import { IconTile } from "@/components/icon";
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

        <Stagger className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {section.entries.map((item) => (
            <StaggerItem key={item.id}>
              <article className="group relative h-full bg-surface p-7 transition-colors duration-500 hover:bg-raised">
                {/* Accent wipe on hover */}
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-linear-to-r from-transparent via-accent to-transparent transition-transform duration-500 group-hover:scale-x-100"
                  aria-hidden
                />
                <IconTile
                  name={item.icon}
                  size="md"
                  className="transition-transform duration-500 group-hover:-translate-y-0.5"
                />
                <h3 className="mt-5 text-[0.95rem] font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">
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
