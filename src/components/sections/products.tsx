"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { IconTile, toneForAccent } from "@/components/icon";
import { SectionHeading, cn } from "@/components/ui/primitives";
import type { SectionWithEntries } from "@/lib/content";
import { sectionAnchor } from "@/lib/meta";

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
  const tone = toneForAccent(entry.accent, entry.title);

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
        data-tone={tone}
        className={cn(
          "group panel grain relative overflow-hidden p-8 sm:p-11",
          "shadow-[var(--bw-shadow-panel)] transition-shadow duration-700",
          "hover:shadow-[0_40px_120px_-60px_color-mix(in_oklab,var(--tone)_55%,transparent)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--tone)_16%,transparent),transparent)]"
          aria-hidden
        />

        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <div className="flex items-center gap-4">
              <IconTile name={entry.icon} tone={tone} size="md" />
              <span className="font-mono text-xs text-ink-3">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>

            <h3 className="mt-6 font-display text-3xl text-ink sm:text-4xl">
              {entry.title}
            </h3>
            <p className="mt-2 text-sm font-medium text-[var(--tone)]">
              {entry.subtitle}
            </p>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-ink-2">
              {entry.body}
            </p>
          </div>

          <div className="flex flex-wrap content-start gap-2 lg:justify-end">
            {/* Tone-tinted variant of <Chip>; the tint has to beat Chip's own
                neutral colours, which Tailwind emits after arbitrary values. */}
            {entry.bullets.map((bullet) => (
              <span
                key={bullet}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs",
                  "border-[color-mix(in_oklab,var(--tone)_38%,transparent)]",
                  "bg-[color-mix(in_oklab,var(--tone)_12%,transparent)]",
                  "text-[var(--tone)] transition-all duration-300 group-hover:-translate-y-px",
                )}
              >
                {bullet}
              </span>
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
      id={sectionAnchor(section.meta, "products")}
      className="relative border-t border-line py-28 sm:py-36"
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
