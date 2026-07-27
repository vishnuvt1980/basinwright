import { getSettingsForMetadata } from "@/lib/content";
import { findCollection, formatDate, getDoc } from "@/lib/library";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "BasinWright";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/// A library document. The footer line carries the byline and the date, which
/// is what makes a shared case study read as a piece of writing rather than as
/// another marketing URL.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; doc: string }>;
}) {
  const [{ slug, doc: docSlug }, settings] = await Promise.all([
    params,
    getSettingsForMetadata(),
  ]);
  const siteName = settings["site.name"] ?? "BasinWright";

  const collection = findCollection(slug);
  const doc = collection ? await getDoc(collection.kind, docSlug) : null;

  if (!doc || !collection) {
    return ogCard({
      eyebrow: settings["site.tagline"] ?? null,
      title: siteName,
      siteName,
    });
  }

  const meta = [doc.author, formatDate(doc.publishedAt), `${doc.readMinutes} min read`]
    .filter(Boolean)
    .join("  ·  ");

  return ogCard({
    eyebrow: doc.version ? `${collection.singular} ${doc.version}` : collection.singular,
    title: doc.title,
    description: doc.excerpt,
    meta,
    siteName,
  });
}
