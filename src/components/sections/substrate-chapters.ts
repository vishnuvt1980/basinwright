import { toneForAccent, type Tone } from "@/components/icon";
import type { SectionWithEntries } from "@/lib/content";

/**
 * The narrative, flattened out of the CMS into the plain shape both the
 * instrument and the plain-text fallback take. Everything here is serialisable
 * so a server component can hand it straight to the client island.
 */
export type SubstrateChapter = {
  id: string;
  /// Position in the sequence. The stage maps this onto which part of the
  /// simulation to bring forward, so reordering entries in /admin reorders the
  /// emphasis with them.
  index: number;
  /// Short stage name — "Ingest", "Decision layer".
  stage: string | null;
  title: string;
  body: string | null;
  icon: string | null;
  tone: Tone;
  points: string[];
};

export function substrateChapters(
  section: SectionWithEntries,
): SubstrateChapter[] {
  return section.entries.map((entry, index) => ({
    id: entry.id,
    index,
    stage: entry.subtitle,
    title: entry.title,
    body: entry.body,
    icon: entry.icon,
    tone: toneForAccent(entry.accent, entry.title),
    points: entry.bullets,
  }));
}
