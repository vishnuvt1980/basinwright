/* ---------------------------------------------------------------------------
   Seed content types.

   The modules in this directory are the *initial* state of the CMS, not the
   site's content source. Everything they write is editable at /admin
   afterwards, and re-running the seed replaces it wholesale — see the note on
   the `seed` service in docker-compose.yml.
--------------------------------------------------------------------------- */

import type { DocKind, SectionKind } from "@prisma/client";

/// One card, tier, bullet-list item or FAQ pair inside a section.
export type EntrySeed = {
  title: string;
  subtitle?: string;
  body?: string;
  icon?: string;
  href?: string;
  badge?: string;
  accent?: string;
  bullets?: string[];
};

export type SectionSeed = {
  key: string;
  kind: SectionKind;
  order: number;
  eyebrow?: string;
  title?: string;
  headlineLines?: string[];
  subtitle?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaLabel2?: string;
  ctaHref2?: string;
  meta?: Record<string, unknown>;
  entries?: EntrySeed[];
};

/// An editorial page: a shell plus the section blocks that make up its body.
export type PageSeed = {
  slug: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  seoTitle?: string;
  seoDescription?: string;
  order: number;
  published?: boolean;
  sections: SectionSeed[];
};

/// A library item. `body` is markdown — the subset in src/lib/markdown.tsx.
export type DocSeed = {
  kind: DocKind;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  body: string;
  category?: string;
  industry?: string;
  author?: string;
  authorRole?: string;
  readMinutes?: number;
  featured?: boolean;
  /// ISO date. Ordering on every index is newest first.
  publishedAt: string;
  version?: string;
  tags?: string[];
  metrics?: { label: string; value: string; caption?: string }[];
  accent?: string;
  icon?: string;
  gated?: boolean;
  seoDescription?: string;
};
