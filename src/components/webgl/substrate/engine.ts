/* ---------------------------------------------------------------------------
   The driver. Advances the simulation, packs what it produced into GPU
   buffers, and publishes a snapshot the HUD can render from.

   No animation here is scripted — every pixel is downstream of the simulation,
   and the HUD never invents a number the simulation did not produce.
--------------------------------------------------------------------------- */

import type { Tone } from "@/components/icon";

import { CaseBoard, AGENTS, NEED, type CasePhase, type LedgerEntry } from "./cases";
import { Field, legGroup } from "./entities";
import { createRenderer } from "./renderer";
import {
  DECISION,
  ENGINES,
  HUB,
  INK,
  LINKS,
  NODES,
  PROVENANCE_CHAPTER,
  SOURCES,
  chapterEmphasis,
  makeCamera,
  type Anchor,
  type Camera,
  type Ink,
  type NodeGroup,
} from "./topology";

/* -------------------------------------------------------------------------- */
/* What the HUD reads                                                         */
/* -------------------------------------------------------------------------- */

export type HudSource = {
  id: string;
  label: string;
  sub: string;
  /// Sampled arrival rate, records per second.
  rate: number;
  /// 0..1, for the load bar.
  load: number;
};

export type HudAgent = {
  id: string;
  code: string;
  name: string;
  verb: string;
  tone: Tone;
  xp: number;
  active: boolean;
  skills: { name: string; running: boolean }[];
};

export type HudCase = {
  id: number;
  ref: string;
  title: string;
  /// The trigger while gathering, the decision once decided.
  line: string;
  phase: CasePhase;
  priority: boolean;
  /// Evidence completeness per engine lane, 0..1.
  tracks: number[];
  confidence: number;
  records: number;
};

export type HudLabel = {
  id: string;
  label: string;
  sub: string;
  anchor: Anchor;
  group: NodeGroup;
  /// CSS pixels within the canvas box.
  x: number;
  y: number;
};

export type HudSnapshot = {
  meters: { ingest: number; live: number; inflight: number; decided: number };
  hub: { merged: number; quarantined: number; remediated: number; delivered: number };
  sources: HudSource[];
  agents: HudAgent[];
  cases: HudCase[];
  ledger: LedgerEntry[];
  labels: HudLabel[];
};

export const EMPTY_SNAPSHOT: HudSnapshot = {
  meters: { ingest: 0, live: 0, inflight: 0, decided: 0 },
  hub: { merged: 0, quarantined: 0, remediated: 0, delivered: 0 },
  sources: [],
  agents: [],
  cases: [],
  ledger: [],
  labels: [],
};

/// What the frame-rate guard concluded about this machine.
export type Verdict = "degrade" | "abort";

export type Substrate = {
  /// Index of the narrative chapter currently on screen.
  setChapter(chapter: number): void;
  /// The case the visitor is pointing at, traced back through the graph.
  setHighlight(caseId: number | null): void;
  setPaused(paused: boolean): void;
  /// Operator injection — a disruption that jumps the queue and runs hot.
  inject(): void;
  /// A burst of records from one connected system.
  burst(sourceId: string): void;
  dispose(): void;
};

export type SubstrateOptions = {
  canvas: HTMLCanvasElement;
  /// False under reduced motion: the simulation still runs, at a calmer rate.
  animated: boolean;
  /// Publishes ~7 times a second, which is as fast as any of these numbers can
  /// be read anyway.
  onSnapshot: (snapshot: HudSnapshot) => void;
  onVerdict: (verdict: Verdict) => void;
};

/* -------------------------------------------------------------------------- */
/* Tuning                                                                     */
/* -------------------------------------------------------------------------- */

/// Records the field may hold at once.
const CAPACITY = 2400;

/// Seconds of simulation to fast-forward before the first paint, so no counter
/// opens at zero and no case is ever at the start line.
const WARMUP_SECONDS = 45;
const WARMUP_STEP = 1 / 30;

/// How often the HUD snapshot is republished.
const PUBLISH_INTERVAL = 0.14;

/// Segments per lattice strand.
const SEG = 20;

/// Frame-rate guard: let the machine settle, then judge it over one window.
const GUARD_SETTLE = 1.2;
const GUARD_WINDOW = 2.5;
const GUARD_DEGRADE_FPS = 40;
const GUARD_ABORT_FPS = 30;

/// Frames longer than this are the browser withholding animation frames — an
/// occluded window, a throttled background tab, a tab restore — not a machine
/// struggling. Counting them condemns perfectly capable hardware, so they are
/// left out of the sample entirely. Anything faster, including a genuinely
/// miserable 3fps, is taken at face value.
const GUARD_STALL = 0.4;

/// Device pixel ratio, before and after the guard steps quality down.
const DPR_FULL = 1.6;
const DPR_REDUCED = 1.1;

/**
 * Pixels per world unit the mark sizes were tuned against.
 *
 * A record is a fraction of a world unit across, so on a stage half this scale
 * every mark lands under a pixel, alpha-blends into nothing, and the field
 * reads as empty. Marks are scaled back up on smaller stages — never down on
 * larger ones, where the tuned size is already right.
 */
const REFERENCE_SCALE = 9;
const MAX_SIZE_BOOST = 2;

/// How quickly the narrative emphasis eases between chapters.
const EMPHASIS_RATE = 3.5;

/// Seconds each auto-traced case holds the provenance spotlight.
const AUTO_TRACE_LIFE = 4;

const fmtRate = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

/* -------------------------------------------------------------------------- */
/* Driver                                                                     */
/* -------------------------------------------------------------------------- */

export function createSubstrate({
  canvas,
  animated,
  onSnapshot,
  onVerdict,
}: SubstrateOptions): Substrate | null {
  const renderer = createRenderer(canvas);
  if (!renderer) return null;

  const { resize, draw, instanceData, lineData, maxInstances, maxLineVerts } =
    renderer;

  const field = new Field(CAPACITY);
  const board = new CaseBoard(field);

  let time = 0;

  /* The substrate is already running when you arrive. Fast-forward before the
     first paint — no counter should ever open at zero, and no case should ever
     be at the start line. */
  for (let i = 0; i < WARMUP_SECONDS / WARMUP_STEP; i++) {
    time += WARMUP_STEP;
    board.step(WARMUP_STEP, time);
    board.absorb(field.step(WARMUP_STEP, time));
  }
  field.flashes.length = 0;

  /// Provenance spotlight: set when a case decides, and by the chapter whose
  /// whole subject is lineage.
  let trace: { id: number; life: number } | null = null;
  board.onDecision = (c) => {
    trace = { id: c.id, life: 3.4 };
  };

  let chapter = 0;
  let paused = false;
  let disposed = false;
  let dpr = DPR_FULL;

  /* --- layout ------------------------------------------------------------- */

  let camera: Camera | null = null;
  let sizeBoost = 1;

  function layout() {
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height));
    const ratio = Math.min(window.devicePixelRatio || 1, dpr);

    canvas.width = Math.round(cssW * ratio);
    canvas.height = Math.round(cssH * ratio);
    resize(canvas.width, canvas.height);

    // The camera fits the world into the canvas box itself. The HUD rails sit
    // beside the canvas rather than over it, so there is nothing to avoid.
    camera = makeCamera({ x: 0, y: 0, width: cssW, height: cssH }, cssW, cssH);
    sizeBoost = Math.min(
      MAX_SIZE_BOOST,
      Math.max(1, REFERENCE_SCALE / camera.scale),
    );
    publish();
  }

  // Observed, and first measured, only once the HUD state `publish` reads has
  // been declared — see the bottom of this function.
  const observer = new ResizeObserver(() => layout());

  /* --- buffer packing ----------------------------------------------------- */

  let ic = 0;
  function glyph(
    x: number,
    y: number,
    size: number,
    rot: number,
    shape: number,
    glow: number,
    ink: ArrayLike<number>,
    alpha: number,
  ) {
    if (ic >= maxInstances) return;
    const o = ic * 10;
    instanceData[o] = x;
    instanceData[o + 1] = y;
    instanceData[o + 2] = size;
    instanceData[o + 3] = rot;
    instanceData[o + 4] = shape;
    instanceData[o + 5] = glow;
    instanceData[o + 6] = ink[0];
    instanceData[o + 7] = ink[1];
    instanceData[o + 8] = ink[2];
    instanceData[o + 9] = alpha;
    ic++;
  }

  let lc = 0;
  function vert(x: number, y: number, ink: ArrayLike<number>, alpha: number) {
    if (lc >= maxLineVerts) return;
    const o = lc * 6;
    lineData[o] = x;
    lineData[o + 1] = y;
    lineData[o + 2] = ink[0];
    lineData[o + 3] = ink[1];
    lineData[o + 4] = ink[2];
    lineData[o + 5] = alpha;
    lc++;
  }

  const mix: [number, number, number] = [0, 0, 0];

  /** A link drawn as a graded strand with energy travelling along it. */
  function strand(
    a: { x: number; y: number },
    b: { x: number; y: number },
    inkA: Ink,
    inkB: Ink,
    base: number,
    pulseAmp: number,
    phase: number,
    now: number,
    speed: number,
  ) {
    for (let i = 0; i < SEG; i++) {
      for (const t of [i / SEG, (i + 1) / SEG]) {
        const p = (t - now * speed + phase) % 1;
        const q = p < 0 ? p + 1 : p;
        const pulse = Math.pow(q, 16) + Math.pow((q + 0.5) % 1, 26) * 0.5;
        mix[0] = inkA[0] + (inkB[0] - inkA[0]) * t;
        mix[1] = inkA[1] + (inkB[1] - inkA[1]) * t;
        mix[2] = inkA[2] + (inkB[2] - inkA[2]) * t;
        const fade = Math.sin(t * Math.PI) * 0.55 + 0.45;
        vert(
          a.x + (b.x - a.x) * t,
          a.y + (b.y - a.y) * t,
          mix,
          (base + pulse * pulseAmp) * fade,
        );
      }
    }
  }

  /* --- narrative emphasis -------------------------------------------------- */

  /* Eased rather than switched: a chapter change should feel like attention
     moving across a system that never stopped running. */
  const emphasis: Record<NodeGroup, number> = {
    source: 1,
    hub: 1,
    engine: 1,
    decision: 1,
    quarantine: 1,
  };

  function easeEmphasis(dt: number) {
    const k = Math.min(1, dt * EMPHASIS_RATE);
    for (const group of Object.keys(emphasis) as NodeGroup[]) {
      const target = chapterEmphasis(group, chapter);
      emphasis[group] += (target - emphasis[group]) * k;
    }
  }

  /* --- HUD snapshot -------------------------------------------------------- */

  const lastCounts: Record<string, number> = { ...field.bySource };
  const smoothed: Record<string, number> = Object.fromEntries(
    SOURCES.map((s) => [s.id, 8]),
  );
  let lastTotal = SOURCES.reduce((n, s) => n + field.bySource[s.id], 0);
  let publishAcc = 0;
  let ingestRate = 0;

  function labels(): HudLabel[] {
    if (!camera) return [];
    return NODES.map((n) => {
      const [x, y] = camera!.toScreen(n.x, n.y);
      return {
        id: n.id,
        label: n.label,
        sub: n.sub,
        anchor: n.anchor,
        group: n.group,
        x,
        y,
      };
    });
  }

  function publish() {
    const running = new Set<string>();
    for (const c of board.active) {
      if (c.phase !== "deliberating") continue;
      c.skills.slice(0, c.skillsRun).forEach((s) => running.add(s));
    }

    onSnapshot({
      meters: {
        ingest: Math.round(ingestRate * 60),
        live: field.stats.live,
        inflight: board.active.length,
        decided: board.decided,
      },
      hub: {
        merged: field.stats.merged,
        quarantined: field.stats.quarantined,
        remediated: field.stats.remediated,
        delivered: field.stats.delivered,
      },
      sources: SOURCES.map((s) => ({
        id: s.id,
        label: s.label,
        sub: s.sub,
        rate: fmtRate(smoothed[s.id]),
        load: Math.min(1, fmtRate(smoothed[s.id]) / 12),
      })),
      agents: AGENTS.map((a) => {
        const skills = a.skills.map((name) => ({
          name,
          running: running.has(name),
        }));
        return {
          id: a.id,
          code: a.code,
          name: a.name,
          verb: a.verb,
          tone: a.tone,
          xp: a.xp,
          active: skills.some((s) => s.running),
          skills,
        };
      }),
      cases: board.active.map((c) => ({
        id: c.id,
        ref: c.ref,
        title: c.tmpl.title,
        line: c.phase === "decided" ? c.tmpl.decision : c.tmpl.trigger,
        phase: c.phase,
        priority: c.priority,
        tracks: c.evidence.map((n, i) => Math.min(1, n / NEED[i])),
        confidence: c.confidence,
        records: c.provenance.length,
      })),
      ledger: [...board.ledger],
      labels: labels(),
    });
  }

  function sampleRates(window: number) {
    let total = 0;
    for (const s of SOURCES) {
      const now = field.bySource[s.id];
      // smoothed — a 140ms window on a random source picker is pure noise
      const inst = (now - lastCounts[s.id]) / window;
      smoothed[s.id] = smoothed[s.id] * 0.72 + inst * 0.28;
      lastCounts[s.id] = now;
      total += now;
    }
    ingestRate = (total - lastTotal) / window;
    lastTotal = total;
  }

  /* --- frame-rate guard ---------------------------------------------------- */

  let guardElapsed = 0;
  let guardFrames = 0;
  let guardDone = false;

  function guard(elapsed: number) {
    if (guardDone || elapsed <= 0 || elapsed >= GUARD_STALL) return;
    guardElapsed += elapsed;
    if (guardElapsed < GUARD_SETTLE) return;
    guardFrames++;
    if (guardElapsed < GUARD_SETTLE + GUARD_WINDOW) return;

    guardDone = true;
    const fps = guardFrames / (guardElapsed - GUARD_SETTLE);
    if (fps < GUARD_ABORT_FPS) {
      onVerdict("abort");
    } else if (fps < GUARD_DEGRADE_FPS) {
      // Thin the ambient roar and drop the pixel count before giving up on the
      // scene entirely.
      board.ambientRate = 30;
      dpr = DPR_REDUCED;
      layout();
      onVerdict("degrade");
    }
  }

  /* --- loop ---------------------------------------------------------------- */

  const RATE = animated ? 1 : 0.45;
  let last = performance.now() / 1000;
  let raf = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    now /= 1000;

    // Clamp below zero as well as above. A non-monotonic timestamp (tab
    // restore, clock adjustment) yields a negative dt, and a negative fade
    // makes the decay blend *amplify* the accumulation buffer every frame until
    // the whole field saturates to white.
    const elapsed = now - last;
    const raw = Math.max(0, Math.min(0.05, elapsed));
    last = now;

    if (paused || !camera) return;

    const dt = raw * RATE;
    time += dt;

    board.step(dt, time);
    board.absorb(field.step(dt, time));
    easeEmphasis(dt);
    // The guard needs the true interval, not the clamped one — the clamp is
    // what keeps the simulation stable, and it would read every stalled frame
    // as a 20fps frame.
    guard(elapsed);

    if (trace) {
      trace.life -= dt;
      if (trace.life <= 0) trace = null;
    }

    // The provenance chapter demonstrates the thing it describes: with nothing
    // hovered, the stage keeps tracing cases of its own accord.
    if (chapter === PROVENANCE_CHAPTER && board.highlight === null && !trace) {
      const candidate =
        board.active.find((c) => c.phase === "deliberating") ??
        board.active[board.active.length - 1];
      if (candidate) trace = { id: candidate.id, life: AUTO_TRACE_LIFE };
    }

    const focus = board.highlight ?? trace?.id ?? null;
    const focusCase =
      focus === null ? null : board.active.find((c) => c.id === focus);

    /* lattice */
    lc = 0;
    for (let i = 0; i < LINKS.length; i++) {
      const l = LINKS[i];
      const lit = Math.min(emphasis[l.a.group], emphasis[l.b.group]);
      const dim = (focus === null ? 1 : 0.35) * lit;
      strand(
        l.a,
        l.b,
        l.inkA,
        l.inkB,
        0.17 * l.weight * dim,
        1.25 * l.weight * dim,
        (i * 0.137) % 1,
        time,
        0.14,
      );
    }

    /* provenance: the exact path that produced a decision */
    if (focusCase) {
      const glowT = Math.min(
        1,
        trace && trace.id === focusCase.id ? trace.life / 3.4 : 1,
      );
      const amp = 0.55 + 0.45 * Math.sin(time * 6);
      for (const id of new Set(focusCase.provenance)) {
        const s = SOURCES.find((x) => x.id === id);
        if (s) strand(s, HUB, INK.raw, INK.context, 0.42 * glowT, 0.7, 0, time, 0.42);
      }
      for (const e of ENGINES) {
        strand(HUB, e, INK.context, e.ink, 0.38 * glowT * amp, 0.8, 0, time, 0.42);
        strand(e, DECISION, e.ink, INK.decided, 0.38 * glowT * amp, 0.8, 0.5, time, 0.42);
      }
    }

    /* flux — packed first, drawn into the trail buffer */
    ic = 0;
    for (const e of field.items) {
      const tracked = e.caseId !== null;
      const isFocus = tracked && e.caseId === focus;
      // Levels are set against the trail equilibrium, which is roughly
      // ink-per-frame / fade — about 7x here. Ambient traffic is the roar a
      // tracked case lives inside; it must never out-shout the case itself.
      // Held just under saturation: past ~1.0 accumulated the marks clip to
      // white and the colour-is-meaning read is lost.
      let alpha = tracked ? 0.45 : 0.1 + e.trust * 0.12;
      if (focus !== null && !isFocus) alpha *= 0.16;
      alpha *= emphasis[legGroup(e.leg)];
      const size = e.size * (isFocus ? 1.8 : 1) * (0.85 + e.trust * 0.4);
      glyph(
        e.x,
        e.y,
        size * sizeBoost,
        e.ang,
        e.shape,
        0.25 + e.trust * 0.6 + (isFocus ? 1.0 : 0),
        e.ink,
        alpha,
      );
    }

    for (const f of field.flashes) {
      const k = 1 - f.life;
      glyph(
        f.x,
        f.y,
        0.5 + k * 2.4 * f.strength,
        0,
        0,
        1.4,
        f.ink,
        f.life * f.life * 0.2 * f.strength * emphasis[f.group],
      );
    }

    /* structure — packed second, drawn straight to the screen */
    const trailInstances = ic;
    for (const r of field.residents) {
      const ang = r.angle + time * r.speed;
      const rad = r.radius * (0.7 + 0.3 * Math.sin(time * r.bob + r.seed));
      glyph(
        r.node.x + Math.cos(ang) * rad,
        r.node.y + Math.sin(ang) * rad * 0.82,
        // tangential, so orbiting cores read as arcs rather than tumbling chips
        r.size * sizeBoost,
        ang + Math.PI / 2,
        r.shape,
        0.55,
        r.ink,
        (0.3 + 0.2 * Math.sin(time * 2 + r.seed)) *
          (focus === null ? 1 : 0.45) *
          emphasis[r.group],
      );
    }

    publishAcc += dt;
    if (publishAcc >= PUBLISH_INTERVAL) {
      sampleRates(publishAcc);
      publishAcc = 0;
      publish();
    }

    draw({
      camera,
      trailInstances,
      overlayFrom: trailInstances,
      overlayCount: ic - trailInstances,
      lineVerts: lc,
      // A mark aligned to its own heading repaints its own trail, so the decay
      // has to be quicker here than it would be for round sprites.
      fade: 1 - Math.exp(-dt * 12),
    });
  }

  // Sizes the canvas, fits the camera and takes the first snapshot, all of
  // which read state declared above.
  layout();
  observer.observe(canvas);
  raf = requestAnimationFrame(frame);

  return {
    setChapter(next) {
      chapter = next;
    },
    setHighlight(caseId) {
      board.highlight = caseId;
    },
    setPaused(next) {
      // Reset the clock on resume, or the first frame back gets the whole
      // offscreen interval as one dt.
      if (!next && paused) last = performance.now() / 1000;
      paused = next;
    },
    inject() {
      trace = { id: board.inject().id, life: 3 };
    },
    burst(sourceId) {
      const source = SOURCES.find((s) => s.id === sourceId);
      if (!source) return;
      for (let i = 0; i < 26; i++) field.emit({ source });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.dispose();
    },
  };
}
