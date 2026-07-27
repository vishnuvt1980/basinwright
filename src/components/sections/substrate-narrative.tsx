import { IconTile } from "@/components/icon";
import type { SubstrateChapter } from "@/components/sections/substrate-chapters";
import { Chip } from "@/components/ui/primitives";

/**
 * The substrate story with no graphics at all.
 *
 * This is what phones, tablets, reduced-motion visitors, anyone who has turned
 * graphics off and anyone without JavaScript sees — so it is the version that
 * has to carry the argument on its own, not a placeholder for a canvas. It is
 * rendered on the server in every case, and the instrument replaces it only
 * once a machine has proved it can hold a frame rate.
 */
export function SubstrateNarrative({
  chapters,
}: {
  chapters: SubstrateChapter[];
}) {
  return (
    <ol className="mt-14 flex flex-col">
      {chapters.map((chapter, index) => (
        <li
          key={chapter.id}
          className="group relative flex gap-5 pb-10 last:pb-0 sm:gap-7"
        >
          {/* Connector: the pipeline is one continuous thing, so the steps are
              joined rather than stacked as separate cards. */}
          <span
            aria-hidden
            className="absolute top-11 bottom-0 left-[1.375rem] w-px bg-line group-last:hidden"
          />

          <IconTile
            name={chapter.icon}
            tone={chapter.tone}
            className="relative z-1 bg-canvas"
          />

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs text-ink-3">
                {String(index + 1).padStart(2, "0")}
              </span>
              {chapter.stage ? (
                <span
                  data-tone={chapter.tone}
                  className="text-xs font-semibold tracking-wide text-[var(--tone)] uppercase"
                >
                  {chapter.stage}
                </span>
              ) : null}
            </div>

            <h3 className="mt-2 text-lg text-balance text-ink">
              {chapter.title}
            </h3>

            {chapter.body ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pretty text-ink-2">
                {chapter.body}
              </p>
            ) : null}

            {chapter.points.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {chapter.points.map((point) => (
                  <Chip key={point} className="font-mono text-[0.7rem]">
                    {point}
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
