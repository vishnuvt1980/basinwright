import { substrateChapters } from "@/components/sections/substrate-chapters";
import { SubstrateNarrative } from "@/components/sections/substrate-narrative";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { SubstrateStage } from "@/components/webgl/substrate-stage";
import type { SectionWithEntries } from "@/lib/content";

/**
 * The cognitive substrate block: the platform's data path, simulated live.
 *
 * The shell stays a server component. Only the stage is interactive, and the
 * plain narrative is rendered here and handed down as children so the argument
 * is present in the HTML whether or not the instrument ever mounts.
 */
export function CognitiveSubstrate({
  section,
}: {
  section: SectionWithEntries;
}) {
  const chapters = substrateChapters(section);
  if (!chapters.length) return null;

  return (
    <section
      id="substrate"
      className="relative border-t border-line py-28 sm:py-36"
    >
      <div className="container-bw">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
        </Reveal>
      </div>

      <SubstrateStage chapters={chapters} hint={section.body}>
        <div className="container-bw">
          <SubstrateNarrative chapters={chapters} />
        </div>
      </SubstrateStage>
    </section>
  );
}
