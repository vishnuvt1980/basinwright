import Link from "next/link";

import { DocFeature, DocGrid, DocRows } from "@/components/library/doc-card";
import { PageHero } from "@/components/site/page-hero";
import { cn } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { Collection, DocCard as Doc } from "@/lib/library";

/* ---------------------------------------------------------------------------
   A collection index: /blog, /case-studies, /whitepapers and the rest.

   Filtering is a set of links carrying ?category=, not client state. It works
   without JavaScript, it is linkable, and it keeps the whole index a server
   component.
--------------------------------------------------------------------------- */

function CategoryFilter({
  collection,
  categories,
  active,
  total,
}: {
  collection: Collection;
  categories: { label: string; count: number }[];
  active: string | null;
  total: number;
}) {
  const chip =
    "rounded-md border px-3 py-1.5 text-sm transition-colors duration-200";

  return (
    <nav className="mt-10 flex flex-wrap gap-2" aria-label={`${collection.label} categories`}>
      <Link
        href={`/${collection.slug}`}
        aria-current={active ? undefined : "page"}
        className={cn(
          chip,
          active
            ? "border-line bg-transparent text-ink-2 hover:border-line-strong hover:text-ink"
            : "border-accent bg-accent text-on-accent",
        )}
      >
        All
        <span className="ml-1.5 text-xs opacity-70">{total}</span>
      </Link>

      {categories.map((category) => {
        const selected = active === category.label;

        return (
          <Link
            key={category.label}
            href={`/${collection.slug}?category=${encodeURIComponent(category.label)}`}
            aria-current={selected ? "page" : undefined}
            className={cn(
              chip,
              selected
                ? "border-accent bg-accent text-on-accent"
                : "border-line bg-transparent text-ink-2 hover:border-line-strong hover:text-ink",
            )}
          >
            {category.label}
            <span className="ml-1.5 text-xs opacity-70">{category.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function CollectionIndex({
  collection,
  docs,
  categories,
  activeCategory,
  total,
}: {
  collection: Collection;
  docs: Doc[];
  categories: { label: string; count: number }[];
  activeCategory: string | null;
  /// Count across the whole collection, so the "All" chip is honest while a
  /// filter is applied.
  total: number;
}) {
  // A featured piece gets the top slot, but only on the unfiltered index —
  // inside a filter the reader has already told us what they want.
  const lead = !activeCategory && collection.layout === "cards" ? docs.find((d) => d.featured) : undefined;
  const rest = lead ? docs.filter((d) => d.id !== lead.id) : docs;

  return (
    <>
      <PageHero
        eyebrow={collection.label}
        title={collection.title}
        subtitle={collection.blurb}
      >
        {categories.length > 1 ? (
          <CategoryFilter
            collection={collection}
            categories={categories}
            active={activeCategory}
            total={total}
          />
        ) : null}
      </PageHero>

      <section className="py-16 sm:py-20">
        <div className="container-bw">
          {docs.length === 0 ? (
            <Reveal>
              <p className="text-ink-2">
                Nothing published here yet.{" "}
                <Link href={`/${collection.slug}`} className="text-accent hover:underline">
                  Clear the filter
                </Link>{" "}
                to see everything in {collection.label.toLowerCase()}.
              </p>
            </Reveal>
          ) : (
            <>
              {lead ? (
                <Reveal className="mb-6">
                  <DocFeature doc={lead} />
                </Reveal>
              ) : null}

              {collection.layout === "list" ? (
                <DocRows docs={rest} />
              ) : (
                <DocGrid docs={rest} />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
