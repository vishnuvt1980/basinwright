/* ---------------------------------------------------------------------------
   Cases — the actual unit of concurrency in a business.

   Not "stage 1 then stage 2". At any instant several unrelated cases are in
   flight, each at its own point, each pulling evidence through all three
   engines at once. A case only reaches a decision when its evidence is
   complete AND verified, and it keeps the provenance of the exact records that
   got it there.

   The cases themselves live in `presets.ts`: they are what the substrate is
   *processing*, and they change with the visitor's industry. The copy a
   visitor reads lives in the CMS, on the section's entries.
--------------------------------------------------------------------------- */

import type { Tone } from "@/components/icon";

import { activePreset, DISRUPTION, type CaseTemplate } from "./presets";
import { ENGINES, SOURCES, type SubstrateNode } from "./topology";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];

/**
 * Each agent owns skills. Skills are interoperable: a case checks out whichever
 * skills it needs, from whichever agent holds them, and agents accumulate
 * experience from every case they touch.
 */
export type Agent = {
  id: string;
  code: string;
  name: string;
  verb: string;
  skills: string[];
  /// Tone token, so the council picks up the same hues as the rest of the site.
  tone: Tone;
  xp: number;
};

export const AGENTS: Agent[] = [
  { id: "observer", code: "01", name: "Signal Observer", verb: "OBSERVE", skills: ["detect", "correlate"], tone: "azure", xp: 1840 },
  { id: "evidence", code: "02", name: "Evidence Navigator", verb: "GROUND", skills: ["retrieve", "cite"], tone: "berry", xp: 1512 },
  { id: "guardian", code: "03", name: "Margin Guardian", verb: "VERIFY", skills: ["simulate", "bound"], tone: "teal", xp: 1275 },
  { id: "orchestr", code: "04", name: "Reasoning Orchestrator", verb: "DECIDE", skills: ["weigh", "explain"], tone: "amber", xp: 968 },
];

/// Evidence needed per engine lane before a case may be decided. Tuned so a
/// case lives ~30-45s: long enough that five of them overlap at all times.
export const NEED = [5, 5, 4];
const SLOTS = 5;

export type CasePhase = "gathering" | "deliberating" | "decided";

export type Case = {
  id: number;
  tmpl: CaseTemplate;
  priority: boolean;
  ref: string;
  phase: CasePhase;
  age: number;
  /// No two cases move at the same speed.
  tempo: number;
  emitted: number;
  quota: number;
  emitTimer: number;
  evidence: number[];
  provenance: string[];
  skills: string[];
  skillsRun: number;
  deliberate: number;
  confidence: number;
  linger: number;
  decidedAt?: number;
  sources: SubstrateNode[];
};

export type LedgerEntry = {
  ref: string;
  title: string;
  decision: string;
  impact: string;
  confidence: number;
  sources: number;
  priority: boolean;
};

/// Just enough of `Field` for the board to drive it, so the two modules stay
/// testable apart.
type Emitter = {
  emit(options: {
    caseId?: number | null;
    source?: SubstrateNode | null;
    lane?: number | null;
    priority?: boolean;
  }): unknown;
};

let nextCase = 1;
let templateCursor = 0;

export class CaseBoard {
  readonly field: Emitter;
  readonly active: Case[] = [];
  readonly ledger: LedgerEntry[] = [];
  decided = 0;
  /// Case the visitor is pointing at, if any. Drives the provenance trace.
  highlight: number | null = null;
  /// Background records per second. Dropped by the frame-rate guard before the
  /// scene is given up on entirely — thinning the roar costs less than losing
  /// the whole picture.
  ambientRate = 54;
  onDecision: (c: Case) => void = () => {};

  #ambientDebt = 0;
  #openCooldown = 0;

  constructor(field: Emitter) {
    this.field = field;
    this.#prewarm();
  }

  /* Open the board mid-stream. Without this every case starts together, runs
     at the same pace and decides together — a convoy, which is exactly the
     sequential feel this design exists to avoid. Each case also carries its own
     tempo, so they stay spread out for the rest of the session. */
  #prewarm() {
    for (let i = 0; i < SLOTS; i++) {
      const c = this.open();
      const progress = i / SLOTS; // 0 → nearly complete
      for (let lane = 0; lane < NEED.length; lane++) {
        c.evidence[lane] = Math.min(
          NEED[lane],
          Math.floor(NEED[lane] * progress + rand(0, 0.9)),
        );
      }
      c.emitted = Math.round(c.quota * progress);
      c.confidence = 0.3 + progress * 0.5;
      c.age = progress * 18;
      for (let k = 0; k < c.emitted; k++) c.provenance.push(pick(SOURCES).id);
    }
  }

  step(dt: number, time: number) {
    // Keep the board populated. New cases open while old ones are mid-flight,
    // which is what makes the board read as continuous rather than cyclic.
    this.#openCooldown -= dt;
    if (this.active.length < SLOTS && this.#openCooldown <= 0) {
      this.open();
      this.#openCooldown = rand(1.4, 4);
    }

    for (let i = this.active.length - 1; i >= 0; i--) {
      const c = this.active[i];
      c.age += dt;

      if (c.phase === "gathering") {
        c.emitTimer -= dt;
        if (c.emitTimer <= 0 && c.emitted < c.quota) {
          c.emitTimer = rand(0.28, 0.7) / c.tempo;
          // one record per lane, in parallel — never one lane at a time
          const lane = c.emitted % ENGINES.length;
          this.field.emit({
            caseId: c.id,
            source: pick(c.sources),
            lane,
            priority: c.priority,
          });
          c.emitted++;
        }
        if (this.#complete(c)) {
          c.phase = "deliberating";
          c.deliberate = 0;
        }
      } else if (c.phase === "deliberating") {
        // Agents run their skills over the assembled evidence. Each skill lands
        // at its own moment — the council is not a queue.
        c.deliberate += dt;
        const done = Math.min(c.skills.length, Math.floor(c.deliberate / 0.55));
        if (done > c.skillsRun) {
          c.skillsRun = done;
          c.confidence = Math.min(0.985, c.confidence + rand(0.06, 0.12));
        }
        if (
          c.skillsRun >= c.skills.length &&
          c.deliberate > c.skills.length * 0.55 + 0.4
        ) {
          this.#decide(c, time);
        }
      } else if (c.phase === "decided") {
        c.linger -= dt;
        if (c.linger <= 0) this.active.splice(i, 1);
      }
    }

    // Background traffic: the roar the tracked cases live inside. Smaller marks
    // need more of them to read as volume rather than sparsity.
    this.#ambientDebt += dt * this.ambientRate;
    while (this.#ambientDebt >= 1) {
      this.#ambientDebt -= 1;
      this.field.emit({});
    }
  }

  #complete(c: Case) {
    return (
      c.evidence[0] >= NEED[0] &&
      c.evidence[1] >= NEED[1] &&
      c.evidence[2] >= NEED[2]
    );
  }

  open(priority = false): Case {
    const templates = activePreset.cases;
    const tmpl = templates[templateCursor++ % templates.length];
    const c: Case = {
      id: nextCase++,
      tmpl,
      priority,
      ref: `CASE-${4100 + nextCase * 7}`,
      phase: "gathering",
      age: 0,
      tempo: rand(0.6, 1.55),
      emitted: 0,
      quota: 21 + ((Math.random() * 7) | 0),
      emitTimer: rand(0, 0.5),
      evidence: [0, 0, 0],
      provenance: [],
      skills: tmpl.skills,
      skillsRun: 0,
      deliberate: 0,
      confidence: rand(0.28, 0.44),
      linger: 0,
      sources: [pick(SOURCES), pick(SOURCES), pick(SOURCES)],
    };
    this.active.push(c);
    return c;
  }

  /** Records arriving at the decision layer become a case's evidence. */
  absorb(arrivals: { caseId: number; lane: number; src: string }[]) {
    if (!arrivals.length) return;
    for (const a of arrivals) {
      const c = this.active.find((x) => x.id === a.caseId);
      if (!c) continue;
      c.evidence[a.lane]++;
      if (c.provenance.length < 14) c.provenance.push(a.src);
      c.confidence = Math.min(0.96, c.confidence + 0.015);
    }
  }

  #decide(c: Case, time: number) {
    c.phase = "decided";
    c.linger = rand(4.5, 9);
    c.decidedAt = time;
    this.decided++;
    for (const a of AGENTS) {
      if (c.skills.some((s) => a.skills.includes(s))) a.xp++;
    }
    this.ledger.unshift({
      ref: c.ref,
      title: c.tmpl.title,
      decision: c.tmpl.decision,
      impact: c.tmpl.impact,
      confidence: c.confidence,
      sources: new Set(c.provenance).size,
      priority: c.priority,
    });
    if (this.ledger.length > 3) this.ledger.pop();
    this.onDecision(c);
  }

  /** Operator injection: a disruption jumps the queue and runs hot. */
  inject(): Case {
    const c = this.open(true);
    c.quota = 12;
    c.emitTimer = 0;
    c.tmpl = DISRUPTION;
    c.skills = c.tmpl.skills;
    return c;
  }
}
