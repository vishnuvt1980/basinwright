"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { IconTile } from "@/components/icon";
import { substrateChapters } from "@/components/sections/substrate-chapters";
import { SubstrateNarrative } from "@/components/sections/substrate-narrative";
import { useIsDark } from "@/components/theme/use-dark";
import { ButtonLink, Eyebrow, cn } from "@/components/ui/primitives";
import { GraphicsToggle } from "@/components/webgl/graphics-toggle";
import { useGraphics } from "@/components/webgl/graphics-store";
import { HeroCanvas } from "@/components/webgl/hero-canvas";
import type { Verdict } from "@/components/webgl/substrate/engine";
import type { SectionWithEntries } from "@/lib/content";

/// Keeps the simulation, the shaders and the readouts out of the homepage
/// payload — they arrive only on a machine that has cleared the capability
/// gate, and never on a phone.
const SubstrateBanner = dynamic(
  () => import("@/components/webgl/substrate-banner"),
  { ssr: false },
);

const EASE = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/* Tab visibility                                                             */
/* -------------------------------------------------------------------------- */

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const hiddenSnapshot = () => document.visibilityState === "hidden";

function useTabHidden() {
  return useSyncExternalStore(subscribeVisibility, hiddenSnapshot, () => false);
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The hero, with the cognitive substrate running behind it.
 *
 * The substrate is its own CMS section — it has chapters, copy and an editor —
 * but it is not a block on the page: it is the hero's banner. `page.tsx` pulls
 * it out of the section list and hands it here.
 *
 * On a phone, under reduced motion, with graphics switched off or without
 * JavaScript, there is no canvas at all. The same story is told as plain text
 * beneath the headline instead, because a story nobody can see is not a story.
 */
export function Hero({
  section,
  substrate,
}: {
  section: SectionWithEntries;
  /// The substrate section, when there is one to draw.
  substrate: SectionWithEntries | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const [onscreen, setOnscreen] = useState(true);
  // Set when the runtime frame-rate guard gives up on this machine.
  const [tooSlow, setTooSlow] = useState(false);

  const { sceneEnabled, sceneAnimated } = useGraphics();
  const dark = useIsDark();
  const tabHidden = useTabHidden();

  const chapters = useMemo(
    () => (substrate ? substrateChapters(substrate) : []),
    [substrate],
  );

  const banner = sceneEnabled && !tooSlow && chapters.length > 0;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The copy settles back and dims as the next section rises over it.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const presence = new IntersectionObserver(([entry]) =>
      setOnscreen(entry.isIntersecting),
    );
    presence.observe(element);
    return () => presence.disconnect();
  }, []);

  const handleVerdict = useCallback((verdict: Verdict) => {
    // The engine steps its own quality down once; if that was not enough it
    // says so and the hero falls back to the plain rendering. Never let the
    // page stutter to preserve the effect.
    if (verdict === "abort") setTooSlow(true);
  }, []);

  const lines = section.headlineLines.length
    ? section.headlineLines
    : [section.title ?? ""];

  return (
    // `data-substrate` scopes the simulation's own colour tokens (globals.css)
    // to everything the hero draws with them — the banner readouts, the
    // highlighted closing line, and the plain narrative that replaces both.
    <section
      ref={ref}
      data-substrate
      className={cn("relative isolate", !banner && "grain")}
    >
      {/* The banner: full width, the field with nothing laid over it but its
          own readouts, its story and one call to action. */}
      {banner ? (
        <div className="relative h-[min(92svh,54rem)] min-h-[34rem] overflow-hidden">
          <SubstrateBanner
            chapters={chapters}
            hint={substrate?.body ?? null}
            cta={
              section.ctaLabel && section.ctaHref
                ? { label: section.ctaLabel, href: section.ctaHref }
                : null
            }
            dark={dark}
            animated={sceneAnimated}
            paused={!onscreen || tabHidden}
            onVerdict={handleVerdict}
          />
        </div>
      ) : null}

      {/* The copy. Below the banner where there is one, and the whole of the
          first screen where there is not. */}
      <div
        className={cn(
          "relative flex flex-col justify-center overflow-hidden",
          banner ? "pt-20 pb-4" : "min-h-[100svh] pt-32 pb-20",
        )}
      >
        {banner ? null : (
          <>
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
          </>
        )}

        <motion.div
          style={reduced || banner ? undefined : { y, opacity, scale }}
          className="container-bw relative z-10"
        >
          <div
            className={cn(
              "flex flex-col",
              banner
                ? "max-w-4xl items-start text-left"
                : "items-center text-center",
            )}
          >
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

            {/* The banner already carries the one call to action it is allowed;
                repeating it here would be the third on the same screen, after
                the header's two. */}
            {banner ? null : (
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
            )}
          </div>
        </motion.div>
      </div>

      {/* The numbers, and — where there is no canvas — the same story the
          banner would have told. */}
      <div className="container-bw relative z-10 pt-16 pb-24">
        {section.entries.length ? (
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
            {section.entries.map((stat) => (
              <div
                key={stat.id}
                className="group flex flex-col items-center gap-3 bg-surface px-5 py-7 transition-colors duration-500 hover:bg-raised"
              >
                <IconTile name={stat.icon} size="sm" />
                <dd className="font-display text-3xl text-ink">{stat.subtitle}</dd>
                <dt className="text-[0.7rem] tracking-[0.14em] text-ink-3 uppercase">
                  {stat.title}
                </dt>
              </div>
            ))}
          </dl>
        ) : null}

        {!banner && chapters.length ? (
          <div className="mt-20 border-t border-line pt-14">
            {substrate?.eyebrow ? <Eyebrow>{substrate.eyebrow}</Eyebrow> : null}
            {substrate?.title ? (
              <h2 className="mt-4 max-w-2xl font-display text-[1.75rem] leading-[1.2] text-balance text-ink sm:text-[2rem]">
                {substrate.title}
              </h2>
            ) : null}
            <SubstrateNarrative chapters={chapters} />
          </div>
        ) : null}

        <div className="mt-10 flex justify-end">
          <GraphicsToggle />
        </div>
      </div>
    </section>
  );
}
