import { getPage, getSettingsForMetadata } from "@/lib/content";
import { findCollection } from "@/lib/library";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "BasinWright";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/// A collection index or a CMS page, resolved the same way the route is.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const settings = await getSettingsForMetadata();
  const siteName = settings["site.name"] ?? "BasinWright";

  const collection = findCollection(slug);
  if (collection) {
    return ogCard({
      eyebrow: collection.label,
      title: collection.title,
      description: collection.blurb,
      siteName,
    });
  }

  const page = await getPage(slug);

  return ogCard({
    eyebrow: page?.eyebrow ?? settings["site.tagline"] ?? null,
    title: page?.title ?? siteName,
    description: page?.seoDescription ?? page?.subtitle ?? null,
    siteName,
  });
}
