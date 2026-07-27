import Link from "next/link";

import { Icon, IconTile, toneForAccent } from "@/components/icon";
import { cn } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import {
  collectionForKind,
  docHref,
  formatDate,
  readMetrics,
  type DocCard as Doc,
} from "@/lib/library";

/* ---------------------------------------------------------------------------
   Cards for the library.

   Two shapes. `DocGrid` is the default — a card per document, with the case
   study proof band when there is one. `DocRows` is the stacked variant used by
   release notes, where a version and a date carry more than a card would.
--------------------------------------------------------------------------- */

function Meta({ doc }: { doc: Doc }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
      <time dateTime={doc.publishedAt.toISOString()}>{formatDate(doc.publishedAt)}</time>
      <span aria-hidden>·</span>
      <span>{doc.readMinutes} min read</span>
      {doc.author ? (
        <>
          <span aria-hidden>·</span>
          <span>{doc.author}</span>
        </>
      ) : null}
    </div>
  );
}

export function DocCard({
  doc,
  showCollection = false,
}: {
  doc: Doc;
  /// Set on mixed lists (search, "read next" across collections).
  showCollection?: boolean;
}) {
  const tone = toneForAccent(doc.accent, doc.title);
  const metrics = readMetrics(doc.metrics).slice(0, 2);
  const collection = collectionForKind(doc.kind);

  return (
    <Link
      href={docHref(doc)}
      data-tone={tone}
      className="panel group flex h-full flex-col p-7 transition-shadow duration-500 hover:shadow-[var(--bw-shadow-panel)]"
    >
      <div className="flex items-start justify-between gap-4">
        {doc.icon ? <IconTile name={doc.icon} tone={tone} size="sm" /> : <span />}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {doc.gated ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-line bg-raised px-2 py-0.5 text-[0.7rem] text-ink-3">
              <Icon name="Lock" className="size-3" />
              Portal
            </span>
          ) : null}
          {showCollection ? (
            <span className="rounded-md border border-line bg-raised px-2 py-0.5 text-[0.7rem] text-ink-3">
              {collection.singular}
            </span>
          ) : null}
          {doc.category ? (
            <span className="text-[0.7rem] tracking-wide text-[var(--tone)] uppercase">
              {doc.category}
            </span>
          ) : null}
        </div>
      </div>

      <h3 className="mt-5 text-lg leading-snug text-balance text-ink transition-colors group-hover:text-accent">
        {doc.title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-pretty text-ink-2">
        {doc.excerpt}
      </p>

      {metrics.length ? (
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dd className="font-display text-xl text-[var(--tone)]">{metric.value}</dd>
              <dt className="mt-0.5 text-xs text-ink-3">{metric.label}</dt>
            </div>
          ))}
        </dl>
      ) : null}

      <Meta doc={doc} />
    </Link>
  );
}

/// The lead slot on an unfiltered index: the same card, laid out wide, with
/// the full metrics band rather than the first two.
export function DocFeature({ doc }: { doc: Doc }) {
  const tone = toneForAccent(doc.accent, doc.title);
  const metrics = readMetrics(doc.metrics);

  return (
    <Link
      href={docHref(doc)}
      data-tone={tone}
      className="panel group grid gap-8 p-8 transition-shadow duration-500 hover:shadow-[var(--bw-shadow-panel)] sm:p-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          {doc.icon ? <IconTile name={doc.icon} tone={tone} size="sm" /> : null}
          <span className="text-[0.7rem] tracking-wide text-[var(--tone)] uppercase">
            {doc.category ?? collectionForKind(doc.kind).singular}
          </span>
        </div>

        <h2 className="mt-5 font-display text-2xl leading-snug text-balance text-ink transition-colors group-hover:text-accent sm:text-[1.75rem]">
          {doc.title}
        </h2>

        <p className="mt-4 max-w-2xl leading-relaxed text-pretty text-ink-2">
          {doc.excerpt}
        </p>

        <Meta doc={doc} />
      </div>

      {metrics.length ? (
        <dl className="grid grid-cols-2 content-start gap-6 border-line lg:border-l lg:pl-14">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dd className="font-display text-2xl text-[var(--tone)]">{metric.value}</dd>
              <dt className="mt-1 text-sm text-ink">{metric.label}</dt>
              {metric.caption ? (
                <p className="mt-0.5 text-xs text-ink-3">{metric.caption}</p>
              ) : null}
            </div>
          ))}
        </dl>
      ) : null}
    </Link>
  );
}

export function DocGrid({
  docs,
  showCollection = false,
  className,
}: {
  docs: Doc[];
  showCollection?: boolean;
  className?: string;
}) {
  return (
    <Stagger className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {docs.map((doc) => (
        <StaggerItem key={doc.id} className="h-full">
          <DocCard doc={doc} showCollection={showCollection} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/// The stacked variant: version, title, excerpt and date on one row.
export function DocRows({ docs, className }: { docs: Doc[]; className?: string }) {
  return (
    <Stagger className={cn("border-t border-line", className)}>
      {docs.map((doc) => (
        <StaggerItem key={doc.id}>
          <Link
            href={docHref(doc)}
            className="group grid gap-3 border-b border-line py-7 transition-colors duration-500 hover:border-accent/60 sm:grid-cols-[9rem_1fr] sm:gap-8"
          >
            <div className="flex flex-col gap-1">
              {doc.version ? (
                <span className="font-mono text-sm text-accent">{doc.version}</span>
              ) : null}
              <time
                dateTime={doc.publishedAt.toISOString()}
                className="text-xs text-ink-3"
              >
                {formatDate(doc.publishedAt)}
              </time>
            </div>

            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 text-base text-ink transition-colors group-hover:text-accent">
                {doc.title}
                <Icon
                  name="ArrowRight"
                  className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-pretty text-ink-2">
                {doc.excerpt}
              </p>
            </div>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
