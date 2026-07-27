import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

export function PlatformGrid({ section }: { section: SectionWithEntries }) {
  return (
    <section id="platform" className="relative py-28 sm:py-36">
      <div className="container-bw">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            align="center"
            className="mx-auto items-center"
          />
        </Reveal>

        <Stagger className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-basin-700/60 bg-basin-700/40 sm:grid-cols-2 lg:grid-cols-5">
          {section.entries.map((item) => (
            <StaggerItem key={item.id}>
              <article className="group relative h-full bg-basin-900 p-7 transition-colors duration-500 hover:bg-basin-850">
                {/* Brass wipe on hover */}
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-linear-to-r from-transparent via-brass-400 to-transparent transition-transform duration-500 group-hover:scale-x-100"
                  aria-hidden
                />
                <Icon
                  name={item.icon}
                  className="size-6 text-brass-500 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:text-brass-300"
                />
                <h3 className="mt-5 text-[0.95rem] font-medium text-parchment-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-basin-400">
                  {item.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
