/* ---------------------------------------------------------------------------
   The field: every unit of data in the system is a real object with state.

   State lives on the CPU, not in a shader closed-form. That is the whole point
   of the piece — because the simulation owns the state, the interface can ask
   it real questions ("which records produced this decision?") instead of
   narrating over decoration.

   Colour is stored as palette *keys*, never as resolved values, so the whole
   field can be re-inked when the visitor switches between light and dark
   without touching a single record.
--------------------------------------------------------------------------- */

import {
  DECISION,
  ENGINES,
  HUB,
  OPS,
  OWNERSHIP,
  QUARANTINE,
  SOURCES,
  type InkKey,
  type NodeGroup,
  type SubstrateNode,
} from "./topology";

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];
const ease = (t: number) => t * t * (3 - 2 * t);

/* -------------------------------------------------------------------------- */
/* The flow                                                                   */
/* -------------------------------------------------------------------------- */

/* One field of directions, shared by every record on the board.

   The point is coherence. A record used to bow along an arc drawn for it alone,
   which at two thousand marks reads as spray: no two neighbours agree on which
   way the world is leaning, so nothing gathers. Sampling a single continuous
   field instead means records crossing the same patch of world are pushed the
   same way, and traffic bundles into strands the eye can follow.

   Two octaves of sine — one axis-aligned, one diagonal — drifting against each
   other at different rates, so there is no period to lock onto. Cheap enough to
   evaluate per record per frame, which is the only reason it can be shared. */

/// Radians of turn per world unit. The world is 100 across, so the near octave
/// takes about two and a half turns to cross it and the far one about six:
/// broad currents with detail inside them, rather than uniform churn.
const FLOW_NEAR = 0.024;
const FLOW_FAR = 0.062;

/// The field's own clock, against the simulation's seconds. Slow, deliberately:
/// this is weather over the board, not turbulence in it.
const FLOW_CLOCK = 0.36;

function flowAngle(x: number, y: number, time: number): number {
  const t = time * FLOW_CLOCK;
  const near =
    Math.sin(x * FLOW_NEAR + t * 0.6) + Math.cos(y * FLOW_NEAR - t * 0.4);
  const far =
    Math.sin((x + y) * FLOW_FAR - t * 0.5) +
    Math.cos((x - y) * FLOW_FAR + t * 0.3);
  return (near + far) * 1.35;
}

/**
 * How the flow is allowed to move a record: a damped mass on a spring, driven
 * along whichever streamline the record is standing in.
 *
 * The spring is the part that matters. A record owes its arrival to the
 * simulation — a decision has to reach the decision layer, and it has to reach
 * it on the leg that says so — and free advection would carry it wherever the
 * field liked. Tethering the excursion means the field decides the *shape* of
 * the journey while the simulation keeps the destination.
 *
 * Push over tether sets how far a record can be carried off its line: about
 * three world units here, against the ±7 of the old per-record arc. This is the
 * dial between "flowing" and "chaotic" and it does not have much room — at four
 * units the excursions started crossing each other far enough from the lattice
 * that the board stopped reading as traffic between named nodes. Damping is
 * just under critical, so a record leans into a turn and settles rather than
 * ringing through it.
 */
const FLOW_PUSH = 9;
const FLOW_TETHER = 3;
const FLOW_DRAG = 3.1;

/// Where a record currently is in the pipeline. Doubles as the key the
/// narrative uses to decide whether this record is part of what the copy is
/// currently describing.
export type Leg =
  | "ingest"
  | "quarantine"
  | "remediate"
  | "expire"
  | "engine"
  | "deliver"
  /// The last hop: a decision passing across the line to the customer.
  | "own";

const LEG_GROUP: Record<Leg, NodeGroup> = {
  ingest: "source",
  quarantine: "quarantine",
  expire: "quarantine",
  remediate: "hub",
  engine: "engine",
  deliver: "decision",
  own: "ownership",
};

export const legGroup = (leg: Leg): NodeGroup => LEG_GROUP[leg];

/// A record's colour, as a blend of at most two palette entries. Resolved at
/// pack time against whichever palette the theme is currently using.
export type InkRef = { a: InkKey; b: InkKey | null; k: number };

const solid = (a: InkKey): InkRef => ({ a, b: null, k: 0 });
const blend = (a: InkKey, b: InkKey, k: number): InkRef => ({ a, b, k });

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
  /// How far the flow has carried this record off the line it owes its
  /// destination, and how fast that excursion is currently moving.
  fx: number;
  fy: number;
  fvx: number;
  fvy: number;
  seed: number;
  spin: number;
  orbitR: number;
  ink: InkRef;
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
  ink: InkKey;
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
  ink: InkKey;
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
  /// Decisions that have crossed to the customer's side of the line.
  owned: number;
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
    owned: 0,
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
      radius: number,
      /// Angular speed range — the control plane turns slower than the data.
      pace: [number, number] = [0.25, 0.7],
      shape = node.shape,
    ) => {
      for (let i = 0; i < count; i++) {
        this.residents.push({
          node,
          group: node.group,
          ink: node.ink,
          shape,
          // annulus, not a filled disc: sampling radius uniformly puts most of
          // the points near the centre and the node reads as a blob
          radius: radius * Math.sqrt(rand(0.34, 1)),
          angle: rand(0, TAU),
          speed: rand(pace[0], pace[1]) * (Math.random() < 0.5 ? -1 : 1),
          bob: rand(0.6, 1.5),
          seed: rand(0, TAU),
          size: rand(0.11, 0.22),
        });
      }
    };

    SOURCES.forEach((s) => core(s, 20, 1.7));
    core(HUB, 54, 4.2, [0.25, 0.7], 0);
    ENGINES.forEach((e) => core(e, 34, 3.1, [0.25, 0.7], 0));
    core(QUARANTINE, 16, 1.6);
    core(DECISION, 40, 3.2);
    // The end of the line gets the densest core on the board. It is the node
    // the whole picture is arguing towards.
    core(OWNERSHIP, 46, 3.4);
    // The control plane is present but unhurried: fewer marks, slower orbits.
    OPS.forEach((o) => core(o, 18, 1.9, [0.16, 0.4]));
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
      /* A record belonging to a tracked case is still the heavier mark, but
         only just. At two and a half times the ambient size it was a lozenge
         rather than a stroke, and the trail buffer turned every one of them
         into a broad wash. What makes a tracked record legible is its alpha and
         its halo, both of which it keeps. */
      size: caseId ? rand(0.17, 0.22) : rand(0.1, 0.17),
      ang: 0,
      fx: 0,
      fy: 0,
      fvx: 0,
      fvy: 0,
      seed: rand(0, TAU),
      spin: rand(-1.4, 1.4),
      // varied dwell radii: an annulus, not a blob
      orbitR: rand(0.5, 1.4),
      ink: solid("raw"),
      x: src.x,
      y: src.y,
      ax: src.x,
      ay: src.y,
      bx: HUB.x + rand(-2.6, 2.6),
      by: HUB.y + rand(-2.6, 2.6),
      /* A residual bow, and nothing more. This used to be the whole character
         of a record's path, which is exactly why the board read as spray: every
         record leaned a different way for no reason anyone could see. Now it
         only keeps two records on the same leg off the same line, and the flow
         they share is what shapes the journey. */
      arc: rand(-3, 3),
      speed: 1 / rand(2.6, 4.4),
      dead: false,
    };

    this.items.push(e);
    this.bySource[src.id]++;
    return e;
  }

  flash(x: number, y: number, ink: InkKey, strength: number, group: NodeGroup) {
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
      // Sampled where the record actually is — including last frame's
      // excursion — so a record that has drifted into a different current
      // follows that current, and strands hold together instead of unravelling.
      this.#drift(e, dt, time);
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

  /**
   * Advances this record's excursion from the line it is travelling.
   *
   * Integrated rather than read straight off the field, which is what turns a
   * direction into a path: the record carries momentum through a turn, so its
   * trail curves instead of kinking frame to frame.
   */
  #drift(e: Record_, dt: number, time: number) {
    const ang = flowAngle(e.x, e.y, time);
    e.fvx +=
      (Math.cos(ang) * FLOW_PUSH - FLOW_DRAG * e.fvx - FLOW_TETHER * e.fx) * dt;
    e.fvy +=
      (Math.sin(ang) * FLOW_PUSH - FLOW_DRAG * e.fvy - FLOW_TETHER * e.fy) * dt;
    e.fx += e.fvx * dt;
    e.fy += e.fvy * dt;
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

    // The flow, gated to nothing at both ends of the leg. A record may wander
    // as far as the current takes it in between, but it leaves the node it left
    // and reaches the node it owes — the picture is still a claim about where
    // data goes, and the flow is only how it gets there.
    const carry = Math.sin(k * Math.PI);
    e.x += e.fx * carry;
    e.y += e.fy * carry;

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
            "context",
            0.34,
            "hub",
          );
        }
        e.dead = true;
        return;
      }

      if (e.trust < 0.1 && !e.priority) {
        this.stats.quarantined++;
        this.#retarget(e, QUARANTINE, "quarantine", rand(-1.7, 1.7), 1 / rand(1.6, 2.6));
        e.ink = solid("reject");
        return;
      }

      e.hold = rand(0.3, 0.85);
      e.mess = 0.06; // normalised
      e.trust = rand(0.48, 0.72); // linked to a governed concept
      e.ink = solid("context");
      if (e.caseId) {
        this.flash(HUB.x + rand(-3, 3), HUB.y + rand(-3, 3), "context", 0.3, "hub");
      }
      return;
    }

    if (e.leg === "quarantine") {
      // Some held records come back once enrichment resolves the gap. A record
      // belonging to a tracked case always does — a business case is never
      // allowed to silently evaporate.
      if (e.caseId || Math.random() < 0.45) {
        this.stats.remediated++;
        this.#retarget(e, HUB, "remediate", rand(-2.2, 2.2), 1 / rand(2, 3));
        e.trust = rand(0.4, 0.6);
        e.ink = blend("reject", "context", 0.5);
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
      e.ink = solid(ENGINES[e.lane].ink);
      return;
    }

    if (e.leg === "deliver") {
      this.stats.delivered++;
      if (e.caseId) {
        this.flash(
          DECISION.x + rand(-2, 2),
          DECISION.y + rand(-2, 2),
          "decided",
          0.5,
          "decision",
        );
        arrivals.push({ caseId: e.caseId, lane: e.lane, src: e.src });
      }
      // A decision does not stop at the decision layer. It carries on across
      // the line and becomes something the customer holds — which is the last
      // thing this picture has to say, so it is the one hop that is drawn
      // rather than assumed.
      this.#retarget(e, OWNERSHIP, "own", rand(-1.3, 1.3), 1 / rand(1.4, 2.2));
      e.ink = blend("decided", "own", 0.55);
      return;
    }

    if (e.leg === "own") {
      this.stats.owned++;
      if (e.caseId) {
        this.flash(
          OWNERSHIP.x + rand(-2, 2),
          OWNERSHIP.y + rand(-2, 2),
          "own",
          0.55,
          "ownership",
        );
      }
      e.dead = true;
    }
  }

  /** Chooses the next leg once a dwell finishes. */
  #advance(e: Record_) {
    if (e.leg === "ingest" || e.leg === "remediate") {
      // Fan out: every case works all three engines at the same time.
      this.#retarget(e, ENGINES[e.lane], "engine", rand(-2.6, 2.6), 1 / rand(1.8, 3));
      return;
    }
    if (e.leg === "engine") {
      this.#retarget(e, DECISION, "deliver", rand(-1.7, 1.7), 1 / rand(1.6, 2.6));
      e.ink = blend(ENGINES[e.lane].ink, "decided", 0.55);
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
