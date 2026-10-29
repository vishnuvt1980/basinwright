"use client";

import { useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------------------------
   The hero's right-hand column: the stack, and the way into the explainer.

   The video used to run full-bleed behind the copy. That put the footage
   somewhere nobody could watch it — muted, blurred, cropped to the viewport —
   and it meant the first screen's picture was a moving texture rather than a
   statement. The still does the stating now: five layers, chips at the bottom
   and the application at the top, which is the whole product in one glance.
   The video is a click away rather than a wash behind the headline.
--------------------------------------------------------------------------- */

/**
 * The still, with a play button over it when there is something to play.
 *
 * The whole figure is the button, not just the disc — a play glyph sitting on
 * an image sets the expectation that the image is clickable, and honouring it
 * costs nothing.
 */
export function HeroMedia({
  image,
  video,
  alt,
}: {
  image: string;
  video: string | null;
  alt: string;
}) {
  const [watching, setWatching] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Height-capped rather than width-capped. The illustration is portrait,
          and a column's worth of width would make it tall enough to push the
          buttons off the first screen on a laptop. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- no loader in
          this project; the asset ships at its final size. */}
      <img
        src={image}
        alt={alt}
        width={1126}
        height={1397}
        // Rounded and ringed. The illustration's own background is near-white,
        // which all but disappears against the light canvas but lands as a bare
        // white rectangle on the dark one; the corners and the hairline make it
        // read as a framed figure rather than a stray block.
        className="mx-auto block max-h-[58svh] w-auto max-w-full rounded-2xl object-contain ring-1 ring-line"
      />

      {video ? (
        <button
          type="button"
          onClick={() => setWatching(true)}
          aria-label="Watch the BasinWright overview"
          className="group absolute inset-0 grid place-items-center rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="flex flex-col items-center gap-3">
            <span className="grid size-16 place-items-center rounded-full bg-accent text-white shadow-xl ring-4 ring-white/50 transition-transform duration-300 group-hover:scale-105">
              {/* Nudged right by a hair: a triangle's optical centre is left of
                  its bounding box, and centred by the numbers it looks like it
                  is about to fall over. */}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-1 size-6">
                <path d="M8 5.14v13.72a.5.5 0 0 0 .76.43l11.1-6.86a.5.5 0 0 0 0-.86L8.76 4.71A.5.5 0 0 0 8 5.14Z" />
              </svg>
            </span>

            {/* The label carries its own background: it sits over an
                illustration whose colours we do not control. */}
            <span className="rounded-full bg-canvas/85 px-3 py-1 text-xs font-medium tracking-wide text-ink backdrop-blur-sm">
              Watch Video
            </span>
          </span>
        </button>
      ) : null}

      {/* Mounted only while open: a dialog in the top layer does not care where
          in the tree it was declared, and leaving it unmounted keeps the file
          off the wire until someone asks for it. */}
      {video && watching ? (
        <HeroVideoDialog src={video} onClose={() => setWatching(false)} />
      ) : null}
    </div>
  );
}

/**
 * The player. Full size, full frame, sound on.
 *
 * A native `<dialog>` so Escape, focus containment and the top layer come from
 * the platform rather than from us.
 *
 * `object-contain` inside a fixed 16:9 box: the thing being watched must not
 * be cropped to fit someone's window.
 */
function HeroVideoDialog({ src, onClose }: { src: string; onClose: () => void }) {
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
