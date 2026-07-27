import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Eye, EyeOff, MoveDown, MoveUp } from "lucide-react";

import { moveSection, toggleSectionVisibility } from "@/app/admin/actions";
import { db } from "@/lib/db";

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
          <h1 className="font-display text-3xl text-parchment-50">Homepage sections</h1>
          <p className="mt-2 text-sm text-basin-400">
            Reorder, hide, or edit any block on the site. Changes go live on save.
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/admin/leads" className="text-basin-400 hover:text-brass-300">
            <span className="font-display text-2xl text-parchment-50">{openLeads}</span>{" "}
            new leads
          </Link>
          <Link href="/admin/chats" className="text-basin-400 hover:text-brass-300">
            <span className="font-display text-2xl text-parchment-50">
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
            className="flex items-center gap-3 rounded-xl border border-basin-700/70 bg-basin-900/60 p-3 pl-4 transition-colors hover:border-basin-500"
          >
            <span className="w-6 shrink-0 font-mono text-xs text-basin-500">
              {String(i + 1).padStart(2, "0")}
            </span>

            <Link href={`/admin/sections/${section.id}`} className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-parchment-100">
                {section.title || section.eyebrow || section.key}
              </p>
              <p className="mt-0.5 truncate text-xs text-basin-500">
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
                  className="inline-flex size-8 items-center justify-center rounded-lg text-basin-400 transition-colors hover:bg-basin-800 hover:text-parchment-100 disabled:opacity-25"
                >
                  <MoveUp className="size-4" />
                </button>
              </form>

              <form action={moveSection}>
                <input type="hidden" name="id" value={section.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  disabled={i === sections.length - 1}
                  aria-label={`Move ${section.key} down`}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-basin-400 transition-colors hover:bg-basin-800 hover:text-parchment-100 disabled:opacity-25"
                >
                  <MoveDown className="size-4" />
                </button>
              </form>

              <form action={toggleSectionVisibility}>
                <input type="hidden" name="id" value={section.id} />
                <button
                  type="submit"
                  aria-label={`${section.visible ? "Hide" : "Show"} ${section.key}`}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-basin-400 transition-colors hover:bg-basin-800 hover:text-parchment-100"
                >
                  {section.visible ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4 text-basin-600" />
                  )}
                </button>
              </form>

              <Link
                href={`/admin/sections/${section.id}`}
                className="inline-flex size-8 items-center justify-center rounded-lg text-basin-400 transition-colors hover:bg-basin-800 hover:text-brass-300"
                aria-label={`Edit ${section.key}`}
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
