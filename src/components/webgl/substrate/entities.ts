/* ---------------------------------------------------------------------------
   The field: every unit of data in the system is a real object with state.

   State lives on the CPU, not in a shader closed-form. That is the whole point
   of the piece — because the simulation owns the state, the interface can ask
   it real questions ("which records produced this decision?") instead of
   narrating over decoration.
--------------------------------------------------------------------------- */

import {
  DECISION,
  ENGINES,
  HUB,
  INK,
  QUARANTINE,
  SOURCES,
  type Ink,
  type NodeGroup,
  type SubstrateNode,
} from "./topology";

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];
const ease = (t: number) => t * t * (3 - 2 * t);

const mixInk = (a: Ink, b: Ink, k: number): number[] => [
  a[0] + (b[0] - a[0]) * k,
  a[1] + (b[1] - a[1]) * k,
  a[2] + (b[2] - a[2]) * k,
];

/// Where a record currently is in the pipeline. Doubles as the key the
/// narrative uses to decide whether this record is part of what the copy is
/// currently describing.
export type Leg =
  | "ingest"
  | "quarantine"
  | "remediate"
  | "expire"
  | "engine"
  | "deliver";

const LEG_GROUP: Record<Leg, NodeGroup> = {
  ingest: "source",
  quarantine: "quarantine",
  expire: "quarantine",
  remediate: "hub",
  engine: "engine",
  deliver: "decision",
};

export const legGroup = (leg: Leg): NodeGroup => LEG_GROUP[leg];

export type Record_ = {
  id: number;
  /// null for ambient background traffic.
  caseId: number | null;
  priority: boolean;
  src: string;
  shape: number;
  /// Engine lane this record is destined for.
  lane: number;
  leg: Leg;
  hold: number;
  t: number;
  trust: number;
  mess: number;
  dup: boolean;
  size: number;
  /// Heading, kept aligned to travel.
  ang: number;
  seed: number;
  spin: number;
  orbitR: number;
  ink: number[];
  x: number;
  y: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  arc: number;
  speed: number;
  dead: boolean;
};

/// A permanent orbiting core, so no part of the system is ever dark between
/// transits.
export type Resident = {
  node: SubstrateNode;
  group: NodeGroup;
  ink: Ink;
  shape: number;
  radius: number;
  angle: number;
  speed: number;
  bob: number;
  seed: number;
  size: number;
};

export type Flash = {
  x: number;
  y: number;
  ink: Ink;
  life: number;
  strength: number;
  group: NodeGroup;
};

export type Arrival = { caseId: number; lane: number; src: string };

export type FieldStats = {
  merged: number;
  quarantined: number;
  remediated: number;
  delivered: number;
  live: number;
};

export type EmitOptions = {
  caseId?: number | null;
  source?: SubstrateNode | null;
  lane?: number | null;
  priority?: boolean;
};

let nextId = 1;

export class Field {
  readonly capacity: number;
  readonly items: Record_[] = [];
  readonly residents: Resident[] = [];
  readonly flashes: Flash[] = [];
  readonly stats: FieldStats = {
    merged: 0,
    quarantined: 0,
    remediated: 0,
    delivered: 0,
    live: 0,
  };
  readonly bySource: Record<string, number>;

  constructor(capacity = 2600) {
    this.capacity = capacity;
    this.bySource = Object.fromEntries(SOURCES.map((s) => [s.id, 0]));
    this.#seedResidents();
  }

  #seedResidents() {
    const core = (
      node: SubstrateNode,
      count: number,
      ink: Ink,
      radius: number,
      shape: number,
    ) => {
      for (let i = 0; i < count; i++) {
        this.residents.push({
          node,
          group: node.group,
          ink,
          shape,
          // annulus, not a filled disc: sampling radius uniformly puts most of
          // the points near the centre and the node reads as a blob
          radius: radius * Math.sqrt(rand(0.34, 1)),
          angle: rand(0, TAU),
          speed: rand(0.25, 0.7) * (Math.random() < 0.5 ? -1 : 1),
          bob: rand(0.6, 1.5),
          seed: rand(0, TAU),
          size: rand(0.11, 0.22),
        });
      }
    };

    SOURCES.forEach((s) => core(s, 20, INK.raw, 1.7, s.shape));
    core(HUB, 54, INK.context, 4.2, 0);
    ENGINES.forEach((e) => core(e, 34, e.ink, 3.1, 0));
    core(DECISION, 40, INK.decided, 3.2, 3);
    core(QUARANTINE, 16, INK.reject, 1.6, 1);
  }

  /* ---- spawning ---------------------------------------------------------- */

  emit({
    caseId = null,
    source = null,
    lane = null,
    priority = false,
  }: EmitOptions = {}): Record_ | null {
    if (this.items.length >= this.capacity) return null;
    const src = source ?? pick(SOURCES);

    const e: Record_ = {
      id: nextId++,
      caseId,
      priority,
      src: src.id,
      shape: src.shape,
      lane: lane === null ? (Math.random() * ENGINES.length) | 0 : lane,
      leg: "ingest",
      hold: 0,
      t: 0,
      // messy on arrival: unnormalised, unlinked, of unknown quality
      trust: rand(0.05, 0.32),
      mess: rand(0.55, 1),
      dup: caseId ? false : Math.random() < 0.17,
      size: caseId ? rand(0.3, 0.4) : rand(0.1, 0.17),
      ang: 0,
      seed: rand(0, TAU),
      spin: rand(-1.4, 1.4),
      // varied dwell radii: an annulus, not a blob
      orbitR: rand(0.5, 1.4),
      ink: [...INK.raw],
      x: src.x,
      y: src.y,
      ax: src.x,
      ay: src.y,
      bx: HUB.x + rand(-2.6, 2.6),
      by: HUB.y + rand(-2.6, 2.6),
      arc: rand(-7, 7),
      speed: 1 / rand(2.6, 4.4),
      dead: false,
    };

    this.items.push(e);
    this.bySource[src.id]++;
    return e;
  }

  flash(x: number, y: number, ink: Ink, strength: number, group: NodeGroup) {
    this.flashes.push({ x, y, ink, life: 1, strength, group });
  }

  /* ---- simulation -------------------------------------------------------- */

  /** Advances every record. Returns the arrivals the case board must absorb. */
  step(dt: number, time: number): Arrival[] {
    const arrivals: Arrival[] = [];
    const items = this.items;

    for (let i = items.length - 1; i >= 0; i--) {
      const e = items[i];

      const px = e.x;
      const py = e.y;

      if (e.hold > 0) {
        e.hold -= dt;
        this.#orbit(e, time);
        this.#aim(e, px, py);
        if (e.hold <= 0) this.#advance(e);
        continue;
      }

      e.t += dt * e.speed * (e.priority ? 1.45 : 1);
      if (e.t >= 1) {
        e.t = 1;
        this.#arrive(e, arrivals);
      }
      this.#place(e, time);
      this.#aim(e, px, py);

      if (e.dead) items.splice(i, 1);
    }

    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt * 1.6;
      if (f.life <= 0) this.flashes.splice(i, 1);
    }

    this.stats.live = items.length;
    return arrivals;
  }

  /** Position along the current leg: an arced path plus quality-scaled noise. */
  #place(e: Record_, time: number) {
    const k = ease(e.t);
    const dx = e.bx - e.ax;
    const dy = e.by - e.ay;
    const len = Math.hypot(dx, dy) || 1;
    const bow = Math.sin(k * Math.PI) * e.arc;
    e.x = e.ax + dx * k - (dy / len) * bow;
    e.y = e.ay + dy * k + (dx / len) * bow;

    // messy records shake; the shake is what the hub takes away
    const m = e.mess;
    if (m > 0.01) {
      e.x += Math.sin(time * 5.1 + e.seed * 3.3) * m * 0.85;
      e.y += Math.cos(time * 4.3 + e.seed * 2.1) * m * 0.85;
    }
  }

  /* Points the mark along its own motion. Below a threshold the heading is
     held, so a record that is momentarily still does not spin on the spot. */
  #aim(e: Record_, px: number, py: number) {
    const dx = e.x - px;
    const dy = e.y - py;
    if (dx * dx + dy * dy > 1e-6) e.ang = Math.atan2(dy, dx);
  }

  /* Dwelling records orbit on a wide ring with a guaranteed angular speed.
     A tight, slow orbit parks hundreds of glyphs on the same pixels. */
  #orbit(e: Record_, time: number) {
    const r = (3.1 + Math.sin(time * 1.7 + e.seed) * 1.3) * e.orbitR;
    const w = (e.spin < 0 ? -1 : 1) * (1.1 + Math.abs(e.spin));
    e.x = e.bx + Math.cos(time * w + e.seed) * r;
    e.y = e.by + Math.sin(time * w + e.seed) * r * 0.9;
  }

  /** End of a leg — this is where meaning is added. */
  #arrive(e: Record_, arrivals: Arrival[]) {
    if (e.leg === "ingest") {
      // Resolution: duplicates collapse into their twin, junk is held back.
      if (e.dup) {
        this.stats.merged++;
        // Flashes mark events worth noticing, not every arrival — at ~46
        // records/sec a flash per arrival saturates the additive buffer to
        // flat white. Sample the merges instead.
        if (Math.random() < 0.22) {
          this.flash(
            HUB.x + rand(-2.5, 2.5),
            HUB.y + rand(-2.5, 2.5),
            INK.context,
            0.34,
            "hub",
          );
        }
        e.dead = true;
        return;
      }

      if (e.trust < 0.1 && !e.priority) {
        this.stats.quarantined++;
        this.#retarget(e, QUARANTINE, "quarantine", rand(-4, 4), 1 / rand(1.6, 2.6));
        e.ink = [...INK.reject];
        return;
      }

      e.hold = rand(0.3, 0.85);
      e.mess = 0.06; // normalised
      e.trust = rand(0.48, 0.72); // linked to a governed concept
      e.ink = [...INK.context];
      if (e.caseId) {
        this.flash(HUB.x + rand(-3, 3), HUB.y + rand(-3, 3), INK.context, 0.3, "hub");
      }
      return;
    }

    if (e.leg === "quarantine") {
      // Some held records come back once enrichment resolves the gap. A record
      // belonging to a tracked case always does — a business case is never
      // allowed to silently evaporate.
      if (e.caseId || Math.random() < 0.45) {
        this.stats.remediated++;
        this.#retarget(e, HUB, "remediate", rand(-5, 5), 1 / rand(2, 3));
        e.trust = rand(0.4, 0.6);
        e.ink = mixInk(INK.reject, INK.context, 0.5);
      } else {
        e.hold = rand(0.6, 1.6);
        e.leg = "expire";
      }
      return;
    }

    if (e.leg === "expire") {
      e.dead = true;
      return;
    }

    if (e.leg === "remediate") {
      e.hold = rand(0.3, 0.7);
      return;
    }

    if (e.leg === "engine") {
      e.hold = rand(0.5, 1.3);
      e.trust = Math.min(1, e.trust + rand(0.18, 0.34));
      e.ink = [...ENGINES[e.lane].ink];
      return;
    }

    if (e.leg === "deliver") {
      this.stats.delivered++;
      if (e.caseId) {
        this.flash(
          DECISION.x + rand(-2, 2),
          DECISION.y + rand(-2, 2),
          INK.decided,
          0.5,
          "decision",
        );
        arrivals.push({ caseId: e.caseId, lane: e.lane, src: e.src });
      }
      e.dead = true;
    }
  }

  /** Chooses the next leg once a dwell finishes. */
  #advance(e: Record_) {
    if (e.leg === "ingest" || e.leg === "remediate") {
      // Fan out: every case works all three engines at the same time.
      this.#retarget(e, ENGINES[e.lane], "engine", rand(-6, 6), 1 / rand(1.8, 3));
      return;
    }
    if (e.leg === "engine") {
      this.#retarget(e, DECISION, "deliver", rand(-4, 4), 1 / rand(1.6, 2.6));
      e.ink = mixInk(ENGINES[e.lane].ink, INK.decided, 0.55);
      return;
    }
    if (e.leg === "expire") e.dead = true;
  }

  /* A node is an area, not a point: aim each record at its own spot inside the
     node's footprint so arrivals spread instead of stacking on one pixel. */
  #retarget(
    e: Record_,
    node: SubstrateNode,
    leg: Leg,
    arc: number,
    speed: number,
    spread = 2.3,
  ) {
    e.ax = e.x;
    e.ay = e.y;
    e.bx = node.x + rand(-spread, spread);
    e.by = node.y + rand(-spread, spread);
    e.leg = leg;
    e.arc = arc;
    e.speed = speed;
    e.t = 0;
  }
}
