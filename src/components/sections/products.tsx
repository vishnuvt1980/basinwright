"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { Icon } from "@/components/icon";
import { Chip, SectionHeading, accent, cn } from "@/components/ui/primitives";
import type { SectionWithEntries } from "@/lib/content";

/// Each product card pins briefly and stacks over the previous one, so the
/// ecosystem reads as one continuous descent rather than a grid.
function ProductCard({
  entry,
  index,
  total,
}: {
  entry: SectionWithEntries["entries"][number];
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const tone = accent(entry.accent);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [0.35, 1]);

  return (
    <div
      ref={ref}
      className="sticky"
      style={{
        // Stagger the pin so cards fan out slightly as they stack.
        top: `calc(7rem + ${index * 1.15}rem)`,
        zIndex: index + 1,
      }}
    >
      <motion.article
        style={reduced ? undefined : { scale, opacity }}
        className={cn(
          "group panel grain relative overflow-hidden p-8 sm:p-11",
          "shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)] transition-shadow duration-700",
          tone.glow,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b to-transparent opacity-25",
            tone.bar,
          )}
          aria-hidden
        />

        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <div className="flex items-center gap-4">
              <span className="inline-flex size-12 items-center justify-center rounded-xl border border-basin-600/70 bg-basin-800/80">
                <Icon name={entry.icon} className={cn("size-6", tone.text)} />
              </span>
              <span className="font-mono text-xs text-basin-500">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>

            <h3 className="mt-6 font-display text-3xl text-parchment-50 sm:text-4xl">
              {entry.title}
            </h3>
            <p className={cn("mt-2 text-sm font-medium", tone.text)}>
              {entry.subtitle}
            </p>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-basin-300">
              {entry.body}
            </p>
          </div>

          <div className="flex flex-wrap content-start gap-2 lg:justify-end">
            {entry.bullets.map((bullet) => (
              <Chip
                key={bullet}
                className={cn(
                  "border transition-all duration-300 group-hover:-translate-y-px",
                  tone.chip,
                )}
              >
                {bullet}
              </Chip>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function Products({ section }: { section: SectionWithEntries }) {
  return (
    <section
      id="products"
      className="relative border-t border-basin-800/70 py-28 sm:py-36"
    >
      <div className="container-bw">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
        />

        <div className="mt-16 flex flex-col gap-8 pb-[24vh]">
          {section.entries.map((entry, i) => (
            <ProductCard
              key={entry.id}
              entry={entry}
              index={i}
              total={section.entries.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
