import { SectionKind } from "@prisma/client";

import type { PageSeed } from "./types";

/* ---------------------------------------------------------------------------
   /substrate — the live simulation, on a page of its own.

   This ran behind the homepage hero until it was moved here. It is the best
   thing on the site and it was in the worst possible place: a visitor arriving
   cold met a diagram of how the platform works before anything had told them
   what the platform is, and read it as decoration or as noise. Nobody lands on
   this page by accident — they come from the hero's second call to action, the
   nav, or the platform page — and everybody who does has already asked the
   question it answers.

   The page is one block. The `COGNITIVE_SUBSTRATE` renderer draws the rail, the
   console it opens into, and the written walkthrough beneath both.
--------------------------------------------------------------------------- */

export const substratePage: PageSeed = {
  slug: "substrate",
  title: "Watch the substrate run",
  eyebrow: "Live simulation",
  subtitle:
    "A working simulation of what happens underneath a BasinWright deployment: records arriving unresolved, a hub deciding what is fit to use, three engines grounding and verifying a case, and a decision that keeps the lineage of every record behind it. Configure it around your own systems and it runs your board instead of ours.",
  seoTitle: "The Cognitive Substrate, running live",
  seoDescription:
    "A live, in-browser simulation of the BasinWright substrate — ingest, entity resolution, model deployment, the ground/verify/explain lanes and the decision layer, running end to end on a case you can follow.",
  order: 6,
  sections: [
    {
      // The simulation, and the same seven stages written out underneath it.
      // Both halves come from these entries, so there is one story here rather
      // than a drawing and a caption that can drift apart.
      //
      // Entry order is structural — the stage maps each chapter onto the part of
      // the substrate it lights up, so reordering the entries reorders the
      // emphasis with them. Copy is free to change. The entry carrying the badge
      // "highlight" gets the closing treatment, wherever it sits.
      key: "substrate",
      kind: SectionKind.COGNITIVE_SUBSTRATE,
      order: 0,
      eyebrow: "Cognitive Substrate",
      title: "We build it, run it and watch it. You own it.",
      subtitle:
        "The seven stages above, written out. Each chapter lights the part of the substrate it describes, so what you just watched a case do is what you are about to read.",
      body: "Nothing here is a loop. The counters, the cases and the decisions are all produced by a simulation running in your browser — pick a chapter to steer it, or open the full console to configure it around your own systems.",
      ctaLabel: "Talk to an architect about your data",
      ctaHref: "#contact",
      entries: [
        {
          title: "Everything arrives messy",
          subtitle: "Ingest",
          body: "Records land unnormalised, duplicated and unlinked, from systems that never agreed on a schema. They enter the substrate grey, because nothing has earned meaning yet. Colour here is not decoration — it is the quality of the record.",
          icon: "Boxes",
          accent: "slate",
          bullets: ["Unnormalised", "Duplicated", "Unlinked", "Unknown quality"],
        },
        {
          title: "Resolution is where meaning starts",
          subtitle: "Cognitive Data Hub",
          body: "The hub resolves entities, collapses duplicates into one governed record and decides what is fit to use. What fails the quality bar falls into quarantine — some records are remediated and released, others expire. A funnel with no rejects is not one anybody has run.",
          icon: "Database",
          accent: "brass",
          bullets: [
            "Entity resolution",
            "Duplicate collapse",
            "Quarantine & remediation",
            "Policy applied once",
          ],
        },
        {
          title: "BasinWright builds the model and deploys it into your estate",
          subtitle: "Build & deploy",
          body: "We train, tune and evaluate against your governed data, then deploy into your tenancy and your region — not ours. The control plane underneath the field is our work; the estate it runs in is yours.",
          icon: "Rocket",
          accent: "ember",
          bullets: [
            "Trained on your data",
            "Evaluated before promotion",
            "Deployed in your tenancy",
            "Your region, your keys",
          ],
        },
        {
          title: "Three engines, running at once",
          subtitle: "Ground · Verify · Explain",
          body: "Cognitive RAG grounds the case in retrieved evidence, deterministic models verify it against real constraints, and LLM reasoning weighs the options and explains the call. Three concurrent lanes, not three sequential steps.",
          icon: "Network",
          accent: "verdigris",
          bullets: ["Cognitive RAG", "Deterministic models", "LLM reasoning"],
        },
        {
          title: "Monitored every hour of every day",
          subtitle: "Run & monitor 24×7",
          body: "Drift, accuracy, latency and cost are watched continuously, and a model that starts to slip is retrained and re-evaluated before it reaches a decision that matters. Running it is the part that never stops — and it is the part we carry.",
          icon: "Activity",
          accent: "brass",
          bullets: [
            "Drift detection",
            "Accuracy & latency SLOs",
            "Cost per decision",
            "Retrain and roll forward",
          ],
        },
        {
          title: "A case decides only when every lane is satisfied",
          subtitle: "Decision layer",
          body: "Evidence accrues per lane and nothing is decided early. The agent council then runs its skills over the assembled evidence, and every decision keeps the lineage of the exact records that produced it. Confidence is computed, not asserted.",
          icon: "Scale",
          accent: "ember",
          bullets: [
            "Evidence quorum",
            "Agent council",
            "Computed confidence",
            "Record-level lineage",
          ],
        },
        {
          title: "Your business owns the model and the intelligence",
          subtitle: "Ownership",
          badge: "highlight",
          body: "We build it, deploy it and keep it running — but what comes out the other end is yours. The model, the weights, the governed data it learned from and every decision it has ever made stay inside your estate, under your control. Intelligence you own and can walk away with, not a black box you rent by the month.",
          icon: "Lock",
          accent: "verdigris",
          bullets: [
            "You own the model",
            "You own the data",
            "You own the decisions",
            "No lock-in",
          ],
        },
      ],
    },

    /* The block the rail's own call to action points at, so "talk to an
       architect" lands further down this page rather than sending anybody back
       to the homepage to find a form. */
    {
      key: "substrate-cta",
      kind: SectionKind.CONTACT,
      order: 1,
      eyebrow: "Talk to us",
      title: "Run it against your own systems",
      subtitle:
        "The console you just configured travels with your enquiry — the sources you connected and the use cases you picked arrive with it, so the first conversation starts from your estate rather than from ours.",
    },
  ],
};
