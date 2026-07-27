"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";

import { IconTile, toneForAccent } from "@/components/icon";
import { SectionHeading, cn } from "@/components/ui/primitives";
import type { SectionWithEntries } from "@/lib/content";

/// Scrollytelling: the left column pins while the numbered pillars advance,
/// each one taking over the sticky panel on the right as it reaches centre.
export function WhyPillars({ section }: { section: SectionWithEntries }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pillars = section.entries;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!pillars.length) return;
    const next = Math.min(pillars.length - 1, Math.floor(p * pillars.length));
    setActive((current) => (current === next ? current : Math.max(0, next)));
  });

  if (!pillars.length) return null;

  const current = pillars[active];
  const tone = toneForAccent(current.accent, current.title);

  return (
    <section id="why" className="relative border-t border-line py-28 sm:py-36">
      <div className="container-bw">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
        />

        <div ref={ref} className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* Narrative rail */}
          <ol className="flex flex-col">
            {pillars.map((pillar, i) => {
              const isActive = i === active;
              return (
                <li key={pillar.id}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive}
                    className="group relative flex w-full gap-6 border-l border-line py-9 pl-8 text-left transition-colors"
                  >
                    {/* Progress rail */}
                    <motion.span
                      className="absolute -left-px top-0 w-px bg-accent"
                      initial={false}
                      animate={{ height: isActive ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "shrink-0 font-mono text-xs transition-colors duration-500",
                        isActive ? "text-accent" : "text-ink-3",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-display text-2xl transition-colors duration-500 sm:text-3xl",
                          isActive ? "text-ink" : "text-ink-3",
                        )}
                      >
                        {pillar.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-1.5 text-sm transition-colors duration-500",
                          isActive ? "text-ink-2" : "text-ink-3",
                        )}
                      >
                        {pillar.subtitle}
                      </p>
                      <motion.p
                        className="overflow-hidden text-sm leading-relaxed text-ink-3"
                        initial={false}
                        animate={{
                          height: isActive ? "auto" : 0,
                          opacity: isActive ? 1 : 0,
                          marginTop: isActive ? 14 : 0,
                        }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {pillar.body}
                      </motion.p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Pinned panel */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              data-tone={tone}
              className="panel topo relative overflow-hidden p-9 sm:p-11"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--tone)_22%,transparent),transparent)]"
                aria-hidden
              />

              <div className="relative">
                <IconTile name={current.icon} tone={tone} size="lg" />

                <h3 className="mt-7 font-display text-3xl text-ink">
                  {current.title}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-ink-2">
                  {current.body}
                </p>

                <ul className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {current.bullets.map((bullet, i) => (
                    <motion.li
                      key={bullet}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.045 }}
                      className="flex items-center gap-2.5 text-sm text-ink-2"
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-[var(--tone)]"
                        aria-hidden
                      />
                      {bullet}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
