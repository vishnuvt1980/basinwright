import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { deleteDoc } from "@/app/admin/actions";
import { DocForm } from "@/components/admin/doc-form";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";
import { collectionForKind } from "@/lib/library";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doc = await db.doc.findUnique({ where: { id } });
  return { title: doc?.title ?? "Document" };
}

export default async function DocEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const doc = await db.doc.findUnique({ where: { id } });
  if (!doc) notFound();

  const collection = collectionForKind(doc.kind);

  return (
    <>
      <Link
        href="/admin/library"
        className="inline-flex items-center gap-2 text-sm text-ink-3 transition-colors hover:text-accent"
      >
        <Icon name="ArrowLeft" className="size-4" />
        All documents
      </Link>

      <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{doc.title}</h1>
          <p className="mt-2 font-mono text-xs text-ink-3">
            /{collection.slug}/{doc.slug}
            {doc.published ? "" : " · draft"}
          </p>
        </div>

        {doc.published ? (
          <Link
            href={`/${collection.slug}/${doc.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-ink-3 transition-colors hover:text-accent"
          >
            <Icon name="ExternalLink" className="size-4" />
            View
          </Link>
        ) : null}
      </header>

      <section className="mt-9 rounded-2xl border border-line bg-surface/50 p-6">
        <DocForm doc={doc} />
      </section>

      <form action={deleteDoc} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="id" value={doc.id} />
        <button
          type="submit"
          data-tone="ember"
          className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--tone)_35%,transparent)] px-4 py-2 text-xs text-[var(--tone)] transition-colors hover:bg-[color-mix(in_oklab,var(--tone)_12%,transparent)]"
        >
          <Icon name="Trash" className="size-3.5" />
          Delete document
        </button>
      </form>
    </>
  );
}
