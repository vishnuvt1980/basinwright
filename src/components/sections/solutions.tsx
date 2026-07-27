import { ArrowUpRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

export function Solutions({ section }: { section: SectionWithEntries }) {
  return (
    <section id="solutions" className="relative border-t border-basin-800/70 py-28 sm:py-36">
      <div className="container-bw">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {section.entries.map((solution) => (
            <StaggerItem key={solution.id}>
              <div className="group flex items-start gap-4 border-b border-basin-800 py-6 transition-colors duration-500 hover:border-brass-700/60">
                <Icon
                  name={solution.icon}
                  className="mt-0.5 size-5 shrink-0 text-brass-600 transition-colors duration-500 group-hover:text-brass-400"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-1.5 text-sm font-medium text-parchment-100 transition-colors group-hover:text-brass-200">
                    {solution.title}
                    <ArrowUpRight
                      className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden
                    />
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-basin-400">
                    {solution.body}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
