import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createEntry } from "@/app/admin/actions";
import { EntryForm } from "@/components/admin/entry-form";
import { SectionForm } from "@/components/admin/section-form";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const section = await db.section.findUnique({ where: { id } });
  return { title: section?.title ?? "Section" };
}

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const section = await db.section.findUnique({
    where: { id },
    include: { entries: { orderBy: { order: "asc" } } },
  });

  if (!section) notFound();

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-ink-3 transition-colors hover:text-accent"
      >
        <Icon name="ArrowLeft" className="size-4" />
        All sections
      </Link>

      <header className="mt-5">
        <h1 className="font-display text-3xl text-ink">
          {section.title || section.key}
        </h1>
        <p className="mt-2 font-mono text-xs text-ink-3">
          {section.kind} · key: {section.key}
        </p>
      </header>

      <section className="mt-9 rounded-2xl border border-line bg-surface/50 p-6">
        <h2 className="mb-6 text-sm font-medium tracking-wide text-ink-2 uppercase">
          Section content
        </h2>
        <SectionForm section={section} />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium tracking-wide text-ink-2 uppercase">
            Items ({section.entries.length})
          </h2>
          <form action={createEntry}>
            <input type="hidden" name="sectionId" value={section.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink-2 transition-colors hover:border-accent/60 hover:text-accent"
            >
              <Icon name="Plus" className="size-4" />
              Add item
            </button>
          </form>
        </div>

        {section.entries.length ? (
          <ul className="flex flex-col gap-2">
            {section.entries.map((entry, i) => (
              <EntryForm
                key={entry.id}
                entry={entry}
                index={i}
                total={section.entries.length}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-5 py-10 text-center text-sm text-ink-3">
            No items yet. This section type may not need any.
          </p>
        )}
      </section>
    </>
  );
}
