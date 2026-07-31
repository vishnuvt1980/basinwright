import { substrateChapters } from "@/components/sections/substrate-chapters";
import { SubstrateNarrative } from "@/components/sections/substrate-narrative";
import { SubstrateStage } from "@/components/sections/substrate-stage";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";
import { sectionAnchor } from "@/lib/meta";

/**
 * The cognitive substrate, running.
 *
 * Two halves, in this order: the simulation, then the same seven stages written
 * out as text. The written half is not a fallback that appears when the drawing
 * cannot — it is always there, because the argument has to survive being read
 * rather than watched, and because a visitor who has just watched a case travel
 * the rail wants the detail the rail had no room for.
 *
 * The block used to be the homepage hero's banner, drawn before anyone had
 * asked for it. It is an ordinary section now, so it goes wherever the CMS puts
 * it — today, the page at /substrate.
 */
export function CognitiveSubstrate({ section }: { section: SectionWithEntries }) {
  const chapters = substrateChapters(section);
  if (!chapters.length) return null;

  const cta =
    section.ctaLabel && section.ctaHref
      ? { label: section.ctaLabel, href: section.ctaHref }
      : null;

  return (
    // `data-substrate` scopes the simulation's own colour tokens (globals.css)
    // to everything drawn with them — the rail's readouts, the highlighted
    // closing line, and the written walkthrough underneath.
    <section
      id={sectionAnchor(section.meta, "substrate")}
      data-substrate
      className="relative isolate border-t border-line"
    >
      <SubstrateStage chapters={chapters} hint={section.body} cta={cta} />

      <div className="container-bw pt-16 pb-24 sm:pt-20 sm:pb-28">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
        </Reveal>

        <SubstrateNarrative chapters={chapters} />
      </div>
    </section>
  );
}
