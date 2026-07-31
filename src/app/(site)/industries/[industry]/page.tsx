import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionRenderer } from "@/components/sections/section-renderer";
import { PageHero } from "@/components/site/page-hero";
import { getPage, getSections, getSettingsForMetadata } from "@/lib/content";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbLd,
  clampDescription,
  jsonLd,
  socialMeta,
} from "@/lib/seo";

/* ---------------------------------------------------------------------------
   The industry tier: /industries/insurance and its siblings.

   These are ordinary CMS pages — the only thing separating them from /about is
   that their slug has a "/" in it. That is what gives the site a real second
   level without a second content model: `getPage("industries/insurance")` is
   the same lookup as `getPage("about")`, and the sitemap emits the nested path
   without knowing anything special happened.

   This route exists because /[slug] only matches a single segment. A static
   segment beats a dynamic one, so /industries/insurance resolves here rather
   than through the library's /[slug]/[doc] route, and /industries itself —
   one segment — still resolves through /[slug] to the index page.

   Anything published under an `industries/…` slug is reachable. There is no
   allow-list of industries in code on purpose: adding one is publishing a page
   in /admin, not a deploy.
--------------------------------------------------------------------------- */

const slugFor = (industry: string) => `industries/${industry}`;

export async function generateMetadata(
  props: PageProps<"/industries/[industry]">,
): Promise<Metadata> {
  const { industry } = await props.params;
  const [settings, page] = await Promise.all([
    getSettingsForMetadata(),
    getPage(slugFor(industry)),
  ]);
  if (!page) return {};

  const name = settings["site.name"] ?? "BasinWright";
  const title = page.seoTitle ?? page.title;
  const description = clampDescription(page.seoDescription ?? page.subtitle ?? "");
  const path = `/${page.slug}`;

  return {
    title,
    description: description || undefined,
    alternates: { canonical: path },
    ...socialMeta({
      title: `${title} · ${name}`,
      description: description || undefined,
      path,
      siteName: name,
    }),
  };
}

export default async function IndustryPage(
  props: PageProps<"/industries/[industry]">,
) {
  const { industry } = await props.params;

  const page = await getPage(slugFor(industry));
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
              { name: "Industries", path: "/industries" },
              { name: page.title, path },
            ]),
          ),
        }}
      />

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
