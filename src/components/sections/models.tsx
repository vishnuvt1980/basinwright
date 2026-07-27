import { IconTile } from "@/components/icon";
import { Chip, HairRule, SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { metaList, type SectionWithEntries } from "@/lib/content";

export function Models({ section }: { section: SectionWithEntries }) {
  const providers = metaList(section.meta, "providers");

  return (
    <section id="models" className="relative border-t border-line py-28 sm:py-36">
      <div className="container-bw">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
        </Reveal>

        <Stagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.entries.map((category) => (
            <StaggerItem key={category.id}>
              <article className="group relative h-full rounded-2xl border border-line bg-surface/60 p-7 transition-all duration-500 hover:border-accent/50 hover:bg-raised">
                <div className="flex items-start justify-between gap-4">
                  <IconTile name={category.icon} size="md" />
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-3 transition-colors group-hover:text-ink-2">
                    model
                  </span>
                </div>
                <h3 className="mt-6 font-medium text-ink">{category.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">
                  {category.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        {providers.length ? (
          <Reveal className="mt-16" delay={0.1}>
            <HairRule />
            <div className="mt-10 flex flex-col items-center gap-6">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-ink-3">
                Supported providers
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {providers.map((provider) => (
                  <Chip
                    key={provider}
                    className="px-4 py-1.5 text-sm hover:border-accent/60 hover:text-accent"
                  >
                    {provider}
                  </Chip>
                ))}
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
