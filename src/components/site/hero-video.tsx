"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/components/ui/primitives";
import { useGraphics } from "@/components/webgl/graphics-store";

/* ---------------------------------------------------------------------------
   The hero's explainer, in two states.

   Behind the copy it is texture: muted, looping, blurred, well back behind a
   scrim. That is the only way a full-bleed video and a headline can share a
   plane — the footage is a screen recording of the console, so sharp it is
   full of its own words and they read as copy competing with the real copy.

   But texture is a waste of an explainer, so there is a way to actually watch
   it. The play button opens it at full size, unblurred, uncropped and with
   sound, which is what "clear on play" has to mean: not a brighter backdrop
   but the whole 16:9 frame, controls and all.
--------------------------------------------------------------------------- */

/**
 * The ambient backdrop.
 *
 * Nothing about the hero depends on it arriving. The element mounts with no
 * `src` at all and picks one up on the first idle callback, so the file never
 * competes with the headline for the opening second of the page. Until then —
 * and on a phone, under reduced motion, under reduced data, or with immersive
 * graphics switched off — the hero is simply the page's own canvas colour
 * behind the copy, which is what it was before any of this.
 *
 * It is hidden from assistive technology: silent, uncontrollable, and saying
 * what the headline in front of it already says. The dialog below is the
 * accessible route to the same footage.
 */
export function HeroVideo({ src, held }: { src: string; held: boolean }) {
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

  // Two copies of the same footage decoding at once, one of them blurred and
  // invisible behind a dialog, is pure waste. The backdrop stands down while
  // the player has the screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || !el.src) return;
    if (held) el.pause();
    else void el.play().catch(() => {});
  }, [held]);

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
        // Blurred, and deliberately — see the note at the top of the file. The
        // slight scale hides the transparent fringe a blur leaves at the edges
        // of the element.
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

/**
 * The way in. A ring, a triangle, and a label saying what happens.
 *
 * Quieter than either call to action beside it — those ask for a meeting and
 * this asks for two minutes — so it carries no fill and no border, only the
 * ring around the glyph.
 */
export function HeroVideoButton({
  onPlay,
  className,
}: {
  onPlay: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full py-1.5 pr-4 pl-1.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      <span className="relative inline-flex size-10 items-center justify-center rounded-full bg-surface ring-1 ring-line-strong transition-all duration-300 group-hover:ring-accent">
        {/* Nudged right by a hair: a triangle's optical centre is left of its
            bounding box, and centred by the numbers it looks like it is about
            to fall over. */}
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-0.5 size-4 text-accent">
          <path d="M8 5.14v13.72a.5.5 0 0 0 .76.43l11.1-6.86a.5.5 0 0 0 0-.86L8.76 4.71A.5.5 0 0 0 8 5.14Z" />
        </svg>
      </span>
      Watch the overview
    </button>
  );
}

/**
 * The player. Full size, full frame, sound on.
 *
 * A native `<dialog>` so Escape, focus containment and the top layer come from
 * the platform rather than from us. It only mounts while open, which is also
 * what keeps a second copy of the file off the wire until someone asks for it.
 *
 * `object-contain` inside a fixed 16:9 box, not `cover`: the backdrop crops
 * because it is scenery, and this one must not because it is the thing being
 * watched.
 */
export function HeroVideoDialog({ src, onClose }: { src: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Opening is a click, so the gesture that got us here is what permits
    // sound. React does not reliably reflect `muted={false}`, so it is set on
    // the element; a browser that declines anyway leaves the controls, and the
    // visitor presses play themselves.
    const el = video.current;
    if (el) {
      el.muted = false;
      el.volume = 1;
      void el.play().catch(() => {});
    }

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label="BasinWright overview"
      // Clicking away closes. The dialog element itself is the full viewport,
      // so a click that lands on it rather than on a child landed on the
      // emptiness around the video.
      onClick={(e) => {
        if (e.target === dialog.current) dialog.current?.close();
      }}
      className="m-0 grid h-dvh max-h-none w-dvw max-w-none place-items-center border-0 bg-transparent p-4 backdrop:bg-black/80 backdrop:backdrop-blur-sm sm:p-8"
    >
      <div className="relative w-full max-w-5xl">
        <video
          ref={video}
          src={src}
          controls
          playsInline
          autoPlay
          preload="auto"
          className="aspect-video w-full rounded-xl bg-black object-contain shadow-2xl"
        />

        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="Close the video"
          className="absolute -top-2 right-0 inline-flex size-9 -translate-y-full items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
            <path d="M4.4 3.34 4.3 3.3a.75.75 0 0 0-.96 1.14L10.94 12l-7.6 7.56a.75.75 0 0 0 1.06 1.06L12 13.06l7.6 7.56a.75.75 0 0 0 1.06-1.06L13.06 12l7.6-7.56a.75.75 0 0 0-1.06-1.06L12 10.94l-7.6-7.6Z" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}
