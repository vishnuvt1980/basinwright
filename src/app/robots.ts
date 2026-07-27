import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/* ---------------------------------------------------------------------------
   robots.txt

   Three groups, and the distinction matters.

   1. Everyone — index the site, stay out of /admin and /api.

   2. Link-preview crawlers. WhatsApp, X, Facebook, LinkedIn, Slack, Telegram
      and Discord each fetch a page to build an unfurl card. They are named
      explicitly so a future tightening of the wildcard rule cannot silently
      break sharing, and they are allowed the generated Open Graph images.

   3. LLM crawlers. Being read by ChatGPT, Gemini, Claude and Perplexity is the
      point rather than something to defend against, so they are allowed by
      name. Naming them is not redundant with the wildcard: several of these
      agents look for their own user-agent block first, and an explicit Allow
      is the only unambiguous signal.
--------------------------------------------------------------------------- */

/// Everything that turns a URL into a preview card in a chat or a timeline.
const PREVIEW_AGENTS = [
  "WhatsApp",
  "facebookexternalhit",
  "FacebookBot",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Slackbot-LinkExpanding",
  "TelegramBot",
  "Discordbot",
  "Applebot",
  "redditbot",
  "Pinterestbot",
  "SkypeUriPreview",
  "vkShare",
];

/// Crawlers that feed answer engines and model training sets.
const LLM_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "meta-externalagent",
  "Meta-ExternalAgent",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Diffbot",
  "YouBot",
  "Timpibot",
];

const DISALLOW = ["/admin", "/admin/", "/api/"];

// Rendered per request rather than baked at build time, so the sitemap and
// host lines follow SITE_URL in the running environment rather than whatever
// it was when the image was built.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: PREVIEW_AGENTS, allow: "/", disallow: DISALLOW },
      { userAgent: LLM_AGENTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
