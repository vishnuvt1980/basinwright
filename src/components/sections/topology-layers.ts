import { toneForAccent, type Tone } from "@/components/icon";
import type { SectionWithEntries } from "@/lib/content";

/**
 * The four-layer stack, flattened out of the CMS into the plain shape both
 * renderers take. Everything here is serialisable so a server component can
 * hand it straight to the client island.
 */
export type TopologyLayer = {
  id: string;
  /// Layer name — "GPU Compute", "Foundation Models"…
  title: string;
  subtitle: string | null;
  body: string | null;
  icon: string | null;
  tone: Tone;
  /// The node labels drawn in this layer, from the entry's `bullets`.
  nodes: string[];
};

/// The drawn width of the SVG diagram. The height follows the layer count.
export const TOPOLOGY_WIDTH = 580;

/**
 * Plate geometry for a stack of `count` layers.
 *
 * The diagram was drawn for four layers and hardcoded to them — fixed spacing
 * in a fixed 3:2 box. Seven layers in that box either overflow it or, once
 * scaled to fit, shrink the captions to about seven pixels.
 *
 * So the plates flatten instead. Depth comes down as the stack grows, spacing
 * follows depth closely enough that plates never collide, and the box gets
 * taller rather than the text getting smaller. Four layers still produce the
 * exact geometry they always did, so nothing about the original drawing moved.
 */
export function topologyGeometry(count: number) {
  const depth = count <= 4 ? 38 : Math.max(22, 38 - (count - 4) * 4);
  // 2·depth is the plate's own height; the constant is the extrusion plus the
  // gap that keeps one plate off the next.
  const spacing = count <= 4 ? 90 : 2 * depth + 21;
  const topY = count <= 4 ? 62 : 46;

  return {
    depth,
    spacing,
    topY,
    width: TOPOLOGY_WIDTH,
    height: topY + Math.max(0, count - 1) * spacing + depth + 9 + 14,
  };
}

/// Entry order is bottom-of-stack first: index 0 is the base layer.
export function topologyLayers(section: SectionWithEntries): TopologyLayer[] {
  return section.entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: entry.subtitle,
    body: entry.body,
    icon: entry.icon,
    tone: toneForAccent(entry.accent, entry.title),
    nodes: entry.bullets,
  }));
}
