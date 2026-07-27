"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { SubstrateChapter } from "@/components/sections/substrate-chapters";
import { GraphicsToggle } from "@/components/webgl/graphics-toggle";
import { useGraphics } from "@/components/webgl/graphics-store";
import type { Verdict } from "@/components/webgl/substrate/engine";

/// Keeps the simulation, the shaders and the HUD out of the homepage payload —
/// they arrive only once a capable machine scrolls the section into range.
const SubstrateInstrument = dynamic(
  () => import("@/components/webgl/substrate-instrument"),
  { ssr: false },
);

/// Start fetching the instrument chunk this far before the section arrives.
const PREFETCH_MARGIN = "500px 0px";

/// Where the instrument parks itself, clearing the fixed site header (4.5rem).
const STICKY_TOP_REM = 5.5;

/// Scroll length granted to each chapter after the first, as a fraction of the
/// viewport. Long enough to read the copy, short enough not to feel trapped.
const CHAPTER_SCROLL_VH = 0.7;

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
/* Stage                                                                      */
/* -------------------------------------------------------------------------- */

export function SubstrateStage({
  chapters,
  hint,
  children,
}: {
  chapters: SubstrateChapter[];
  hint: string | null;
  /// The server-rendered narrative. Shown whenever the instrument is not
  /// running, which includes phones, reduced motion and the no-JS case.
  children: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);

  // Mounted once the section is close, and kept mounted afterwards.
  const [near, setNear] = useState(false);
  const [onscreen, setOnscreen] = useState(false);
  const [chapter, setChapter] = useState(0);
  // Set when the runtime frame-rate guard gives up on this machine.
  const [tooSlow, setTooSlow] = useState(false);

  const { sceneEnabled, sceneAnimated } = useGraphics();
  const tabHidden = useTabHidden();

  const showInstrument = sceneEnabled && !tooSlow;

  // Re-run when the branch changes: the track only exists in the instrument
  // branch, and the first render is always the fallback one — the graphics
  // store reports "off" until it has resolved on the client.
  useEffect(() => {
    const element = track.current;
    if (!element) return;

    // Two thresholds: one to decide when to fetch and mount, a tighter one to
    // decide whether the simulation should be running at all.
    const prefetch = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          prefetch.disconnect();
        }
      },
      { rootMargin: PREFETCH_MARGIN },
    );

    const presence = new IntersectionObserver(([entry]) =>
      setOnscreen(entry.isIntersecting),
    );

    prefetch.observe(element);
    presence.observe(element);

    return () => {
      prefetch.disconnect();
      presence.disconnect();
    };
  }, [showInstrument]);

  /* --- scroll drives the narrative ---------------------------------------- */

  useEffect(() => {
    const element = track.current;
    if (!element || !showInstrument) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const stage = element.firstElementChild as HTMLElement | null;
      if (!stage) return;

      // Distance the track scrolls past while the instrument is parked.
      const travel = element.offsetHeight - stage.offsetHeight;
      if (travel <= 0) return;

      const top = element.getBoundingClientRect().top;
      const offset = STICKY_TOP_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const scrolled = Math.min(Math.max(offset - top, 0), travel);
      const next = Math.min(
        chapters.length - 1,
        Math.floor((scrolled / travel) * chapters.length),
      );

      setChapter((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      // One measurement per frame at most: scroll fires far more often than
      // anything on screen can change.
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Deferred rather than called straight from the effect, so the first
    // measurement lands after paint instead of as a synchronous state write.
    frame = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chapters.length, showInstrument]);

  /// Scrolls to the middle of a chapter's slice of the track, so the dots are a
  /// way back to something already read rather than a dead readout.
  const selectChapter = useCallback(
    (index: number) => {
      const element = track.current;
      const stage = element?.firstElementChild as HTMLElement | null;
      if (!element || !stage) return;

      const travel = element.offsetHeight - stage.offsetHeight;
      if (travel <= 0) return;

      const offset =
        STICKY_TOP_REM *
        parseFloat(getComputedStyle(document.documentElement).fontSize);
      const start = window.scrollY + element.getBoundingClientRect().top - offset;
      const within = ((index + 0.5) / chapters.length) * travel;

      window.scrollTo({ top: start + within, behavior: "smooth" });
    },
    [chapters.length],
  );

  const handleVerdict = useCallback((verdict: Verdict) => {
    // The engine steps its own quality down once; if that was not enough it
    // says so and the section goes back to the narrative. Never let the page
    // stutter to preserve the effect.
    if (verdict === "abort") setTooSlow(true);
  }, []);

  if (!showInstrument) {
    return (
      <>
        {children}
        <div className="container-bw mt-10">
          <GraphicsToggle />
        </div>
      </>
    );
  }

  return (
    <div
      ref={track}
      className="relative mt-14"
      style={{
        // One viewport-ish of scroll per chapter after the first. The
        // instrument is sticky inside this, so the height *is* the narrative.
        paddingBottom: `${(chapters.length - 1) * CHAPTER_SCROLL_VH * 100}vh`,
      }}
    >
      <div
        className="sticky mx-auto max-w-[110rem] px-0"
        style={{
          top: `${STICKY_TOP_REM}rem`,
          // The full HUD needs the height: the rails carry four panels between
          // them, and the field needs room to be more than a smear.
          height: `min(56rem, calc(100vh - ${STICKY_TOP_REM + 1.5}rem))`,
        }}
      >
        {near ? (
          <SubstrateInstrument
            chapters={chapters}
            chapter={chapter}
            hint={hint}
            animated={sceneAnimated}
            paused={!onscreen || tabHidden}
            onVerdict={handleVerdict}
            onSelectChapter={selectChapter}
          />
        ) : (
          // Holds the exact box the instrument will occupy, so mounting it
          // shifts nothing.
          <div className="h-full border-y border-line bg-shade-950" />
        )}
      </div>

      <div className="container-bw absolute inset-x-0 bottom-0 flex justify-end pb-10">
        <GraphicsToggle />
      </div>
    </div>
  );
}
