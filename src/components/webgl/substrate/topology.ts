/* ---------------------------------------------------------------------------
   Substrate topology + camera.

   One source of truth for where everything lives, in world units. The camera
   fits the world into the stage's *central* region, which is why nothing in
   the visualisation can ever slide underneath a HUD rail.
--------------------------------------------------------------------------- */

/// World extents. Everything below is expressed in these units, never pixels.
export const WORLD = { w: 100, h: 56 };

export type Ink = readonly [number, number, number];

/**
 * Colour is meaning. Raw data is deliberately grey — it earns colour as it is
 * resolved, grounded, verified and explained.
 *
 * These are linear-ish additive weights rather than CSS colours: the canvas
 * accumulates them in HDR and tone-maps once at the end, so they are tuned for
 * how they stack, not for how they read as a swatch. They follow the Fluent
 * ramp the rest of the site uses (`--tone` in globals.css) pushed to the bright
 * end, because a dark ramp value disappears entirely once tone-mapped.
 */
export const INK = {
  /// shade-600, near enough — unresolved records read as slate.
  raw: [0.42, 0.47, 0.57],
  /// brand-400 #6cb8f6 — the hub's governed colour, and the site's accent.
  context: [0.42, 0.72, 0.96],
  /// azure pushed violet: distinguishable from `context` at a glance.
  ground: [0.55, 0.60, 1.0],
  /// teal #4fd2d2 lifted — the verdigris tone.
  verify: [0.25, 0.9, 0.78],
  /// amber #ff8c00 softened so it does not out-shout everything else.
  explain: [1.0, 0.66, 0.28],
  /// Decision-grade: brand-200 at full lift, almost white but still blue.
  decided: [0.82, 0.93, 1.0],
  /// ember #f1707b — quarantine.
  reject: [1.0, 0.42, 0.5],
} as const satisfies Record<string, Ink>;

export type NodeGroup =
  | "source"
  | "hub"
  | "engine"
  | "decision"
  | "quarantine";

export type Anchor = "top" | "bottom" | "right" | "left";

export type SubstrateNode = {
  id: string;
  group: NodeGroup;
  label: string;
  sub: string;
  x: number;
  y: number;
  anchor: Anchor;
  /// Glyph proportions used for records originating here: 0 signal, 1 record,
  /// 2 document, 3 decision.
  shape: number;
  ink: Ink;
};

/// The systems the substrate ingests from. Names match the connectors the rest
/// of the site names in the platform topology section.
export const SOURCES: SubstrateNode[] = [
  { id: "erp", group: "source", label: "SAP S/4HANA", sub: "orders · deliveries", shape: 1, x: 7, y: 47, anchor: "right", ink: INK.raw },
  { id: "crm", group: "source", label: "Salesforce", sub: "accounts · cases", shape: 1, x: 12, y: 38, anchor: "right", ink: INK.raw },
  { id: "tel", group: "source", label: "IoT Telemetry", sub: "sensors · scans", shape: 0, x: 6, y: 29, anchor: "right", ink: INK.raw },
  { id: "evt", group: "source", label: "Event Streams", sub: "kafka · webhooks", shape: 0, x: 12, y: 20, anchor: "right", ink: INK.raw },
  { id: "doc", group: "source", label: "SharePoint", sub: "contracts · email", shape: 2, x: 7, y: 11, anchor: "right", ink: INK.raw },
  { id: "led", group: "source", label: "Snowflake", sub: "gl · invoices", shape: 1, x: 17, y: 53, anchor: "right", ink: INK.raw },
];

export const HUB: SubstrateNode = {
  id: "hub",
  group: "hub",
  label: "Cognitive Data Hub",
  sub: "resolve · link · govern",
  x: 34,
  y: 29,
  anchor: "top",
  shape: 0,
  ink: INK.context,
};

export type EngineNode = SubstrateNode & { verb: string };

export const ENGINES: EngineNode[] = [
  { id: "rag", group: "engine", label: "Cognitive RAG", sub: "retrieve & ground", verb: "GROUND", ink: INK.ground, x: 60, y: 46, anchor: "top", shape: 0 },
  { id: "det", group: "engine", label: "Deterministic Models", sub: "simulate & verify", verb: "VERIFY", ink: INK.verify, x: 64, y: 29, anchor: "bottom", shape: 0 },
  { id: "llm", group: "engine", label: "LLM Reasoning", sub: "weigh & explain", verb: "EXPLAIN", ink: INK.explain, x: 60, y: 11, anchor: "bottom", shape: 0 },
];

export const DECISION: SubstrateNode = {
  id: "dec",
  group: "decision",
  label: "Decision Layer",
  sub: "grounded · verified · actionable",
  x: 88,
  y: 29,
  anchor: "top",
  shape: 3,
  ink: INK.decided,
};

export const QUARANTINE: SubstrateNode = {
  id: "qtn",
  group: "quarantine",
  label: "Quarantine",
  sub: "held for remediation",
  x: 40,
  y: 3,
  anchor: "bottom",
  shape: 1,
  ink: INK.reject,
};

export const NODES: SubstrateNode[] = [
  ...SOURCES,
  HUB,
  ...ENGINES,
  DECISION,
  QUARANTINE,
];

export type Link = {
  a: SubstrateNode;
  b: SubstrateNode;
  inkA: Ink;
  inkB: Ink;
  weight: number;
};

/// The permanent lattice. Everything is always connected; traffic is what
/// varies, never the topology.
export const LINKS: Link[] = [
  ...SOURCES.map((s) => ({ a: s, b: HUB, inkA: INK.raw as Ink, inkB: INK.context as Ink, weight: 0.5 })),
  ...ENGINES.map((e) => ({ a: HUB, b: e, inkA: INK.context as Ink, inkB: e.ink, weight: 1 })),
  ...ENGINES.map((e) => ({ a: e, b: DECISION, inkA: e.ink, inkB: INK.decided as Ink, weight: 0.85 })),
  { a: HUB, b: QUARANTINE, inkA: INK.context, inkB: INK.reject, weight: 0.4 },
  { a: QUARANTINE, b: HUB, inkA: INK.reject, inkB: INK.context, weight: 0.28 },
];

/* -------------------------------------------------------------------------- */
/* Narrative emphasis                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Which part of the substrate each narrative chapter is talking about.
 *
 * The index is the chapter's position in the CMS, so reordering the entries in
 * /admin reorders the emphasis with them. Anything not listed dims rather than
 * disappearing — the point of the picture is that the whole system is always
 * running, whichever part the copy is currently pointing at.
 */
const CHAPTER_GROUPS: NodeGroup[][] = [
  ["source"],
  ["source", "hub", "quarantine"],
  ["hub", "engine"],
  ["engine", "decision"],
  ["source", "hub", "engine", "decision", "quarantine"],
];

/// How far out-of-focus material is pushed down. Never zero: dimming to nothing
/// reads as a bug rather than as emphasis.
const DIM = 0.3;

export function chapterEmphasis(group: NodeGroup, chapter: number): number {
  const groups = CHAPTER_GROUPS[chapter];
  if (!groups) return 1;
  return groups.includes(group) ? 1 : DIM;
}

/// The chapter whose whole point is that provenance lights up on demand, so the
/// stage traces cases by itself while it is on screen.
export const PROVENANCE_CHAPTER = CHAPTER_GROUPS.length - 1;

/* -------------------------------------------------------------------------- */
/* Camera                                                                     */
/* -------------------------------------------------------------------------- */

export type Rect = { x: number; y: number; width: number; height: number };

export type Camera = {
  scale: number;
  /// clip = pos * mul + add   (world y is up, screen y is down)
  mul: [number, number];
  add: [number, number];
  /// World -> CSS pixels within the canvas, for positioning DOM labels.
  toScreen(x: number, y: number): [number, number];
};

/**
 * Fits the world into a rect (CSS px, relative to the canvas). Returns
 * clip-space multipliers for the shaders plus a world -> screen projector for
 * the DOM node captions.
 */
export function makeCamera(rect: Rect, cssW: number, cssH: number): Camera {
  // Pad scales with the stage so node captions always have room to sit beside
  // their node instead of running off the edge.
  const pad = Math.max(8, Math.min(56, rect.width * 0.055));
  const w = Math.max(120, rect.width - pad * 2);
  const h = Math.max(120, rect.height - pad * 2);
  const s = Math.min(w / WORLD.w, h / WORLD.h);
  const ox = rect.x + pad + (w - WORLD.w * s) / 2;
  const oy = rect.y + pad + (h - WORLD.h * s) / 2;

  return {
    scale: s,
    mul: [(2 * s) / cssW, (2 * s) / cssH],
    add: [(2 * ox) / cssW - 1, 1 - (2 * oy) / cssH - (2 * WORLD.h * s) / cssH],
    toScreen(x, y) {
      return [ox + x * s, oy + (WORLD.h - y) * s];
    },
  };
}
