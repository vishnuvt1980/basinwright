"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { Icon } from "@/components/icon";
import { ButtonLink, Eyebrow } from "@/components/ui/primitives";
import { HeroCanvas } from "@/components/webgl/hero-canvas";
import type { SectionWithEntries } from "@/lib/content";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ section }: { section: SectionWithEntries }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The hero settles back and dims as the next section rises over it.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  const lines = section.headlineLines.length
    ? section.headlineLines
    : [section.title ?? ""];

  return (
    <section
      ref={ref}
      className="grain relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20"
    >
      {/* Layered backdrop: contour wash, WebGL basin, vignette. */}
      <div className="topo pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <HeroCanvas />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,transparent_0%,var(--color-basin-950)_78%)]"
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

          <h1 className="mt-8 font-display text-[2.6rem] leading-[1.06] tracking-tight text-parchment-50 sm:text-6xl lg:text-[4.6rem]">
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className={i === lines.length - 1 ? "block text-brass-gradient" : "block"}
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
            className="mt-8 max-w-3xl text-pretty text-lg leading-relaxed text-basin-300 sm:text-xl"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          >
            {section.subtitle}
          </motion.p>

          {section.body ? (
            <motion.p
              className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-basin-400"
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
              <ButtonLink href={section.ctaHref} withArrow className="px-7 py-3.5">
                {section.ctaLabel}
              </ButtonLink>
            ) : null}
            {section.ctaLabel2 && section.ctaHref2 ? (
              <ButtonLink
                href={section.ctaHref2}
                variant="secondary"
                className="px-7 py-3.5"
              >
                {section.ctaLabel2}
              </ButtonLink>
            ) : null}
          </motion.div>

          {section.entries.length ? (
            <motion.dl
              className="mt-20 grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-basin-700/60 bg-basin-700/40 lg:grid-cols-4"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.95, ease: EASE }}
            >
              {section.entries.map((stat) => (
                <div
                  key={stat.id}
                  className="group flex flex-col items-center gap-1.5 bg-basin-900/80 px-5 py-7 backdrop-blur-sm transition-colors duration-500 hover:bg-basin-850"
                >
                  <Icon
                    name={stat.icon}
                    className="size-4 text-brass-500/70 transition-colors duration-500 group-hover:text-brass-400"
                  />
                  <dd className="font-display text-3xl text-parchment-50">
                    {stat.subtitle}
                  </dd>
                  <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-basin-400">
                    {stat.title}
                  </dt>
                </div>
              ))}
            </motion.dl>
          ) : null}
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute inset-x-0 bottom-7 z-10 flex justify-center"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <div className="flex h-11 w-6 items-start justify-center rounded-full border border-basin-600/80 p-1.5">
          <motion.span
            className="block h-2 w-1 rounded-full bg-brass-400"
            animate={reduced ? undefined : { y: [0, 13, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
