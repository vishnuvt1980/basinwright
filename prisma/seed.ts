import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  allDocs,
  footerNav,
  headerNav,
  homeSections,
  legalNav,
  navSettings,
  pages,
} from "./content";
import type { SectionSeed } from "./content";

const prisma = new PrismaClient();

const settings = [
  { key: "site.name", value: "BasinWright", label: "Site name", group: "brand", order: 0 },
  {
    key: "site.tagline",
    value: "Enterprise Intelligence, built around outcomes",
    label: "Tagline",
    group: "brand",
    order: 1,
  },
  {
    key: "site.description",
    value:
      "BasinWright helps regulated industries deploy secure, explainable AI that delivers measurable business outcomes \u2014 not just AI infrastructure.",
    label: "Meta description",
    group: "brand",
    type: "textarea",
    order: 2,
  },
  {
    key: "footer.tagline",
    value: "Enterprise Intelligence. Built around outcomes.",
    label: "Footer tagline",
    group: "footer",
    order: 0,
  },
  {
    key: "footer.subline",
    value:
      "Purpose-built models, trained on your data, running inside your boundary \u2014 measured against the outcome you bought.",
    label: "Footer subline",
    group: "footer",
    type: "textarea",
    order: 1,
  },
  {
    key: "footer.legal",
    value: "© BasinWright. All rights reserved.",
    label: "Legal line",
    group: "footer",
    order: 2,
  },
  {
    key: "contact.email",
    value: "architects@basinwright.com",
    label: "Contact email",
    group: "contact",
    type: "email",
    order: 0,
  },
  {
    key: "chat.title",
    value: "BasinWright Architect",
    label: "Chat assistant name",
    group: "ai",
    order: 0,
  },
  {
    key: "chat.greeting",
    value:
      "I'm the BasinWright architect assistant. Tell me the business number you want moved \u2014 fraud loss, claims cycle time, procurement leakage \u2014 and I'll tell you what it would take.",
    label: "Chat greeting",
    group: "ai",
    type: "textarea",
    order: 1,
  },
  {
    key: "chat.suggestions",
    value:
      "Which outcomes suit an insurer?|How does sovereign deployment work?|What does an AI assessment cover?|How do you keep our data inside our boundary?",
    label: "Chat suggestions (pipe-separated)",
    group: "ai",
    type: "textarea",
    order: 2,
  },
];

/// Writes one block and its entries. Shared by the homepage and every
/// editorial page — the renderer does not care which page a block sits on.
async function createSection(section: SectionSeed, page: string) {
  const { entries = [], meta, ...rest } = section;

  await prisma.section.create({
    data: {
      ...rest,
      page,
      headlineLines: section.headlineLines ?? [],
      meta: meta as never,
      entries: {
        create: entries.map((entry, i) => ({
          ...entry,
          bullets: entry.bullets ?? [],
          order: i,
        })),
      },
    },
  });
}

async function main() {
  console.log("Seeding BasinWright…");

  // --- Admin user ---------------------------------------------------------
  const email = process.env.ADMIN_EMAIL ?? "admin@basinwright.com";
  const password = process.env.ADMIN_PASSWORD ?? "basinwright";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email,
      name: process.env.ADMIN_NAME ?? "BasinWright Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`  admin user → ${email}`);

  // --- Sections & entries -------------------------------------------------
  // Replace wholesale so re-seeding is idempotent.
  await prisma.entry.deleteMany();
  await prisma.section.deleteMany();

  for (const section of homeSections) await createSection(section, "home");
  console.log(`  ${homeSections.length} homepage sections seeded`);

  // --- Editorial pages ----------------------------------------------------
  await prisma.page.deleteMany();

  let pageBlocks = 0;
  for (const page of pages) {
    const { sections: blocks, ...shell } = page;
    await prisma.page.create({ data: { ...shell, published: page.published ?? true } });
    for (const block of blocks) await createSection(block, page.slug);
    pageBlocks += blocks.length;
  }
  console.log(`  ${pages.length} pages seeded (${pageBlocks} blocks)`);

  // --- Library ------------------------------------------------------------
  await prisma.doc.deleteMany();

  for (const doc of allDocs) {
    const { publishedAt, metrics, tags, ...rest } = doc;
    await prisma.doc.create({
      data: {
        ...rest,
        publishedAt: new Date(publishedAt),
        tags: tags ?? [],
        metrics: metrics as never,
      },
    });
  }
  console.log(`  ${allDocs.length} library documents seeded`);

  // --- Settings -----------------------------------------------------------
  // `value` is deliberately left alone on update: re-seeding should not undo
  // copy edited in /admin, only repair the labels and grouping around it.
  for (const setting of [...settings, ...navSettings]) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { label: setting.label, group: setting.group, order: setting.order },
      create: setting,
    });
  }
  console.log(`  ${settings.length + navSettings.length} settings seeded`);

  // --- Navigation ---------------------------------------------------------
  await prisma.navItem.deleteMany();
  for (const [i, item] of headerNav.entries()) {
    await prisma.navItem.create({
      data: { ...item, order: i, location: "header" },
    });
  }

  let order = 0;
  for (const column of footerNav) {
    for (const item of column.items) {
      await prisma.navItem.create({
        data: { ...item, order: order++, location: "footer", group: column.group },
      });
    }
  }

  for (const [i, item] of legalNav.entries()) {
    await prisma.navItem.create({
      data: { ...item, order: i, location: "legal" },
    });
  }
  console.log("  navigation seeded");

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
