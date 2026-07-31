import { Icon, IconTile, toneForAccent } from "@/components/icon";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";
import { sectionAnchor } from "@/lib/meta";

/**
 * A sequence of steps with the arrows drawn in.
 *
 * Two things on the homepage are the same shape — how the platform works
 * (problem → data → model → agent → outcome) and how an engagement runs
 * (assessment → pilot → production → scale) — and both of them are a line of
 * boxes read left to right. So this is one block used twice rather than two
 * blocks that happen to look alike.
 *
 * The direction is the only thing the layout really has to get right. Across a
 * row the arrows point right; stacked on a narrow screen they point down, which
 * is why the connector carries both glyphs and shows one per breakpoint rather
 * than rotating a single one — a rotated chevron reads as a corner, not a flow.
 *
 * Entry fields: `title` is the box, `body` the optional gloss under it, `badge`
 * the optional mono tag (a duration, on the engagement flow), `icon` and
 * `accent` the usual tile. Only `title` is required, which is what lets the
 * same block render five bare labels or four annotated stages.
 */
export function Flow({ section }: { section: SectionWithEntries }) {
  const steps = section.entries;
  if (!steps.length) return null;

  return (
    <section
      id={sectionAnchor(section.meta)}
      className="border-t border-line py-24 sm:py-28"
    >
      <div className="container-bw">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
        </Reveal>

        <Stagger className="mt-14 flex flex-col lg:flex-row lg:items-stretch">
          {steps.map((step, i) => {
            const tone = toneForAccent(step.accent, step.title);

            return (
              <StaggerItem
                key={step.id}
                className="flex flex-col lg:flex-1 lg:flex-row lg:items-center"
              >
                {/* The arrow into this step. The first has nothing before it. */}
                {i > 0 ? (
                  <span
                    className="flex shrink-0 flex-col items-center justify-center gap-1 py-3 lg:flex-row lg:px-3 lg:py-0"
                    aria-hidden
                  >
                    <span className="h-5 w-px bg-line-strong lg:h-px lg:w-5" />
                    <Icon name="ChevronDown" className="size-3.5 text-ink-3 lg:hidden" />
                    <Icon
                      name="ChevronRight"
                      className="hidden size-3.5 text-ink-3 lg:block"
                    />
                  </span>
                ) : null}

                <article
                  data-tone={tone}
                  className="panel relative flex h-full flex-1 flex-col p-6 transition-shadow duration-500 hover:shadow-[var(--bw-shadow-panel)]"
                >
                  <span className="font-mono text-xs text-ink-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {step.icon ? (
                    <IconTile name={step.icon} tone={tone} size="sm" className="mt-4" />
                  ) : null}

                  <h3 className="mt-4 text-base leading-6 text-balance text-ink">
                    {step.title}
                  </h3>

                  {step.badge ? (
                    <span className="mt-2 font-mono text-xs text-[var(--tone)]">
                      {step.badge}
                    </span>
                  ) : null}

                  {step.body ? (
                    <p className="mt-2.5 text-sm leading-relaxed text-pretty text-ink-3">
                      {step.body}
                    </p>
                  ) : null}
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>

        {section.body ? (
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-3">
              {section.body}
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
