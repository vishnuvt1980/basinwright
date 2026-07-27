/* ---------------------------------------------------------------------------
   Everything the site needs to be shared, indexed and read by a machine.

   Three audiences, and they want different things:

   • Messaging apps and social (WhatsApp, X, Facebook, LinkedIn, Slack, iMessage)
     read Open Graph and Twitter card tags out of the <head>. Their crawlers do
     not run JavaScript and give up quickly, so every tag has to be in the
     server-rendered HTML with absolute URLs.

   • Search engines want canonical URLs, a sitemap, and JSON-LD describing what
     each page is.

   • LLM crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot …) want the
     same JSON-LD plus a plain-text index. `/llms.txt` is that index.

   `metadataBase` is what turns every relative image path into an absolute URL,
   and without it social previews silently break — hence the loud default here
   rather than an optional setting.
--------------------------------------------------------------------------- */

/// The canonical origin, no trailing slash. Set SITE_URL in the environment for
/// anything that is not production; the default is the real site because a
/// wrong-but-absolute URL is easier to spot than a missing one.
export const SITE_URL = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://basinwright.com"
).replace(/\/+$/, "");

export const absoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/// X handle, used for the `twitter:site` attribution on every card.
export const TWITTER_HANDLE = "@basinwright";

/// Trimmed to what a preview actually shows. WhatsApp and X truncate around
/// 160–200 characters; anything past that is weight without benefit.
export function clampDescription(text: string, max = 200) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,;:.-]+$/, "")}…`;
}

/**
 * Builds the `openGraph` and `twitter` blocks for a page.
 *
 * Next merges metadata per *field*, not deeply: a child that sets `openGraph`
 * replaces the parent's object entirely. Setting only a title and description
 * on an article therefore silently drops `og:site_name`, `og:locale` and
 * `twitter:card` — and losing `twitter:card` downgrades every shared link on X
 * from a full-width card to a thumbnail. So every page builds both blocks
 * through here rather than by hand.
 */
export function socialMeta({
  title,
  description,
  path,
  siteName,
  type = "website",
  article,
}: {
  title: string;
  description?: string;
  /// Site-relative; `metadataBase` makes it absolute.
  path: string;
  siteName: string;
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
}) {
  const shared = { title, description, siteName, locale: "en_GB", url: path };

  return {
    openGraph:
      type === "article"
        ? { ...shared, type: "article" as const, ...article }
        : { ...shared, type: "website" as const },
    twitter: {
      card: "summary_large_image" as const,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
    },
  };
}

/**
 * Serialises a JSON-LD object for a `<script type="application/ld+json">`.
 *
 * The `<` escape is not decorative: CMS copy flows into these payloads, and an
 * unescaped `</script>` inside a string would close the tag early and turn the
 * rest of the document into executable markup.
 */
export const jsonLd = (data: Record<string, unknown>) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

/// The publisher, referenced by every Article so search engines and LLMs can
/// resolve them to one entity rather than treating each page as orphaned.
export function organisationLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/basinwright-mark-light.svg"),
    },
    description,
    sameAs: [] as string[],
  };
}

export function webSiteLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name,
    url: SITE_URL,
    description,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-GB",
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
