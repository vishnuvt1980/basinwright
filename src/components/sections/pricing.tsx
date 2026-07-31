import { Icon, IconTile, toneForAccent } from "@/components/icon";
import { ButtonLink, SectionHeading, cn } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";
import { sectionAnchor } from "@/lib/meta";

export function Pricing({ section }: { section: SectionWithEntries }) {
  return (
    <section
      id={sectionAnchor(section.meta, "pricing")}
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

        <Stagger className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {section.entries.map((tier) => {
            const tone = toneForAccent(tier.accent, tier.title);
            const featured = tier.accent === "brass";

            return (
              <StaggerItem key={tier.id} className="h-full">
                <article
                  data-tone={tone}
                  className={cn(
                    "group relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-500 hover:-translate-y-1",
                    featured
                      ? "border-accent/60 bg-raised shadow-[0_30px_90px_-50px_color-mix(in_oklab,var(--bw-accent)_60%,transparent)]"
                      : "border-line bg-surface/60 hover:border-line-strong",
                  )}
                >
                  {tier.badge ? (
                    <span
                      className={cn(
                        "absolute -top-2.5 left-7 rounded-full border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider",
                        "border-[color-mix(in_oklab,var(--tone)_40%,transparent)] text-[var(--tone)]",
                        featured
                          ? "bg-canvas"
                          : "bg-[color-mix(in_oklab,var(--tone)_12%,transparent)]",
                      )}
                    >
                      {tier.badge}
                    </span>
                  ) : null}

                  {tier.icon ? (
                    <IconTile
                      name={tier.icon}
                      tone={tone}
                      size="md"
                      className="mb-5"
                    />
                  ) : null}

                  <h3 className="font-display text-2xl text-ink">
                    {tier.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--tone)]">
                    {tier.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-3">
                    {tier.body}
                  </p>

                  <ul className="mt-7 flex flex-1 flex-col gap-2.5">
                    {tier.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm text-ink-2">
                        <Icon
                          name="Check"
                          className="mt-0.5 size-3.5 text-[var(--tone)]"
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
                    {featured ? "Book a session" : "Talk to sales"}
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
