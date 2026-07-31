import "server-only";

import { cache } from "react";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export type SectionWithEntries = Prisma.SectionGetPayload<{
  include: { entries: true };
}>;

/// React `cache` dedupes these within a single render pass; Prisma queries are
/// not memoised the way `fetch` is.
///
/// `page` is the slug the blocks belong to. The homepage is "home" and is the
/// one page whose shell lives in code rather than in a `Page` row.
export const getSections = cache(
  async (page = "home"): Promise<SectionWithEntries[]> => {
    return db.section.findMany({
      where: { visible: true, page },
      orderBy: { order: "asc" },
      include: {
        entries: {
          where: { visible: true },
          orderBy: { order: "asc" },
        },
      },
    });
  },
);

export const getPage = cache(async (slug: string) => {
  const page = await db.page.findUnique({ where: { slug } });
  return page?.published ? page : null;
});

/// Every published page, for the admin list and for sitemap-style listings.
export const getPages = cache(async () => {
  return db.page.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
});

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await db.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

/// Settings for `generateMetadata` only, where a failed lookup must not be
/// fatal. `/_not-found` is statically prerendered, so the root layout's
/// metadata runs inside `next build` — in the Docker image build there is no
/// database and not even a `DATABASE_URL`, and a strict read fails the build.
/// Returning an empty map lets the caller's own `??` defaults stand, and at
/// runtime turns a database blip into a default `<title>` rather than a 500 on
/// every page. Everything that renders actual content keeps using
/// `getSettings` and is still expected to fail loudly.
export const getSettingsForMetadata = cache(async (): Promise<Record<string, string>> => {
  try {
    return await getSettings();
  } catch (error) {
    console.error("[content] settings unavailable for metadata, using defaults:", error);
    return {};
  }
});

/// "legal" is the thin row beneath the footer columns.
export const getNav = cache(async (location: "header" | "footer" | "legal") => {
  return db.navItem.findMany({
    where: { location, visible: true },
    orderBy: { order: "asc" },
  });
});

/// Groups footer links by their column heading, preserving insertion order.
export function groupFooterNav<T extends { group: string | null }>(items: T[]) {
  const columns = new Map<string, T[]>();
  for (const item of items) {
    const key = item.group ?? "More";
    if (!columns.has(key)) columns.set(key, []);
    columns.get(key)!.push(item);
  }
  return [...columns.entries()].map(([heading, links]) => ({ heading, links }));
}

/// The `meta` readers moved to `lib/meta.ts` so the client blocks can use them
/// too — this module is `server-only` and importing it from one is fatal. They
/// are re-exported here because every server-side caller already knows this
/// address, and there is nothing to be gained by making them all move.
export { metaList, metaNumber, metaString, sectionAnchor } from "@/lib/meta";

/// A link that leaves the site — an absolute URL or a mail/tel scheme. Used by
/// the footer and the link-list block to decide between `next/link` and a
/// plain anchor with the usual `target`/`rel` treatment.
export function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href);
}
