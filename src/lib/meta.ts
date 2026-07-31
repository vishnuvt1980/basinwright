import type { Prisma } from "@prisma/client";

/* ---------------------------------------------------------------------------
   Readers for a block's `meta` JSON.

   These live here rather than in `content.ts` because that module is
   `server-only`, and two of the blocks that need to read `meta` — the
   scrollytelling pillars and the hero — are client components. The functions
   are pure and touch neither the database nor the request, so there is nothing
   server-shaped about them; only their old address was. `content.ts` re-exports
   them, so every existing import still resolves.

   Everything here treats a malformed `meta` as an absent one. It is operator-
   authored JSON edited in /admin, so the failure mode has to be a block that
   renders without the extra rather than a page that 500s.
--------------------------------------------------------------------------- */

function metaObject(meta: Prisma.JsonValue | null): Record<string, unknown> | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  return meta as Record<string, unknown>;
}

/// Reads a `meta` JSON field as a string array. Returns [] when absent or malformed.
export function metaList(meta: Prisma.JsonValue | null, key: string): string[] {
  const value = metaObject(meta)?.[key];
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function metaString(meta: Prisma.JsonValue | null, key: string): string | null {
  const value = metaObject(meta)?.[key];
  return typeof value === "string" ? value : null;
}

export function metaNumber(meta: Prisma.JsonValue | null, key: string): number | null {
  const value = metaObject(meta)?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * The DOM id a block anchors at.
 *
 * Every block ships with the id it has always had — `#products`, `#contact`,
 * `#industries` — passed here as `fallback`, so nothing that already links into
 * the homepage changes. `meta.anchor` overrides it.
 *
 * The override is what lets one block type appear twice on a page under two
 * different anchors, which is the whole reason it exists: the same feature grid
 * is the industry problem cards near the top and the reasons-to-choose band
 * further down, and the nav has to be able to point at each of them separately.
 */
export function sectionAnchor(
  meta: Prisma.JsonValue | null,
  fallback?: string,
): string | undefined {
  const anchor = metaString(meta, "anchor")?.trim();
  return anchor || fallback;
}
