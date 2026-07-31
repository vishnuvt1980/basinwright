"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { ButtonLink, Eyebrow } from "@/components/ui/primitives";
import { HeroCanvas } from "@/components/webgl/hero-canvas";
import type { SectionWithEntries } from "@/lib/content";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The first screen: what we sell, who it is for, and the two things to do next.
 *
 * It used to open with the substrate simulation running behind the headline.
 * That was the wrong first move — a visitor who has not yet been told what
 * BasinWright sells cannot read a diagram of how it works, and the picture
 * answered a question nobody had asked yet. The simulation moved to its own
 * page at /substrate, which people reach on purpose; the hero now does the job
 * a hero has: state the offer plainly and point at the next step.
 *
 * The backdrop is deliberately quiet — contour wash, the WebGL basin, a
 * vignette — and none of it carries meaning, so a machine that skips the canvas
 * loses nothing but the texture.
 *
 * The hero used to close with a four-tile band of capabilities, which sat under
 * the fold of the first screen looking like a component from another site: no
 * heading, no section rule, display-sized text over uppercase labels. What it
 * had to say is now the "stack" block immediately below, drawn in the same card
 * language as every other section. The hero ends at its buttons.
 */
export function Hero({ section }: { section: SectionWithEntries }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The copy settles back and dims as the next section rises over it.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  const lines = section.headlineLines.length
    ? section.headlineLines
    : [section.title ?? ""];

  return (
    <section ref={ref} className="grain relative isolate">
      <div className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-32 pb-20">
        {/* Layered backdrop: contour wash, WebGL basin, vignette. */}
        <div
          className="topo pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
        />
        <HeroCanvas />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,transparent_0%,var(--bw-canvas)_78%)]"
          aria-hidden
        />

        <motion.div
          style={reduced ? undefined : { y, opacity, scale }}
          className="container-bw relative z-10"
        >
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <Eyebrow>{section.eyebrow}</Eyebrow>
            </motion.div>

            {/* Microsoft's marketing H1 tops out around 40–52px; the old 4.6rem
                setting is the giveaway of a generated landing page. */}
            <h1 className="mt-6 font-display text-[2.25rem] leading-[1.15] text-ink sm:text-[2.75rem] lg:text-[3.25rem]">
              {lines.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-1">
                  <motion.span
                    className={
                      i === lines.length - 1
                        ? "block text-brass-gradient"
                        : "block"
                    }
                    initial={reduced ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, delay: 0.12 + i * 0.11, ease: EASE }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="mt-8 max-w-3xl text-lg leading-relaxed text-pretty text-ink-2 sm:text-xl"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            >
              {section.subtitle}
            </motion.p>

            {section.body ? (
              <motion.p
                className="mt-4 max-w-2xl text-sm leading-relaxed text-pretty text-ink-3"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
              >
                {section.body}
              </motion.p>
            ) : null}

            <motion.div
              className="mt-11 flex flex-col items-center gap-3.5 sm:flex-row"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
            >
              {section.ctaLabel && section.ctaHref ? (
                <ButtonLink
                  href={section.ctaHref}
                  withArrow
                  className="px-5 py-2.5 sm:px-7 sm:py-3.5"
                >
                  {section.ctaLabel}
                </ButtonLink>
              ) : null}
              {section.ctaLabel2 && section.ctaHref2 ? (
                <ButtonLink
                  href={section.ctaHref2}
                  variant="secondary"
                  className="px-5 py-2.5 sm:px-7 sm:py-3.5"
                >
                  {section.ctaLabel2}
                </ButtonLink>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
