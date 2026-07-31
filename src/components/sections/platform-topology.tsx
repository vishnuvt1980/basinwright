import { topologyLayers } from "@/components/sections/topology-layers";
import { TopologyDiagram } from "@/components/sections/topology-diagram";
import { TopologyStage } from "@/components/sections/topology-stage";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";
import { sectionAnchor } from "@/lib/meta";

/**
 * The platform topology block: one stack, four layers, one control plane.
 *
 * The shell stays a server component. Only the stage is interactive, and the
 * SVG fallback is rendered here and handed down as children so it is present in
 * the HTML whether or not JavaScript ever runs.
 */
export function PlatformTopology({ section }: { section: SectionWithEntries }) {
  const layers = topologyLayers(section);
  if (!layers.length) return null;

  return (
    <section
      id={sectionAnchor(section.meta, "topology")}
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

        <TopologyStage layers={layers} caption={section.body}>
          <TopologyDiagram layers={layers} />
        </TopologyStage>
      </div>
    </section>
  );
}
