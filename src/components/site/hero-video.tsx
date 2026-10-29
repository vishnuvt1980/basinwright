"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { useGraphics } from "@/components/webgl/graphics-store";

/**
 * The hero's backdrop when the block carries a video: the explainer, muted and
 * looping behind the copy.
 *
 * The file is served from `public/` rather than embedded from a video host. A
 * background loop wants none of what a host gives you — no controls, no
 * branding, no related-video card at the end, no cookie set before the visitor
 * has agreed to anything — and the one thing it does want, a clean loop back to
 * frame one, is the thing an embed does worst.
 *
 * Nothing about the hero depends on it arriving. The element mounts with no
 * `src` at all; the source is attached on the first idle callback, so the file
 * never competes with the headline for the opening second of the page. Until
 * then — and on a phone, under reduced motion, under reduced data, or with
 * immersive graphics switched off — the hero is simply the page's own canvas
 * colour behind the copy, which is what it was before any of this.
 *
 * It is not content: silent, uncontrollable, and saying what the headline in
 * front of it already says, so it is hidden from assistive technology outright.
 * An explainer that is meant to be *watched* wants a play button and a dialog,
 * not this.
 */
export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  // One switch governs every moving backdrop on the site. Only an explicit
  // "off" is honoured here: unlike the WebGL layers this costs no GPU, so the
  // capability probe has no opinion about it.
  const off = useGraphics().choice === "off";

  useEffect(() => {
    const el = ref.current;
    if (!el || !src || reduced || off) return;

    // Phones keep the plain hero. A 16:9 frame cropped to a tall viewport shows
    // almost none of itself, and it would be far the heaviest thing on a page
    // that someone is quite possibly paying for by the megabyte.
    if (window.innerWidth < 768) return;
    if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return;

    const start = () => {
      // React does not reliably reflect the `muted` prop onto the element, and
      // an unmuted video is refused autoplay by every current browser.
      el.muted = true;
      el.src = src;
      // A rejected play() is an ordinary outcome, not a fault: the tab may be
      // in the background, or the engine may simply decline. The backdrop stays
      // absent and the hero reads exactly as it does without a video.
      void el.play().catch(() => {});
    };

    // `requestIdleCallback` is still unimplemented in Safari-derived engines.
    const idle = window.requestIdleCallback?.(start, { timeout: 2500 });
    const timer = idle === undefined ? window.setTimeout(start, 900) : undefined;

    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [src, reduced, off]);

  if (!src) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
        // Blurred, and deliberately. The footage is a screen recording of the
        // console, so it is full of its own words — menu labels, field names, a
        // model id — and unblurred they sit directly behind the headline
        // reading as competing copy. Out of focus the same frames keep what the
        // hero actually wants from them: the motion, the brand blues, the sense
        // of a product doing something. The slight scale hides the transparent
        // fringe a blur leaves at the edges of the element.
        className="size-full scale-105 object-cover opacity-0 blur-[3px] transition-opacity duration-1000"
        // The first decodable frame, not the first loadable byte: fading in any
        // earlier shows a black rectangle under the headline.
        onCanPlay={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      />

      {/* The scrim, in two parts. A flat wash holds the whole frame back behind
          the page's own canvas colour; the radial on top of it is heaviest
          exactly where the copy sits, because the hero's body line is the
          smallest text on the page and has to clear contrast against whichever
          frame happens to be showing under it. */}
      <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--bw-canvas)_58%,transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_54%_44%_at_50%_46%,color-mix(in_oklab,var(--bw-canvas)_80%,transparent)_0%,transparent_100%)]" />
    </div>
  );
}
