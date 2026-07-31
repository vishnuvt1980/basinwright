import Link from "next/link";
import { SectionKind } from "@prisma/client";

import { createSection, moveSection, toggleSectionVisibility } from "@/app/admin/actions";
import { Icon } from "@/components/icon";

/* ---------------------------------------------------------------------------
   The block list, shared by the homepage editor and every page editor. Both
   scope to one `page` slug, because ordering is per page.
--------------------------------------------------------------------------- */

const iconButton =
  "inline-flex size-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-raised hover:text-ink disabled:opacity-25";

/// Block types offered when adding to a page. The homepage's bespoke kinds are
/// excluded — they exist once each and are not things to create by hand.
const ADDABLE: { kind: SectionKind; label: string }[] = [
  { kind: SectionKind.PROSE, label: "Prose (Markdown)" },
  { kind: SectionKind.FEATURE_GRID, label: "Feature grid" },
  { kind: SectionKind.STAT_BAND, label: "Stat band" },
  { kind: SectionKind.TIMELINE, label: "Timeline" },
  { kind: SectionKind.FLOW, label: "Flow (stepped diagram)" },
  { kind: SectionKind.FAQ, label: "FAQ" },
  { kind: SectionKind.LINK_LIST, label: "Link list" },
  { kind: SectionKind.DOC_LIST, label: "Library list" },
  { kind: SectionKind.CALLOUT, label: "Callout" },
  { kind: SectionKind.CONTACT, label: "Contact form" },
];

type Row = {
  id: string;
  key: string;
  kind: SectionKind;
  title: string | null;
  eyebrow: string | null;
  visible: boolean;
  _count: { entries: number };
};

export function SectionList({ sections, page }: { sections: Row[]; page: string }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium tracking-wide text-ink-2 uppercase">
          Blocks ({sections.length})
        </h2>

        <form action={createSection} className="flex items-center gap-2">
          <input type="hidden" name="page" value={page} />
          <select
            name="kind"
            defaultValue={SectionKind.PROSE}
            aria-label="Block type"
            className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors focus:border-accent focus:outline-none"
          >
            {ADDABLE.map((option) => (
              <option key={option.kind} value={option.kind}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink-2 transition-colors hover:border-accent/60 hover:text-accent"
          >
            <Icon name="Plus" className="size-4" />
            Add
          </button>
        </form>
      </div>

      {sections.length ? (
        <ul className="flex flex-col gap-2">
          {sections.map((section, i) => (
            <li
              key={section.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3 pl-4 transition-colors hover:border-line-strong"
            >
              <span className="w-6 shrink-0 font-mono text-xs text-ink-3">
                {String(i + 1).padStart(2, "0")}
              </span>

              <Link href={`/admin/sections/${section.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {section.title || section.eyebrow || section.key}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-3">
                  {section.kind} · {section._count.entries} item
                  {section._count.entries === 1 ? "" : "s"}
                  {section.visible ? "" : " · hidden"}
                </p>
              </Link>

              <div className="flex shrink-0 items-center gap-1">
                <form action={moveSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label={`Move ${section.key} up`}
                    className={iconButton}
                  >
                    <Icon name="ArrowUp" className="size-4" />
                  </button>
                </form>

                <form action={moveSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={i === sections.length - 1}
                    aria-label={`Move ${section.key} down`}
                    className={iconButton}
                  >
                    <Icon name="ArrowDown" className="size-4" />
                  </button>
                </form>

                <form action={toggleSectionVisibility}>
                  <input type="hidden" name="id" value={section.id} />
                  <button
                    type="submit"
                    aria-label={`${section.visible ? "Hide" : "Show"} ${section.key}`}
                    className={iconButton}
                  >
                    <Icon
                      name={section.visible ? "Eye" : "EyeOff"}
                      className={section.visible ? "size-4" : "size-4 opacity-60"}
                    />
                  </button>
                </form>

                <Link
                  href={`/admin/sections/${section.id}`}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-raised hover:text-accent"
                  aria-label={`Edit ${section.key}`}
                >
                  <Icon name="ChevronRight" className="size-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-5 py-10 text-center text-sm text-ink-3">
          No blocks yet. Add one above — the page will render its heading either way.
        </p>
      )}
    </>
  );
}
