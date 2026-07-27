import Link from "next/link";

import { Icon, IconTile, toneForAccent } from "@/components/icon";
import { ContactForm } from "@/components/sections/contact-form";
import { ButtonLink, SectionHeading, cn } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { isExternalHref, type SectionWithEntries } from "@/lib/content";
import { Markdown } from "@/lib/markdown";

/* ---------------------------------------------------------------------------
   General-purpose blocks.

   These are the section kinds the editorial pages are built from. Nothing here
   knows which page it is on — the renderer maps a `SectionKind` to a component
   and the same block works on /about, /trust or the homepage.
--------------------------------------------------------------------------- */

type Props = { section: SectionWithEntries };

/// Shared shell: the hairline, the vertical rhythm and the optional heading.
function Block({
  section,
  children,
  className,
  narrow = false,
}: Props & { children?: React.ReactNode; className?: string; narrow?: boolean }) {
  const hasHeading = Boolean(section.eyebrow || section.title || section.subtitle);

  return (
    <section className={cn("border-t border-line py-20 sm:py-24", className)}>
      <div className="container-bw">
        {hasHeading ? (
          <Reveal>
            <SectionHeading
              eyebrow={section.eyebrow}
              title={section.title}
              subtitle={section.subtitle}
              className={narrow ? "max-w-3xl" : undefined}
            />
          </Reveal>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- Prose */

export function Prose({ section }: Props) {
  return (
    <Block section={section} narrow>
      {section.body ? (
        <Reveal>
          {/* The measure is deliberately narrower than the grid: long-form copy
              reads badly at container width. */}
          <div className={cn("max-w-3xl", section.title || section.eyebrow ? "mt-8" : "")}>
            <Markdown content={section.body} />
          </div>
        </Reveal>
      ) : null}
    </Block>
  );
}

/* ------------------------------------------------------------ Feature grid */

export function FeatureGrid({ section }: Props) {
  const columns = section.entries.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <Block section={section}>
      <Stagger className={cn("mt-14 grid gap-6 sm:grid-cols-2", columns)}>
        {section.entries.map((entry) => {
          const tone = toneForAccent(entry.accent, entry.title);

          return (
            <StaggerItem key={entry.id} className="h-full">
              <article
                data-tone={tone}
                className="panel flex h-full flex-col p-7 transition-shadow duration-500 hover:shadow-[var(--bw-shadow-panel)]"
              >
                {entry.icon ? <IconTile name={entry.icon} tone={tone} /> : null}

                <h3 className="mt-5 text-lg text-ink">{entry.title}</h3>
                {entry.subtitle ? (
                  <p className="mt-1 text-sm font-medium text-[var(--tone)]">
                    {entry.subtitle}
                  </p>
                ) : null}
                {entry.body ? (
                  <p className="mt-3 text-sm leading-relaxed text-pretty text-ink-2">
                    {entry.body}
                  </p>
                ) : null}

                {entry.bullets.length ? (
                  <ul className="mt-5 flex flex-wrap gap-2 pt-1">
                    {entry.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="rounded-md border border-line bg-raised px-2.5 py-1 text-xs text-ink-3"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Block>
  );
}

/* --------------------------------------------------------------- Stat band */

export function StatBand({ section }: Props) {
  return (
    <Block section={section}>
      <Stagger className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {section.entries.map((entry) => (
          <StaggerItem key={entry.id} className="bg-surface">
            <div className="flex h-full flex-col p-7">
              {/* `subtitle` carries the figure and `title` the label — the CMS
                  field names are generic, the reading order is not. */}
              <span className="font-display text-3xl text-ink sm:text-4xl">
                {entry.subtitle}
              </span>
              <span className="mt-2 text-sm font-medium text-ink">{entry.title}</span>
              {entry.body ? (
                <span className="mt-1.5 text-xs leading-relaxed text-ink-3">
                  {entry.body}
                </span>
              ) : null}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Block>
  );
}

/* ---------------------------------------------------------------- Timeline */

export function Timeline({ section }: Props) {
  return (
    <Block section={section} narrow>
      <Stagger className="mt-12 max-w-3xl">
        {section.entries.map((entry) => (
          <StaggerItem key={entry.id}>
            <div className="group relative grid gap-2 border-l border-line py-6 pl-8 sm:grid-cols-[7rem_1fr] sm:gap-6 sm:pl-10">
              <span
                className="absolute top-8 -left-[4.5px] size-2 rounded-full bg-line-strong transition-colors duration-500 group-hover:bg-accent"
                aria-hidden
              />
              <span className="font-mono text-sm text-accent">{entry.badge}</span>
              <div>
                <h3 className="text-base text-ink">{entry.title}</h3>
                {entry.body ? (
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-2">
                    {entry.body}
                  </p>
                ) : null}
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Block>
  );
}

/* --------------------------------------------------------------------- FAQ */

export function Faq({ section }: Props) {
  return (
    <Block section={section} narrow>
      {/* Native <details> rather than a state-driven accordion: it works before
          hydration, it is findable by in-page search, and it needs no JS. */}
      <div className="mt-12 max-w-3xl border-t border-line">
        {section.entries.map((entry) => (
          <details key={entry.id} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left text-base text-ink transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
              {entry.title}
              <Icon
                name="ChevronDown"
                className="mt-1 size-4 shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            {entry.body ? (
              <div className="pb-6 text-sm">
                <Markdown content={entry.body} />
              </div>
            ) : null}
          </details>
        ))}
      </div>
    </Block>
  );
}

/* --------------------------------------------------------------- Link list */

export function LinkList({ section }: Props) {
  return (
    <Block section={section}>
      <Stagger className="mt-10 border-t border-line">
        {section.entries.map((entry) => {
          const href = entry.href ?? "#";
          const external = isExternalHref(href);

          const inner = (
            <>
              {entry.icon ? (
                <IconTile
                  name={entry.icon}
                  size="sm"
                  tone={toneForAccent(entry.accent, entry.title)}
                  className="mt-0.5"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-base text-ink transition-colors group-hover:text-accent">
                    {entry.title}
                  </h3>
                  {entry.badge ? (
                    <span className="rounded-md border border-line bg-raised px-2 py-0.5 text-[0.7rem] tracking-wide text-ink-3 uppercase">
                      {entry.badge}
                    </span>
                  ) : null}
                </div>
                {entry.subtitle ? (
                  <p className="mt-1 text-sm text-ink-3">{entry.subtitle}</p>
                ) : null}
                {entry.body ? (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pretty text-ink-2">
                    {entry.body}
                  </p>
                ) : null}
              </div>

              <Icon
                name={external ? "ExternalLink" : "ArrowRight"}
                className="mt-1.5 size-4 shrink-0 text-ink-3 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </>
          );

          const className =
            "group flex items-start gap-4 border-b border-line py-6 transition-colors duration-500 hover:border-accent/60";

          return (
            <StaggerItem key={entry.id}>
              {external ? (
                <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
                  {inner}
                </a>
              ) : (
                <Link href={href} className={className}>
                  {inner}
                </Link>
              )}
            </StaggerItem>
          );
        })}
      </Stagger>
    </Block>
  );
}

/* ----------------------------------------------------------------- Callout */

export function Callout({ section }: Props) {
  return (
    <section className="border-t border-line py-20 sm:py-24">
      <div className="container-bw">
        <Reveal>
          <div className="panel flex flex-col gap-8 bg-raised p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
            <div className="max-w-2xl">
              {section.eyebrow ? (
                <span className="text-[0.9375rem] font-semibold text-accent">
                  {section.eyebrow}
                </span>
              ) : null}
              {section.title ? (
                <h2 className="mt-3 font-display text-[1.75rem] leading-tight text-balance text-ink sm:text-[2rem]">
                  {section.title}
                </h2>
              ) : null}
              {section.subtitle ? (
                <p className="mt-4 leading-relaxed text-pretty text-ink-2">
                  {section.subtitle}
                </p>
              ) : null}
            </div>

            {section.ctaLabel && section.ctaHref ? (
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <CtaLink href={section.ctaHref} label={section.ctaLabel} />
                {section.ctaLabel2 && section.ctaHref2 ? (
                  <CtaLink
                    href={section.ctaHref2}
                    label={section.ctaLabel2}
                    variant="secondary"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/// A CTA that may point off-site — `next/link` would prefetch an external URL.
function CtaLink({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  if (!isExternalHref(href)) {
    return (
      <ButtonLink href={href} variant={variant} withArrow={variant === "primary"}>
        {label}
      </ButtonLink>
    );
  }

  const styles =
    variant === "primary"
      ? "bg-accent text-on-accent hover:bg-accent-strong"
      : "border border-ink bg-transparent text-ink hover:bg-raised";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.9375rem] font-semibold transition-colors duration-150",
        styles,
      )}
    >
      {label}
      <Icon name="ExternalLink" className="size-4" />
    </a>
  );
}

/* ----------------------------------------------------------------- Contact */

export function Contact({ section }: Props) {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-line py-24 sm:py-28"
    >
      <div className="container-bw">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow={section.eyebrow}
              title={section.title}
              subtitle={section.subtitle}
            />
            {section.body ? (
              <div className="mt-6 max-w-xl">
                <Markdown content={section.body} />
              </div>
            ) : null}
          </Reveal>

          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
