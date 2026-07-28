import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocKind } from "@prisma/client";

import { DocArticle } from "@/components/library/doc-article";
import { getSettingsForMetadata } from "@/lib/content";
import { findCollection, getDoc, getRelatedDocs } from "@/lib/library";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbLd,
  clampDescription,
  jsonLd,
  socialMeta,
} from "@/lib/seo";

/// A single library document: /case-studies/meridian-bank-fraud-decisioning
/// and every other collection's detail page. The first segment names the
/// collection; the slug is unique across the whole library, so a document
/// reached under the wrong collection is a wrong URL rather than a redirect.

/// schema.org has narrower types than "Article" for two of our collections,
/// and using them is what lets Google and the answer engines classify a
/// release note as documentation rather than as journalism.
const SCHEMA_TYPE: Record<DocKind, string> = {
  [DocKind.NEWS]: "NewsArticle",
  [DocKind.RESEARCH]: "ScholarlyArticle",
  [DocKind.RELEASE_NOTE]: "TechArticle",
  [DocKind.ARTICLE]: "TechArticle",
  [DocKind.WHITEPAPER]: "TechArticle",
  // Reference deployments are worked designs rather than reports of work done,
  // so TechArticle rather than Article — the type an answer engine reads as
  // documentation instead of as a customer story.
  [DocKind.REFERENCE]: "TechArticle",
  [DocKind.BLOG]: "BlogPosting",
};

export async function generateMetadata(
  props: PageProps<"/[slug]/[doc]">,
): Promise<Metadata> {
  const { slug, doc: docSlug } = await props.params;

  const collection = findCollection(slug);
  if (!collection) return {};

  const [doc, settings] = await Promise.all([
    getDoc(collection.kind, docSlug),
    getSettingsForMetadata(),
  ]);
  if (!doc) return {};

  const name = settings["site.name"] ?? "BasinWright";
  const description = clampDescription(doc.seoDescription ?? doc.excerpt);
  const title = doc.seoTitle ?? doc.title;
  const path = `/${collection.slug}/${doc.slug}`;

  return {
    title,
    description,
    // Tags are the closest thing the corpus has to author-declared keywords.
    // Google ignores them; several answer engines and social crawlers do not.
    keywords: doc.tags.length ? doc.tags : undefined,
    authors: doc.author ? [{ name: doc.author }] : undefined,
    alternates: { canonical: path },
    ...socialMeta({
      title: `${title} · ${name}`,
      description,
      path,
      siteName: name,
      type: "article",
      article: {
        publishedTime: doc.publishedAt.toISOString(),
        modifiedTime: doc.updatedAt.toISOString(),
        authors: doc.author ? [doc.author] : undefined,
        section: doc.category ?? collection.label,
        tags: doc.tags,
      },
    }),
  };
}

export default async function DocPage(props: PageProps<"/[slug]/[doc]">) {
  const { slug, doc: docSlug } = await props.params;

  const collection = findCollection(slug);
  if (!collection) notFound();

  const doc = await getDoc(collection.kind, docSlug);
  if (!doc) notFound();

  const [related, settings] = await Promise.all([
    getRelatedDocs(doc),
    getSettingsForMetadata(),
  ]);

  const path = `/${collection.slug}/${doc.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[doc.kind],
    "@id": `${absoluteUrl(path)}#article`,
    headline: doc.title,
    description: doc.seoDescription ?? doc.excerpt,
    url: absoluteUrl(path),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    datePublished: doc.publishedAt.toISOString(),
    dateModified: doc.updatedAt.toISOString(),
    inLanguage: "en-GB",
    articleSection: doc.category ?? collection.label,
    keywords: doc.tags.join(", ") || undefined,
    wordCount: doc.body.split(/\s+/).filter(Boolean).length,
    timeRequired: `PT${doc.readMinutes}M`,
    image: [absoluteUrl(`${path}/opengraph-image`)],
    // Bylines belong to internal AI agents (Meridian, Anvil, …), not people.
    // Attributing them as schema:Person would misrepresent authorship in the
    // knowledge graph; the visible byline still surfaces the agent name.
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    // Whitepapers whose appendices sit behind the subscription are marked as
    // such rather than presented as fully free — a cloaking signal otherwise.
    isAccessibleForFree: !doc.gated,
  };

  const crumbs = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: collection.label, path: `/${collection.slug}` },
    { name: doc.title, path },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }}
      />

      <DocArticle
        doc={doc}
        collection={collection}
        related={related}
        appUrl={settings["app.url"] ?? "https://app.basinwright.com"}
      />
    </>
  );
}
