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
