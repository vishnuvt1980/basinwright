import Link from "next/link";
import type { Metadata } from "next";

import { createPage } from "@/app/admin/actions";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";
import { COLLECTIONS } from "@/lib/library";

export const metadata: Metadata = { title: "Pages" };
export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await db.page.findMany({ orderBy: { order: "asc" } });

  // Blocks join to their page by slug rather than by relation, so the count is
  // a separate group-by rather than an `include`.
  const counts = await db.section.groupBy({
    by: ["page"],
    _count: { _all: true },
  });
  const blocksFor = new Map(counts.map((row) => [row.page, row._count._all]));

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Pages</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-3">
            Everything at <span className="font-mono text-xs">/slug</span>. Each page is
            a heading plus ordered blocks — the same blocks the homepage is built from.
          </p>
        </div>

        <form action={createPage}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink-2 transition-colors hover:border-accent/60 hover:text-accent"
          >
            <Icon name="Plus" className="size-4" />
            New page
          </button>
        </form>
      </header>

      <ul className="mt-9 flex flex-col gap-2">
        {pages.map((page) => (
          <li key={page.id}>
            <Link
              href={`/admin/pages/${page.id}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3 pl-4 transition-colors hover:border-line-strong"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{page.title}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-ink-3">
                  /{page.slug} · {blocksFor.get(page.slug) ?? 0} blocks
                  {page.published ? "" : " · draft"}
                </p>
              </div>
              <Icon name="ChevronRight" className="size-4 shrink-0 text-ink-3" />
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10 rounded-2xl border border-line bg-surface/50 p-6">
        <h2 className="text-sm font-medium tracking-wide text-ink-2 uppercase">
          Library collections
        </h2>
        <p className="mt-2 text-sm text-ink-3">
          These routes are generated from the library and cannot be used as page slugs.
          Their contents are edited under{" "}
          <Link href="/admin/library" className="text-accent hover:underline">
            Library
          </Link>
          .
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {COLLECTIONS.map((collection) => (
            <li
              key={collection.slug}
              className="rounded-md border border-line bg-raised px-2.5 py-1 font-mono text-xs text-ink-3"
            >
              /{collection.slug}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
