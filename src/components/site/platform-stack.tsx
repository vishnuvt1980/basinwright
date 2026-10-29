import { Icon } from "@/components/icon";
import type { TopologyLayer } from "@/components/sections/topology-layers";

/* ---------------------------------------------------------------------------
   The stack, in markup.

   This replaced a rendered illustration of the same diagram. The picture was
   1126px wide and the hero gave it 421 — a scale of 0.374, which took its
   layer labels down to about five pixels. They were present and unreadable,
   which is the worst of both: the bytes of a labelled diagram and the use of
   an unlabelled one.

   Text set as text has no such scale. It also flips with the theme, reflows on
   a phone, can be read aloud, found by a search, and translated, none of which
   a baked PNG of the same words can do.

   Everything here is content from the CMS: the layers are the block's entries,
   bottom of the stack first, and the industries along the top are
   `meta.industries`. A server component, because none of it moves.
--------------------------------------------------------------------------- */

export function PlatformStack({
  layers,
  industries,
  governance,
}: {
  /// Bottom of the stack first, as the entries are ordered.
  layers: TopologyLayer[];
  industries: string[];
  governance: string | null;
}) {
  if (!layers.length) return null;

  // Entries run bottom-first so that reordering them in /admin restacks the
  // diagram the way it reads on screen. Drawing runs top-first.
  const top = [...layers].reverse();

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-none">
      {industries.length ? (
        <>
          <ul className="flex flex-wrap justify-center gap-1.5">
            {industries.map((industry) => (
              <li
                key={industry}
                className="rounded-md bg-raised px-2.5 py-1 text-[0.6875rem] font-medium text-ink-2 ring-1 ring-line"
              >
                {industry}
              </li>
            ))}
          </ul>

          {/* The industries sit above the stack and are served by it, so the
              gap between them is a join rather than a margin. */}
          <div
            aria-hidden
            className="mx-auto h-5 w-px bg-gradient-to-b from-transparent to-line-strong"
          />
        </>
      ) : null}

      <ol className="flex flex-col gap-1.5">
        {top.map((layer) => (
          <li
            key={layer.id}
            data-tone={layer.tone}
            // The plate. A tinted wash and a hairline in the layer's own tone,
            // with the left edge carrying the weight — the eye reads the
            // colour run down the side of the stack as the stack itself.
            className="flex items-center gap-3 rounded-lg border-l-2 bg-[color-mix(in_oklab,var(--tone)_7%,var(--bw-surface))] px-3 py-2.5 ring-1 ring-[color-mix(in_oklab,var(--tone)_22%,transparent)] ring-inset"
            style={{ borderLeftColor: "var(--tone)" }}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[color-mix(in_oklab,var(--tone)_14%,transparent)] text-[var(--tone)]">
              <Icon name={layer.icon} className="size-4" />
            </span>

            <span className="min-w-0">
              <span className="block text-sm leading-tight font-semibold text-ink">
                {layer.title}
              </span>
              {layer.subtitle ? (
                <span className="block truncate text-xs leading-tight text-ink-3">
                  {layer.subtitle}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      {governance ? (
        <p className="mt-1.5 rounded-lg border border-dashed border-line-strong px-3 py-2 text-center text-[0.6875rem] font-medium text-ink-3">
          {governance}
        </p>
      ) : null}
    </div>
  );
}
