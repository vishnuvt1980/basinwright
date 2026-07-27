"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SectionKind } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

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

  try {
    await db.section.update({ where: { id }, data: parsed.data });
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
}

export async function moveSection(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const sections = await db.section.findMany({ orderBy: { order: "asc" } });
  const index = sections.findIndex((s) => s.id === id);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= sections.length) return;

  // Rewrite the whole ordering so gaps and duplicate `order` values self-heal.
  const reordered = [...sections];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];

  await db.$transaction(
    reordered.map((section, i) =>
      db.section.update({ where: { id: section.id }, data: { order: i } }),
    ),
  );

  refreshSite();
  revalidatePath("/admin");
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
    : SectionKind.RICH_TEXT;

  const last = await db.section.findFirst({ orderBy: { order: "desc" } });

  const section = await db.section.create({
    data: {
      key: `section-${Date.now()}`,
      kind,
      order: (last?.order ?? -1) + 1,
      title: "New section",
      visible: false,
    },
  });

  refreshSite();
  redirect(`/admin/sections/${section.id}`);
}
