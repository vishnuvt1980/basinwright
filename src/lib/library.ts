import "server-only";

import { cache } from "react";
import { DocKind, type Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/* ---------------------------------------------------------------------------
   The content library.

   One `Doc` model backs seven collections. This module owns the mapping from
   URL slug to `DocKind` and the copy that surrounds each index, so adding a
   collection is a row here plus an enum value — no new route files.

   Collection slugs are reserved: a CMS `Page` may not claim one, because the
   route resolves collections first. `isReservedSlug` is the check, and the
   admin action enforces it.
--------------------------------------------------------------------------- */

export type Collection = {
  /// URL segment: /case-studies, /blog, …
  slug: string;
  kind: DocKind;
  /// Plural, for the index heading and breadcrumbs.
  label: string;
  /// Singular, for the eyebrow on a detail page.
  singular: string;
  title: string;
  blurb: string;
  icon: string;
  accent: string;
  /// Release notes read better as a stacked list than as a card grid.
  layout: "cards" | "list";
  /// A standing disclosure, rendered above the index and above every document
  /// in the collection. It lives here rather than in each document's body so
  /// it cannot be edited away one piece at a time — which is the only way a
  /// disclosure of this kind stays true.
  notice?: string;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "reference-deployments",
    kind: DocKind.REFERENCE,
    label: "Reference deployments",
    singular: "Reference deployment",
    title: "How we would build it, and why",
    blurb:
      "A problem shape, the design we would propose for it, and what we would expect to be measured afterwards.",
    icon: "Building2",
    accent: "brass",
    layout: "cards",
    notice:
      "These are worked designs, not customer stories. BasinWright is early and has no case studies to publish — so there are no outcome figures here, because an outcome figure with no customer behind it is exactly the claim we are avoiding.",
  },
  {
    slug: "whitepapers",
    kind: DocKind.WHITEPAPER,
    label: "Whitepapers",
    singular: "Whitepaper",
    title: "The long-form arguments behind the platform",
    blurb:
      "Architecture, governance and economics, written for the people who will have to defend the decision internally.",
    icon: "FileText",
    accent: "verdigris",
    layout: "cards",
  },
  {
    slug: "blog",
    kind: DocKind.BLOG,
    label: "Blog",
    singular: "Post",
    title: "From the agents doing the work",
    blurb:
      "Shorter and more opinionated. What we are building, what we have changed our minds about, and the reasoning behind both — written by the agents that live inside the platform.",
    icon: "MessageSquare",
    accent: "slate",
    layout: "cards",
  },
  {
    slug: "learn",
    kind: DocKind.ARTICLE,
    label: "Learning Centre",
    singular: "Article",
    title: "Explainers for people who have to decide something",
    blurb:
      "Vendor-neutral where they can be. Written for someone weighing an option, not revising for an exam.",
    icon: "GraduationCap",
    accent: "azure",
    layout: "cards",
  },
  {
    slug: "research",
    kind: DocKind.RESEARCH,
    label: "Engineering notes",
    singular: "Engineering note",
    title: "Why the platform works the way it does",
    blurb:
      "The mechanisms behind the design decisions, and what we would have to measure to know whether each one holds.",
    icon: "Microscope",
    accent: "purple",
    layout: "cards",
    notice:
      "These explain mechanisms and set out what we would measure — they are not published results. Where a number appears it is either from public literature and cited, or an explicitly stated assumption.",
  },
  {
    slug: "news",
    kind: DocKind.NEWS,
    label: "Newsroom",
    singular: "News",
    title: "What we have shipped",
    blurb: "Short, factual and dated. Empty stretches are honest ones.",
    icon: "Newspaper",
    accent: "amber",
    layout: "cards",
  },
  {
    slug: "release-notes",
    kind: DocKind.RELEASE_NOTE,
    label: "Release notes",
    singular: "Release",
    title: "What changed on the platform",
    blurb:
      "Monthly, newest first. Deprecations are listed with their removal date on the release that announces them.",
    icon: "Rocket",
    accent: "ember",
    layout: "list",
  },
];

const BY_SLUG = new Map(COLLECTIONS.map((c) => [c.slug, c]));
const BY_KIND = new Map(COLLECTIONS.map((c) => [c.kind, c]));

export const findCollection = (slug: string | undefined) =>
  slug ? (BY_SLUG.get(slug) ?? null) : null;

export const collectionForKind = (kind: DocKind) => BY_KIND.get(kind)!;

/// Slugs a CMS page may not use, because the route resolves them first.
export const isReservedSlug = (slug: string) => BY_SLUG.has(slug);

/// The canonical path for a doc: /{collection}/{slug}.
export const docHref = (doc: { kind: DocKind; slug: string }) =>
  `/${collectionForKind(doc.kind).slug}/${doc.slug}`;

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

/// Everything a card needs, and nothing more — index pages never load bodies.
const CARD_FIELDS = {
  id: true,
  kind: true,
  slug: true,
  title: true,
  subtitle: true,
  excerpt: true,
  category: true,
  industry: true,
  author: true,
  authorRole: true,
  readMinutes: true,
  featured: true,
  publishedAt: true,
  version: true,
  tags: true,
  metrics: true,
  accent: true,
  icon: true,
  gated: true,
} satisfies Prisma.DocSelect;

export type DocCard = Prisma.DocGetPayload<{ select: typeof CARD_FIELDS }>;

export const getCollectionDocs = cache(
  async (kind: DocKind, category?: string): Promise<DocCard[]> => {
    return db.doc.findMany({
      where: {
        kind,
        published: true,
        ...(category ? { category } : {}),
      },
      orderBy: { publishedAt: "desc" },
      select: CARD_FIELDS,
    });
  },
);

/// Distinct categories within a collection, for the filter row. Counted so the
/// row can be hidden when there is only one bucket.
export const getCategories = cache(async (kind: DocKind) => {
  const rows = await db.doc.groupBy({
    by: ["category"],
    where: { kind, published: true, category: { not: null } },
    _count: { _all: true },
    orderBy: { category: "asc" },
  });

  return rows
    .filter((r): r is typeof r & { category: string } => r.category !== null)
    .map((r) => ({ label: r.category, count: r._count._all }));
});

export const getDoc = cache(async (kind: DocKind, slug: string) => {
  const doc = await db.doc.findUnique({ where: { slug } });
  // The slug is unique across the whole library, so a doc found under the
  // wrong collection is a wrong URL rather than a redirect target.
  return doc && doc.published && doc.kind === kind ? doc : null;
});

/// Newest first, for the DOC_LIST block and the "read next" rails.
export const getRecentDocs = cache(
  async (kind: DocKind, limit: number): Promise<DocCard[]> => {
    return db.doc.findMany({
      where: { kind, published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: limit,
      select: CARD_FIELDS,
    });
  },
);

/// Same collection, preferring the same category, excluding the doc itself.
export const getRelatedDocs = cache(
  async (
    doc: { id: string; kind: DocKind; category: string | null },
    limit = 3,
  ): Promise<DocCard[]> => {
    const sameCategory = doc.category
      ? await db.doc.findMany({
          where: {
            kind: doc.kind,
            published: true,
            category: doc.category,
            id: { not: doc.id },
          },
          orderBy: { publishedAt: "desc" },
          take: limit,
          select: CARD_FIELDS,
        })
      : [];

    if (sameCategory.length >= limit) return sameCategory;

    const filler = await db.doc.findMany({
      where: {
        kind: doc.kind,
        published: true,
        id: { notIn: [doc.id, ...sameCategory.map((d) => d.id)] },
      },
      orderBy: { publishedAt: "desc" },
      take: limit - sameCategory.length,
      select: CARD_FIELDS,
    });

    return [...sameCategory, ...filler];
  },
);

/* -------------------------------------------------------------------------- */
/* Shaping                                                                    */
/* -------------------------------------------------------------------------- */

/// The proof band on a case study card. Stored as JSON, so it is validated
/// rather than trusted.
export type Metric = { label: string; value: string; caption?: string };

export function readMetrics(value: Prisma.JsonValue | null): Metric[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    if (typeof row.label !== "string" || typeof row.value !== "string") return [];
    return [
      {
        label: row.label,
        value: row.value,
        caption: typeof row.caption === "string" ? row.caption : undefined,
      },
    ];
  });
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatDate = (date: Date) => DATE_FORMAT.format(date);
