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

   The industry tier the problem cards link to lives at /industries, and the
   substrate simulation lives at /substrate — both are pages of their own rather
   than blocks here. The substrate used to run behind this hero, which meant the
   first thing a visitor met was a diagram of how the thing works, before they
   had been told what it is. It is a page people now reach on purpose.
--------------------------------------------------------------------------- */

export const homeSections: SectionSeed[] = [
  /* ------------------------------------------------------------------- Hero */
  {
    // The offer in one line: they are buying a result, and everything under it
    // — the training, the deployment, the monitoring — is ours to carry until
    // that result arrives. "Model-as-a-Service" names the commercial shape;
    // "delivered as an outcome" says what is actually being bought.
    key: "hero",
    kind: SectionKind.HERO,
    order: 0,
    eyebrow: "Model-as-a-Service",
    headlineLines: ["Model-as-a-Service,", "Delivered as an Outcome."],
    subtitle:
      "BasinWright gives enterprises the platform to build, govern, and scale AI with confidence.",
    // The line that says who and what. The headline and subtitle above it are
    // about the commercial shape of the thing and are deliberately abstract, so
    // this is the only chance the first screen gets to name a reader and a
    // problem they would recognise as theirs. Four problems, then the audience:
    // a visitor who leaves after eight seconds should still be able to say who
    // this is for and what it is pointed at.
    body: "Fraud loss, claims cycle time, procurement leakage, engineering knowledge — for regulated industries that need AI to be secure, explainable and sovereign.",
    ctaLabel: "Book an AI strategy session",
    ctaHref: "#contact",
    ctaLabel2: "See the substrate run live",
    ctaHref2: "/substrate",
    // No entries: the hero's four-tile band was replaced by the "stack" block
    // below, which says the same kind of thing with a heading over it and in
    // the site's own card language. The tiles had no section chrome at all and
    // read as a component borrowed from somewhere else.
  },

  /* ------------------------------------------------------------------ Stack */
  {
    // What the platform is made of, in the three layers a buyer already has a
    // budget line for — models, data, infrastructure. It is the first thing
    // after the hero because the hero's promise is abstract by design, and the
    // reader's next question is "made of what?".
    //
    // An ordinary FEATURE_GRID rather than a bespoke block: three cards in the
    // same panel, icon tile and measure as every other card on the site, so the
    // first screen and the twelfth are visibly the same website.
    key: "stack",
    kind: SectionKind.FEATURE_GRID,
    order: 1,
    meta: { anchor: "stack", columns: 3 },
    eyebrow: "The stack",
    title: "Stop managing fragmented infrastructure. Start directing outcomes.",
    subtitle:
      "Our AI agents connect your systems, automate work, and turn data into action from one secure interface.",
    entries: [
      {
        title: "AI Models",
        icon: "Boxes",
        accent: "brass",
        body: "Purpose-built, sovereign AI that understands your business. From open-weight models and voice AI to flexible integrations, we help you deploy intelligence that evolves with your organisation.",
      },
      {
        title: "Data Platform",
        icon: "Database",
        accent: "verdigris",
        body: "Turn raw data into governed, usable insight. We unify ingestion, processing, orchestration, APIs, and AI services into a secure data foundation built for action.",
      },
      {
        title: "Infrastructure",
        icon: "Cpu",
        accent: "ember",
        body: "The compute, performance, and resilience modern AI demands. From training and inference to storage, pipelines, and AI-native data centres, BasinWright provides infrastructure designed to scale.",
      },
    ],
  },

  /* ---------------------------------------------------------------- Product */
  {
    // Immediately after the hero, and deliberately so.
    //
    // "We build, fine-tune, deploy and monitor" is a sentence a consultancy
    // could write, and until this block existed a first-time reader had no way
    // to tell the difference. Everything above is what we do; this is the thing
    // it lands in — the console's own modules, drawn in the site's own tokens.
    //
    // The whole argument of the block is in the last line of the copy: the
    // sixth use case arrives where the first one did. That is what a platform
    // is, and it is the one claim a services firm cannot make.
    key: "product",
    kind: SectionKind.PRODUCT_CONSOLE,
    order: 2,
    meta: { anchor: "product", panel: "modules" },
    eyebrow: "The platform underneath",
    title: "You buy the outcome. You keep the platform that delivers it.",
    subtitle:
      "The work lands somewhere: a console you operate, with your models, your data connections, your deployments and your evidence in it. Not a slide pack and a handover call.",
    entries: [
      {
        title: "One control plane, every use case",
        body: "Fraud, claims, procurement and AI safety arrive in the same place, with one audit trail and one access model behind them — rather than six vendors and six governance stories.",
      },
      {
        title: "Driven by API, not just by console",
        body: "A REST API across the platform surface, Python and TypeScript SDKs, an OpenAI-compatible inference gateway that meters every call, and MCP so your models are reachable as tools. Anything you can click, you can automate.",
      },
      {
        title: "Yours to keep",
        body: "The estate runs in your tenancy under your keys, and what it produces — models, weights, governed corpora, decision history — stays inside it.",
      },
    ],
    ctaLabel: "Explore the platform",
    ctaHref: "/platform",
    ctaLabel2: "See it running",
    ctaHref2: "/substrate",
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
    order: 3,
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
    order: 4,
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

  /* ------------------------------------------------------------- Catalogue */
  {
    // The outcomes block above says what a business wants moved. This says what
    // exists to move it — and it is the second half of the argument the product
    // block starts, because a catalogue is the thing a services firm does not
    // have. Work that has been done once and can be done again is a product;
    // work that starts from a blank page every time is a rate card.
    //
    // Seven domains, no counts. The catalogue's size is a real number and a
    // moving one, and a figure in a headline goes stale in a way "across seven
    // domains" does not — the same reasoning that keeps traction figures off
    // the hero. What matters here is the shape: cross-industry domains that the
    // four industry cards further up do not cover, and the last card, which is
    // the whole point of the block.
    //
    // Four across: eight cards at three columns leaves an orphan.
    key: "catalogue",
    kind: SectionKind.FEATURE_GRID,
    order: 5,
    meta: { anchor: "catalogue", columns: 4 },
    eyebrow: "What you can buy",
    title: "A catalogue of use cases, each bought for a number",
    subtitle:
      "Some ship today as reference implementations — a working data pipeline, a trained artifact, an evaluation report and a model card, ready to be tuned on your data. Others are fully specified designs we build to order. We tell you plainly which is which and scope the difference honestly.",
    entries: [
      {
        title: "Core fintech & customer intelligence",
        icon: "Shield",
        accent: "slate",
        body: "Real-time fraud scoring, churn risk, lifetime value and behavioural authentication.",
        bullets: ["Cut fraud loss without more false declines"],
      },
      {
        title: "Credit, capital & regulatory risk",
        icon: "LineChart",
        accent: "brass",
        body: "IFRS 9 ECL, Basel IRB capital, application scorecards and transaction monitoring.",
        bullets: ["Numbers that survive challenge"],
      },
      {
        title: "Insurance",
        icon: "Umbrella",
        accent: "verdigris",
        body: "Automated underwriting, claims triage, fraud-ring detection and loss reserving.",
        bullets: ["Shorter claims cycle time"],
      },
      {
        title: "Procurement & supply chain",
        icon: "ShoppingCart",
        accent: "ember",
        body: "Spend anomalies, supplier risk, three-way match, tender extraction and spend classification.",
        bullets: ["Recover leaked spend"],
      },
      {
        title: "AI security & LLM safety",
        icon: "ShieldAlert",
        accent: "ember",
        body: "Injection, leakage, poisoning and agentic-abuse detection for your own GenAI stack.",
        bullets: ["Ship GenAI that passes risk review"],
      },
      {
        title: "Knowledge & GenAI",
        icon: "MessageSquare",
        accent: "verdigris",
        body: "Grounded assistants and routing over your own document estate, with citations.",
        bullets: ["Answers with sources, not guesses"],
      },
      {
        title: "GPU-served & sovereign",
        icon: "Cpu",
        accent: "slate",
        body: "On-premises embeddings, self-hosted LLM assistants and domain classifiers.",
        bullets: ["Nothing leaves your perimeter"],
      },
      {
        title: "Not in the catalogue?",
        icon: "Wrench",
        accent: "brass",
        body: "Custom model development is a productised service, not a research project: the same authoring pipeline, the same governance, the same delivery discipline.",
        bullets: ["Scoped to an outcome like everything else"],
      },
    ],
  },

  /* -------------------------------------------------------------------- How */
  {
    key: "how",
    kind: SectionKind.FLOW,
    order: 6,
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
    order: 7,
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
    order: 8,
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
    order: 9,
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
    order: 10,
    meta: { anchor: "choose" },
    eyebrow: "Why enterprises choose BasinWright",
    title: "What you are actually buying",
    subtitle:
      "Most organisations putting AI into production end up with a generic platform that has no models in it, or a point solution that brings its own console and its own audit story. This is neither: you are buying a target metric, the work of hitting it, and everything that work produces.",
    // Six cards, and six is not incidental — the grid runs three across only on
    // a multiple of three, and a seventh card would drop the whole block to two
    // columns with an orphan on the end.
    //
    // Ownership leads. It is the sharpest thing we say and the hardest for a
    // platform vendor to answer, and it used to appear on this page only as the
    // closing line of the substrate simulation — which now lives at /substrate.
    // "Buy outcomes, not infrastructure" left this list when it did: the hero
    // says exactly that, twice the size, and the block's own subtitle carries
    // what is left of the point.
    entries: [
      {
        title: "You own what we build",
        subtitle: "And the exit is written first",
        body: "The model, the weights, the governed corpora it learned from and every decision it has made sit inside your estate throughout. Leaving is us stopping work rather than you extracting anything — and which artefacts transfer, in what format and on what cadence is agreed in writing before the first deployment.",
        icon: "Lock",
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

  /* ------------------------------------------------------------------ Proof */
  {
    // Six confident claims sit directly above this block, and until now the
    // page gave a sceptical reader nothing to test them against: no logos, no
    // case studies, no numbers, and no route to the reading that does exist.
    //
    // We are early and have no customer stories, so the evidence offered is the
    // design work itself — which is also the only kind we can stand behind. The
    // block says so in its own subtitle rather than letting the cards imply
    // customers we do not have. Cards come from the reference deployments; the
    // link goes to the whole library, whitepapers and engineering notes
    // included.
    key: "proof",
    kind: SectionKind.DOC_LIST,
    order: 11,
    meta: { anchor: "proof", collection: "reference-deployments", limit: 3 },
    eyebrow: "Worked designs",
    title: "Judge the thinking before you believe the claims",
    subtitle:
      "There is no wall of customer logos here, because we are early and would rather say so. What there is instead is the design work: the problem shape, the architecture we would propose for it, and what we would expect to be measured against afterwards.",
    ctaLabel: "Everything we have published",
    ctaHref: "/resources",
  },

  /* ------------------------------------------------------------- Deployment */
  {
    key: "deployment",
    kind: SectionKind.INFRASTRUCTURE,
    order: 12,
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
    order: 13,
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
    order: 14,
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
    order: 15,
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
