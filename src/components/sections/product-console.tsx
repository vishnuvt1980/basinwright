import { Icon } from "@/components/icon";
import { PANELS, panelFor } from "@/components/product/panels";
import { ButtonLink, Eyebrow, cn } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";
import { metaString, sectionAnchor } from "@/lib/meta";

/**
 * Copy on one side, the product on the other.
 *
 * The block every page that claims a platform needs at least once: the claim in
 * words, and the thing itself beside it. Which surface it shows is `meta.panel`
 * — "modules", "catalogue", "model360" or "serving" — so a second one of these
 * further down the same page argues a different point with a different screen
 * rather than repeating the first.
 *
 * `meta.side` puts the console left instead of right. Alternating it down a page
 * is what stops three of these in a row reading as a template; it changes
 * nothing below `lg`, where the console always follows the words.
 *
 * Entries, if there are any, become the checklist under the copy — the two or
 * three things about that surface worth saying in a line each.
 */
export function ProductConsole({ section }: { section: SectionWithEntries }) {
  const Panel = PANELS[panelFor(metaString(section.meta, "panel"))];
  const consoleLeft = metaString(section.meta, "side") === "left";

  return (
    <section
      id={sectionAnchor(section.meta)}
      className="border-t border-line py-20 sm:py-24"
    >
      <div className="container-bw">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className={cn(consoleLeft && "lg:order-2")}>
            {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}

            {section.title ? (
              <h2 className="mt-5 font-display text-[2rem] leading-[1.2] text-balance text-ink sm:text-[2.5rem]">
                {section.title}
              </h2>
            ) : null}

            {section.subtitle ? (
              <p className="mt-5 text-base leading-7 text-pretty text-ink-2 sm:text-lg">
                {section.subtitle}
              </p>
            ) : null}

            {section.entries.length ? (
              <ul className="mt-7 flex flex-col gap-3.5">
                {section.entries.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <Icon
                      name="Check"
                      className="mt-1 size-4 shrink-0 text-[var(--bw-mark-intelligence)]"
                    />
                    <div className="min-w-0">
                      <p className="text-[0.9375rem] font-medium text-ink">{entry.title}</p>
                      {entry.body ? (
                        <p className="mt-0.5 text-sm leading-relaxed text-pretty text-ink-2">
                          {entry.body}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {section.body ? (
              <p className="mt-7 max-w-xl text-sm leading-relaxed text-pretty text-ink-3">
                {section.body}
              </p>
            ) : null}

            {section.ctaLabel && section.ctaHref ? (
              <div className="mt-9 flex flex-wrap gap-3.5">
                <ButtonLink href={section.ctaHref} withArrow className="px-5 py-2.5">
                  {section.ctaLabel}
                </ButtonLink>
                {section.ctaLabel2 && section.ctaHref2 ? (
                  <ButtonLink
                    href={section.ctaHref2}
                    variant="secondary"
                    className="px-5 py-2.5"
                  >
                    {section.ctaLabel2}
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}
          </Reveal>

          <Reveal delay={0.1} className={cn(consoleLeft && "lg:order-1")}>
            <Panel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
