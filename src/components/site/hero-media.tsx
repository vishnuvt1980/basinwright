"use client";

import { useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

/* ---------------------------------------------------------------------------
   The hero's right-hand column: the stack, and the way into the explainer.

   The stack itself arrives as children, built on the server — see
   `platform-stack.tsx` for why it is markup rather than a picture. Only the
   player is interactive, so only the player lives on this side of the client
   boundary.

   The play button sits under the diagram rather than over it. Over a rendered
   illustration a centred disc was the obvious place for it; over five rows of
   real text it would cover the words the diagram exists to show.
--------------------------------------------------------------------------- */

export function HeroMedia({
  video,
  children,
}: {
  video: string | null;
  children: ReactNode;
}) {
  const [watching, setWatching] = useState(false);

  return (
    <div className="w-full">
      {children}

      {video ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setWatching(true)}
            className="group inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="grid size-9 place-items-center rounded-full bg-accent text-white shadow-md transition-transform duration-300 group-hover:scale-105">
              {/* Nudged right by a hair: a triangle's optical centre is left of
                  its bounding box, and centred by the numbers it looks like it
                  is about to fall over. */}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-0.5 size-3.5">
                <path d="M8 5.14v13.72a.5.5 0 0 0 .76.43l11.1-6.86a.5.5 0 0 0 0-.86L8.76 4.71A.5.5 0 0 0 8 5.14Z" />
              </svg>
            </span>
            Watch the overview
          </button>
        </div>
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
