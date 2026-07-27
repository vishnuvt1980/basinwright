import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { deletePage } from "@/app/admin/actions";
import { PageForm } from "@/components/admin/page-form";
import { SectionList } from "@/components/admin/section-list";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const page = await db.page.findUnique({ where: { id } });
  return { title: page?.title ?? "Page" };
}

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await db.page.findUnique({ where: { id } });
  if (!page) notFound();

  const sections = await db.section.findMany({
    where: { page: page.slug },
    orderBy: { order: "asc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <>
      <Link
        href="/admin/pages"
        className="inline-flex items-center gap-2 text-sm text-ink-3 transition-colors hover:text-accent"
      >
        <Icon name="ArrowLeft" className="size-4" />
        All pages
      </Link>

      <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{page.title}</h1>
          <p className="mt-2 font-mono text-xs text-ink-3">/{page.slug}</p>
        </div>

        {page.published ? (
          <Link
            href={`/${page.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-ink-3 transition-colors hover:text-accent"
          >
            <Icon name="ExternalLink" className="size-4" />
            View page
          </Link>
        ) : null}
      </header>

      <section className="mt-9 rounded-2xl border border-line bg-surface/50 p-6">
        <h2 className="mb-6 text-sm font-medium tracking-wide text-ink-2 uppercase">
          Page heading
        </h2>
        <PageForm page={page} />
      </section>

      <section className="mt-8">
        <SectionList sections={sections} page={page.slug} />
      </section>

      <form action={deletePage} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="id" value={page.id} />
        <button
          type="submit"
          data-tone="ember"
          className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--tone)_35%,transparent)] px-4 py-2 text-xs text-[var(--tone)] transition-colors hover:bg-[color-mix(in_oklab,var(--tone)_12%,transparent)]"
        >
          <Icon name="Trash" className="size-3.5" />
          Delete page and its {sections.length} block
          {sections.length === 1 ? "" : "s"}
        </button>
      </form>
    </>
  );
}
