import "server-only";

import { cache } from "react";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export type SectionWithEntries = Prisma.SectionGetPayload<{
  include: { entries: true };
}>;

/// React `cache` dedupes these within a single render pass; Prisma queries are
/// not memoised the way `fetch` is.
export const getSections = cache(async (): Promise<SectionWithEntries[]> => {
  return db.section.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    include: {
      entries: {
        where: { visible: true },
        orderBy: { order: "asc" },
      },
    },
  });
});

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await db.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export const getNav = cache(async (location: "header" | "footer") => {
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

/// Reads a `meta` JSON field as a string array. Returns [] when absent or malformed.
export function metaList(meta: Prisma.JsonValue | null, key: string): string[] {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return [];
  const value = (meta as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}
