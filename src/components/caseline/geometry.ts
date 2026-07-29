/* ---------------------------------------------------------------------------
   The Case Line — where everything sits, in one coordinate space.

   The old field was a particle simulation that the viewer had to infer a
   diagram from. This is a diagram that a simulation runs *inside*. Same
   argument, same topology, same story:

     your systems -> resolution -> three engines -> a decision -> your business

   drawn as stations on a rail, with BasinWright's control plane bracketed
   underneath it, so a single frame can be screenshotted and understood.

   One coordinate space serves both layers: the SVG that draws the connective
   tissue uses it as a viewBox, and the DOM cards laid over the top position
   themselves as percentages of the same box. The box's aspect ratio is locked
   in CSS, which is what keeps the two in register at every width.
--------------------------------------------------------------------------- */

/// The drawing. Everything below is in these units, never pixels.
export const BOX = { w: 1320, h: 500 };

/**
 * The band the tracked case rides along the top.
 *
 * It gets a lane of its own rather than being parked beside whichever station
 * it is visiting: a marker that moves along one clean line, with a tick
 * dropping to the station below it, reads as a playhead over a process. A
 * marker that hops around inside the diagram reads as another object in the
 * diagram, which is the mistake the whole revision exists to undo.
 */
export const CASE_BAND = { y: 6, h: 58 };

export type Rect = { x: number; y: number; w: number; h: number };

/// A card's position as CSS percentages of the box.
export function place(rect: Rect) {
  return {
    left: `${(rect.x / BOX.w) * 100}%`,
    top: `${(rect.y / BOX.h) * 100}%`,
    width: `${(rect.w / BOX.w) * 100}%`,
    height: `${(rect.h / BOX.h) * 100}%`,
  };
}

/* -------------------------------------------------------------------------- */
/* Stations                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The groups the story can point at.
 *
 * Deliberately the same vocabulary the old topology used, so the chapter
 * mapping and the CMS copy carry over untouched.
 */
export type Group =
  | "source"
  | "hub"
  | "quarantine"
  | "engine"
  | "decision"
  | "ownership"
  | "ops";

/// The colour tokens, matching `--sub-*` in globals.css. Colour is state, and
/// the legend under the rail says so out loud rather than leaving it to be
/// guessed.
export type Ink =
  | "raw"
  | "context"
  | "ground"
  | "verify"
  | "explain"
  | "decided"
  | "reject"
  | "ops"
  | "own";

export const INK_VAR: Record<Ink, string> = {
  raw: "var(--sub-raw)",
  context: "var(--sub-context)",
  ground: "var(--sub-ground)",
  verify: "var(--sub-verify)",
  explain: "var(--sub-explain)",
  decided: "var(--sub-decided)",
  reject: "var(--sub-reject)",
  ops: "var(--sub-ops)",
  own: "var(--sub-own)",
};

/* The rail. Left to right, and only left to right — the two movements that are
   not part of the forward path (quarantine, and the control plane) leave it
   downward, so nothing ever crosses. */

export const SOURCE_RAIL = { x: 24, w: 184 };
/// Tile height and the gap between tiles. The column is centred on the hub.
export const SOURCE_TILE = { h: 44, gap: 13 };

export const HUB: Rect = { x: 286, y: 172, w: 212, h: 136 };
export const QUARANTINE: Rect = { x: 286, y: 326, w: 212, h: 88 };

export const LANE_BOX = { x: 590, w: 250, h: 98 };
export const LANE_Y = [76, 190, 304];

export const DECISION: Rect = { x: 890, y: 172, w: 204, h: 136 };
export const OWNERSHIP: Rect = { x: 1124, y: 172, w: 172, h: 136 };

/// The line the decision crosses. Everything to the right of it is the
/// customer's, and the whole picture is an argument for this one edge.
export const ESTATE_X = 1109;

/// BasinWright's own plane, bracketed beneath the data path rather than
/// threaded through it.
export const OPS_BAND: Rect = { x: 286, y: 424, w: 808, h: 52 };

export type Lane = {
  id: string;
  label: string;
  sub: string;
  /// The verb the lane contributes to the decision.
  verb: string;
  ink: Ink;
  rect: Rect;
};

export const LANES: Lane[] = [
  {
    id: "rag",
    label: "Cognitive RAG",
    sub: "retrieve & ground",
    verb: "GROUND",
    ink: "ground",
    rect: { x: LANE_BOX.x, y: LANE_Y[0], w: LANE_BOX.w, h: LANE_BOX.h },
  },
  {
    id: "det",
    label: "Deterministic Models",
    sub: "simulate & verify",
    verb: "VERIFY",
    ink: "verify",
    rect: { x: LANE_BOX.x, y: LANE_Y[1], w: LANE_BOX.w, h: LANE_BOX.h },
  },
  {
    id: "llm",
    label: "LLM Reasoning",
    sub: "weigh & explain",
    verb: "EXPLAIN",
    ink: "explain",
    rect: { x: LANE_BOX.x, y: LANE_Y[2], w: LANE_BOX.w, h: LANE_BOX.h },
  },
];

export const OPS_STEPS = [
  { id: "build", label: "Build", sub: "train · evaluate" },
  { id: "deploy", label: "Deploy", sub: "your tenancy" },
  { id: "monitor", label: "Monitor 24×7", sub: "drift · cost" },
];

/* -------------------------------------------------------------------------- */
/* Source column                                                              */
/* -------------------------------------------------------------------------- */

/// Where source tile `i` of `n` sits. The column is centred on the hub, so
/// connecting three systems or six changes the fan-in, never the composition.
export function sourceRect(i: number, n: number): Rect {
  const span = n * SOURCE_TILE.h + (n - 1) * SOURCE_TILE.gap;
  const top = HUB.y + HUB.h / 2 - span / 2;
  return {
    x: SOURCE_RAIL.x,
    y: top + i * (SOURCE_TILE.h + SOURCE_TILE.gap),
    w: SOURCE_RAIL.w,
    h: SOURCE_TILE.h,
  };
}

/* -------------------------------------------------------------------------- */
/* Segments                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A leg of the path, as a quadratic bezier.
 *
 * Every mark on screen is somewhere on one of these, which is the whole reason
 * the picture reads as a flow rather than as noise: there are eleven possible
 * routes through the drawing, not ten thousand.
 */
export type Segment = {
  id: string;
  a: [number, number];
  c: [number, number];
  b: [number, number];
  from: Ink;
  to: Ink;
};

export function pointOn(seg: Segment, t: number): [number, number] {
  const u = 1 - t;
  return [
    u * u * seg.a[0] + 2 * u * t * seg.c[0] + t * t * seg.b[0],
    u * u * seg.a[1] + 2 * u * t * seg.c[1] + t * t * seg.b[1],
  ];
}

/// Direction of travel at `t`, for pointing a mark along its route.
export function angleOn(seg: Segment, t: number): number {
  const u = 1 - t;
  const dx = 2 * u * (seg.c[0] - seg.a[0]) + 2 * t * (seg.b[0] - seg.c[0]);
  const dy = 2 * u * (seg.c[1] - seg.a[1]) + 2 * t * (seg.b[1] - seg.c[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export function pathOf(seg: Segment): string {
  return `M${seg.a[0]} ${seg.a[1]} Q${seg.c[0]} ${seg.c[1]} ${seg.b[0]} ${seg.b[1]}`;
}

const hubIn: [number, number] = [HUB.x, HUB.y + HUB.h / 2];
const hubOut: [number, number] = [HUB.x + HUB.w, HUB.y + HUB.h / 2];
const decIn: [number, number] = [DECISION.x, DECISION.y + DECISION.h / 2];
const decOut: [number, number] = [DECISION.x + DECISION.w, DECISION.y + DECISION.h / 2];
const ownIn: [number, number] = [OWNERSHIP.x, OWNERSHIP.y + OWNERSHIP.h / 2];

/**
 * Builds the routes for a given number of connected systems.
 *
 * Rebuilt rather than mutated in place: nothing outside a running simulation
 * holds a reference to a segment, so a reconfiguration can simply hand over a
 * new set.
 */
/**
 * One rule for every fan in the drawing: **the shared end is the horizontal
 * one.**
 *
 * A quadratic's tangent at each end points at its control, so putting the
 * control level with the single node — the hub, the decision layer — makes the
 * strands leave or arrive along the spine and splay only at the far end. Fanning
 * out of the hub and fanning back into the decision layer then read as the same
 * gesture mirrored, which is what they are.
 *
 * The fan-in used to be built the other way round, level with each source and
 * nudged along, and it showed: six strands bending late and piling into the
 * hub's edge at six different angles, which is the one part of the picture that
 * still read as a knot.
 */
function fan(
  a: [number, number],
  b: [number, number],
  /// Which end is the single node the strands share.
  shared: "a" | "b",
): [number, number] {
  const level = shared === "a" ? a[1] : b[1];
  return [(a[0] + b[0]) / 2, level];
}

export function segmentsFor(sources: number): Segment[] {
  const segs: Segment[] = [];

  for (let i = 0; i < sources; i++) {
    const r = sourceRect(i, sources);
    const a: [number, number] = [r.x + r.w, r.y + r.h / 2];
    segs.push({
      id: `in${i}`,
      a,
      c: fan(a, hubIn, "b"),
      b: hubIn,
      from: "raw",
      to: "context",
    });
  }

  LANES.forEach((lane, k) => {
    const laneIn: [number, number] = [lane.rect.x, lane.rect.y + lane.rect.h / 2];
    const laneOut: [number, number] = [
      lane.rect.x + lane.rect.w,
      lane.rect.y + lane.rect.h / 2,
    ];
    segs.push({
      id: `lane${k}`,
      a: hubOut,
      c: fan(hubOut, laneIn, "a"),
      b: laneIn,
      from: "context",
      to: lane.ink,
    });
    segs.push({
      id: `out${k}`,
      // Converging, so the decision layer is the shared end — the same
      // correction the fan-in needed, for the same reason.
      c: fan(laneOut, decIn, "b"),
      a: laneOut,
      b: decIn,
      from: lane.ink,
      to: "decided",
    });
  });

  segs.push({
    id: "hand",
    a: decOut,
    c: [(decOut[0] + ownIn[0]) / 2, decOut[1]],
    b: ownIn,
    from: "decided",
    to: "own",
  });

  const qtnTop: [number, number] = [
    QUARANTINE.x + QUARANTINE.w / 2,
    QUARANTINE.y,
  ];
  segs.push({
    id: "qtn",
    a: [HUB.x + HUB.w / 2, HUB.y + HUB.h],
    c: [HUB.x + HUB.w / 2, (HUB.y + HUB.h + qtnTop[1]) / 2],
    b: qtnTop,
    from: "context",
    to: "reject",
  });

  return segs;
}

/* -------------------------------------------------------------------------- */
/* The story                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Where the tracked case stands during each chapter, and what is lit while it
 * stands there.
 *
 * The index is the chapter's position in the CMS, so reordering entries in
 * /admin reorders the journey with them. The critical property — and the thing
 * the old rendering never had — is that consecutive chapters put the case in
 * *different* places. A chapter change moves the subject; it does not merely
 * dim two thirds of the picture and hope the difference is noticed.
 */
export type Stage = "intake" | "resolve" | "lanes" | "decide" | "own";

export const STAGE_ORDER: Stage[] = ["intake", "resolve", "lanes", "decide", "own"];

export type ChapterFocus = { stage: Stage; lit: Group[] };

export const CHAPTER_FOCUS: ChapterFocus[] = [
  { stage: "intake", lit: ["source"] },
  { stage: "resolve", lit: ["source", "hub", "quarantine"] },
  { stage: "resolve", lit: ["hub", "ops"] },
  { stage: "lanes", lit: ["hub", "engine"] },
  { stage: "lanes", lit: ["engine", "ops"] },
  { stage: "decide", lit: ["engine", "decision"] },
  { stage: "own", lit: ["decision", "ownership"] },
];

/**
 * Where the case marker sits for each stage, and how far its tick reaches down.
 *
 * `x` is the centre of the station the marker is pointing at; `drop` is the top
 * edge of that station, so the tick lands on it rather than near it.
 */
export const STAGE_ANCHOR: Record<Stage, { x: number; drop: number }> = {
  intake: { x: SOURCE_RAIL.x + SOURCE_RAIL.w / 2, drop: HUB.y - 40 },
  resolve: { x: HUB.x + HUB.w / 2, drop: HUB.y },
  lanes: { x: LANE_BOX.x + LANE_BOX.w / 2, drop: LANE_Y[0] },
  decide: { x: DECISION.x + DECISION.w / 2, drop: DECISION.y },
  own: { x: OWNERSHIP.x + OWNERSHIP.w / 2, drop: OWNERSHIP.y },
};

export function focusFor(chapter: number): ChapterFocus {
  return (
    CHAPTER_FOCUS[chapter] ?? {
      stage: "resolve",
      lit: ["source", "hub", "engine", "decision", "ownership", "ops"],
    }
  );
}

/// Out-of-focus material recedes rather than disappearing: the argument is that
/// the whole system is always running, whichever part the copy is pointing at.
/// The case moving is what carries the emphasis, so this can stay gentle.
export function litFor(group: Group, chapter: number): boolean {
  return focusFor(chapter).lit.includes(group);
}

/* -------------------------------------------------------------------------- */
/* Legend                                                                     */
/* -------------------------------------------------------------------------- */

/// Colour is the state of a record. Left unexplained it is decoration, which
/// is exactly how the previous rendering was read.
export const LEGEND: { ink: Ink; label: string }[] = [
  { ink: "raw", label: "Unresolved" },
  { ink: "context", label: "Governed" },
  { ink: "verify", label: "Verified" },
  { ink: "reject", label: "Quarantined" },
  { ink: "own", label: "Yours" },
];
