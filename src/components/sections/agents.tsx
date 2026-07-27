import { IconTile } from "@/components/icon";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

export function Agents({ section }: { section: SectionWithEntries }) {
  return (
    <section
      id="agents"
      className="grain relative border-t border-line bg-surface/50 py-28 sm:py-36"
    >
      <div
        className="topo pointer-events-none absolute inset-0 opacity-25"
        aria-hidden
      />

      <div className="container-bw relative">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
        </Reveal>

        <Stagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.entries.map((agent) => (
            <StaggerItem key={agent.id}>
              <article className="group panel relative h-full overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent/50">
                {/* Cursor-agnostic sheen that sweeps on hover */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-accent/[0.07] to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                  aria-hidden
                />
                <IconTile name={agent.icon} size="md" />
                <h3 className="mt-5 font-medium text-ink">{agent.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">
                  {agent.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
