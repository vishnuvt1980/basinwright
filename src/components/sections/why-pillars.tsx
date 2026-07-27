"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { SectionHeading, accent, cn } from "@/components/ui/primitives";
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
  const tone = accent(current.accent);

  return (
    <section id="why" className="relative border-t border-basin-800/70 py-28 sm:py-36">
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
                    className="group relative flex w-full gap-6 border-l border-basin-700 py-9 pl-8 text-left transition-colors"
                  >
                    {/* Progress rail */}
                    <motion.span
                      className="absolute -left-px top-0 w-px bg-brass-400"
                      initial={false}
                      animate={{ height: isActive ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "shrink-0 font-mono text-xs transition-colors duration-500",
                        isActive ? "text-brass-400" : "text-basin-500",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-display text-2xl transition-colors duration-500 sm:text-3xl",
                          isActive ? "text-parchment-50" : "text-basin-400",
                        )}
                      >
                        {pillar.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-1.5 text-sm transition-colors duration-500",
                          isActive ? "text-basin-300" : "text-basin-500",
                        )}
                      >
                        {pillar.subtitle}
                      </p>
                      <motion.p
                        className="overflow-hidden text-sm leading-relaxed text-basin-400"
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
              className="panel topo relative overflow-hidden p-9 sm:p-11"
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b to-transparent opacity-40",
                  tone.bar,
                )}
                aria-hidden
              />

              <div className="relative">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl border border-basin-600/70 bg-basin-800/80">
                  <Icon name={current.icon} className={cn("size-7", tone.text)} />
                </span>

                <h3 className="mt-7 font-display text-3xl text-parchment-50">
                  {current.title}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-basin-300">
                  {current.body}
                </p>

                <ul className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {current.bullets.map((bullet, i) => (
                    <motion.li
                      key={bullet}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.045 }}
                      className="flex items-center gap-2.5 text-sm text-basin-300"
                    >
                      <span
                        className={cn("size-1.5 shrink-0 rounded-full", tone.text)}
                        style={{ backgroundColor: "currentColor" }}
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
