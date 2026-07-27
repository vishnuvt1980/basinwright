import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionIndex } from "@/components/library/collection-index";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { PageHero } from "@/components/site/page-hero";
import { getPage, getSections, getSettingsForMetadata } from "@/lib/content";
import {
  findCollection,
  getCategories,
  getCollectionDocs,
  type Collection,
  type DocCard,
} from "@/lib/library";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbLd,
  clampDescription,
  jsonLd,
  socialMeta,
} from "@/lib/seo";
import type { SectionWithEntries } from "@/lib/content";

/* ---------------------------------------------------------------------------
   One dynamic segment serves two things, in this order:

     1. a library collection index — /blog, /case-studies, /whitepapers …
     2. a CMS page — /about, /careers, /trust …

   Collections win, which is why their slugs are reserved: `isReservedSlug`
   stops the admin creating a page that would be shadowed by one. Static routes
   (/admin, /api) still take precedence over this segment entirely.
--------------------------------------------------------------------------- */

/// A category value that matches nothing yields an empty index rather than a
/// 404 — a stale bookmark should not read as a broken site.
function readCategory(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value : null;
}

/// The index as an ItemList, so an answer engine can enumerate a collection
/// without crawling every document first.
function collectionLd(collection: Collection, docs: DocCard[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(`/${collection.slug}`)}#collection`,
    name: collection.label,
    headline: collection.title,
    description: collection.blurb,
    url: absoluteUrl(`/${collection.slug}`),
    inLanguage: "en-GB",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: docs.length,
      itemListElement: docs.map((doc, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/${collection.slug}/${doc.slug}`),
        name: doc.title,
      })),
    },
  };
}

/// Any FAQ block on the page becomes a FAQPage entity — the schema Google and
/// the answer engines quote from most readily.
function faqLd(blocks: SectionWithEntries[], path: string) {
  const questions = blocks
    .filter((block) => block.kind === "FAQ")
    .flatMap((block) => block.entries)
    .filter((entry) => entry.body);

  if (!questions.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity: questions.map((entry) => ({
      "@type": "Question",
      name: entry.title,
      acceptedAnswer: { "@type": "Answer", text: entry.body },
    })),
  };
}

async function CollectionPage({
  collection,
  category,
}: {
  collection: Collection;
  category: string | null;
}) {
  const [docs, categories, all] = await Promise.all([
    getCollectionDocs(collection.kind, category ?? undefined),
    getCategories(collection.kind),
    getCollectionDocs(collection.kind),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(collectionLd(collection, all)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: collection.label, path: `/${collection.slug}` },
            ]),
          ),
        }}
      />

      <CollectionIndex
        collection={collection}
        docs={docs}
        categories={categories}
        activeCategory={category}
        total={all.length}
      />
    </>
  );
}

export async function generateMetadata(
  props: PageProps<"/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const settings = await getSettingsForMetadata();
  const name = settings["site.name"] ?? "BasinWright";

  const collection = findCollection(slug);
  if (collection) {
    const description = clampDescription(collection.blurb);
    return {
      title: collection.label,
      description,
      alternates: { canonical: `/${slug}` },
      ...socialMeta({
        title: `${collection.label} · ${name}`,
        description,
        path: `/${slug}`,
        siteName: name,
      }),
    };
  }

  const page = await getPage(slug);
  if (!page) return {};

  const title = page.seoTitle ?? page.title;
  const description = clampDescription(
    page.seoDescription ?? page.subtitle ?? "",
  );

  return {
    title,
    description: description || undefined,
    alternates: { canonical: `/${slug}` },
    // og:type stays "website" for these — they are standing pages, not dated
    // articles. Their freshness signal is the sitemap's lastModified.
    ...socialMeta({
      title: `${title} · ${name}`,
      description: description || undefined,
      path: `/${slug}`,
      siteName: name,
    }),
  };
}

export default async function SlugPage(props: PageProps<"/[slug]">) {
  const [{ slug }, search] = await Promise.all([props.params, props.searchParams]);

  const collection = findCollection(slug);
  if (collection) {
    return (
      <CollectionPage collection={collection} category={readCategory(search.category)} />
    );
  }

  const page = await getPage(slug);
  if (!page) notFound();

  const blocks = await getSections(page.slug);
  const path = `/${page.slug}`;

  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    name: page.seoTitle ?? page.title,
    headline: page.title,
    description: page.seoDescription ?? page.subtitle ?? undefined,
    url: absoluteUrl(path),
    dateModified: page.updatedAt.toISOString(),
    inLanguage: "en-GB",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };

  const faq = faqLd(blocks, path);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: page.title, path },
            ]),
          ),
        }}
      />
      {faq ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(faq) }}
        />
      ) : null}

      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        subtitle={page.subtitle}
      />

      {blocks.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
