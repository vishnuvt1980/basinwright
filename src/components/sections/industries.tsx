import { IconTile } from "@/components/icon";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

export function Industries({ section }: { section: SectionWithEntries }) {
  return (
    <section
      id="industries"
      className="grain relative border-t border-line bg-surface/50 py-28 sm:py-36"
    >
      <div className="container-bw relative">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            align="center"
            className="mx-auto items-center"
          />
        </Reveal>

        <Stagger
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-4"
          amount={0.1}
        >
          {section.entries.map((industry) => (
            <StaggerItem key={industry.id}>
              <div className="group relative flex h-full flex-col items-center justify-center gap-3.5 bg-surface px-4 py-10 text-center transition-colors duration-500 hover:bg-raised">
                <IconTile
                  name={industry.icon}
                  size="md"
                  className="transition-transform duration-500 group-hover:-translate-y-0.5"
                />
                <span className="text-sm text-ink-2 transition-colors duration-500 group-hover:text-ink">
                  {industry.title}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
