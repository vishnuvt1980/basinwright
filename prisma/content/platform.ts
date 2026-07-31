import { SectionKind } from "@prisma/client";

import type { PageSeed } from "./types";

/* ---------------------------------------------------------------------------
   The product tier — the third level of the site.

   These blocks used to be on the homepage, above the fold of anybody's
   patience: a ten-tile capability grid, the agent roster, the model catalogue
   and four pricing columns, all before the reader had been told what problem
   any of it solves.

   Nothing here was rewritten to move it. It is the same content, read by
   somebody who has already decided the story is worth checking — which is the
   only audience it was ever any good for.
--------------------------------------------------------------------------- */

export const platformPages: PageSeed[] = [
  /* ---------------------------------------------------------------- Platform */
  {
    slug: "platform",
    title: "The Enterprise Intelligence Platform",
    eyebrow: "Platform",
    subtitle:
      "One control plane across models, agents, knowledge, data and compute — so the sixth use case lands where the first one did, with the same audit trail behind it.",
    seoTitle: "Platform",
    seoDescription:
      "The BasinWright platform: models, agents, knowledge, data hub, compute and observability under one control plane, deployed inside your own boundary.",
    order: 11,
    sections: [
      {
        // The page opens on the product rather than on a description of it.
        // Everything below this block is prose about a platform; this is the
        // platform, with the module names it actually ships with.
        key: "platform-console",
        kind: SectionKind.PRODUCT_CONSOLE,
        order: 0,
        meta: { panel: "modules" },
        eyebrow: "One environment",
        title: "Not a toolkit. An operating environment you keep.",
        subtitle:
          "Models, data connections, deployments, guardrails, compute and the evidence behind every decision — in one console, inside your own tenancy.",
        entries: [
          {
            title: "The sixth use case lands where the first one did",
            body: "One control plane, one audit trail, one access model. The alternative is six vendors, six consoles and six governance stories to defend separately.",
          },
          {
            title: "Everything the console does, the API does",
            body: "Projects, registry entries, deployments, guardrails and evaluators are all addressable, so the estate is manageable as code rather than by browser.",
          },
        ],
        ctaLabel: "Talk to an architect",
        ctaHref: "#contact",
      },
      {
        key: "platform-grid",
        kind: SectionKind.PLATFORM_GRID,
        order: 1,
        eyebrow: "What is in it",
        title: "Everything an AI estate needs, in one operating environment",
        subtitle:
          "Instead of assembling model vendors, GPU providers, a vector store, an evaluation harness and a governance story, you operate one environment — and keep it.",
        entries: [
          {
            title: "Foundation Models",
            body: "Frontier and open-weight models behind one API contract.",
            icon: "Boxes",
          },
          {
            title: "GPU Cloud",
            body: "H100, H200 and B200 capacity with multi-node interconnect.",
            icon: "Cpu",
          },
          {
            title: "Agent Platform",
            body: "Autonomous agents with memory, planning and tool calling.",
            icon: "Bot",
          },
          {
            title: "Enterprise Search",
            body: "Semantic retrieval across every system your business runs on.",
            icon: "Search",
          },
          {
            title: "Knowledge Hub",
            body: "Governed, versioned corpora with lineage back to the source.",
            icon: "Library",
          },
          {
            title: "Security",
            body: "Private networking, encryption in transit and at rest, BYOK.",
            icon: "ShieldCheck",
          },
          {
            title: "Governance",
            body: "Policy, audit trails and evaluation gates before promotion.",
            icon: "Scale",
          },
          {
            title: "Fine-Tuning",
            body: "LoRA and full-parameter tuning on your own data, in your tenancy.",
            icon: "SlidersHorizontal",
          },
          {
            title: "Model Marketplace",
            body: "Models, agents and extensions with commercial terms attached.",
            icon: "Store",
          },
          {
            title: "Deployment",
            body: "Serverless, dedicated, on-premises or fully air-gapped.",
            icon: "Rocket",
          },
        ],
      },
      {
        key: "platform-models",
        kind: SectionKind.MODELS,
        order: 2,
        eyebrow: "Models",
        title: "Deterministic and generative, deliberately both",
        subtitle:
          "A lot of vendors have quietly reduced every problem to a prompt. That is the wrong tool for most enterprise decisions, and it is why so many pilots die in risk review. Route by cost, latency, residency or capability without rewriting application code.",
        meta: {
          providers: [
            "OpenAI",
            "Anthropic",
            "Meta",
            "Mistral",
            "Google",
            "DeepSeek",
            "Qwen",
            "Microsoft",
            "Cohere",
            "Open Source",
          ],
        },
        entries: [
          {
            title: "Deterministic ML",
            body: "Scorecards, anomaly detectors, survival and time-series models — reproducible and defensible.",
            icon: "LineChart",
          },
          {
            title: "Large Language Models",
            body: "Reasoning, drafting and synthesis, self-hosted and fine-tuned on your corpus.",
            icon: "MessageSquare",
          },
          {
            title: "Vision Models",
            body: "Detection, inspection and document understanding.",
            icon: "Eye",
          },
          {
            title: "Speech Models",
            body: "Transcription, diarisation and real-time voice.",
            icon: "AudioLines",
          },
          {
            title: "Embedding Models",
            body: "Dense and sparse retrieval tuned for your corpus.",
            icon: "Network",
          },
          {
            title: "Multimodal Models",
            body: "Text, image, audio and video in a single context.",
            icon: "Shapes",
          },
          {
            title: "Code Models",
            body: "Generation, migration and review across your stack.",
            icon: "Code2",
          },
          {
            title: "Domain Specific Models",
            body: "Clinical, legal, financial and industrial specialists.",
            icon: "Microscope",
          },
        ],
      },
      {
        // The registry, with the AI-safety screeners in it — the entries a
        // visitor can be shown in the real product today, which is why they are
        // the ones drawn here rather than a flattering selection.
        //
        // Console on the left, because the block above it put its diagram on
        // the right and three of these down a page in the same arrangement
        // reads as a template rather than as a product.
        key: "platform-catalogue",
        kind: SectionKind.PRODUCT_CONSOLE,
        order: 3,
        meta: { panel: "catalogue", side: "left" },
        eyebrow: "Catalogue",
        title: "A catalogue to start from, not a blank page",
        subtitle:
          "A shipping use case arrives as a working data pipeline, a trained artifact, an evaluation report and a model card. It is a starting point: what runs in your production is calibrated on your population, your policy and your thresholds.",
        entries: [
          {
            title: "Tuned on your data, always",
            body: "The reference model is where the work starts. Deterministic models are recalibrated and re-validated; LLM components are fine-tuned, grounded and guardrailed on your corpus.",
          },
          {
            title: "Build to order on the same pipeline",
            body: "What is not in the catalogue is specified and built the same way, with the same governance and the same monitoring — a productised service rather than a research project.",
          },
        ],
      },
      {
        key: "platform-agents",
        kind: SectionKind.AGENTS,
        order: 4,
        eyebrow: "Agents",
        title: "A digital workforce that knows how your business runs",
        subtitle:
          "Agents ship with memory, planning, reasoning, tool calling, workflow automation, human approval and knowledge retrieval — and escalate when policy requires it rather than improvising.",
        entries: [
          {
            title: "Procurement Agent",
            body: "Screens suppliers, drafts RFPs and flags contract drift.",
            icon: "ShoppingCart",
          },
          {
            title: "Finance Agent",
            body: "Reconciles ledgers, explains variance and drafts board packs.",
            icon: "Landmark",
          },
          {
            title: "HR Agent",
            body: "Answers policy questions and shepherds onboarding end to end.",
            icon: "Users",
          },
          {
            title: "Customer Service Agent",
            body: "Resolves tier-one volume with full case history in context.",
            icon: "Headset",
          },
          {
            title: "Legal Agent",
            body: "Reviews clauses against playbooks and surfaces obligations.",
            icon: "Gavel",
          },
          {
            title: "Supply Chain Agent",
            body: "Watches signals upstream and re-plans around disruption.",
            icon: "Truck",
          },
          {
            title: "Sales Agent",
            body: "Researches accounts, drafts outreach and keeps CRM honest.",
            icon: "TrendingUp",
          },
          {
            title: "Engineering Agent",
            body: "Triages incidents, proposes fixes and writes the postmortem.",
            icon: "Wrench",
          },
        ],
      },
      {
        // Model 360. The answer to the only question that matters six months
        // after go-live, asked in front of a regulator or a board: is this
        // thing still working, and what is the evidence?
        key: "platform-model360",
        kind: SectionKind.PRODUCT_CONSOLE,
        order: 5,
        meta: { anchor: "model-360", panel: "model360" },
        eyebrow: "Model 360",
        title: "An outcome you cannot measure is a claim",
        subtitle:
          "Every model carries the same evidence, on by default: why it decided what it did, a signed trail back to the inputs and sources behind it, and continuous monitoring of whether it still holds.",
        entries: [
          {
            title: "Never a bare number",
            body: "Contributing factors and reason codes on tabular models, cited source passages on retrieval and LLM models. Adverse-action reason codes are native, which matters wherever a declined applicant has a legal right to an explanation.",
          },
          {
            title: "Signed reasoning receipts",
            body: "A cryptographically signed evidence trail linking an output back to its inputs and its sources — built for audit and for dispute resolution rather than for a dashboard.",
          },
          {
            title: "Watched, not assumed",
            body: "Drift and accuracy decay monitored statistically, output quality scored by evaluators continuously rather than once at UAT, and every inference logged and metered.",
          },
        ],
      },
      {
        key: "platform-serving",
        kind: SectionKind.PRODUCT_CONSOLE,
        order: 6,
        meta: { anchor: "serving", panel: "serving", side: "left" },
        eyebrow: "Serving",
        title: "Runs where your policy allows it to run",
        subtitle:
          "Residency, sovereignty and blast radius are usually decided before the model is. The same platform, the same governance and the same evidence trail follow the model to whichever of the three it lands on.",
        entries: [
          {
            title: "Not everything needs a GPU",
            body: "CPU serving covers a large share of deterministic use cases at a fraction of the cost, and we will say so when a use case does not need the hardware.",
          },
          {
            title: "Your data does not move to reach it",
            body: "The platform database holds application state and metadata. Your business data stays in your systems and is read at query time — an architectural invariant enforced in the codebase, not a policy written for a website.",
          },
        ],
      },
      {
        key: "platform-api",
        kind: SectionKind.PROSE,
        order: 7,
        eyebrow: "For engineers",
        title: "Driven by API, not just by console",
        body: "A public REST API across the full platform surface, SDKs for Python and TypeScript, an OpenAI-compatible inference gateway that authenticates and meters every call, and MCP support so your models and data are reachable as tools by agentic clients.\n\n**Anything you can click, you can automate.** Projects, registry entries, deployments, guardrails and evaluators are all addressable, which is what makes the platform survivable in an organisation that manages infrastructure as code rather than through a browser.\n\nEvery call routes through the gateway, so usage, cost and behaviour are visible per project, per model and per team — the same telemetry that makes drift monitoring possible in the first place.",
      },
      {
        // The whole module list rather than the six that fitted a three-column
        // grid. A platform is judged on whether the unglamorous half is there —
        // access control, billing, templates — and leaving those out to keep
        // the grid tidy is how a product ends up looking like a demo.
        key: "platform-modules",
        kind: SectionKind.FEATURE_GRID,
        order: 8,
        meta: { columns: 4 },
        eyebrow: "Modules",
        title: "What you operate day to day",
        subtitle:
          "Every one of these is a surface in the console and an endpoint on the API. Nothing here is on a roadmap.",
        entries: [
          {
            title: "Projects",
            body: "Isolated workspaces with their own data, credentials, compute and members — the unit of separation between teams, environments and business lines.",
            icon: "LayoutDashboard",
            accent: "slate",
          },
          {
            title: "Data Hub",
            body: "Register, browse, preview and query the data stores your models read from.",
            icon: "Database",
            accent: "brass",
          },
          {
            title: "Integrations",
            body: "Connect databases, warehouses, object stores, streams and AI providers. Credentials sealed and masked at rest.",
            icon: "Network",
            accent: "brass",
          },
          {
            title: "Models & Registry",
            body: "Catalogue, version, configure and promote models through their lifecycle, with evaluation gates before promotion.",
            icon: "Shapes",
            accent: "verdigris",
          },
          {
            title: "Deployments",
            body: "Live endpoints with health, logs, events and rollback per deployment.",
            icon: "Rocket",
            accent: "ember",
          },
          {
            title: "Services & Templates",
            body: "Provision the supporting infrastructure — search, vector and query engines — from templates onto registered servers.",
            icon: "Layers",
            accent: "slate",
          },
          {
            title: "GPU 360",
            body: "Fleet inventory, live utilisation and cost per GPU server, across cloud capacity and your own hardware.",
            icon: "Cpu",
            accent: "verdigris",
          },
          {
            title: "Chat & Knowledge",
            body: "Grounded conversational access to your own documents and data, with the passage an answer came from attached.",
            icon: "MessageSquare",
            accent: "brass",
          },
          {
            title: "Guardrails & Evaluators",
            body: "Safety screening on inputs and outputs, plus rubric-based quality scoring run continuously rather than once at UAT.",
            icon: "ShieldCheck",
            accent: "verdigris",
          },
          {
            title: "Automations",
            body: "Multi-step workflows chaining models, data and actions on a schedule or a trigger.",
            icon: "Zap",
            accent: "ember",
          },
          {
            title: "Access Control",
            body: "Role-based and attribute-based permissions with deny-overrides, down to the individual resource.",
            icon: "Lock",
            accent: "slate",
          },
          {
            title: "Billing & Usage",
            body: "Per-project consumption, rate cards, credits and spend visibility — because every inference routes through a gateway that meters it.",
            icon: "LineChart",
            accent: "ember",
          },
        ],
      },
      {
        key: "platform-next",
        kind: SectionKind.LINK_LIST,
        order: 9,
        eyebrow: "Elsewhere",
        title: "Where to go next",
        entries: [
          {
            title: "Industries",
            subtitle: "The catalogues built on top of the platform",
            href: "/industries",
            icon: "Building2",
          },
          {
            title: "Pricing",
            subtitle: "From a single developer to a sovereign estate",
            href: "/pricing",
            icon: "LineChart",
          },
          {
            title: "Trust Centre",
            subtitle: "The security position, stated plainly",
            href: "/trust",
            icon: "ShieldCheck",
          },
          {
            title: "Reference deployments",
            subtitle: "Worked designs for the problems we are built for",
            href: "/reference-deployments",
            icon: "Library",
          },
        ],
      },
      {
        key: "platform-cta",
        kind: SectionKind.CONTACT,
        order: 10,
        eyebrow: "Talk to us",
        title: "See it against your own estate",
        subtitle:
          "The useful version of a platform demo is one pointed at your systems and your constraints. Tell us what those are and we will run it that way.",
      },
    ],
  },

  /* ----------------------------------------------------------------- Pricing */
  {
    slug: "pricing",
    title: "Start on a laptop. Scale to a sovereign estate.",
    eyebrow: "Pricing",
    subtitle:
      "The platform is priced by what you consume and what you need governed. The delivered outcome is scoped per use case — because that is honest work with a target attached, not a seat licence.",
    seoTitle: "Pricing",
    seoDescription:
      "BasinWright pricing: developer, professional, enterprise and sovereign tiers, plus how outcome-based use case delivery is scoped.",
    order: 12,
    sections: [
      {
        key: "pricing-tiers",
        kind: SectionKind.PRICING,
        order: 0,
        entries: [
          {
            title: "Starter",
            subtitle: "Developers",
            body: "Everything you need to prototype against frontier models.",
            badge: "Free to begin",
            accent: "slate",
            bullets: [
              "Serverless inference",
              "Shared model catalog",
              "Community support",
              "Usage analytics",
            ],
          },
          {
            title: "Professional",
            subtitle: "Growing Teams",
            body: "Dedicated capacity and the controls a real product needs.",
            badge: "Most popular",
            accent: "brass",
            bullets: [
              "Dedicated endpoints",
              "Fine-tuning",
              "Role-based access",
              "Priority support",
              "Evaluation suites",
            ],
          },
          {
            title: "Enterprise",
            subtitle: "Large Organisations",
            body: "Private networking, governance and procurement-grade terms.",
            accent: "verdigris",
            bullets: [
              "Private cloud & VPC peering",
              "SSO, audit and policy",
              "Committed GPU capacity",
              "Availability terms agreed per estate",
              "Named architect",
            ],
          },
          {
            title: "Sovereign AI",
            subtitle: "Governments",
            body: "National-scale compute with full data and operational sovereignty.",
            accent: "ember",
            bullets: [
              "Air-gapped deployment",
              "In-country residency",
              "Cleared personnel where required",
              "Bespoke model estate",
            ],
          },
        ],
      },
      {
        key: "pricing-outcomes",
        kind: SectionKind.PROSE,
        order: 1,
        eyebrow: "Delivered outcomes",
        title: "How a use case is scoped",
        body: "The tiers above price the platform. A delivered use case is scoped separately, and deliberately so — you are buying work with a number attached rather than access to a console.\n\nWe agree the target metric with you up front, and it becomes the definition of done. We will tell you plainly whether the use case is one that ships today as a reference implementation to be tuned on your data, or one we build to order — and we scope the difference honestly rather than quietly.\n\nA shipping use case typically goes from kickoff to a governed, monitored endpoint in weeks. What follows go-live — drift monitoring, evaluators, retuning — is part of the engagement rather than a support contract bolted on afterwards, because an outcome is a durable state and not a launch event.",
      },
      {
        key: "pricing-faq",
        kind: SectionKind.FAQ,
        order: 2,
        eyebrow: "Questions",
        title: "What people ask before procurement does",
        entries: [
          {
            title: "Do we pay for GPUs we are not using?",
            body: "No. Compute is consumed rather than reserved unless you specifically want committed capacity, which enterprises under a fixed budget frequently do. CPU serving covers a large share of deterministic use cases and costs a fraction of GPU capacity — we will tell you when a use case does not need a GPU.",
          },
          {
            title: "What happens to our models if we leave?",
            body: "You keep them. The model, the weights, the governed data it learned from and the decisions it has made are inside your estate throughout — leaving is a matter of us stopping work, not of you extracting anything. Exit terms are agreed up front rather than negotiated under pressure later.",
          },
          {
            title: "Is the platform priced separately from the delivery work?",
            body: "Yes. The platform is a subscription with consumption on top; a delivered use case is scoped against its outcome. Keeping them separate is what stops the delivery work from being priced as though it were software licensing.",
          },
          {
            title: "Do you hold the certifications our vendor review will ask for?",
            body: "We describe our controls plainly and do not claim certifications we do not hold. Ask us for the current assurance position and you will get the real answer, including where it is incomplete — see the Trust Centre for how we state it.",
          },
        ],
      },
      {
        key: "pricing-cta",
        kind: SectionKind.CONTACT,
        order: 3,
        eyebrow: "Talk to us",
        title: "Get a scoped number, not a price list",
        subtitle:
          "Tell us the outcome you want moved and the constraints you are under, and we will come back with what it would take — including if the answer is that you do not need us for it.",
      },
    ],
  },
];
