import { getSettingsForMetadata } from "@/lib/content";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "BasinWright — Enterprise Intelligence as a Service";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Route segment config from the group layout does not reach metadata image
// routes, so this one would otherwise prerender at build time — inside the
// Docker build, where there is no database, freezing the card on the fallback
// copy. Rendered per request it tracks whatever the CMS says today.
export const dynamic = "force-dynamic";

/// The homepage card, and the fallback for any route that does not define its
/// own — Next resolves the nearest `opengraph-image` up the segment tree.
export default async function Image() {
  const settings = await getSettingsForMetadata();

  return ogCard({
    eyebrow: settings["site.tagline"] ?? "Enterprise Intelligence as a Service",
    title:
      settings["footer.tagline"] ??
      "Building the Infrastructure for Enterprise Intelligence",
    description:
      settings["footer.subline"] ??
      "AI models, agentic systems, high-performance compute, enterprise knowledge and secure deployment.",
    siteName: settings["site.name"] ?? "BasinWright",
  });
}
