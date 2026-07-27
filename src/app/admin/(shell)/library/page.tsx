import Link from "next/link";
import type { Metadata } from "next";

import { createDoc, toggleDocPublished } from "@/app/admin/actions";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";
import { COLLECTIONS, formatDate } from "@/lib/library";

export const metadata: Metadata = { title: "Library" };
export const dynamic = "force-dynamic";

export default async function AdminLibraryPage() {
  const docs = await db.doc.findMany({
    orderBy: [{ kind: "asc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      kind: true,
      slug: true,
      title: true,
      category: true,
      author: true,
      published: true,
      featured: true,
      gated: true,
      publishedAt: true,
    },
  });

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Library</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-3">
            Case studies, whitepapers, blog posts, learning articles, research, news and
            release notes. Each one is Markdown and publishes to its collection.
          </p>
        </div>

        <form action={createDoc} className="flex items-center gap-2">
          <select
            name="kind"
            defaultValue="BLOG"
            aria-label="Collection"
            className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors focus:border-accent focus:outline-none"
          >
            {COLLECTIONS.map((collection) => (
              <option key={collection.kind} value={collection.kind}>
                {collection.singular}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink-2 transition-colors hover:border-accent/60 hover:text-accent"
          >
            <Icon name="Plus" className="size-4" />
            New
          </button>
        </form>
      </header>

      {COLLECTIONS.map((collection) => {
        const rows = docs.filter((doc) => doc.kind === collection.kind);
        if (!rows.length) return null;

        return (
          <section key={collection.slug} className="mt-9">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-medium tracking-wide text-ink-2 uppercase">
                {collection.label} ({rows.length})
              </h2>
              <Link
                href={`/${collection.slug}`}
                target="_blank"
                className="font-mono text-xs text-ink-3 transition-colors hover:text-accent"
              >
                /{collection.slug}
              </Link>
            </div>

            <ul className="flex flex-col gap-2">
              {rows.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3 pl-4 transition-colors hover:border-line-strong"
                >
                  <Link href={`/admin/library/${doc.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{doc.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-3">
                      {formatDate(doc.publishedAt)}
                      {doc.category ? ` · ${doc.category}` : ""}
                      {doc.author ? ` · ${doc.author}` : ""}
                      {doc.featured ? " · featured" : ""}
                      {doc.gated ? " · portal" : ""}
                      {doc.published ? "" : " · draft"}
                    </p>
                  </Link>

                  <div className="flex shrink-0 items-center gap-1">
                    <form action={toggleDocPublished}>
                      <input type="hidden" name="id" value={doc.id} />
                      <button
                        type="submit"
                        aria-label={`${doc.published ? "Unpublish" : "Publish"} ${doc.title}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-raised hover:text-ink"
                      >
                        <Icon
                          name={doc.published ? "Eye" : "EyeOff"}
                          className={doc.published ? "size-4" : "size-4 opacity-60"}
                        />
                      </button>
                    </form>

                    <Link
                      href={`/admin/library/${doc.id}`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-raised hover:text-accent"
                      aria-label={`Edit ${doc.title}`}
                    >
                      <Icon name="ChevronRight" className="size-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {docs.length === 0 ? (
        <p className="mt-9 rounded-xl border border-dashed border-line px-5 py-10 text-center text-sm text-ink-3">
          Nothing in the library yet. Pick a collection above and create the first piece.
        </p>
      ) : null}
    </>
  );
}
