import { IconTile } from "@/components/icon";
import { Chip, SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { metaList, type SectionWithEntries } from "@/lib/content";
import { sectionAnchor } from "@/lib/meta";

export function Infrastructure({ section }: { section: SectionWithEntries }) {
  const developer = metaList(section.meta, "developer");

  return (
    <section
      id={sectionAnchor(section.meta, "infrastructure")}
      className="relative border-t border-line py-28 sm:py-36"
    >
      <div className="container-bw">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow={section.eyebrow}
              title={section.title}
              subtitle={section.subtitle}
            />

            {developer.length ? (
              <div className="mt-10">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-ink-3">
                  Ship with
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {developer.map((tool) => (
                    <Chip
                      key={tool}
                      className="font-mono text-xs hover:border-accent/60 hover:text-accent"
                    >
                      {tool}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {section.entries.map((item) => (
              <StaggerItem key={item.id}>
                <div className="group flex h-full items-center gap-3.5 rounded-xl border border-line bg-surface/60 px-5 py-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-raised">
                  <IconTile name={item.icon} size="sm" />
                  <span className="text-sm text-ink-2">{item.title}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
