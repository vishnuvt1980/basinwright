import { SectionKind } from "@prisma/client";

import type { SectionSeed } from "./types";

/* ---------------------------------------------------------------------------
   The homepage.

   These blocks carry no `page` value when seeded, so they take the schema
   default of "home" — the one page whose shell lives in code rather than in a
   `Page` row.

   The running order is the argument the page makes, and it is deliberate:

     problem → outcome → method → trust → platform → proof → next step

   A CIO decides whether to take the meeting long before reaching the product
   modules, so the modules come last. What used to be here — a ten-tile
   capability grid, the agent roster, the model catalogue, the pricing tiers —
   was the same information arranged the other way round, product first. None
   of it was deleted; it moved to /platform and /pricing, where somebody who
   has already decided the story is true goes looking for it.

   Two blocks are not in the reading order. `substrate` is the hero's banner,
   pulled out of the flow by page.tsx. And the industry tier the problem cards
   link to lives at /industries — the second level of the site, not a block.
--------------------------------------------------------------------------- */

export const homeSections: SectionSeed[] = [
  /* ------------------------------------------------------------------- Hero */
  {
    key: "hero",
    kind: SectionKind.HERO,
    order: 0,
    eyebrow: "Enterprise Intelligence",
    headlineLines: ["Enterprise Intelligence.", "Built Around Outcomes."],
    subtitle:
      "Stop buying AI infrastructure. Deploy AI that solves real business problems — from fraud detection and claims automation to procurement intelligence and enterprise knowledge.",
    body: "Built for regulated industries that need AI to be secure, explainable and sovereign.",
    ctaLabel: "Book an AI strategy session",
    ctaHref: "#contact",
    ctaLabel2: "Explore industry solutions",
    ctaHref2: "/industries",
    // The hero's four tiles used to carry traction figures — models served,
    // uptime, regions, GPU hours. We are early and had none of them, so they
    // now describe what the platform *is*. A capability is checkable; a
    // fabricated count is not.
    //
    // They are also the four pillars of the "why" block in miniature, in the
    // same order, so the promise made in the first screen is the one argued
    // properly further down.
    entries: [
      { title: "Purpose-built models", subtitle: "Trained for your problem", icon: "Boxes" },
      { title: "Your data stays put", subtitle: "Inside your boundary", icon: "Lock" },
      { title: "Explainable decisions", subtitle: "Evidence and reason codes", icon: "Scale" },
      { title: "Monitored after go-live", subtitle: "Drift watched, models retuned", icon: "Activity" },
    ],
  },

  /* -------------------------------------------------------------- Substrate */
  {
    // Not a block on the page: this is the hero's banner. `page.tsx` pulls it
    // out of the section flow and hands it to the hero, which either draws it
    // as a live simulation or tells the same story as plain text.
    //
    // Entry order is structural — the stage maps each chapter onto the part of
    // the substrate it lights up, so reordering the entries reorders the
    // emphasis with them. Copy is free to change. The entry carrying the badge
    // "highlight" gets the closing treatment, wherever it sits.
    key: "substrate",
    kind: SectionKind.COGNITIVE_SUBSTRATE,
    order: 1,
    eyebrow: "Cognitive Substrate",
    title: "We build it, run it and watch it. You own it.",
    subtitle:
      "A live simulation of the substrate underneath the platform. Every mark is a record with its own state, quality and lineage — the picture is downstream of the simulation, not a shader with copy laid over it.",
    body: "Nothing here is a loop. The counters, the cases and the decisions are all produced by a simulation running in your browser.",
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

  /* --------------------------------------------------------------- Problems */
  {
    // The industry tier's front door. Each card is a link into
    // /industries/{slug} — the FEATURE_GRID block renders the whole card as the
    // link when an entry carries an `href`.
    //
    // The four here are the four the platform is genuinely built around, and
    // they are the same four the substrate configurator can be preset to. A
    // fifth card would be easy to write and impossible to stand behind.
    key: "problems",
    kind: SectionKind.FEATURE_GRID,
    order: 2,
    meta: { anchor: "problems" },
    eyebrow: "Industries",
    title: "Enterprise problems we solve",
    subtitle:
      "Not products — the decisions your organisation already makes, slowly or inconsistently, at volume. Across banking, insurance, manufacturing, energy, procurement, knowledge and AI safety.",
    entries: [
      {
        title: "Insurance",
        href: "/industries/insurance",
        icon: "Umbrella",
        accent: "brass",
        body: "Claims cycle time, premium leakage, underwriting consistency, and reserves that have to survive challenge.",
        bullets: [
          "Accelerate claims",
          "Detect fraud",
          "Improve underwriting",
          "Reserve with confidence",
        ],
      },
      {
        title: "Banking & financial services",
        href: "/industries/banking",
        icon: "Landmark",
        accent: "verdigris",
        body: "Fraud loss without false declines, AML alerts worth an investigator's hour, and a reason code on every credit decline.",
        bullets: [
          "Reduce fraud",
          "Improve AML yield",
          "Increase credit accuracy",
          "Meet regulatory expectations",
        ],
      },
      {
        title: "Manufacturing",
        href: "/industries/manufacturing",
        icon: "Factory",
        accent: "ember",
        body: "Engineering knowledge locked inside documents, quality evidence spread across systems, and production signals nobody reads in time.",
        bullets: [
          "Engineering knowledge",
          "Quality documentation",
          "Production intelligence",
          "Supplier collaboration",
        ],
      },
      {
        title: "Energy, oil & gas",
        href: "/industries/energy",
        icon: "Fuel",
        accent: "slate",
        body: "Spend leaking through specification mismatches and long-lead items, and vendor evaluations that take weeks of engineering time.",
        bullets: [
          "Procurement intelligence",
          "Technical specification search",
          "Vendor evaluation",
          "Asset maintenance",
        ],
      },
    ],
  },

  /* --------------------------------------------------------------- Outcomes */
  {
    // The SOLUTIONS block, moved up the page and re-pointed. It used to list
    // capability categories — "Generative AI", "Agentic AI", "Predictive
    // Analytics" — which are things to buy rather than things to get. These
    // are the numbers a business already tracks and already wants moved.
    key: "outcomes",
    kind: SectionKind.SOLUTIONS,
    order: 3,
    meta: { anchor: "outcomes" },
    eyebrow: "Outcomes",
    title: "Buy the outcome.",
    subtitle:
      "Every AI project should start with a measurable business outcome. Pick the number you want moved, and we will tell you honestly whether a model can move it — and what a realistic target looks like on your data.",
    entries: [
      {
        title: "Reduce fraud losses",
        body: "Catch more of what matters without raising false declines on good customers.",
        icon: "ShieldAlert",
      },
      {
        title: "Recover procurement spend",
        body: "Find the leakage in specifications, tenders and invoices before it is paid.",
        icon: "ShoppingCart",
      },
      {
        title: "Accelerate claims processing",
        body: "Triage, severity and routing decided in hours rather than days.",
        icon: "Umbrella",
      },
      {
        title: "Improve customer retention",
        body: "See the accounts about to leave while there is still something to do about it.",
        icon: "TrendingUp",
      },
      {
        title: "Reduce document search time",
        body: "Answers grounded in your own documents, with the passage they came from attached.",
        icon: "Search",
      },
      {
        title: "Increase engineering productivity",
        body: "Institutional knowledge that answers a question, instead of a folder nobody can navigate.",
        icon: "Wrench",
      },
      {
        title: "Strengthen regulatory compliance",
        body: "Evidence, lineage and reason codes attached to every decision, by default.",
        icon: "Scale",
      },
    ],
  },

  /* -------------------------------------------------------------------- How */
  {
    key: "how",
    kind: SectionKind.FLOW,
    order: 4,
    meta: { anchor: "how" },
    eyebrow: "How it works",
    title: "From business problem to measured outcome",
    subtitle:
      "Five steps, and the first one is not a model. This is the actual engagement rather than a marketing abstraction.",
    body: "The engagement does not end at deployment — that is where it starts. A model that was accurate at go-live and silently decayed six months later has failed, even if it never threw an error.",
    entries: [
      {
        title: "Business problem",
        body: "The metric you want moved, agreed up front. It becomes the definition of done.",
        icon: "LineChart",
        accent: "slate",
      },
      {
        title: "Enterprise data",
        body: "Your warehouse, database, object store or stream — read where it already lives, not copied into ours.",
        icon: "Database",
        accent: "brass",
      },
      {
        title: "Purpose-built AI model",
        body: "Trained, tuned or calibrated on your population, your policy and your thresholds.",
        icon: "Boxes",
        accent: "ember",
      },
      {
        title: "Enterprise AI agent",
        body: "The model put to work inside the process that actually makes the decision.",
        icon: "Bot",
        accent: "verdigris",
      },
      {
        title: "Measured business outcome",
        body: "Instrumented from day one, monitored for drift, retuned when it slips.",
        icon: "Activity",
        accent: "brass",
      },
    ],
  },

  /* -------------------------------------------------------------------- Why */
  {
    key: "why",
    kind: SectionKind.WHY_PILLARS,
    order: 5,
    eyebrow: "Why BasinWright",
    title: "The four things that decide whether AI survives contact with your risk committee",
    subtitle:
      "Accuracy is rarely what kills an enterprise AI project. These are what it dies of instead.",
    entries: [
      {
        title: "Purpose-built models",
        subtitle: "Every model is trained for your business problem",
        body: "A reference model is a starting point, never the delivered thing. What runs in your production is calibrated on your population, your policy and your thresholds — and where the honest answer is that a problem does not need AI at all, we say so.",
        icon: "Boxes",
        accent: "brass",
        bullets: [
          "Tuned on your data",
          "Your thresholds, versioned",
          "Deterministic where it must be",
          "LLM where it must read language",
        ],
      },
      {
        title: "Your data never leaves",
        subtitle: "Keep your enterprise data inside your boundary",
        body: "The platform database holds application state and metadata — users, projects, registry entries, audit logs. Your business data stays in your own systems and is read at query time. This is an architectural invariant enforced in the codebase, not a policy written for a website.",
        icon: "Lock",
        accent: "verdigris",
        bullets: [
          "Metadata on the platform",
          "Data in your systems",
          "Inference on your compute",
          "Sovereign and air-gapped options",
        ],
      },
      {
        title: "Explainable decisions",
        subtitle: "Evidence. Reasoning. Governance. Audit.",
        body: "Contributing factors and reason codes on tabular models, cited source passages on retrieval and LLM models — never a bare number. Full data-to-decision lineage, versioned configuration and validation workflows for the models that carry real risk.",
        icon: "Scale",
        accent: "ember",
        bullets: [
          "Reason codes on every decision",
          "Cited sources on every answer",
          "Signed reasoning receipts",
          "Lineage, versioning, approvals",
        ],
      },
      {
        title: "Continuous improvement",
        subtitle: "Models do not stop at deployment",
        body: "Drift and accuracy decay are monitored statistically, output quality is scored by evaluators continuously rather than once at UAT, and every inference is logged and metered. When the number moves, we retune.",
        icon: "Activity",
        accent: "slate",
        bullets: [
          "Drift and decay monitoring",
          "Continuous evaluators",
          "Every inference logged",
          "Retuned against the outcome",
        ],
      },
    ],
  },

  /* --------------------------------------------------------------- Platform */
  {
    // Entries are ordered bottom-of-stack first: entry 0 is the base layer the
    // renderer draws lowest, the last entry the top. Reordering them in /admin
    // restacks the diagram.
    //
    // Observability is the base rather than a band down the side because it is
    // the layer everything else is answerable to — the stack is read upward
    // from what watches it.
    key: "topology",
    kind: SectionKind.PLATFORM_TOPOLOGY,
    order: 6,
    meta: { anchor: "platform" },
    eyebrow: "One platform",
    title: "The Enterprise Intelligence Platform",
    subtitle:
      "One stack, operated and governed from the same place. Models as a Service is one layer of it — not the whole of it.",
    body: "Requests travel up the stack; retrieved context and results settle back down. Nothing leaves the control plane on the way.",
    entries: [
      {
        title: "Observability",
        subtitle: "What everything answers to",
        body: "Inference tracing, drift detection, cost attribution and policy enforcement across every model in the estate — one audit trail rather than one per vendor.",
        icon: "Activity",
        accent: "ember",
        bullets: ["Tracing", "Drift", "Cost", "Policy", "Audit export"],
      },
      {
        title: "Compute",
        subtitle: "The substrate",
        body: "CPU serving inside your environment, cloud GPU on demand, or entirely on your own hardware behind your firewall.",
        icon: "Cpu",
        accent: "slate",
        bullets: ["CPU serving", "Cloud GPU", "Your own GPU", "Multi-node", "Bare metal"],
      },
      {
        title: "Data Hub",
        subtitle: "Where the records resolve",
        body: "Register, browse, preview and query the stores your models read from — structured, semi-structured and unstructured, under one governance model.",
        icon: "Database",
        accent: "brass",
        bullets: ["Warehouses", "Databases", "Object stores", "Streams", "Documents"],
      },
      {
        title: "Knowledge",
        subtitle: "The institutional memory",
        body: "Governed, versioned corpora with lineage back to the source, so an answer can always be traced to the passage it came from.",
        icon: "Library",
        accent: "verdigris",
        bullets: ["Retrieval", "Grounding", "Citations", "Versioned corpora"],
      },
      {
        title: "Models",
        subtitle: "The intelligence",
        body: "Deterministic ML and self-hosted open-weight LLMs, catalogued, versioned and promoted through a lifecycle with evaluation gates.",
        icon: "Shapes",
        accent: "brass",
        bullets: [
          "Scorecards",
          "Anomaly detection",
          "Forecasting",
          "Fine-tuned LLMs",
          "Embeddings",
        ],
      },
      {
        title: "AI agents",
        subtitle: "The workforce",
        body: "Agents that plan multi-step work, call your internal tools, hand off to one another and escalate when policy requires it.",
        icon: "Bot",
        accent: "verdigris",
        bullets: ["Memory", "Planning", "Tool calling", "Human approval", "Escalation"],
      },
      {
        title: "AI applications",
        subtitle: "Where the business meets it",
        body: "The decisions themselves — claims triage, fraud review, tender evaluation, grounded search — inside the processes that already make them.",
        icon: "LayoutDashboard",
        accent: "ember",
        bullets: ["Claims", "Fraud", "Credit", "Procurement", "Knowledge"],
      },
    ],
  },

  /* ----------------------------------------------------------- Capabilities */
  {
    key: "products",
    kind: SectionKind.PRODUCTS,
    order: 7,
    eyebrow: "Platform capabilities",
    title: "What the platform is made of",
    subtitle:
      "Models as a Service is one capability inside the platform, not the platform. Everything here lands in the same control plane, with the same audit trail — so the sixth use case arrives where the first one did.",
    entries: [
      {
        title: "BasinWright MaaS",
        subtitle: "Models as a Service",
        body: "Deploy production-ready AI models through secure APIs without managing infrastructure.",
        icon: "Boxes",
        accent: "brass",
        bullets: [
          "Model Catalog",
          "Serverless Inference",
          "Dedicated Endpoints",
          "Auto Scaling",
          "API Gateway",
          "Usage Analytics",
          "Version Management",
        ],
      },
      {
        title: "BasinWright Compute",
        subtitle: "Enterprise GPU Cloud",
        body: "High-performance infrastructure designed for training and serving AI at scale.",
        icon: "Cpu",
        accent: "ember",
        bullets: [
          "GPU Marketplace",
          "H100 / H200 / B200",
          "RTX fleet",
          "Multi-node Training",
          "Kubernetes",
          "Bare Metal",
          "Auto Scaling",
        ],
      },
      {
        title: "BasinWright Agents",
        subtitle: "Cognitive AI Agents",
        body: "Build intelligent enterprise agents that plan, act and escalate under policy.",
        icon: "Bot",
        accent: "verdigris",
        bullets: [
          "Memory",
          "Planning",
          "Reasoning",
          "Tool Calling",
          "Workflow Automation",
          "Human Approval",
          "Knowledge Retrieval",
        ],
      },
      {
        title: "BasinWright Studio",
        subtitle: "Visual AI Development Platform",
        body: "Design, evaluate and ship AI systems without leaving one workspace.",
        icon: "LayoutDashboard",
        accent: "slate",
        bullets: [
          "Drag-and-drop",
          "Prompt Engineering",
          "Fine Tuning",
          "Evaluation",
          "Deployment",
          "Monitoring",
        ],
      },
      {
        title: "BasinWright Knowledge",
        subtitle: "Enterprise RAG Platform",
        body: "Connect the systems your organisation already runs on and make them answerable.",
        icon: "Library",
        accent: "brass",
        bullets: [
          "SharePoint",
          "SAP",
          "Oracle",
          "Salesforce",
          "Microsoft 365",
          "Google Workspace",
          "Databases, Files & APIs",
        ],
      },
      {
        title: "BasinWright Data Hub",
        subtitle: "Unified Enterprise Data",
        body: "Bring structured, semi-structured and unstructured data into one governed plane.",
        icon: "Database",
        accent: "verdigris",
        bullets: [
          "Structured & Semi-Structured",
          "Unstructured",
          "Documents, Images, Video",
          "SQL & NoSQL",
          "Streams",
        ],
      },
      {
        title: "BasinWright Observe",
        subtitle: "Monitoring & Governance",
        body: "Trace every inference, cost centre and policy decision across the estate.",
        icon: "Activity",
        accent: "ember",
        bullets: [
          "Inference Tracing",
          "Cost Attribution",
          "Drift Detection",
          "Policy Enforcement",
          "Audit Export",
        ],
      },
      {
        title: "BasinWright Marketplace",
        subtitle: "Models, Agents & Extensions",
        body: "Procure vetted AI capability with commercial and compliance terms attached.",
        icon: "Store",
        accent: "slate",
        bullets: [
          "Vetted Publishers",
          "Private Listings",
          "Usage-based Terms",
          "One-click Deploy",
        ],
      },
    ],
  },

  /* ----------------------------------------------------------------- Choose */
  {
    key: "choose",
    kind: SectionKind.FEATURE_GRID,
    order: 8,
    meta: { anchor: "choose" },
    eyebrow: "Why enterprises choose BasinWright",
    title: "What you are actually buying",
    subtitle:
      "Most organisations putting AI into production end up with a generic platform that has no models in it, or a point solution that brings its own console and its own audit story. This is neither.",
    entries: [
      {
        title: "Buy outcomes",
        subtitle: "Not infrastructure",
        body: "We define the target metric with you and own the work of hitting it. You are not buying a workshop and a set of tools with the product still left to build.",
        icon: "LineChart",
        accent: "brass",
      },
      {
        title: "Runs on your cloud",
        subtitle: "Not ours",
        body: "Your tenancy, your region, your keys — or your own hardware behind your own firewall, with nothing leaving the perimeter.",
        icon: "Cloud",
        accent: "verdigris",
      },
      {
        title: "Deterministic and LLM",
        subtitle: "The right tool for every decision",
        body: "Reproducible models where a decision must be defensible under challenge; language models where the problem is genuinely language. Most delivered use cases are both.",
        icon: "Shapes",
        accent: "ember",
      },
      {
        title: "One governance model",
        subtitle: "Across every AI deployment",
        body: "One audit trail, one access model, one place to see what every model in the organisation is doing — instead of six vendors and six governance stories.",
        icon: "ShieldCheck",
        accent: "slate",
      },
      {
        title: "A catalogue, not a blank page",
        subtitle: "Reference implementations you tune",
        body: "Each shipping use case arrives as a working data pipeline, trained artifact, evaluation report and model card, ready to be calibrated on your data.",
        icon: "Library",
        accent: "brass",
      },
      {
        title: "Compliance mapped up front",
        subtitle: "Shortens vendor risk review",
        body: "Use cases ship with the regulatory frameworks they were designed against already mapped, and fairness controls standard on scoring models rather than on a roadmap.",
        icon: "Scale",
        accent: "verdigris",
      },
    ],
  },

  /* ------------------------------------------------------------- Deployment */
  {
    key: "deployment",
    kind: SectionKind.INFRASTRUCTURE,
    order: 9,
    meta: {
      anchor: "deployment",
      developer: [
        "Python",
        "Java",
        ".NET",
        "JavaScript",
        "REST APIs",
        "CLI",
        "Terraform",
        "GitHub",
      ],
    },
    eyebrow: "Deployment",
    title: "Wherever your policy allows it to run",
    subtitle:
      "Residency, sovereignty and blast radius are usually decided before the model is. Every option below runs the same platform, with the same governance.",
    entries: [
      { title: "Cloud", icon: "Cloud" },
      { title: "Hybrid", icon: "CloudCog" },
      { title: "On-premises", icon: "Server" },
      { title: "Sovereign", icon: "Shield" },
      { title: "Private GPU", icon: "Cpu" },
      { title: "Air-gapped", icon: "Lock" },
      { title: "Multi-cloud", icon: "Cloudy" },
      { title: "Edge", icon: "Radio" },
    ],
  },

  /* ----------------------------------------------------------- Integrations */
  {
    // The logo wall, finally carrying something true. It stood empty because
    // the eight customer names that used to be in it were invented; connectors
    // are a statement about our own software and can be checked by trying one.
    key: "integrations",
    kind: SectionKind.LOGO_WALL,
    order: 10,
    eyebrow: "Integrations",
    title: "Connected to the systems your business already runs on",
    entries: [
      { title: "Microsoft 365" },
      { title: "SAP" },
      { title: "Oracle" },
      { title: "Salesforce" },
      { title: "SharePoint" },
      { title: "Snowflake" },
      { title: "Databricks" },
      { title: "Kafka" },
      { title: "PostgreSQL" },
      { title: "ServiceNow" },
      { title: "Amazon S3" },
      { title: "Google Workspace" },
    ],
  },

  /* ---------------------------------------------------------------- Journey */
  {
    key: "journey",
    kind: SectionKind.FLOW,
    order: 11,
    meta: { anchor: "journey" },
    eyebrow: "Customer journey",
    title: "How you get from first conversation to enterprise-wide",
    subtitle:
      "Nobody should sign up for an enterprise AI programme. They should sign up for one outcome, and then decide.",
    body: "A shipping use case typically goes from kickoff to a governed, monitored endpoint in weeks rather than quarters.",
    entries: [
      {
        title: "AI assessment",
        body: "We look at the decision, the data behind it, and whether a model can honestly move the number.",
        icon: "Search",
        accent: "slate",
      },
      {
        title: "Pilot",
        body: "One use case, built on your data, measured against the target agreed at the start.",
        icon: "Rocket",
        accent: "brass",
      },
      {
        title: "Production",
        body: "Deployed into your tenancy, governed, instrumented — and owned by you.",
        icon: "ShieldCheck",
        accent: "verdigris",
      },
      {
        title: "Scale enterprise-wide",
        body: "The second use case lands in the same control plane as the first. So does the sixth.",
        icon: "Layers",
        accent: "ember",
      },
    ],
  },

  /* -------------------------------------------------------------------- CTA */
  {
    key: "cta",
    kind: SectionKind.CTA,
    order: 12,
    eyebrow: "Talk to us",
    title: "Let's identify your first AI outcome",
    subtitle:
      "Book a 60-minute enterprise AI discovery session. We will come back to you with what we found, whether or not it points at us.",
    ctaLabel: "Book discovery session",
    ctaHref: "#contact",
    ctaLabel2: "Talk to an architect",
    ctaHref2: "#contact",
    // The line beside the contact form. This used to be three claims about the
    // commercial terms; it is now what the session actually produces, which is
    // the only thing a reader at this point still wants to know.
    entries: [
      { title: "High-impact AI opportunities" },
      { title: "ROI potential" },
      { title: "Data readiness" },
      { title: "Recommended implementation roadmap" },
    ],
  },
];
