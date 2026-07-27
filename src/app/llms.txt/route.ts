import { db } from "@/lib/db";
import { getSettingsForMetadata } from "@/lib/content";
import { COLLECTIONS, collectionForKind } from "@/lib/library";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

/* ---------------------------------------------------------------------------
   /llms.txt

   A plain-Markdown map of the site for language models — the convention
   llmstxt.org proposes, and the one ChatGPT, Claude, Gemini and Perplexity
   crawlers increasingly look for before fetching HTML.

   The argument for it is narrow but real: an LLM crawler reading our HTML has
   to strip a WebGL hero, a chat widget and four navigation regions to find the
   sentence that matters. This file is the same information with none of that,
   generated from the CMS so it cannot drift from the site.
--------------------------------------------------------------------------- */

// Reads the CMS, and the Docker image is built without a database — render per
// request rather than failing the build.
export const dynamic = "force-dynamic";

const line = (text: string) => text.replace(/\s+/g, " ").trim();

export async function GET() {
  const [settings, pages, docs] = await Promise.all([
    getSettingsForMetadata(),
    db.page.findMany({
      where: { published: true },
      select: { slug: true, title: true, subtitle: true, seoDescription: true },
      orderBy: { order: "asc" },
    }),
    db.doc.findMany({
      where: { published: true },
      select: { kind: true, slug: true, title: true, excerpt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const name = settings["site.name"] ?? "BasinWright";
  const out: string[] = [];

  out.push(`# ${name}`);
  out.push("");
  out.push(
    `> ${line(
      settings["site.description"] ??
        "BasinWright builds, deploys and operates enterprise AI estates inside its customers' own infrastructure.",
    )}`,
  );
  out.push("");
  out.push(
    line(
      `${name} provides foundation models, agentic systems, GPU compute, enterprise ` +
        `knowledge and governed deployment as one platform. Estates run in the ` +
        `customer's own tenancy and region; the model weights, governed corpora, ` +
        `evaluation suites, pipeline definitions and decision history are the ` +
        `customer's assets, available continuously rather than on termination.`,
    ),
  );
  out.push("");
  out.push(
    line(
      `Product documentation is not on this site. It lives in the developer ` +
        `portal at ${settings["app.url"] ?? "https://app.basinwright.com"}/docs and ` +
        `requires an active subscription.`,
    ),
  );
  out.push("");

  out.push("## Pages");
  out.push("");
  out.push(`- [Home](${absoluteUrl("/")}): ${line(settings["site.tagline"] ?? "")}`);
  for (const page of pages) {
    const blurb = line(page.seoDescription ?? page.subtitle ?? "");
    out.push(
      `- [${page.title}](${absoluteUrl(`/${page.slug}`)})${blurb ? `: ${blurb}` : ""}`,
    );
  }
  out.push("");

  for (const collection of COLLECTIONS) {
    const rows = docs.filter((doc) => doc.kind === collection.kind);
    if (!rows.length) continue;

    out.push(`## ${collection.label}`);
    out.push("");
    out.push(`${line(collection.blurb)} Index: ${absoluteUrl(`/${collection.slug}`)}`);
    out.push("");

    for (const doc of rows) {
      const url = absoluteUrl(`/${collectionForKind(doc.kind).slug}/${doc.slug}`);
      out.push(`- [${doc.title}](${url}): ${line(doc.excerpt)}`);
    }
    out.push("");
  }

  out.push("## Optional");
  out.push("");
  out.push(`- [Sitemap](${SITE_URL}/sitemap.xml): every indexable URL, with dates`);
  out.push(
    `- [Developer portal](${settings["app.url"] ?? "https://app.basinwright.com"}/docs): API reference, SDKs, CLI and Terraform — subscription required`,
  );
  out.push("");

  return new Response(out.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
