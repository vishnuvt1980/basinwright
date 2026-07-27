import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

export function Agents({ section }: { section: SectionWithEntries }) {
  return (
    <section
      id="agents"
      className="grain relative border-t border-basin-800/70 bg-basin-900/50 py-28 sm:py-36"
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
              <article className="group panel relative h-full overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brass-600/50">
                {/* Cursor-agnostic sheen that sweeps on hover */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-brass-400/[0.07] to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                  aria-hidden
                />
                <Icon
                  name={agent.icon}
                  className="size-6 text-brass-500 transition-colors duration-500 group-hover:text-brass-300"
                />
                <h3 className="mt-5 font-medium text-parchment-50">{agent.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-basin-400">
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
