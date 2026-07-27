import { Icon } from "@/components/icon";
import { Chip, HairRule, SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { metaList, type SectionWithEntries } from "@/lib/content";

export function Models({ section }: { section: SectionWithEntries }) {
  const providers = metaList(section.meta, "providers");

  return (
    <section id="models" className="relative border-t border-basin-800/70 py-28 sm:py-36">
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
              <article className="group relative h-full rounded-2xl border border-basin-700/60 bg-basin-900/60 p-7 transition-all duration-500 hover:border-brass-600/50 hover:bg-basin-850">
                <div className="flex items-start justify-between gap-4">
                  <Icon
                    name={category.icon}
                    className="size-6 text-brass-500 transition-colors duration-500 group-hover:text-brass-300"
                  />
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-basin-600 transition-colors group-hover:text-basin-400">
                    model
                  </span>
                </div>
                <h3 className="mt-6 font-medium text-parchment-50">{category.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-basin-400">
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
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-basin-500">
                Supported providers
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {providers.map((provider) => (
                  <Chip
                    key={provider}
                    className="px-4 py-1.5 text-sm hover:border-brass-600/60 hover:text-brass-200"
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
