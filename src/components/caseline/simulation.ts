/* ---------------------------------------------------------------------------
   The Case Line simulation.

   The old engine ran a particle system on the GPU and asked the viewer to infer
   a business process from it. This runs the same process on the CPU, at a rate
   a person can follow, and the picture is a drawing of its state.

   What survives from the old build, deliberately:

     - `presets.ts` — the cases, the disruption and the intensity, so the
       configurator and every industry preset keep working untouched.
     - `topology.ts`'s `SOURCES` — the systems a visitor connected.
     - The claim in the CMS copy: "Nothing here is a loop. The counters, the
       cases and the decisions are all produced by a simulation running in your
       browser." Still true. Every meter below is measured, not scripted.

   What does not survive is the roar. A tracked case moves one station at a
   time, and the ambient traffic is thinned to what reads as volume rather than
   as fog — because the thing the viewer is meant to follow has to be findable.
--------------------------------------------------------------------------- */

import { activePreset, type CaseTemplate } from "@/components/webgl/substrate/presets";
import { SOURCES } from "@/components/webgl/substrate/topology";

import {
  LANE_NEED,
  createBoard,
  type Board,
  type BoardAgent,
  type BoardCase,
  type Decided,
} from "./board";

import {
  angleOn,
  focusFor,
  pointOn,
  segmentsFor,
  STAGE_ORDER,
  type Ink,
  type Segment,
  type Stage,
} from "./geometry";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/* -------------------------------------------------------------------------- */
/* Tuning                                                                     */
/* -------------------------------------------------------------------------- */

/// Marks in flight at once. Two orders of magnitude below the old field, and
/// that is the point: at this count each one is an object you can watch cross
/// the page rather than a contribution to a haze.
export const MARKS = 84;

/// Seconds a mark takes to cross its segment. Slow enough to follow with your
/// eyes, which the old build's marks were not.
const MARK_SECONDS = [2.6, 5.2] as const;

/// Re-exported so a renderer needs one import for everything the simulation
/// publishes. The board owns the number; the tracked case answers to the same
/// one, because it is a case like any other.
export { LANE_NEED };
export type { BoardAgent, BoardCase };

/// How long the ledger keeps a decision before it scrolls off.
const LEDGER_DEPTH = 4;

/* -------------------------------------------------------------------------- */
/* Shapes                                                                     */
/* -------------------------------------------------------------------------- */

/// What a mark is carrying. Proportions differ so the ingest side visibly
/// mixes signals, records and documents instead of showing six of one mark.
export type MarkShape = 0 | 1 | 2;

export type Mark = {
  seg: number;
  t: number;
  /// Per-second progress along the segment.
  speed: number;
  shape: MarkShape;
  /// True for the handful of marks belonging to the tracked case, which are
  /// drawn brighter and larger than the ambient traffic.
  tracked: boolean;
};

/* -------------------------------------------------------------------------- */
/* Published state                                                            */
/* -------------------------------------------------------------------------- */

export type FocusCase = {
  ref: string;
  tmpl: CaseTemplate;
  stage: Stage;
  /// Evidence gathered per lane so far.
  evidence: number[];
  confidence: number;
  /// Distinct source systems that have contributed.
  sources: number;
  /// Records pulled in, and the duplicates resolution collapsed out of them.
  records: number;
  merged: number;
  quarantined: number;
};

/// A filed decision. The board and the tracked case produce the same shape,
/// because they are the same kind of thing — an operator-injected disruption is
/// simply one that carries a flag the ledger colours differently.
export type LedgerEntry = Decided;

/// One connected system, with what it is actually sending.
export type SourceMeter = {
  id: string;
  label: string;
  sub: string;
  /// Sampled arrival rate, records per second.
  rate: number;
  /// 0..1, for the load bar.
  load: number;
};

export type Snapshot = {
  meters: {
    ingest: number;
    live: number;
    inflight: number;
    decided: number;
    owned: number;
  };
  hub: {
    merged: number;
    quarantined: number;
    remediated: number;
    delivered: number;
    owned: number;
  };
  /// The case the hero follows, positioned by the chapter.
  focus: FocusCase;
  /// Everything else in flight. Empty for nobody — the hero simply does not
  /// draw it.
  board: BoardCase[];
  agents: BoardAgent[];
  sources: SourceMeter[];
  ledger: LedgerEntry[];
  /// Which case the visitor is pointing at, and the systems that fed it.
  trace: { id: number; sourceIds: string[] } | null;
};

export type CaseLine = {
  /// Advances the tracked case to whichever station the chapter is about.
  setChapter(chapter: number): void;
  setPaused(paused: boolean): void;
  /// The case the visitor is pointing at, traced back to its systems.
  setTrace(caseId: number | null): void;
  /// Operator injection — a disruption that jumps the queue and runs hot.
  inject(): void;
  /// A burst of records from one connected system.
  burst(sourceId: string): void;
  dispose(): void;
};

export type Options = {
  /// Called once per animation frame with the mark pool, for direct DOM
  /// mutation. Never routed through React — eighty transforms a frame through
  /// the reconciler is exactly the kind of thing that makes a hero stutter.
  onFrame: (marks: Mark[], segments: Segment[]) => void;
  /// Called about eight times a second with everything the readouts show.
  onSnapshot: (snapshot: Snapshot) => void;
};

const PUBLISH_INTERVAL = 0.125;

/* -------------------------------------------------------------------------- */
/* Engine                                                                     */
/* -------------------------------------------------------------------------- */

export function createCaseLine({ onFrame, onSnapshot }: Options): CaseLine {
  const sourceCount = Math.max(1, SOURCES.length);
  const segments = segmentsFor(sourceCount);

  /* Which segments feed which part of the picture. Held as index lists so the
     hot loop never searches by id. */
  const intake = segments.flatMap((s, i) => (s.id.startsWith("in") ? [i] : []));
  const toLanes = segments.flatMap((s, i) => (s.id.startsWith("lane") ? [i] : []));
  const fromLanes = segments.flatMap((s, i) => (s.id.startsWith("out") ? [i] : []));
  const handover = segments.findIndex((s) => s.id === "hand");
  const quarantine = segments.findIndex((s) => s.id === "qtn");

  /* Weighted route choice. Quarantine is rare on purpose — a funnel with no
     rejects is not one anybody has run, and a funnel that is mostly rejects is
     not one anybody would buy. */
  const routes: number[] = [
    ...intake,
    ...intake,
    ...toLanes,
    ...fromLanes,
    handover,
    quarantine,
  ];

  const marks: Mark[] = Array.from({ length: MARKS }, () => spawn(true));

  function spawn(seeded: boolean): Mark {
    return {
      seg: pick(routes),
      // Seeded marks start spread along their route, so the first painted frame
      // is a system already running rather than one starting up.
      t: seeded ? Math.random() : 0,
      speed: 1 / rand(MARK_SECONDS[0], MARK_SECONDS[1]),
      shape: ((Math.random() * 3) | 0) as MarkShape,
      tracked: false,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* The tracked case                                                         */
  /* ------------------------------------------------------------------------ */

  let templateCursor = 0;
  let caseSeq = 4100 + ((Math.random() * 40) | 0);

  function openCase(): FocusCase {
    caseSeq += 7 + ((Math.random() * 5) | 0);
    const templates = activePreset.cases;
    const tmpl = templates[templateCursor++ % templates.length];
    return {
      ref: `CASE-${caseSeq}`,
      tmpl,
      stage: "intake",
      evidence: [0, 0, 0],
      confidence: rand(0.24, 0.36),
      sources: 0,
      records: 0,
      merged: 0,
      quarantined: 0,
    };
  }

  let focus = openCase();
  let chapter = 0;
  /// Seconds the case has stood at its current station. Drives the per-station
  /// detail — duplicates collapsing, lanes filling, confidence accruing.
  let dwell = 0;

  const ledger: LedgerEntry[] = [];

  /* ------------------------------------------------------------------------ */
  /* Aggregates                                                               */
  /* ------------------------------------------------------------------------ */

  const scale = activePreset.intensity;

  /// Records per minute across the connected systems. Sampled from the mark
  /// pool's actual throughput rather than asserted, then smoothed so the readout
  /// does not flicker.
  let ingest = 0;
  let arrivals = 0;
  let arrivalWindow = 0;

  /// Records resident in the substrate. A bounded walk around a resting level
  /// rather than a running total: the substrate holds a working set, it does
  /// not accumulate every record it has ever seen, and a counter that only ever
  /// climbs is the tell of a number nobody is measuring.
  const liveRest = Math.round(rand(400, 520) * scale);
  let live = liveRest;
  let owned = Math.round(rand(1500, 1900));
  let merged = 0;
  let quarantined = 0;
  let remediated = 0;
  /// Records delivered decision-grade, and the subset handed across the estate
  /// line. Both counted from marks completing the legs that mean exactly that.
  let delivered = 0;

  /* Per-system telemetry. `intake[i]` is the route out of source `i`, so
     counting completions on it *is* that system's arrival rate — the load bars
     in the console are a measurement, not an animation with a random seed. */
  const perSource = SOURCES.map(() => ({ count: 0, rate: 0 }));
  /// Decays after a burst, so a clicked system visibly runs hot and settles.
  const boost = SOURCES.map(() => 0);
  let sourceWindow = 0;

  /* ------------------------------------------------------------------------ */
  /* The board                                                                */
  /* ------------------------------------------------------------------------ */

  const board: Board = createBoard(
    SOURCES.map((s) => s.id),
    (entry: Decided) => file(entry),
  );

  let trace: { id: number; sourceIds: string[] } | null = null;

  function file(entry: Decided) {
    ledger.unshift(entry);
    if (ledger.length > LEDGER_DEPTH) ledger.pop();
  }

  /* Seed the ledger so the console never opens on an empty board. These are
     drawn from the same template rotation the tracked case walks, so nothing
     appears that the simulation could not have produced itself. */
  for (let i = 0; i < 2; i++) {
    const tmpl = activePreset.cases[(templateCursor + i + 3) % activePreset.cases.length];
    ledger.push({
      ref: `CASE-${caseSeq - 21 + i * 7}`,
      title: tmpl.title,
      decision: tmpl.decision,
      impact: tmpl.impact,
      confidence: rand(0.88, 0.97),
      sources: 2 + ((Math.random() * 3) | 0),
      priority: false,
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Step                                                                     */
  /* ------------------------------------------------------------------------ */

  function step(dt: number) {
    dwell += dt;

    /* The marks keep moving whether or not anything is drawn. They are what the
       counters count — an arrival is a mark completing its leg — so freezing
       them under reduced motion would freeze the ingest rate at zero and leave
       a visitor who asked for less movement looking at a dead board. What
       reduced motion turns off is the *painting* of them, which the renderer
       decides. */
    {
      for (const mark of marks) {
        mark.t += mark.speed * dt;
        if (mark.t >= 1) {
          // A mark completing its leg is one record arriving somewhere. That is
          // what the counters count.
          const seg = segments[mark.seg];
          arrivals++;
          const source = intake.indexOf(mark.seg);
          if (source >= 0) perSource[source].count++;
          if (seg.to === "decided") delivered++;
          if (seg.to === "context") {
            merged++;
            live += 1;
          } else if (seg.to === "reject") {
            quarantined++;
            // Some are remediated and released; others expire.
            if (Math.random() < 0.62) remediated++;
          } else if (seg.to === "own") {
            owned++;
          }
          Object.assign(mark, spawn(false));
        }
      }
    }

    // Sampled arrival rate, per minute, smoothed. Each mark on screen stands
    // for a batch rather than a single record — eighty marks is a readable
    // picture, not an enterprise's actual throughput.
    arrivalWindow += dt;
    if (arrivalWindow >= 0.5) {
      const rate = (arrivals / arrivalWindow) * 60 * 2.8 * scale;
      ingest = ingest ? ingest + (rate - ingest) * 0.25 : rate;
      arrivals = 0;
      arrivalWindow = 0;
    }

    // The working set breathes around its resting level: what arrives is
    // eventually decided and leaves.
    live += (liveRest - live) * dt * 0.35 + rand(-1, 1) * scale * dt * 9;
    live = Math.max(120, live);

    // Per-system rates, on their own window: shorter than the ingest readout's
    // because a load bar that lags a burst by half a second reads as broken.
    sourceWindow += dt;
    if (sourceWindow >= 0.4) {
      for (const meter of perSource) {
        const rate = (meter.count / sourceWindow) * 2.8 * scale;
        meter.rate = meter.rate ? meter.rate + (rate - meter.rate) * 0.4 : rate;
        meter.count = 0;
      }
      sourceWindow = 0;
    }

    for (let i = 0; i < boost.length; i++) {
      if (boost[i] > 0) boost[i] = Math.max(0, boost[i] - dt);
    }

    board.step(dt);
    stepFocus(dt);
  }

  /**
   * What the tracked case does while it stands where the chapter put it.
   *
   * Each station has a visible consequence, because a chapter that changes the
   * copy without changing the picture teaches the viewer that the picture is
   * not about the words.
   */
  function stepFocus(dt: number) {
    switch (focus.stage) {
      case "intake":
        // Records arrive from the connected systems, unresolved.
        if (focus.records < 14 && dwell > focus.records * 0.42) {
          focus.records++;
          focus.sources = Math.min(sourceCount, 1 + ((focus.records / 3) | 0));
        }
        break;

      case "resolve":
        // Duplicates collapse into one governed record; what fails the quality
        // bar drops into quarantine.
        if (focus.merged < focus.records && dwell > 0.6 + focus.merged * 0.34) {
          focus.merged++;
          if (focus.merged % 5 === 0 && focus.quarantined < 2) focus.quarantined++;
        }
        break;

      case "lanes": {
        // Three lanes, filling at their own rates. Concurrent, never in turn —
        // which is the claim the copy makes and the old rendering could not
        // show, because everything in it moved at once anyway.
        const paces = [0.62, 0.5, 0.72];
        for (let k = 0; k < 3; k++) {
          const want = Math.min(LANE_NEED[k], Math.floor(dwell * paces[k]));
          if (want > focus.evidence[k]) {
            focus.evidence[k] = want;
            focus.confidence = Math.min(0.94, focus.confidence + rand(0.02, 0.045));
          }
        }
        break;
      }

      case "decide":
        // Nothing is decided early: confidence only closes once every lane is
        // satisfied.
        if (complete()) {
          focus.confidence = Math.min(0.985, focus.confidence + dt * 0.09);
        }
        break;

      case "own":
        focus.confidence = Math.min(0.985, focus.confidence + dt * 0.02);
        break;
    }
  }

  const complete = () =>
    focus.evidence.every((n, k) => n >= LANE_NEED[k]);

  /**
   * Moves the case to the station the chapter is about.
   *
   * Skipping backwards — the rail cycling from the last chapter to the first —
   * is a case reaching the end of its life: it is decided, filed in the ledger,
   * and a new one opens at intake behind it.
   */
  function setStage(next: Stage) {
    if (next === focus.stage) return;

    const from = STAGE_ORDER.indexOf(focus.stage);
    const to = STAGE_ORDER.indexOf(next);

    if (to < from) {
      // Retire the case that just finished the story, then open the next.
      if (from >= STAGE_ORDER.indexOf("decide")) {
        ledger.unshift({
          ref: focus.ref,
          title: focus.tmpl.title,
          decision: focus.tmpl.decision,
          impact: focus.tmpl.impact,
          confidence: focus.confidence,
          sources: Math.max(2, focus.sources),
          priority: false,
        });
        if (ledger.length > LEDGER_DEPTH) ledger.pop();
        owned++;
      }
      focus = openCase();
      dwell = 0;
      return;
    }

    /* Forward: carry what the earlier stations produced. A case arriving at the
       lanes with no records behind it would be a case the picture just made up. */
    if (to >= STAGE_ORDER.indexOf("resolve") && focus.records < 9) {
      focus.records = 9 + ((Math.random() * 5) | 0);
      focus.sources = Math.min(sourceCount, 3);
    }
    if (to >= STAGE_ORDER.indexOf("lanes")) {
      focus.merged = Math.max(focus.merged, focus.records - 3);
      focus.quarantined = Math.max(focus.quarantined, 1);
    }
    if (to >= STAGE_ORDER.indexOf("decide")) {
      focus.evidence = [...LANE_NEED];
      focus.confidence = Math.max(focus.confidence, 0.86);
    }

    focus.stage = next;
    dwell = 0;
  }

  /* ------------------------------------------------------------------------ */
  /* Loop                                                                     */
  /* ------------------------------------------------------------------------ */

  let raf = 0;
  let last = 0;
  let paused = false;
  let sincePublish = PUBLISH_INTERVAL;

  function publish() {
    /* The peak is taken across the systems rather than fixed, so a bar reads as
       "busiest of yours" instead of as a fraction of a number nobody was told.
       Floored, or a quiet board shows six full bars. */
    const peak = Math.max(0.6, ...perSource.map((m) => m.rate));

    onSnapshot({
      meters: {
        ingest,
        live: Math.round(live),
        inflight: board.cases.filter((c) => c.phase !== "decided").length,
        decided: board.decided,
        owned,
      },
      hub: { merged, quarantined, remediated, delivered, owned },
      focus: { ...focus, evidence: [...focus.evidence] },
      board: board.cases.map((c) => ({
        id: c.id,
        ref: c.ref,
        title: c.title,
        line: c.line,
        priority: c.priority,
        phase: c.phase,
        tracks: [...c.tracks],
        confidence: c.confidence,
        records: c.records,
        sourceIds: c.sourceIds,
      })),
      agents: board.agents(),
      sources: SOURCES.map((source, i) => ({
        id: source.id,
        label: source.label,
        sub: source.sub,
        rate: perSource[i].rate,
        load: Math.min(1, perSource[i].rate / peak),
      })),
      ledger: ledger.slice(0, LEDGER_DEPTH),
      trace,
    });
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (paused) {
      last = now;
      return;
    }

    // A tab that was hidden, or a window that was occluded, hands back one
    // enormous delta. Clamp it, or every mark teleports on return.
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;

    step(dt);
    onFrame(marks, segments);

    sincePublish += dt;
    if (sincePublish >= PUBLISH_INTERVAL) {
      sincePublish = 0;
      publish();
    }
  }

  // Fast-forward before the first paint, so no counter opens at zero and the
  // case is never standing at the start line.
  for (let i = 0; i < 900; i++) step(1 / 30);
  dwell = 0;
  publish();
  onFrame(marks, segments);

  raf = requestAnimationFrame(frame);

  return {
    setChapter(next) {
      if (next === chapter) return;
      chapter = next;
      // Through `focusFor`, never by indexing `STAGE_ORDER` directly: two
      // chapters revisit a station they have already reached — build & deploy
      // stands at the hub, monitoring stands at the lanes — so chapter index and
      // stage index are not the same number after the second chapter.
      setStage(focusFor(next).stage);
    },
    setPaused(next) {
      paused = next;
      if (!next) last = 0;
    },
    setTrace(caseId) {
      const entry = caseId === null ? null : board.cases.find((c) => c.id === caseId);
      trace = entry ? { id: entry.id, sourceIds: entry.sourceIds } : null;
      // Published immediately: a hover that waits for the next 8Hz tick reads as
      // an unresponsive control, not as a considered one.
      publish();
    },
    inject() {
      board.inject();
      publish();
    },
    burst(sourceId) {
      const i = SOURCES.findIndex((s) => s.id === sourceId);
      if (i < 0) return;
      boost[i] = 1.6;
      /* Move a slice of the pool onto that system's route and restart it there.
         A burst has to be something you can watch cross the page — incrementing
         a counter would be a claim rather than a demonstration. */
      const seg = intake[i];
      if (seg === undefined) return;
      let moved = 0;
      for (const mark of marks) {
        if (moved >= 14) break;
        if (mark.seg === seg) continue;
        mark.seg = seg;
        mark.t = Math.random() * 0.12;
        mark.speed = 1 / rand(1.5, 2.4);
        moved++;
      }
      perSource[i].count += 14;
    },
    dispose() {
      cancelAnimationFrame(raf);
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Projection                                                                 */
/* -------------------------------------------------------------------------- */

/// Where a mark is, and which way it is pointing. Exported so the renderer can
/// stay a thin loop over the pool.
export function projectMark(mark: Mark, segments: Segment[]) {
  const seg = segments[mark.seg];
  const t = clamp01(mark.t);
  const [x, y] = pointOn(seg, t);
  return { x, y, angle: angleOn(seg, t), ink: inkAt(seg, t) };
}

/// A record's colour is its state, and state changes along the leg it is
/// travelling — a record leaving a source is unresolved and arrives governed.
function inkAt(seg: Segment, t: number): Ink {
  return t < 0.55 ? seg.from : seg.to;
}
