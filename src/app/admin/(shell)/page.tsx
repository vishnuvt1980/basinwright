import Link from "next/link";
import type { Metadata } from "next";

import { moveSection, toggleSectionVisibility } from "@/app/admin/actions";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";

const iconButton =
  "inline-flex size-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-raised hover:text-ink disabled:opacity-25";

export const metadata: Metadata = { title: "Sections" };
export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  const [sections, counts] = await Promise.all([
    db.section.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { entries: true } } },
    }),
    db.$transaction([
      db.lead.count({ where: { handled: false } }),
      db.chatConversation.count(),
    ]),
  ]);

  const [openLeads, conversations] = counts;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Homepage sections</h1>
          <p className="mt-2 text-sm text-ink-3">
            Reorder, hide, or edit any block on the site. Changes go live on save.
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/admin/leads" className="text-ink-3 transition-colors hover:text-accent">
            <span className="font-display text-2xl text-ink">{openLeads}</span>{" "}
            new leads
          </Link>
          <Link href="/admin/chats" className="text-ink-3 transition-colors hover:text-accent">
            <span className="font-display text-2xl text-ink">
              {conversations}
            </span>{" "}
            conversations
          </Link>
        </div>
      </header>

      <ul className="mt-9 flex flex-col gap-2">
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
                  {section.visible ? (
                    <Icon name="Eye" className="size-4" />
                  ) : (
                    <Icon name="EyeOff" className="size-4 opacity-60" />
                  )}
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
    </>
  );
}
