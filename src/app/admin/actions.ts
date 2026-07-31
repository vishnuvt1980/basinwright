"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DocKind, SectionKind } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isReservedSlug } from "@/lib/library";

/// Every action re-checks the session. Server Functions POST to the page route
/// and are reachable directly, so proxy matching alone is not authorization.
async function guard() {
  return requireUser();
}

/// Content is server-rendered per request, but Next still caches the client
/// router entry — bust it so edits appear immediately.
function refreshSite() {
  revalidatePath("/", "layout");
}

export type ActionState = { status: "idle" | "success" | "error"; message?: string };

const ok = (message: string): ActionState => ({ status: "success", message });
const fail = (message: string): ActionState => ({ status: "error", message });

/* -------------------------------------------------------------------------- */
/* Sections                                                                   */
/* -------------------------------------------------------------------------- */

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const optional = (value: FormDataEntryValue | null) => {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
};

const sectionSchema = z.object({
  eyebrow: z.string().nullable(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  body: z.string().nullable(),
  ctaLabel: z.string().nullable(),
  ctaHref: z.string().nullable(),
  ctaLabel2: z.string().nullable(),
  ctaHref2: z.string().nullable(),
  headlineLines: z.array(z.string()),
  visible: z.boolean(),
});

export async function updateSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing section id.");

  const parsed = sectionSchema.safeParse({
    eyebrow: optional(formData.get("eyebrow")),
    title: optional(formData.get("title")),
    subtitle: optional(formData.get("subtitle")),
    body: optional(formData.get("body")),
    ctaLabel: optional(formData.get("ctaLabel")),
    ctaHref: optional(formData.get("ctaHref")),
    ctaLabel2: optional(formData.get("ctaLabel2")),
    ctaHref2: optional(formData.get("ctaHref2")),
    headlineLines: lines(formData.get("headlineLines")),
    visible: formData.get("visible") === "on",
  });

  if (!parsed.success) return fail("Some fields are invalid.");

  // DOC_LIST blocks are configured through two extra fields rather than a raw
  // JSON textarea. Absent fields leave `meta` alone, so every other kind — and
  // anything hand-edited in the database — is untouched by a save.
  const collection = optional(formData.get("metaCollection"));
  const meta = formData.has("metaCollection")
    ? {
        collection,
        limit: Number(formData.get("metaLimit")) || 3,
      }
    : undefined;

  try {
    await db.section.update({
      where: { id },
      data: { ...parsed.data, ...(meta ? { meta } : {}) },
    });
  } catch {
    return fail("Could not save the section.");
  }

  refreshSite();
  revalidatePath(`/admin/sections/${id}`);
  return ok("Section saved.");
}

export async function toggleSectionVisibility(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const section = await db.section.findUnique({ where: { id } });
  if (!section) return;

  await db.section.update({
    where: { id },
    data: { visible: !section.visible },
  });

  refreshSite();
  revalidatePath("/admin");
  revalidatePath("/admin/pages", "layout");
}

export async function moveSection(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const section = await db.section.findUnique({ where: { id } });
  if (!section) return;

  // Ordering is per page. Reordering across the whole table would interleave
  // the homepage with /about the moment either grew a block.
  const siblings = await db.section.findMany({
    where: { page: section.page },
    orderBy: { order: "asc" },
  });

  const index = siblings.findIndex((s) => s.id === id);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  // Rewrite the whole ordering so gaps and duplicate `order` values self-heal.
  const reordered = [...siblings];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];

  await db.$transaction(
    reordered.map((item, i) =>
      db.section.update({ where: { id: item.id }, data: { order: i } }),
    ),
  );

  refreshSite();
  revalidatePath("/admin");
  revalidatePath("/admin/pages", "layout");
}

/* -------------------------------------------------------------------------- */
/* Entries                                                                    */
/* -------------------------------------------------------------------------- */

export async function updateEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id) return fail("Missing entry id.");
  if (!title) return fail("Title is required.");

  try {
    const entry = await db.entry.update({
      where: { id },
      data: {
        title,
        subtitle: optional(formData.get("subtitle")),
        body: optional(formData.get("body")),
        icon: optional(formData.get("icon")),
        href: optional(formData.get("href")),
        badge: optional(formData.get("badge")),
        accent: optional(formData.get("accent")),
        bullets: lines(formData.get("bullets")),
        visible: formData.get("visible") === "on",
      },
    });

    refreshSite();
    revalidatePath(`/admin/sections/${entry.sectionId}`);
  } catch {
    return fail("Could not save the item.");
  }

  return ok("Item saved.");
}

export async function createEntry(formData: FormData) {
  await guard();

  const sectionId = String(formData.get("sectionId") ?? "");
  if (!sectionId) return;

  const last = await db.entry.findFirst({
    where: { sectionId },
    orderBy: { order: "desc" },
  });

  await db.entry.create({
    data: {
      sectionId,
      title: "New item",
      order: (last?.order ?? -1) + 1,
    },
  });

  refreshSite();
  revalidatePath(`/admin/sections/${sectionId}`);
}

export async function deleteEntry(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const entry = await db.entry.findUnique({ where: { id } });
  if (!entry) return;

  await db.entry.delete({ where: { id } });

  refreshSite();
  revalidatePath(`/admin/sections/${entry.sectionId}`);
}

export async function moveEntry(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const entry = await db.entry.findUnique({ where: { id } });
  if (!entry) return;

  const siblings = await db.entry.findMany({
    where: { sectionId: entry.sectionId },
    orderBy: { order: "asc" },
  });

  const index = siblings.findIndex((e) => e.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  const reordered = [...siblings];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];

  await db.$transaction(
    reordered.map((item, i) =>
      db.entry.update({ where: { id: item.id }, data: { order: i } }),
    ),
  );

  refreshSite();
  revalidatePath(`/admin/sections/${entry.sectionId}`);
}

/* -------------------------------------------------------------------------- */
/* Settings & navigation                                                      */
/* -------------------------------------------------------------------------- */

export async function updateSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard();

  const updates: { key: string; value: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("setting:")) continue;
    updates.push({ key: key.slice(8), value: String(value) });
  }

  if (!updates.length) return fail("Nothing to save.");

  try {
    await db.$transaction(
      updates.map((u) =>
        db.siteSetting.update({ where: { key: u.key }, data: { value: u.value } }),
      ),
    );
  } catch {
    return fail("Could not save settings.");
  }

  refreshSite();
  revalidatePath("/admin/settings");
  return ok(`Saved ${updates.length} setting${updates.length === 1 ? "" : "s"}.`);
}

export async function updateNavItem(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();
  if (!id || !label || !href) return;

  await db.navItem.update({ where: { id }, data: { label, href } });

  refreshSite();
  revalidatePath("/admin/navigation");
}

export async function deleteNavItem(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.navItem.delete({ where: { id } });

  refreshSite();
  revalidatePath("/admin/navigation");
}

export async function createNavItem(formData: FormData) {
  await guard();

  const location = String(formData.get("location") ?? "header");
  const group = optional(formData.get("group"));

  const last = await db.navItem.findFirst({
    where: { location },
    orderBy: { order: "desc" },
  });

  await db.navItem.create({
    data: {
      label: "New link",
      href: "#",
      location,
      group,
      order: (last?.order ?? -1) + 1,
    },
  });

  refreshSite();
  revalidatePath("/admin/navigation");
}

/* -------------------------------------------------------------------------- */
/* Leads                                                                      */
/* -------------------------------------------------------------------------- */

export async function toggleLeadHandled(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return;

  await db.lead.update({ where: { id }, data: { handled: !lead.handled } });
  revalidatePath("/admin/leads");
}

/* -------------------------------------------------------------------------- */
/* Sections index helper                                                      */
/* -------------------------------------------------------------------------- */

export async function createSection(formData: FormData) {
  await guard();

  const kindInput = String(formData.get("kind") ?? "");
  const kind = Object.values(SectionKind).includes(kindInput as SectionKind)
    ? (kindInput as SectionKind)
    : SectionKind.PROSE;

  const page = String(formData.get("page") ?? "home") || "home";

  const last = await db.section.findFirst({
    where: { page },
    orderBy: { order: "desc" },
  });

  const section = await db.section.create({
    data: {
      key: `section-${Date.now()}`,
      kind,
      page,
      order: (last?.order ?? -1) + 1,
      title: "New section",
      visible: false,
    },
  });

  refreshSite();
  redirect(`/admin/sections/${section.id}`);
}

export async function deleteSection(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const section = await db.section.findUnique({ where: { id } });
  if (!section) return;

  await db.section.delete({ where: { id } });

  refreshSite();
  revalidatePath("/admin");
  revalidatePath("/admin/pages", "layout");
  redirect(section.page === "home" ? "/admin" : `/admin/pages/${section.page}`);
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

/// Lowercase and hyphenated, with "/" kept as a path separator so a page can
/// nest: "industries/insurance" is the slug that renders at
/// /industries/insurance. A hyphen either side of a slash is collapsed into it,
/// so typing "Industries / Oil & Gas" lands on the slug that was meant, and
/// leading and trailing separators are stripped either way.
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/-*\/+-*/g, "/")
    .replace(/^[-/]+|[-/]+$/g, "");

export async function updatePage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing page id.");

  const existing = await db.page.findUnique({ where: { id } });
  if (!existing) return fail("That page no longer exists.");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return fail("Title is required.");

  const slug = slugify(String(formData.get("slug") ?? existing.slug));
  if (!slug) return fail("Slug is required.");
  // A collection owns its whole subtree — /blog/anything is resolved by the
  // library route — so the check is on the first segment, not the whole slug.
  const [root] = slug.split("/");
  if (isReservedSlug(root)) {
    return fail(`"/${root}" is a library collection and cannot be used as a page.`);
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.page.update({
        where: { id },
        data: {
          slug,
          title,
          eyebrow: optional(formData.get("eyebrow")),
          subtitle: optional(formData.get("subtitle")),
          seoTitle: optional(formData.get("seoTitle")),
          seoDescription: optional(formData.get("seoDescription")),
          published: formData.get("published") === "on",
        },
      });

      // Blocks are joined to their page by slug, so a rename has to carry them.
      if (slug !== existing.slug) {
        await tx.section.updateMany({
          where: { page: existing.slug },
          data: { page: slug },
        });
      }
    });
  } catch {
    return fail("Could not save the page. Is that slug already taken?");
  }

  refreshSite();
  revalidatePath(`/admin/pages/${id}`);
  revalidatePath("/admin/pages");
  return ok("Page saved.");
}

export async function createPage() {
  await guard();

  const last = await db.page.findFirst({ orderBy: { order: "desc" } });
  const slug = `page-${Date.now()}`;

  const page = await db.page.create({
    data: {
      slug,
      title: "New page",
      order: (last?.order ?? -1) + 1,
      published: false,
    },
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}

export async function deletePage(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const page = await db.page.findUnique({ where: { id } });
  if (!page) return;

  // Sections reference the page by slug rather than by relation, so cascade
  // is manual — otherwise the blocks would outlive the page as orphans.
  await db.$transaction([
    db.section.deleteMany({ where: { page: page.slug } }),
    db.page.delete({ where: { id } }),
  ]);

  refreshSite();
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

/* -------------------------------------------------------------------------- */
/* Library                                                                    */
/* -------------------------------------------------------------------------- */

const docSchema = z.object({
  kind: z.enum(DocKind),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
});

export async function updateDoc(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await guard();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing document id.");

  const parsed = docSchema.safeParse({
    kind: String(formData.get("kind") ?? ""),
    slug: slugify(String(formData.get("slug") ?? "")),
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
  });

  if (!parsed.success) {
    return fail("Kind, slug, title, excerpt and body are all required.");
  }

  const publishedAt = new Date(String(formData.get("publishedAt") ?? ""));

  try {
    await db.doc.update({
      where: { id },
      data: {
        ...parsed.data,
        subtitle: optional(formData.get("subtitle")),
        category: optional(formData.get("category")),
        industry: optional(formData.get("industry")),
        author: optional(formData.get("author")),
        authorRole: optional(formData.get("authorRole")),
        version: optional(formData.get("version")),
        icon: optional(formData.get("icon")),
        accent: optional(formData.get("accent")),
        seoTitle: optional(formData.get("seoTitle")),
        seoDescription: optional(formData.get("seoDescription")),
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        readMinutes: Number(formData.get("readMinutes")) || 6,
        featured: formData.get("featured") === "on",
        gated: formData.get("gated") === "on",
        published: formData.get("published") === "on",
        ...(Number.isNaN(publishedAt.valueOf()) ? {} : { publishedAt }),
      },
    });
  } catch {
    return fail("Could not save the document. Is that slug already taken?");
  }

  refreshSite();
  revalidatePath(`/admin/library/${id}`);
  revalidatePath("/admin/library");
  return ok("Document saved.");
}

export async function createDoc(formData: FormData) {
  await guard();

  const kindInput = String(formData.get("kind") ?? "");
  const kind = Object.values(DocKind).includes(kindInput as DocKind)
    ? (kindInput as DocKind)
    : DocKind.BLOG;

  const doc = await db.doc.create({
    data: {
      kind,
      slug: `draft-${Date.now()}`,
      title: "Untitled",
      excerpt: "A one-line summary, used on cards and as the meta description.",
      body: "## Start here\n\nWrite in Markdown. Headings, lists, quotes, tables and links are all supported.",
      published: false,
    },
  });

  revalidatePath("/admin/library");
  redirect(`/admin/library/${doc.id}`);
}

export async function toggleDocPublished(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const doc = await db.doc.findUnique({ where: { id } });
  if (!doc) return;

  await db.doc.update({ where: { id }, data: { published: !doc.published } });

  refreshSite();
  revalidatePath("/admin/library");
}

export async function deleteDoc(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.doc.delete({ where: { id } });

  refreshSite();
  revalidatePath("/admin/library");
  redirect("/admin/library");
}
