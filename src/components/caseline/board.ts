/* ---------------------------------------------------------------------------
   The case board — several cases in flight at once.

   The hero follows one case, because a hero has room for one. The console has
   room for the truth, which is that a business never works a case at a time:
   at any instant several unrelated cases sit at different points, each pulling
   evidence through all three engines concurrently, each deciding only when its
   own evidence is complete.

   This is a rewrite of the old `substrate/cases.ts` board with the coupling
   taken out. The old one accrued evidence only when the GPU field reported
   records arriving at the decision layer, so it could not run without a WebGL
   context. This one keeps its own clock, which is why the console now works on
   a machine that has no GPU worth the name.

   The content it works — the case templates, the disruption, the agent names —
   still comes from `presets.ts` and `cases.ts`, so a visitor's configuration
   drives this board exactly as it drove the old one.
--------------------------------------------------------------------------- */

import { AGENTS } from "@/components/webgl/substrate/cases";
import { activePreset, type CaseTemplate } from "@/components/webgl/substrate/presets";
import type { Tone } from "@/components/icon";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];

/// Evidence a lane must gather before a case may be decided. Tuned so a case
/// lives 30–45 seconds: long enough that five of them overlap at all times.
export const LANE_NEED = [5, 5, 4];

/// Cases the board holds open.
const SLOTS = 5;

export type Phase = "gathering" | "deliberating" | "decided";

export type BoardCase = {
  id: number;
  ref: string;
  title: string;
  /// The trigger while gathering, the decision once decided.
  line: string;
  priority: boolean;
  phase: Phase;
  /// Evidence completeness per lane, 0..1, for the track bars.
  tracks: number[];
  confidence: number;
  records: number;
  /// Which connected systems fed it. The console traces these on hover.
  sourceIds: string[];
};

export type BoardAgent = {
  id: string;
  code: string;
  name: string;
  verb: string;
  tone: Tone;
  xp: number;
  active: boolean;
  skills: { name: string; running: boolean }[];
};

export type Decided = {
  ref: string;
  title: string;
  decision: string;
  impact: string;
  confidence: number;
  sources: number;
  priority: boolean;
};

type Live = BoardCase & {
  tmpl: CaseTemplate;
  evidence: number[];
  skills: string[];
  skillsRun: number;
  tempo: number;
  age: number;
  deliberate: number;
  linger: number;
};

let nextId = 1;
let cursor = 0;
/// Which preset the cursor is walking. Reset when the content changes, so the
/// first case a visitor picked is the first one they see open.
let cursorPreset = "";

export type Board = {
  readonly cases: Live[];
  /// Total decided this session, for the console's counter.
  readonly decided: number;
  step(dt: number): void;
  /// Operator injection: a disruption jumps the queue and runs hot.
  inject(): void;
  agents(): BoardAgent[];
};

export function createBoard(
  sourceIds: string[],
  onDecide: (entry: Decided) => void,
): Board {
  const cases: Live[] = [];
  let decided = 0;
  let openCooldown = 0;

  function open(priority = false): Live {
    if (cursorPreset !== activePreset.id) {
      cursorPreset = activePreset.id;
      cursor = 0;
    }
    const templates = activePreset.cases;
    const tmpl = priority ? activePreset.disruption : templates[cursor++ % templates.length];

    const entry: Live = {
      id: nextId++,
      ref: `CASE-${4100 + nextId * 7}`,
      tmpl,
      title: tmpl.title,
      line: tmpl.trigger,
      priority,
      phase: "gathering",
      tracks: [0, 0, 0],
      evidence: [0, 0, 0],
      confidence: rand(0.28, 0.44),
      records: 0,
      // Three systems, drawn without replacement where there are three to draw
      // from — a case citing the same system three times is a case that has not
      // linked anything.
      sourceIds: sample(sourceIds, 3),
      skills: tmpl.skills,
      skillsRun: 0,
      // No two cases move at the same speed, or the board becomes a convoy.
      tempo: rand(0.6, 1.55),
      age: 0,
      deliberate: 0,
      linger: 0,
    };
    cases.push(entry);
    return entry;
  }

  /* Open the board mid-stream. Without this every case starts together, runs at
     the same pace and decides together — which is exactly the sequential feel
     the whole design exists to argue against. */
  for (let i = 0; i < SLOTS; i++) {
    const entry = open();
    const progress = i / SLOTS; // 0 → nearly complete
    for (let lane = 0; lane < LANE_NEED.length; lane++) {
      entry.evidence[lane] = Math.min(
        LANE_NEED[lane],
        Math.floor(LANE_NEED[lane] * progress + rand(0, 0.9)),
      );
    }
    entry.records = Math.round(22 * progress);
    entry.confidence = 0.3 + progress * 0.5;
    entry.age = progress * 18;
    sync(entry);
  }

  function sync(entry: Live) {
    for (let k = 0; k < LANE_NEED.length; k++) {
      entry.tracks[k] = entry.evidence[k] / LANE_NEED[k];
    }
  }

  const complete = (entry: Live) =>
    entry.evidence.every((n, k) => n >= LANE_NEED[k]);

  function decide(entry: Live) {
    entry.phase = "decided";
    entry.line = entry.tmpl.decision;
    entry.linger = rand(4.5, 9);
    decided++;

    for (const agent of AGENTS) {
      if (entry.skills.some((s) => agent.skills.includes(s))) agent.xp++;
    }

    onDecide({
      ref: entry.ref,
      title: entry.tmpl.title,
      decision: entry.tmpl.decision,
      impact: entry.tmpl.impact,
      confidence: entry.confidence,
      sources: new Set(entry.sourceIds).size,
      priority: entry.priority,
    });
  }

  return {
    cases,
    get decided() {
      return decided;
    },

    step(dt) {
      // Keep the board populated. New cases open while old ones are mid-flight,
      // which is what makes it read as continuous rather than cyclic.
      openCooldown -= dt;
      if (cases.length < SLOTS && openCooldown <= 0) {
        open();
        openCooldown = rand(1.4, 4);
      }

      for (let i = cases.length - 1; i >= 0; i--) {
        const entry = cases[i];
        entry.age += dt;

        if (entry.phase === "gathering") {
          /* Every lane accrues at once, at its own pace. This is the whole
             claim the copy beside it makes — three concurrent lanes, not three
             sequential steps — and the old rendering could not show it, because
             everything in that picture moved at once anyway. */
          const paces = [0.42, 0.34, 0.5];
          let gained = false;
          for (let k = 0; k < LANE_NEED.length; k++) {
            const want = Math.min(
              LANE_NEED[k],
              Math.floor(entry.age * paces[k] * entry.tempo),
            );
            if (want > entry.evidence[k]) {
              entry.evidence[k] = want;
              entry.records += 1 + ((Math.random() * 2) | 0);
              gained = true;
            }
          }
          if (gained) {
            entry.confidence = Math.min(0.9, entry.confidence + rand(0.01, 0.03));
            sync(entry);
          }
          if (complete(entry)) {
            entry.phase = "deliberating";
            entry.deliberate = 0;
          }
        } else if (entry.phase === "deliberating") {
          // Agents run their skills over the assembled evidence. Each skill
          // lands at its own moment — the council is not a queue.
          entry.deliberate += dt;
          const done = Math.min(
            entry.skills.length,
            Math.floor(entry.deliberate / 0.55),
          );
          if (done > entry.skillsRun) {
            entry.skillsRun = done;
            entry.confidence = Math.min(0.985, entry.confidence + rand(0.02, 0.05));
          }
          if (
            entry.skillsRun >= entry.skills.length &&
            entry.deliberate > entry.skills.length * 0.55 + 0.4
          ) {
            decide(entry);
          }
        } else {
          entry.linger -= dt;
          if (entry.linger <= 0) cases.splice(i, 1);
        }
      }
    },

    inject() {
      const entry = open(true);
      // Runs hot: a disruption that took as long as everything else would not
      // be much of a disruption.
      entry.tempo = 2.4;
      entry.age = 6;
    },

    agents() {
      // A skill is running when some case that checked it out is deliberating.
      const running = new Set<string>();
      const claimed = new Set<string>();
      for (const entry of cases) {
        for (const skill of entry.skills) {
          claimed.add(skill);
          if (entry.phase === "deliberating") running.add(skill);
        }
      }

      return AGENTS.map((agent) => ({
        id: agent.id,
        code: agent.code,
        name: agent.name,
        verb: agent.verb,
        tone: agent.tone,
        xp: agent.xp,
        active: agent.skills.some((s) => claimed.has(s)),
        skills: agent.skills.map((name) => ({ name, running: running.has(name) })),
      }));
    },
  };
}

/// `n` distinct entries where there are enough to be distinct, falling back to
/// repeats rather than to a short list when there are not.
function sample(pool: string[], n: number): string[] {
  if (!pool.length) return [];
  if (pool.length <= n) return [...pool];
  const rest = [...pool];
  return Array.from({ length: n }, () => {
    const i = (Math.random() * rest.length) | 0;
    return rest.splice(i, 1)[0];
  });
}

export { pick };
