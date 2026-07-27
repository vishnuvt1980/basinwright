import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { COLLECTIONS, collectionForKind } from "@/lib/library";
import { absoluteUrl } from "@/lib/seo";

// The sitemap reads the CMS, and the Docker image is built without a database.
// Left cacheable, Next would try to render it during `next build` and fail the
// whole build — so it is rendered per request instead.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, docs] = await Promise.all([
    db.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { order: "asc" },
    }),
    db.doc.findMany({
      where: { published: true },
      select: { kind: true, slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  // Newest publication in a collection is the collection index's own freshness.
  const newestIn = new Map<string, Date>();
  for (const doc of docs) {
    const slug = collectionForKind(doc.kind).slug;
    const current = newestIn.get(slug);
    if (!current || doc.publishedAt > current) newestIn.set(slug, doc.publishedAt);
  }

  const home: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const collectionIndexes: MetadataRoute.Sitemap = COLLECTIONS.map((collection) => ({
    url: absoluteUrl(`/${collection.slug}`),
    lastModified: newestIn.get(collection.slug) ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cmsPages: MetadataRoute.Sitemap = pages.map((page) => ({
    url: absoluteUrl(`/${page.slug}`),
    lastModified: page.updatedAt,
    changeFrequency: "monthly",
    priority: page.slug === "resources" ? 0.8 : 0.7,
  }));

  const library: MetadataRoute.Sitemap = docs.map((doc) => ({
    url: absoluteUrl(`/${collectionForKind(doc.kind).slug}/${doc.slug}`),
    lastModified: doc.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...home, ...collectionIndexes, ...cmsPages, ...library];
}
