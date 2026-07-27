import Link from "next/link";
import type { Metadata } from "next";

import { SectionList } from "@/components/admin/section-list";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Sections" };
export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  const [sections, counts] = await Promise.all([
    db.section.findMany({
      where: { page: "home" },
      orderBy: { order: "asc" },
      include: { _count: { select: { entries: true } } },
    }),
    db.$transaction([
      db.lead.count({ where: { handled: false } }),
      db.chatConversation.count(),
      db.doc.count({ where: { published: true } }),
    ]),
  ]);

  const [openLeads, conversations, published] = counts;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Homepage sections</h1>
          <p className="mt-2 text-sm text-ink-3">
            Reorder, hide, or edit any block on the homepage. Changes go live on save.
            Other pages live under{" "}
            <Link href="/admin/pages" className="text-accent hover:underline">
              Pages
            </Link>
            .
          </p>
        </div>

        <div className="flex gap-6 text-sm">
          <Link href="/admin/leads" className="text-ink-3 transition-colors hover:text-accent">
            <span className="font-display text-2xl text-ink">{openLeads}</span> new leads
          </Link>
          <Link href="/admin/chats" className="text-ink-3 transition-colors hover:text-accent">
            <span className="font-display text-2xl text-ink">{conversations}</span>{" "}
            conversations
          </Link>
          <Link href="/admin/library" className="text-ink-3 transition-colors hover:text-accent">
            <span className="font-display text-2xl text-ink">{published}</span> published
          </Link>
        </div>
      </header>

      <div className="mt-9">
        <SectionList sections={sections} page="home" />
      </div>
    </>
  );
}
