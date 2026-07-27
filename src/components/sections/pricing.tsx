import { Check } from "lucide-react";

import { ButtonLink, SectionHeading, accent, cn } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

export function Pricing({ section }: { section: SectionWithEntries }) {
  return (
    <section
      id="pricing"
      className="grain relative border-t border-basin-800/70 bg-basin-900/50 py-28 sm:py-36"
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

        <Stagger className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {section.entries.map((tier) => {
            const tone = accent(tier.accent);
            const featured = tier.accent === "brass";

            return (
              <StaggerItem key={tier.id} className="h-full">
                <article
                  className={cn(
                    "group relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-500 hover:-translate-y-1",
                    featured
                      ? "border-brass-600/60 bg-basin-850 shadow-[0_30px_90px_-50px_rgba(201,162,39,0.6)]"
                      : "border-basin-700/60 bg-basin-900/60 hover:border-basin-500",
                  )}
                >
                  {tier.badge ? (
                    <span
                      className={cn(
                        "absolute -top-2.5 left-7 rounded-full border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider",
                        tone.chip,
                        featured && "bg-basin-950",
                      )}
                    >
                      {tier.badge}
                    </span>
                  ) : null}

                  <h3 className="font-display text-2xl text-parchment-50">
                    {tier.title}
                  </h3>
                  <p className={cn("mt-1 text-xs uppercase tracking-[0.16em]", tone.text)}>
                    {tier.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-basin-400">
                    {tier.body}
                  </p>

                  <ul className="mt-7 flex flex-1 flex-col gap-2.5">
                    {tier.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm text-basin-300">
                        <Check
                          className={cn("mt-0.5 size-3.5 shrink-0", tone.text)}
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <ButtonLink
                    href="#contact"
                    variant={featured ? "primary" : "secondary"}
                    className="mt-8 w-full"
                  >
                    {featured ? "Start Building" : "Talk to Sales"}
                  </ButtonLink>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
