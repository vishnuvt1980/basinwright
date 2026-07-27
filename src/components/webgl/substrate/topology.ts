/* ---------------------------------------------------------------------------
   Substrate topology, palettes and camera.

   One source of truth for where everything lives, in world units. The camera
   fits the world into whatever rect the banner hands it, which is why the
   field can never slide underneath the hero copy at any viewport size.

   The shape of the graph is the argument the section makes:

     your systems -> resolution -> three engines -> a decision -> your business

   with BasinWright's own control plane (build, deploy, monitor) running
   underneath it. The last node is the point: everything upstream is operated
   by us, and what comes out the end belongs to the customer.
--------------------------------------------------------------------------- */

import { DEFAULT_SOURCES } from "@/lib/industries";

/**
 * World extents. Everything below is expressed in these units, never pixels.
 *
 * Wide and shallow: the banner is a full-width strip, and a world with a
 * portrait-ish aspect gets fitted by its height and leaves most of the width
 * empty. Everything below is laid out to fill a letterbox.
 */
export const WORLD = { w: 100, h: 40 };

export type Ink = readonly [number, number, number];

export type InkKey =
  | "raw"
  | "context"
  | "ground"
  | "verify"
  | "explain"
  | "decided"
  | "reject"
  | "ops"
  | "own";

export type Palette = Record<InkKey, Ink>;

/**
 * Dark theme: additive light on a near-black field.
 *
 * These are HDR weights rather than CSS colours — the canvas accumulates them
 * and tone-maps once at the end, so they are tuned for how they stack, not for
 * how they read as a swatch. They follow the Fluent ramp the rest of the site
 * uses, pushed to the bright end, because a dark ramp value disappears
 * entirely once tone-mapped.
 */
export const INK_DARK: Palette = {
  /// Unresolved records read as slate.
  raw: [0.42, 0.47, 0.57],
  /// brand-400 — the hub's governed colour, and the site's accent.
  context: [0.42, 0.72, 0.96],
  /// Azure pushed violet, so grounding is distinct from resolution at a glance.
  ground: [0.55, 0.6, 1.0],
  /// Teal lifted — the verdigris tone.
  verify: [0.25, 0.9, 0.78],
  /// Amber, softened so it does not out-shout everything else.
  explain: [1.0, 0.66, 0.28],
  /// Decision-grade: almost white, still blue.
  decided: [0.82, 0.93, 1.0],
  /// Quarantine.
  reject: [1.0, 0.42, 0.5],
  /// BasinWright's control plane. Deliberately cooler and quieter than the
  /// data it operates on — it is scaffolding, not the product.
  ops: [0.55, 0.66, 0.86],
  /// What the customer keeps. The one green on the board, so the end of the
  /// story is unmistakable.
  own: [0.62, 0.95, 0.35],
};

/**
 * Light theme: the same picture drawn as ink on paper.
 *
 * The renderer cannot simply be run "in reverse" — it accumulates additively,
 * which on a white ground would only ever wash out. So in light mode every
 * value below is the *complement* of the colour we want to see: the buffer
 * accumulates how much light each mark removes, and the present pass inverts
 * once at the end. Subtractive mixing, which is what ink actually does, and it
 * preserves hue where a naive inversion would not.
 *
 * Written as the display colours, complemented in one place, so the table
 * stays readable and stays honest about what it is.
 */
const LIGHT_DISPLAY: Palette = {
  raw: [0.48, 0.51, 0.56], // slate
  context: [0.0, 0.4, 0.72], // brand-600
  ground: [0.36, 0.18, 0.57], // purple
  verify: [0.01, 0.51, 0.53], // teal
  explain: [0.72, 0.31, 0.06], // amber
  decided: [0.0, 0.27, 0.47], // brand-900
  reject: [0.64, 0.15, 0.17], // ember
  ops: [0.24, 0.31, 0.43], // shade-600
  own: [0.06, 0.49, 0.06], // green
};

const complement = (c: Ink): Ink => [1 - c[0], 1 - c[1], 1 - c[2]];

export const INK_LIGHT: Palette = Object.fromEntries(
  Object.entries(LIGHT_DISPLAY).map(([key, value]) => [key, complement(value)]),
) as Palette;

export const palette = (dark: boolean): Palette => (dark ? INK_DARK : INK_LIGHT);

/// Blends two palette entries — used where a record is mid-transition between
/// two states and its colour should be too.
export function mixInk(a: Ink, b: Ink, k: number): Ink {
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];
}

/* -------------------------------------------------------------------------- */
/* Nodes                                                                      */
/* -------------------------------------------------------------------------- */

export type NodeGroup =
  | "source"
  | "hub"
  | "engine"
  | "decision"
  | "quarantine"
  /// BasinWright's control plane: build, deploy, monitor.
  | "ops"
  /// The customer's side of the line.
  | "ownership";

export type Anchor = "top" | "bottom" | "right" | "left";

export type SubstrateNode = {
  id: string;
  group: NodeGroup;
  label: string;
  sub: string;
  x: number;
  y: number;
  anchor: Anchor;
  /// Glyph proportions for records originating here: 0 signal, 1 record,
  /// 2 document, 3 decision.
  shape: number;
  ink: InkKey;
};

/**
 * Where a source node may sit, ordered up the left edge of the world.
 *
 * The slots are fixed — a configuration renames the ingest side and changes how
 * many systems feed it, it never moves the picture. When a visitor connects
 * fewer than six systems the slots are chosen spread across the whole edge
 * rather than taken from the top, so the fan-in stays balanced at any count.
 */
const SOURCE_SLOTS = [
  { x: 7, y: 7, anchor: "right" as const },
  { x: 11, y: 13, anchor: "right" as const },
  { x: 6, y: 20, anchor: "right" as const },
  { x: 10, y: 27, anchor: "right" as const },
  { x: 7, y: 33, anchor: "right" as const },
  { x: 15, y: 37, anchor: "right" as const },
];

/// Glyph proportions, cycled across whatever count of sources is connected, so
/// the ingest side always shows a mix of signals, records and documents rather
/// than six of the same mark. 0 signal, 1 record, 2 document.
const SOURCE_SHAPES = [1, 0, 2, 1, 0, 1];

/// Slots to use for `n` sources, spread across the full edge.
function chooseSlots(n: number) {
  const count = Math.max(1, Math.min(SOURCE_SLOTS.length, n));
  if (count === 1) return [SOURCE_SLOTS[2]];
  return Array.from({ length: count }, (_, i) =>
    SOURCE_SLOTS[Math.round((i * (SOURCE_SLOTS.length - 1)) / (count - 1))],
  );
}

/**
 * The systems the substrate ingests from.
 *
 * Mutated in place by `setSources` rather than replaced, because the lattice,
 * the residents, the field's per-source counters and the case board all hold
 * references into this array. Same reason `NODES` and `LINKS` below are filled
 * rather than rebuilt.
 */
export const SOURCES: SubstrateNode[] = [];

export const HUB: SubstrateNode = {
  id: "hub",
  group: "hub",
  label: "Cognitive Data Hub",
  sub: "resolve · link · govern",
  x: 31,
  y: 20,
  anchor: "top",
  shape: 0,
  ink: "context",
};

export type EngineNode = SubstrateNode & { verb: string };

export const ENGINES: EngineNode[] = [
  { id: "rag", group: "engine", label: "Cognitive RAG", sub: "retrieve & ground", verb: "GROUND", ink: "ground", x: 54, y: 32, anchor: "top", shape: 0 },
  { id: "det", group: "engine", label: "Deterministic Models", sub: "simulate & verify", verb: "VERIFY", ink: "verify", x: 58, y: 20, anchor: "bottom", shape: 0 },
  { id: "llm", group: "engine", label: "LLM Reasoning", sub: "weigh & explain", verb: "EXPLAIN", ink: "explain", x: 54, y: 11, anchor: "bottom", shape: 0 },
];

/// BasinWright's own plane. Not part of the data path — this is the work we do
/// so the data path keeps working.
export const OPS: SubstrateNode[] = [
  { id: "build", group: "ops", label: "Build", sub: "train · tune", shape: 1, x: 44, y: 2, anchor: "bottom", ink: "ops" },
  { id: "deploy", group: "ops", label: "Deploy", sub: "your tenancy", shape: 1, x: 61, y: 2, anchor: "bottom", ink: "ops" },
  { id: "monitor", group: "ops", label: "Monitor 24×7", sub: "drift · cost", shape: 0, x: 78, y: 2, anchor: "bottom", ink: "ops" },
];

export const DECISION: SubstrateNode = {
  id: "dec",
  group: "decision",
  label: "Decision Layer",
  sub: "grounded · verified · actionable",
  x: 77,
  y: 20,
  anchor: "top",
  shape: 3,
  ink: "decided",
};

/// The last node, and the whole point of the picture.
export const OWNERSHIP: SubstrateNode = {
  id: "own",
  group: "ownership",
  label: "Your Business",
  sub: "owns the model · owns the intelligence",
  x: 92,
  y: 20,
  anchor: "bottom",
  shape: 3,
  ink: "own",
};

export const QUARANTINE: SubstrateNode = {
  id: "qtn",
  group: "quarantine",
  label: "Quarantine",
  sub: "held for remediation",
  x: 25,
  y: 2,
  anchor: "bottom",
  shape: 1,
  ink: "reject",
};

export const NODES: SubstrateNode[] = [];

export type Link = {
  a: SubstrateNode;
  b: SubstrateNode;
  inkA: InkKey;
  inkB: InkKey;
  weight: number;
};

/// The permanent lattice. Everything is always connected; traffic is what
/// varies, never the topology.
export const LINKS: Link[] = [];

/**
 * Points the ingest side of the world at a different set of systems.
 *
 * Must be called before an engine is constructed, never while one is running:
 * the field seeds one orbiting core per source and keeps a counter per source
 * id, and both are built from whatever this left behind.
 */
export function setSources(sources: { label: string; sub: string }[]) {
  const slots = chooseSlots(sources.length);

  SOURCES.length = 0;
  slots.forEach((slot, index) => {
    SOURCES.push({
      ...slot,
      // Positional rather than semantic: nothing outside this module reads a
      // source id, so a stable, collision-free slot name is all it has to be.
      id: `src${index}`,
      group: "source",
      ink: "raw",
      shape: SOURCE_SHAPES[index % SOURCE_SHAPES.length],
      label: sources[index].label,
      sub: sources[index].sub,
    });
  });

  NODES.length = 0;
  NODES.push(...SOURCES, HUB, ...ENGINES, ...OPS, DECISION, OWNERSHIP, QUARANTINE);

  LINKS.length = 0;
  LINKS.push(
    ...SOURCES.map((s) => ({ a: s, b: HUB, inkA: "raw" as InkKey, inkB: "context" as InkKey, weight: 0.5 })),
    ...ENGINES.map((e) => ({ a: HUB, b: e, inkA: "context" as InkKey, inkB: e.ink, weight: 1 })),
    ...ENGINES.map((e) => ({ a: e, b: DECISION, inkA: e.ink, inkB: "decided" as InkKey, weight: 0.85 })),
    { a: DECISION, b: OWNERSHIP, inkA: "decided" as InkKey, inkB: "own" as InkKey, weight: 1 },
    { a: HUB, b: QUARANTINE, inkA: "context" as InkKey, inkB: "reject" as InkKey, weight: 0.4 },
    { a: QUARANTINE, b: HUB, inkA: "reject" as InkKey, inkB: "context" as InkKey, weight: 0.28 },
    // The control plane: built from governed data, deployed, then watched. The
    // monitor arm reaches back into every engine, which is what "24×7" means
    // when it is not just a phrase on a slide.
    { a: HUB, b: OPS[0], inkA: "context" as InkKey, inkB: "ops" as InkKey, weight: 0.45 },
    { a: OPS[0], b: OPS[1], inkA: "ops" as InkKey, inkB: "ops" as InkKey, weight: 0.6 },
    { a: OPS[1], b: OPS[2], inkA: "ops" as InkKey, inkB: "ops" as InkKey, weight: 0.6 },
    ...ENGINES.map((e) => ({ a: OPS[2], b: e, inkA: "ops" as InkKey, inkB: e.ink, weight: 0.32 })),
  );
}

/**
 * The captions the board carries before anyone has configured it.
 *
 * A configuration renames the hub's governance line, the deploy node and the
 * last node in place; this is what they are put back to when it is cleared.
 * Captured before anything can overwrite them.
 */
export const DEFAULT_CAPTIONS = {
  governance: HUB.sub,
  tenancy: OPS[1].sub,
  owner: { label: OWNERSHIP.label, sub: OWNERSHIP.sub },
} as const;

/// The board a visitor who has configured nothing is looking at.
setSources(DEFAULT_SOURCES);

/* -------------------------------------------------------------------------- */
/* Narrative emphasis                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Which part of the substrate each narrative chapter is talking about.
 *
 * The index is the chapter's position in the CMS, so reordering the entries in
 * /admin reorders the emphasis with them. Anything not listed dims rather than
 * disappearing — the point of the picture is that the whole system is always
 * running, whichever part the copy is pointing at.
 */
const CHAPTER_GROUPS: NodeGroup[][] = [
  ["source"],
  ["source", "hub", "quarantine"],
  ["hub", "ops"],
  ["hub", "engine"],
  ["ops", "engine"],
  ["engine", "decision"],
  ["decision", "ownership"],
];

/// How far out-of-focus material is pushed down. Never zero: dimming to
/// nothing reads as a bug rather than as emphasis.
const DIM = 0.28;

export function chapterEmphasis(group: NodeGroup, chapter: number): number {
  const groups = CHAPTER_GROUPS[chapter];
  if (!groups) return 1;
  return groups.includes(group) ? 1 : DIM;
}

/// The chapter about the decision itself, where the stage traces provenance on
/// its own. Found rather than hard-coded so re-ordering chapters moves it.
export const TRACE_CHAPTER = CHAPTER_GROUPS.findIndex((g) =>
  g.includes("decision"),
);

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
 *
 * The rect is the *safe* area, not the canvas: the canvas is full-bleed behind
 * the hero copy, and the world is fitted into whatever is left beside it.
 */
export function makeCamera(rect: Rect, cssW: number, cssH: number): Camera {
  // Pad scales with the stage so node captions always have room to sit beside
  // their node instead of running off the edge. Taken from the *smaller*
  // dimension: on a wide, short banner a width-derived pad eats the only axis
  // that was scarce and collapses the whole field.
  const pad = Math.max(8, Math.min(48, Math.min(rect.width, rect.height) * 0.07));
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
