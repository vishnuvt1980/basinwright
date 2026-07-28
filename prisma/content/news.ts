import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Newsroom.

   This used to carry six milestones — a new region, GPU capacity going GA, an
   ISO certification, a partner programme with a headcount, a marketplace with
   a listing count, two national sovereign deployments. None of them had
   happened.

   What is left is the one announcement we can make truthfully: an account of
   what was removed and why. A nearly-empty newsroom is a fair signal about a
   company's stage. A full one made of fiction is not.

   Add to this only when there is something that actually happened.
--------------------------------------------------------------------------- */

export const news: DocSeed[] = [
  {
    kind: DocKind.NEWS,
    slug: "correcting-this-site",
    title: "We took the customer claims off this site",
    excerpt:
      "This site launched with eight named customers, four case studies' worth of outcome metrics, three certifications and a region count. We have none of those. Here is what changed and why.",
    category: "Company",
    readMinutes: 4,
    featured: true,
    publishedAt: "2026-07-28",
    tags: ["Company", "Transparency"],
    icon: "Newspaper",
    accent: "amber",
    seoDescription:
      "BasinWright removed fabricated customer names, outcome metrics, certifications and scale figures from its website. What was removed, and what replaced it.",
    body: `When this site first went up it carried a logo wall headed "Trusted by Enterprise" with eight named organisations, eight case studies with outcome percentages, a certification grid marked *Certified*, and a set of figures — operating regions, GPU hours delivered, uptime SLA, partner and marketplace counts.

None of it was true. BasinWright is early. We have no published customers, no third-party certifications and no region count worth quoting.

That material was written as placeholder copy and it should never have been framed as fact. We have taken it down rather than anonymising it, because an anonymised fabrication is the same claim with the names filed off.

## What was removed

- **The logo wall.** Eight invented customers, gone. There is no anonymised version of a logo wall worth having.
- **Case studies.** Eight fabricated engagements with outcome metrics. They are now [reference deployments](/reference-deployments): worked designs, clearly labelled as such at the top of every page, with no outcome figures at all.
- **Certifications.** The Trust Centre claimed ISO/IEC 42001, ISO/IEC 27001 and SOC 2 Type II. We hold none of them. It now says so plainly and lists the controls we actually operate.
- **Scale figures.** Region counts, GPU hours, models served, uptime SLA, partner and engineer counts, marketplace listings.
- **Contractual response times.** We published a 24×7 support table we cannot yet staff. Response terms are now agreed per engagement.
- **Research results.** Five notes reported measurements across customer estates that do not exist. They are now [engineering notes](/research): the mechanism, and what would have to be measured to know whether it holds.

## What is still here

The architecture, the reasoning and the positions. Those were always ours and they are the part worth evaluating: how a governed record gets built, why evidence quorum beats a confidence threshold, what it takes for an estate to be genuinely sovereign, and why the customer should own the weights.

The [whitepapers](/whitepapers) and the [Learning Centre](/learn) are unchanged in substance. Where they previously said "in our deployments", they now say what they always meant: this is what we expect, and here is the reasoning.

## Why publish this rather than quietly edit

Because someone may have read the earlier version, and because the alternative — a silent correction — is the same instinct that produced the original copy.

If you are evaluating us: judge the thinking, ask hard questions about what is not built yet, and hold us to the exit terms rather than to a reference call we cannot yet give you. When there is a customer who will speak to you, this page will say so.`,
  },
];
