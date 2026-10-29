import type { TopologyLayer } from "@/components/sections/topology-layers";

/* ---------------------------------------------------------------------------
   The stack: the artwork, with its labels set as text over it.

   The illustration ships without words in it. A cut that had them baked in was
   tried and withdrawn — the file is 1126px wide and the hero gives it about
   440, a scale of 0.39, which took 14px labels down to five. Present and
   unreadable, which is the worst of both: the bytes of a labelled diagram and
   the use of an unlabelled one.

   Set as text instead, the same words hold at any size, flip with the theme,
   can be read aloud, found by a search and translated, and cost nothing to
   change. The picture keeps doing what a picture is for.

   ---------------------------------------------------------------------------
   These coordinates belong to THIS artwork.

   They were measured off `platform-stack.webp` rather than guessed: the file
   was drawn to a canvas and scanned for the icon chips down its left edge and
   the industry chips along its top, which came back as five clean row bands
   and six clean column bands. Everything below is those bands as percentages,
   so the labels track the picture at any rendered size.

   Replace the artwork and these are wrong. Re-measure; do not nudge.
--------------------------------------------------------------------------- */

/// Top of the stack first — the order the picture reads downward.
const LAYER_MARKS = [
  { top: 34.1 }, // Application
  { top: 47.9 }, // Models
  { top: 62.0 }, // Data Hub
  { top: 75.5 }, // Infrastructure
  { top: 88.2 }, // Computing
];

/// Centre of each icon chip, which is what the labels hang under.
const LAYER_X = 9.45;

/// How many industry chips the artwork draws along its top. The names are not
/// set over them: those chips sit in the right-hand 56% of the frame, which at
/// the width the hero gives the figure leaves each name about 49px of room.
/// "Government" wants 70. They ride above the figure instead, where they have
/// the whole column — measured, not guessed: at 435px the overlaid row
/// collided by 8.6px and 16.3px.
const INDUSTRY_SLOTS = 6;

export function PlatformStack({
  image,
  layers,
  industries,
  caption,
}: {
  image: string;
  /// Bottom of the stack first, as the entries are ordered.
  layers: TopologyLayer[];
  industries: string[];
  caption: string | null;
}) {
  // Entries run bottom-first so that reordering them in /admin restacks the
  // diagram the way it reads on screen. The picture reads top-first.
  const top = [...layers].reverse().slice(0, LAYER_MARKS.length);
  const chips = industries.slice(0, INDUSTRY_SLOTS);

  return (
    // Capped by WIDTH, never by height. The labels are positioned in percent
    // against this box, so the image has to fill it exactly — cap the image's
    // height instead and it shrinks inside a wider figure, taking every label
    // off its mark. 0.806 is the artwork's 1126/1397, so the cap is really a
    // height budget expressed the only way that keeps the two locked together.
    <figure className="relative mx-auto w-full max-w-md lg:max-w-[calc(60svh*0.806)]">
      {chips.length ? (
        <ul className="mb-3 flex flex-wrap justify-center gap-1.5">
          {chips.map((industry) => (
            <li
              key={industry}
              className="rounded-md bg-raised px-2.5 py-1 text-[0.6875rem] font-medium text-ink-2 ring-1 ring-line"
            >
              {industry}
            </li>
          ))}
        </ul>
      ) : null}

      {/* The positioning context is this box and not the figure: the chip row
          above is part of the figure too, and measuring the labels against a
          box that includes it would slide every one of them down by its
          height. */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- no loader in
            this project; the asset ships at its final size. */}
        <img
          src={image}
          // Decorative: the words it would carry are set as text over it, and
          // the caption gives the whole thing to a screen reader in order.
          alt=""
          width={1126}
          height={1397}
          className="block w-full rounded-2xl ring-1 ring-line"
        />

        {/* `pointer-events-none` so nothing over the figure loses hit area. */}
        <div className="pointer-events-none absolute inset-0 text-[0.625rem] leading-none font-medium sm:text-[0.6875rem]">
          {top.map((layer, i) => (
            <span
              key={layer.id}
              style={{ left: `${LAYER_X}%`, top: `${LAYER_MARKS[i].top}%` }}
              // Tighter padding on a phone: at 342px the longest label,
              // "Infrastructure", overhung the artwork's left edge by 3.5px,
              // and the four it buys back is the whole of the difference.
              className="absolute -translate-x-1/2 rounded bg-canvas/85 px-0.5 py-0.5 whitespace-nowrap text-ink backdrop-blur-sm sm:px-1"
            >
              {layer.title}
            </span>
          ))}
        </div>
      </div>

      {/* The diagram in words, for anything that cannot see it. Visible only to
          assistive technology — the picture above already says this to everyone
          else, and saying it twice on screen would be noise. */}
      {/* Each layer's subtitle is carried here rather than drawn: on screen the
          picture is doing that job, and five lines of description beside it
          would be the thing the overlaid labels were meant to avoid. This is
          also the only place the subtitles are used, so an editor filling one
          in is not filling in nothing. */}
      <figcaption className="sr-only">
        The BasinWright stack, from the top down:{" "}
        {top
          .map((l) => (l.subtitle ? `${l.title} — ${l.subtitle}` : l.title))
          .join(". ")}
        .{chips.length ? ` Serving ${chips.join(", ")}.` : ""}
        {caption ? ` ${caption}` : ""}
      </figcaption>
    </figure>
  );
}
