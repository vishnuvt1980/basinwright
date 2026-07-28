import Link from "next/link";
import type { Doc } from "@prisma/client";

import { Icon } from "@/components/icon";
import { CollectionNotice } from "@/components/library/collection-notice";
import { DocGrid, DocRows } from "@/components/library/doc-card";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink, cn } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { Markdown, outline } from "@/lib/markdown";
import {
  formatDate,
  readMetrics,
  type Collection,
  type DocCard,
} from "@/lib/library";

/* ---------------------------------------------------------------------------
   A library document.

   Layout is a two-column measure: the body at reading width, and a sticky rail
   carrying the outline and the byline. The rail collapses on narrow screens
   rather than being duplicated.
--------------------------------------------------------------------------- */

function MetricsBand({ doc }: { doc: Doc }) {
  const metrics = readMetrics(doc.metrics);
  if (!metrics.length) return null;

  return (
    <div className="border-b border-line py-10">
      <div className="container-bw">
        <dl className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col bg-surface p-6">
              <dd className="font-display text-3xl text-ink">{metric.value}</dd>
              <dt className="mt-2 text-sm font-medium text-ink">{metric.label}</dt>
              {metric.caption ? (
                <span className="mt-1 text-xs leading-relaxed text-ink-3">
                  {metric.caption}
                </span>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/// Whitepapers whose reference implementation lives behind the subscription.
/// The argument is public; the appendices are in the portal.
function PortalCta({ appUrl }: { appUrl: string }) {
  return (
    <aside className="panel mt-14 bg-raised p-7">
      <div className="flex items-start gap-4">
        <Icon name="Lock" className="mt-1 size-5 shrink-0 text-accent" />
        <div>
          <h2 className="text-base text-ink">
            The reference implementation is in the developer portal
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Templates, schemas, worked examples and the integration code that goes with
            this paper are versioned against your platform release. Access is included
            with every paid subscription.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`${appUrl}/docs`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[0.9375rem] font-semibold text-on-accent transition-colors hover:bg-accent-strong"
            >
              Open the developer portal
              <Icon name="ExternalLink" className="size-4" />
            </a>
            <ButtonLink href="/#pricing" variant="secondary">
              See pricing
            </ButtonLink>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function DocArticle({
  doc,
  collection,
  related,
  appUrl,
}: {
  doc: Doc;
  collection: Collection;
  related: DocCard[];
  appUrl: string;
}) {
  const headings = outline(doc.body);

  return (
    <article>
      <PageHero
        title={doc.title}
        subtitle={doc.subtitle}
        crumb={{ label: collection.label, href: `/${collection.slug}` }}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-3">
          {doc.version ? (
            <span className="font-mono text-accent">{doc.version}</span>
          ) : null}
          <time dateTime={doc.publishedAt.toISOString()}>
            {formatDate(doc.publishedAt)}
          </time>
          <span aria-hidden>·</span>
          <span>{doc.readMinutes} min read</span>
          {doc.category ? (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/${collection.slug}?category=${encodeURIComponent(doc.category)}`}
                className="transition-colors hover:text-accent"
              >
                {doc.category}
              </Link>
            </>
          ) : null}
          {doc.industry ? (
            <>
              <span aria-hidden>·</span>
              <span>{doc.industry}</span>
            </>
          ) : null}
        </div>
      </PageHero>

      <MetricsBand doc={doc} />

      <div className="container-bw py-14 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,44rem)_1fr] lg:gap-20">
          <div className="min-w-0">
            {/* Above the body, not below it — a disclosure a reader meets after
                the argument has already landed is not a disclosure. */}
            <CollectionNotice notice={collection.notice} className="mb-10" />

            <Markdown content={doc.body} />

            {doc.gated ? <PortalCta appUrl={appUrl} /> : null}

            {doc.tags.length ? (
              <ul className="mt-14 flex flex-wrap gap-2 border-t border-line pt-8">
                {doc.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md border border-line bg-raised px-2.5 py-1 text-xs text-ink-3"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* The rail. `lg:block` rather than a duplicate mobile copy — an
              outline is not worth a second render on a phone. */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-8">
              {doc.author ? (
                <div className="border-l border-line pl-5">
                  <p className="text-[0.7rem] tracking-[0.14em] text-ink-3 uppercase">
                    Written by
                  </p>
                  <p className="mt-2 text-sm text-ink">{doc.author}</p>
                  {doc.authorRole ? (
                    <p className="mt-0.5 text-sm text-ink-3">{doc.authorRole}</p>
                  ) : null}
                </div>
              ) : null}

              {headings.length > 2 ? (
                <nav className="border-l border-line pl-5" aria-label="On this page">
                  <p className="text-[0.7rem] tracking-[0.14em] text-ink-3 uppercase">
                    On this page
                  </p>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className="text-sm leading-snug text-ink-2 transition-colors hover:text-accent"
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {related.length ? (
        <section className={cn("border-t border-line py-16 sm:py-20")}>
          <div className="container-bw">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-2xl text-ink">Read next</h2>
                <Link
                  href={`/${collection.slug}`}
                  className="text-[0.9375rem] font-semibold text-accent hover:underline"
                >
                  All {collection.label.toLowerCase()}
                </Link>
              </div>
            </Reveal>

            {collection.layout === "list" ? (
              <DocRows docs={related} className="mt-8" />
            ) : (
              <DocGrid docs={related} className="mt-10" />
            )}
          </div>
        </section>
      ) : null}
    </article>
  );
}
