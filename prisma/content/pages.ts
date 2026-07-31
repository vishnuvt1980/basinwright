import { SectionKind } from "@prisma/client";

import type { PageSeed } from "./types";

/* ---------------------------------------------------------------------------
   Editorial pages.

   Each page is a shell (title, eyebrow, subtitle, SEO) plus ordered section
   blocks. Section `key` values are globally unique, so they are prefixed with
   the page slug.

   The blocks available here are the general-purpose ones — PROSE,
   FEATURE_GRID, STAT_BAND, TIMELINE, FAQ, LINK_LIST, DOC_LIST, CALLOUT,
   CONTACT — plus anything the homepage uses, since the renderer does not care
   which page a block sits on.
--------------------------------------------------------------------------- */

export const pages: PageSeed[] = [
  /* -------------------------------------------------------------- Resources */
  {
    slug: "resources",
    title: "The library",
    eyebrow: "Resources",
    subtitle:
      "Worked designs, whitepapers, engineering notes and explainers — the reasoning behind the platform, and how we would build on it.",
    seoDescription:
      "BasinWright resources: reference deployments, whitepapers, engineering notes, learning articles and platform release notes.",
    order: 5,
    sections: [
      {
        key: "resources-cases",
        kind: SectionKind.DOC_LIST,
        order: 0,
        eyebrow: "Reference deployments",
        title: "How we would build it, and why",
        subtitle:
          "Worked designs rather than customer stories — the problem shape, the architecture, and what we would measure afterwards.",
        ctaLabel: "All reference deployments",
        ctaHref: "/reference-deployments",
        meta: { collection: "reference-deployments", limit: 3 },
      },
      {
        key: "resources-whitepapers",
        kind: SectionKind.DOC_LIST,
        order: 1,
        eyebrow: "Whitepapers",
        title: "The long-form arguments",
        ctaLabel: "All whitepapers",
        ctaHref: "/whitepapers",
        meta: { collection: "whitepapers", limit: 3 },
      },
      {
        key: "resources-research",
        kind: SectionKind.DOC_LIST,
        order: 2,
        eyebrow: "Engineering notes",
        title: "Why the platform works the way it does",
        subtitle: "Mechanisms and the measurements that would test them, with the assumptions stated.",
        ctaLabel: "All engineering notes",
        ctaHref: "/research",
        meta: { collection: "research", limit: 3 },
      },
      {
        key: "resources-learning",
        kind: SectionKind.DOC_LIST,
        order: 3,
        eyebrow: "Learning Centre",
        title: "Explainers for people who have to decide something",
        ctaLabel: "All articles",
        ctaHref: "/learn",
        meta: { collection: "learn", limit: 3 },
      },
      {
        key: "resources-blog",
        kind: SectionKind.DOC_LIST,
        order: 4,
        eyebrow: "Blog",
        title: "From the agents doing the work",
        ctaLabel: "All posts",
        ctaHref: "/blog",
        meta: { collection: "blog", limit: 3 },
      },
      {
        key: "resources-releases",
        kind: SectionKind.DOC_LIST,
        order: 5,
        eyebrow: "Platform",
        title: "What changed recently",
        ctaLabel: "All release notes",
        ctaHref: "/release-notes",
        meta: { collection: "release-notes", limit: 2 },
      },
      {
        key: "resources-developers",
        kind: SectionKind.CALLOUT,
        order: 6,
        eyebrow: "Developers",
        title: "Documentation lives in the developer portal",
        subtitle:
          "API reference, SDKs, the CLI, the Terraform provider and working samples are versioned against your platform release. Access is included with every paid subscription.",
        ctaLabel: "Open the developer portal",
        ctaHref: "https://app.basinwright.com/docs",
        ctaLabel2: "See pricing",
        ctaHref2: "/pricing",
      },
    ],
  },

  /* ------------------------------------------------------------------ About */
  {
    slug: "about",
    title: "We build the intelligence. You own it.",
    eyebrow: "About BasinWright",
    subtitle:
      "BasinWright builds, deploys and operates enterprise AI estates inside our customers' own infrastructure — and then hands them the keys.",
    seoDescription:
      "BasinWright builds, deploys and runs enterprise AI estates inside customer infrastructure. Who we are, how we work, and why ownership is the product.",
    order: 0,
    sections: [
      {
        // The name, before the argument. "BasinWright" is two pieces of
        // vocabulary a reader is unlikely to hold at once, and until this block
        // existed the page assumed both — which meant the one word a visitor
        // has already read four times went unexplained.
        key: "about-name",
        kind: SectionKind.PROSE,
        order: 0,
        eyebrow: "The name",
        title: "What is BasinWright?",
        body: `A wright builds complete working systems. A basin of attraction is where a system naturally settles into a stable outcome. BasinWright reshapes how your organisation operates so better outcomes do not just happen once—they hold.`,
      },
      {
        key: "about-position",
        kind: SectionKind.PROSE,
        order: 1,
        eyebrow: "The position",
        title: "Most enterprise AI is rented. That is the problem.",
        body: `The standard arrangement in this market is that a vendor holds the model, the pipeline, the evaluation suite and the operating knowledge, and the customer holds a contract. It works until the customer wants to change something — a provider, a region, a price, a vendor — and discovers that three years of accumulated capability was never theirs to move.

We build the other kind. The estate runs in your tenancy, in your region, under your keys. The weights, the governed corpora, the evaluation suites, the pipeline definitions, the runbooks and the decision history are your assets, available continuously rather than on termination.

We still do the hard part. We build it, we deploy it, and we watch it every hour of every day — drift, accuracy, latency, cost — and retrain it before it reaches a decision that matters. That is the work, and it is what we would rather compete on than on how painful leaving is.

A customer who could leave next quarter and does not is telling you something real. A customer who cannot leave is telling you nothing at all.`,
      },
      {
        // This was a "by the numbers" band — regions, models served, uptime,
        // GPU hours. We are early and had none of those numbers, so it is now
        // a statement of where we are. A company that publishes its stage is
        // easier to trust than one that publishes someone else's metrics.
        key: "about-stage",
        kind: SectionKind.PROSE,
        order: 2,
        eyebrow: "Where we are",
        title: "Early, and saying so",
        body: `BasinWright is a startup. We do not have a wall of customer logos, a region count, or a case study with a percentage on it, and this site used to imply otherwise — so we took those claims down rather than soften them.

What we do have is a platform, a clear position on who should own an AI estate, and a set of designs we can defend in detail. The [reference deployments](/reference-deployments) are worked designs rather than customer stories, and they say so at the top of every page. The [whitepapers](/whitepapers) and [engineering notes](/research) are arguments and mechanisms, not results.

If you are evaluating us, the honest summary is this: judge the thinking and the architecture, ask us hard questions about the parts that are not built yet, and hold us to the exit terms rather than to a reference call we cannot yet give you.`,
      },
      {
        key: "about-how",
        kind: SectionKind.FEATURE_GRID,
        order: 3,
        eyebrow: "How we work",
        title: "Four commitments, in the order they matter",
        subtitle:
          "These are not values on a wall. Each one changes something concrete about how an engagement runs.",
        entries: [
          {
            title: "The data layer comes first",
            body: "Entity resolution, survivorship rules and lineage before any model work. It does not demo, and it is the difference between a decision you can defend and one you cannot.",
            icon: "Database",
            accent: "brass",
            bullets: ["Governed records", "Quarantine with real rejects", "Record-level lineage"],
          },
          {
            title: "Evaluation gates the release",
            body: "Your risk function owns the suite, and the suite can block a promotion. If it has never failed a release, it is a report rather than a gate.",
            icon: "Microscope",
            accent: "verdigris",
            bullets: ["Owned by the risk owner", "Failure-weighted", "Blocks promotion"],
          },
          {
            title: "Everything leaves a trace",
            body: "Every decision carries its trigger, evidence, lineage, model versions, policy gate and outcome, retained like the business record it belongs to.",
            icon: "Activity",
            accent: "ember",
            bullets: ["Queryable", "Audit pack export", "Retained to record schedule"],
          },
          {
            title: "The exit is written first",
            body: "Before the first deployment, we agree in writing which artefacts transfer, in what format, on what cadence — and we test the restoration annually.",
            icon: "Lock",
            accent: "slate",
            bullets: ["Artefact inventory", "Open formats", "Tested restoration"],
          },
        ],
      },
      {
        key: "about-timeline",
        kind: SectionKind.TIMELINE,
        order: 4,
        eyebrow: "History",
        // A dated company history with customer milestones stood here. None of
        // it had happened. What replaces it is the argument itself, which is
        // the thing a reader is actually trying to evaluate.
        title: "What we think, in order",
        entries: [
          {
            badge: "01",
            title: "The data layer decides everything above it",
            body: "Entity resolution, survivorship rules and lineage before any model work. It does not demo, and it is the difference between a decision you can defend and one you cannot.",
          },
          {
            badge: "02",
            title: "The decision is the unit of work",
            body: "Not the alert, the ticket or the document. Once a decision is a first-class object with its evidence attached, audit becomes a query and your own history becomes training data.",
          },
          {
            badge: "03",
            title: "Evidence quorum beats a confidence score",
            body: "Retrieval, deterministic constraint checks and reasoning, each independent, agreeing before anything consequential happens. Self-reported confidence is a property of the output, not of the evidence.",
          },
          {
            badge: "04",
            title: "A gate that has never failed a release is not a gate",
            body: "The evaluation suite belongs to the risk owner, not to the team shipping the model, and blocking a promotion has to be a normal outcome rather than an incident.",
          },
          {
            badge: "05",
            title: "Oversight has to survive volume",
            body: "Approval queues degrade into rubber stamps on a predictable schedule. Put humans at the policy boundary and on a blind sample, and measure whether the control is still real in month eighteen.",
          },
          {
            badge: "06",
            title: "You should be able to leave",
            body: "Weights, corpora, evaluation suites, pipeline definitions and decision history are yours, available continuously rather than on termination. A customer who could leave and does not is telling you something real.",
          },
        ],
      },
      {
        key: "about-reading",
        kind: SectionKind.DOC_LIST,
        order: 5,
        eyebrow: "Read further",
        title: "The arguments behind the product",
        meta: { collection: "whitepapers", limit: 3 },
      },
      {
        key: "about-next",
        kind: SectionKind.LINK_LIST,
        order: 6,
        eyebrow: "Elsewhere",
        title: "Where to go next",
        entries: [
          {
            title: "Careers",
            subtitle: "We are hiring across platform, data and applied evaluation",
            href: "/careers",
            icon: "Users",
          },
          {
            title: "Partners",
            subtitle: "Delivery, technology and ISV tracks with real accreditation",
            href: "/partners",
            icon: "Handshake",
          },
          {
            title: "Trust Centre",
            subtitle: "Certifications, subprocessors and the security position",
            href: "/trust",
            icon: "ShieldCheck",
          },
          {
            title: "Reference deployments",
            subtitle: "Worked designs for the problems we are built for",
            href: "/reference-deployments",
            icon: "Building2",
          },
        ],
      },
      {
        key: "about-cta",
        kind: SectionKind.CONTACT,
        order: 7,
        eyebrow: "Talk to us",
        title: "Start with one decision",
        subtitle:
          "Bring us a decision your organisation makes repeatedly, and we will tell you honestly what the data layer underneath it looks like.",
      },
    ],
  },

  /* --------------------------------------------------------------- Partners */
  {
    slug: "partners",
    title: "Partners who can deliver this properly",
    eyebrow: "Partner network",
    subtitle:
      "Three tracks — delivery, technology and ISV — with accreditation that involves assessed work rather than a slide deck.",
    seoDescription:
      "The BasinWright partner programme: delivery partners, technology partners and ISVs, with assessed accreditation and joint reference architectures.",
    order: 1,
    sections: [
      {
        key: "partners-intro",
        kind: SectionKind.PROSE,
        order: 0,
        eyebrow: "Why the bar is where it is",
        title: "A partner-delivered estate carries our name in someone's risk register",
        body: `The failure modes in this work are not obvious to teams whose experience is in conventional systems integration. Survivorship rules that look reasonable and are wrong. A quarantine lane that becomes a landfill. An approval queue that turns into a rubber stamp in ten weeks. An evaluation suite that has never failed anything.

None of those are visible in a demo, and all of them surface in month nine.

So accreditation involves assessed work on a reference estate rather than a certification exam, it is time-limited, and it is renewed against the current platform. Partners tell us this is more demanding than the equivalent programmes they hold. That is deliberate.`,
      },
      {
        key: "partners-tracks",
        kind: SectionKind.FEATURE_GRID,
        order: 1,
        eyebrow: "Three tracks",
        title: "Where you fit",
        entries: [
          {
            title: "Delivery partners",
            subtitle: "Systems integrators and consultancies",
            body: "Design and deliver BasinWright estates for customers, with accreditation at architect and engineer levels covering the platform, the governed data layer and the operating model.",
            icon: "Building2",
            accent: "brass",
            bullets: [
              "Assessed accreditation",
              "Reference estate access",
              "Joint delivery on first engagements",
              "Named platform contact",
            ],
          },
          {
            title: "Technology partners",
            subtitle: "Data, security, observability and industry software",
            body: "Products that join the estate. We co-engineer the connector, publish a joint reference architecture, and test it against each platform release.",
            icon: "Network",
            accent: "verdigris",
            bullets: [
              "Co-engineered connectors",
              "Joint reference architecture",
              "Release compatibility testing",
              "Marketplace listing",
            ],
          },
          {
            title: "Independent software vendors",
            subtitle: "Models, agents and extensions",
            body: "Publish to the Marketplace with commercial terms, data handling position and evaluation results attached to the listing in a standard form.",
            icon: "Store",
            accent: "slate",
            bullets: [
              "Vetted publication",
              "Usage-based commercial terms",
              "Private listings for enterprise customers",
              "Evaluation on our harness",
            ],
          },
        ],
      },
      {
        // A stat band with partner, engineer and listing counts stood here.
        // The programme is new and had none of them.
        key: "partners-stage",
        kind: SectionKind.PROSE,
        order: 2,
        eyebrow: "Where the programme is",
        title: "New, and looking for the first few",
        body: `The programme is open and the cohorts are small. We are not going to quote a partner count, because the honest one is low and a low number stated plainly is worth more to you than a padded one.

What that means practically: the first partners get disproportionate access. Joint delivery on early engagements is not a perk we are advertising, it is how we intend to work while the accreditation material is still being proven against real projects. Expect us to be in the room.`,
      },
      {
        key: "partners-faq",
        kind: SectionKind.FAQ,
        order: 3,
        eyebrow: "Questions",
        title: "How the programme works",
        entries: [
          {
            title: "What does accreditation involve?",
            body: "Partner engineers complete assessed work on a reference estate: entity resolution with survivorship rules, an evaluation suite that gates promotion, agent tool design with scoped permissions, and an incident exercise. It is graded by our delivery organisation, and it is possible to not pass.",
          },
          {
            title: "How long does it take?",
            body: "Typically six to ten weeks per engineer alongside normal work, and cohorts run quarterly. Architect-level accreditation requires prior engineer-level accreditation and a delivered engagement.",
          },
          {
            title: "Does accreditation expire?",
            body: "Yes. Certification is valid for eighteen months and renewed against the current platform. Renewal is shorter than initial accreditation and focuses on what has changed.",
          },
          {
            title: "Can partners resell the platform?",
            body: "Delivery partners can transact platform capacity on behalf of customers. The ownership position does not change: the customer owns the artefacts, not the partner and not us.",
          },
          {
            title: "What support do partners get on a first engagement?",
            body: "Joint delivery. A BasinWright architect works on the engagement alongside the partner team, with a defined handover point. We would rather do that than read about it later.",
          },
          {
            title: "How do ISV listings get vetted?",
            body: "We check the provenance of any model weights, licence compatibility, the data handling claims, and run a baseline evaluation on our own harness. Listings that make claims we cannot substantiate are not published.",
          },
        ],
      },
      {
        key: "partners-apply",
        kind: SectionKind.CALLOUT,
        order: 4,
        eyebrow: "Applications open",
        title: "Apply to the partner programme",
        subtitle:
          "Tell us which track fits, where you operate, and what you have delivered. Accreditation cohorts run quarterly.",
        ctaLabel: "Talk to the partner team",
        ctaHref: "/#contact",
        ctaLabel2: "Read the platform documentation",
        ctaHref2: "https://app.basinwright.com/docs",
      },
      {
        key: "partners-cases",
        kind: SectionKind.DOC_LIST,
        order: 5,
        eyebrow: "The work",
        title: "What a delivered estate looks like",
        meta: { collection: "reference-deployments", limit: 3 },
      },
    ],
  },

  /* ---------------------------------------------------------------- Careers */
  {
    slug: "careers",
    title: "Work on the part that is actually hard",
    eyebrow: "Careers",
    subtitle:
      "Entity resolution over thirty-year-old systems of record. Evaluation suites that can stop a release. Agents with real authority. Estates that have to keep running when we are not there.",
    seoDescription:
      "Careers at BasinWright — platform engineering, data engineering, applied evaluation, delivery and sovereign programmes.",
    order: 2,
    sections: [
      {
        key: "careers-intro",
        kind: SectionKind.PROSE,
        order: 0,
        eyebrow: "The work",
        title: "Most of it is not model work, and that is the point",
        body: `If you want to spend your time on prompt engineering, this is the wrong place. The interesting problems here are further down.

Working out which of four systems is authoritative for a customer's legal name, and getting someone to own that decision. Designing a tool contract that a model uses correctly ten thousand times a day and that a risk function can read. Building an evaluation suite that will block a release your own colleagues want to ship. Standing up an air-gapped estate in a country where the answer to "can you just download that" is no.

The engagements are long, the systems are real, and the consequences are visible. Several of our customers make decisions on this platform that materially affect people's money, health or livelihood, which is a reason to be careful rather than a reason to be slow.`,
      },
      {
        key: "careers-life",
        kind: SectionKind.FEATURE_GRID,
        order: 1,
        eyebrow: "How it works here",
        title: "What you can expect",
        entries: [
          {
            title: "Customer estates, not internal demos",
            body: "Engineers work on production systems inside customer infrastructure. You will meet the people who use what you build, and you will hear about it when it is wrong.",
            icon: "Building2",
            accent: "brass",
          },
          {
            title: "Long engagements",
            body: "Typical delivery engagements run twelve to thirty months. You see the second year, which is where the interesting failure modes live.",
            icon: "Clock",
            accent: "verdigris",
          },
          {
            title: "Written decisions",
            body: "Architectural choices are written down with the trade-offs and the alternatives rejected. It slows the first week and saves the second year.",
            icon: "FileText",
            accent: "slate",
          },
          {
            title: "On-call that is staffed properly",
            body: "We intend to run estates for regulated customers, which means a rota. It is compensated and it is capped. We are small enough that cover is a real constraint rather than a solved problem, and we would rather say so than describe a follow-the-sun rota we do not yet have.",
            icon: "Activity",
            accent: "ember",
          },
          {
            title: "Time on the craft",
            body: "One day a fortnight on tooling, internal platform work, research or writing. It is scheduled rather than encouraged, because unscheduled time does not survive a delivery deadline.",
            icon: "Wrench",
            accent: "brass",
          },
          {
            title: "Remote, with reasons to travel",
            body: "Most roles are remote within the region. Sovereign programme roles are on-site by necessity, and delivery roles involve customer time — typically a week a month.",
            icon: "Globe",
            accent: "verdigris",
          },
        ],
      },
      {
        key: "careers-roles",
        kind: SectionKind.LINK_LIST,
        order: 2,
        eyebrow: "Open roles",
        title: "Where we are hiring",
        subtitle:
          "Applications go to the recruiting team directly. If nothing here fits and you think it should, write anyway.",
        entries: [
          {
            title: "Senior Data Engineer — Entity Resolution",
            subtitle: "London · Frankfurt · Remote (EU)",
            badge: "Data",
            body: "Resolution pipelines over enterprise systems of record, survivorship design, and quarantine remediation at estate scale.",
            href: "mailto:careers@basinwright.com?subject=Senior%20Data%20Engineer%20%E2%80%94%20Entity%20Resolution",
            icon: "Database",
          },
          {
            title: "Staff Engineer — Agent Runtime",
            subtitle: "Remote (EU / UK)",
            badge: "Platform",
            body: "Tool contracts, permission scoping, policy gate enforcement and the trace store that everything downstream reads.",
            href: "mailto:careers@basinwright.com?subject=Staff%20Engineer%20%E2%80%94%20Agent%20Runtime",
            icon: "Bot",
          },
          {
            title: "Applied Evaluation Researcher",
            subtitle: "London · Remote (UK)",
            badge: "Research",
            body: "Failure-weighted evaluation suites, rubric design, and measurement against real workloads rather than public benchmarks.",
            href: "mailto:careers@basinwright.com?subject=Applied%20Evaluation%20Researcher",
            icon: "Microscope",
          },
          {
            title: "Platform Engineer — Compute",
            subtitle: "Frankfurt · Remote (EU)",
            badge: "Platform",
            body: "Accelerator scheduling, multi-node training fabric, preemptible trough workloads and capacity planning.",
            href: "mailto:careers@basinwright.com?subject=Platform%20Engineer%20%E2%80%94%20Compute",
            icon: "Cpu",
          },
          {
            title: "Delivery Architect — Financial Services",
            subtitle: "London · Singapore",
            badge: "Delivery",
            body: "Own the architecture of customer estates end to end, from the governed record to the decision path, alongside the customer's own teams.",
            href: "mailto:careers@basinwright.com?subject=Delivery%20Architect%20%E2%80%94%20Financial%20Services",
            icon: "Landmark",
          },
          {
            title: "Sovereign Programme Engineer",
            subtitle: "On-site · Southeast Asia",
            badge: "Sovereign",
            body: "Air-gapped estates, offline supply chains, capability transfer to local teams. Requires eligibility for national clearance.",
            href: "mailto:careers@basinwright.com?subject=Sovereign%20Programme%20Engineer",
            icon: "Shield",
          },
          {
            title: "Governance & Assurance Lead",
            subtitle: "London · Remote (UK / EU)",
            badge: "Governance",
            body: "Policy gate design with customer risk functions, blind-sample programmes, audit pack readiness and regulator engagement.",
            href: "mailto:careers@basinwright.com?subject=Governance%20%26%20Assurance%20Lead",
            icon: "Scale",
          },
          {
            title: "Customer Engineer — Agents",
            subtitle: "Remote (EU / UK / SG)",
            badge: "Delivery",
            body: "Take agent deployments from shadow mode to staged live, and own the escalation envelope with the customer's operations team.",
            href: "mailto:careers@basinwright.com?subject=Customer%20Engineer%20%E2%80%94%20Agents",
            icon: "Headset",
          },
        ],
      },
      {
        key: "careers-faq",
        kind: SectionKind.FAQ,
        order: 3,
        eyebrow: "Hiring",
        title: "How the process runs",
        entries: [
          {
            title: "What are the stages?",
            body: "An introductory call, a technical conversation about work you have actually done, a practical exercise on a realistic problem, and a conversation with the team you would join. Four stages, usually within three weeks.",
          },
          {
            title: "Is there a take-home exercise?",
            body: "Yes, and it is capped at three hours with the scope written to fit. We pay for it. If a candidate tells us it took longer, we treat that as feedback on the exercise rather than on the candidate.",
          },
          {
            title: "Do you hire people without AI experience?",
            body: "Frequently. Strong distributed systems, data engineering or regulated-industry backgrounds transfer well, and the platform-specific knowledge is teachable. What does not transfer easily is judgement about production systems with consequences.",
          },
          {
            title: "What does the clearance requirement mean?",
            body: "Sovereign programme roles require eligibility for national security clearance in the relevant country, which usually means citizenship and residency requirements. Eligibility is assessed before an offer; the clearance itself takes months and we sponsor it.",
          },
          {
            title: "How much travel is there?",
            body: "Platform and research roles: occasional, a few times a year. Delivery roles: typically one week a month at customer sites. Sovereign programme roles: on-site as the default.",
          },
        ],
      },
      {
        key: "careers-cta",
        kind: SectionKind.CALLOUT,
        order: 4,
        eyebrow: "Nothing quite right?",
        title: "Write to us anyway",
        subtitle:
          "Tell us what you have built and what you want to work on. We read everything, and roles open more often than this page is updated.",
        ctaLabel: "careers@basinwright.com",
        ctaHref: "mailto:careers@basinwright.com",
        ctaLabel2: "Read about how we work",
        ctaHref2: "/about",
      },
    ],
  },

  /* ----------------------------------------------------------------- Support */
  {
    slug: "support",
    title: "Support",
    eyebrow: "Help & support",
    subtitle:
      "Documentation and reference live in the developer portal. Everything else — incidents, architecture, escalation — comes through the channels below.",
    seoDescription:
      "BasinWright support: severity definitions, response targets, escalation paths, and where to find documentation and status.",
    order: 3,
    sections: [
      {
        key: "support-channels",
        kind: SectionKind.FEATURE_GRID,
        order: 0,
        eyebrow: "Getting help",
        title: "Four ways in, depending on what has happened",
        entries: [
          {
            title: "Production incident",
            subtitle: "Any severity",
            body: "Raise through the console or the on-call number in your runbook. Severity 1 pages the duty engineer immediately and opens a bridge.",
            icon: "ShieldAlert",
            accent: "ember",
            bullets: ["Named incident commander", "Written post-incident review", "Cover agreed per engagement"],
          },
          {
            title: "Technical support",
            subtitle: "Business hours, per region",
            body: "Configuration, integration behaviour, unexpected results and performance questions. Raised in the console with the trace id attached.",
            icon: "Headset",
            accent: "brass",
            bullets: ["In-console ticketing", "Trace-linked cases", "Regional coverage"],
          },
          {
            title: "Architecture and change",
            subtitle: "Your named architect",
            body: "Anything about how the estate should be built or changed: capacity, routing policy, evaluation design, agent envelopes, new use cases.",
            icon: "Building2",
            accent: "verdigris",
            bullets: ["Named contact", "Quarterly estate review", "Change planning"],
          },
          {
            title: "Documentation and reference",
            subtitle: "Developer portal",
            body: "API reference, SDKs, CLI, Terraform provider, migration guides and code samples. Access is included with any paid subscription.",
            icon: "Library",
            accent: "slate",
            bullets: ["Subscription required", "Versioned per release", "Migration guides"],
          },
        ],
      },
      {
        key: "support-severity",
        kind: SectionKind.PROSE,
        order: 1,
        eyebrow: "Severity",
        title: "What each level means and what we commit to",
        body: `Severity is set by impact, not by how the ticket is worded. If you believe a case is mis-classified, say so on the ticket and it is re-triaged — we would rather over-classify than argue.

| Severity | Definition |
| --- | --- |
| Sev 1 | Production decision path unavailable, or producing incorrect outcomes |
| Sev 2 | Significant degradation with a workaround, or a single workload down |
| Sev 3 | Component impaired, no material business impact |
| Sev 4 | Question, guidance, or feature request |

**On response times.** This page previously published a table of contractual response targets across every tier. We are a small team and we are not going to publish a 24×7 commitment we cannot yet staff.

What we will do is agree response and escalation terms in writing as part of an engagement, sized to what the estate actually needs and to what we can actually honour. If round-the-clock cover is a hard requirement for you, raise it in the first conversation rather than the contract review — it is a real constraint on us today and you should know that before you invest time.

Every Sev 1 receives a written post-incident review including the trace evidence, the contributing causes and the actions taken. That one is not tier-dependent and is shared whether or not you ask.`,
      },
      {
        key: "support-selfserve",
        kind: SectionKind.LINK_LIST,
        order: 2,
        eyebrow: "Self-serve",
        title: "Before you raise a ticket",
        entries: [
          {
            title: "Platform status",
            subtitle: "Live status and incident history by region",
            href: "https://app.basinwright.com/status",
            icon: "Activity",
          },
          {
            title: "Documentation",
            subtitle: "Guides, tutorials and platform concepts · subscription required",
            href: "https://app.basinwright.com/docs",
            icon: "Library",
          },
          {
            title: "API reference",
            subtitle: "Endpoints, schemas and error taxonomy · subscription required",
            href: "https://app.basinwright.com/docs/api",
            icon: "Code2",
          },
          {
            title: "Release notes",
            subtitle: "What changed, what is deprecated, and when it is removed",
            href: "/release-notes",
            icon: "Rocket",
          },
          {
            title: "Learning Centre",
            subtitle: "Explainers on retrieval, evaluation, routing and cost",
            href: "/learn",
            icon: "GraduationCap",
          },
          {
            title: "Trust Centre",
            subtitle: "Certifications, subprocessors and security documentation",
            href: "/trust",
            icon: "ShieldCheck",
          },
        ],
      },
      {
        key: "support-faq",
        kind: SectionKind.FAQ,
        order: 3,
        eyebrow: "Common questions",
        title: "Answers we give often",
        entries: [
          {
            title: "Why do I need a subscription to read the documentation?",
            body: "The developer portal is part of the product rather than marketing material. It carries the API reference, SDKs, the Terraform provider, migration guides and working samples against a live environment, and it is versioned against the platform release your estate runs. Access is included with every paid tier, including Starter once a workspace is created.",
          },
          {
            title: "Something changed in the output and nothing changed in my code.",
            body: "Check the route in the trace. A capability-class route can resolve to a different model when a provider deprecates one or when an evaluation gate rejects a version. Every routing decision is recorded with its reason — that is the first place to look, and it resolves most of these cases without a ticket.",
          },
          {
            title: "How do I get a decision explained to an auditor or a customer?",
            body: "Use the audit pack export from the trace store. Filter to the decisions in scope and export; the pack contains the trigger, the evidence with record-level lineage, the constraint checks, the policy gate, the model versions and the outcome. It is designed to be handed over as-is.",
          },
          {
            title: "Our evaluation suite is blocking a promotion we need.",
            body: "That is the suite working. The override path exists and runs through your own risk owner rather than through us — we can tell you what failed and why, and we will not promote a version over a failing hard gate on your behalf.",
          },
          {
            title: "Can we get support in our own language and time zone?",
            body: "Support is in English today. We are a small team in a small number of time zones, so cover outside them is agreed per engagement rather than offered as standard — ask before you assume it. Sovereign estates with cleared-personnel requirements are supported by the on-site team for that programme.",
          },
        ],
      },
      {
        key: "support-contact",
        kind: SectionKind.CONTACT,
        order: 4,
        eyebrow: "Still stuck",
        title: "Talk to a person",
        subtitle:
          "If you are not yet a customer, or you do not know which channel you need, start here and we will route it.",
      },
    ],
  },

  /* ------------------------------------------------------------ Trust Centre */
  {
    slug: "trust",
    title: "Trust Centre",
    eyebrow: "Security, compliance & privacy",
    subtitle:
      "Certifications, the security position, subprocessors, and the documents your risk function will ask for.",
    seoDescription:
      "BasinWright Trust Centre: the security controls we actually operate, our certification status, subprocessors and data handling position.",
    order: 4,
    sections: [
      {
        key: "trust-position",
        kind: SectionKind.PROSE,
        order: 0,
        eyebrow: "The position",
        title: "Your data does not train anything you did not ask for",
        body: `Customer data is used to serve the customer's own workloads and to train the customer's own models. It is never used to train models for anyone else, it is never pooled across customers, and there is no arrangement under which it could be.

Estates are deployed in the customer's own tenancy by default. Where a customer uses our multi-tenant serving path, workloads are logically isolated, and dedicated or in-tenancy deployment is available for anything that cannot be.

Encryption is applied in transit and at rest throughout. Bring-your-own-key is available on Enterprise and Sovereign tiers, which means we can be locked out of a customer's data by the customer, unilaterally.

The one thing we ask risk functions to look at closely is retention. Trace records are retained to match the underlying business record — often years, not the shorter default that log infrastructure assumes — because that is what makes a decision defensible eighteen months later. Retention periods are configurable and set by the customer.`,
      },
      {
        // This was a grid of certifications marked "Certified". We hold none
        // of them yet. Stating a certification you do not have is the single
        // most damaging thing on a page like this: it is checkable, and the
        // person checking is the one deciding whether to buy.
        key: "trust-certifications",
        kind: SectionKind.PROSE,
        order: 1,
        eyebrow: "Certifications",
        title: "What we hold today: nothing yet",
        body: `BasinWright holds no third-party security or AI-management certifications at the time of writing. Not ISO/IEC 27001, not ISO/IEC 42001, not SOC 2. An earlier version of this page said otherwise; that was wrong and it has been corrected.

We are telling you this on the page where a risk function looks first, rather than letting it surface in a questionnaire, because the second version costs you a week and costs us the deal.

**Where we are.** The controls below are implemented and can be evidenced. The formal audit programme is planned rather than complete, and we will not put a date on it here until it is booked — a projected certification date is the same category of claim as a projected certification.

**What that means for you.** If your procurement process requires a current SOC 2 or ISO 27001 certificate as a gate, we do not pass it today. Say so early and we will not waste your time. If your process allows a control-level review with contractual commitments, that we can do properly, and the [Terms](/terms) and DPA are the place those commitments get written down.`,
      },
      {
        key: "trust-controls",
        kind: SectionKind.FEATURE_GRID,
        order: 2,
        eyebrow: "Controls",
        title: "What is actually implemented",
        subtitle:
          "Each of these can be demonstrated in an assessment. None of them is a certification, and we are not presenting them as one.",
        entries: [
          {
            title: "Encryption and key control",
            body: "In transit and at rest throughout. Bring-your-own-key is supported, which means a customer can lock us out of their own data unilaterally.",
            icon: "Lock",
            accent: "brass",
            bullets: ["TLS in transit", "Encrypted at rest", "BYOK supported"],
          },
          {
            title: "Tenancy and isolation",
            body: "Estates deploy into the customer's own tenancy by default. Where a shared serving path is used, workloads are logically isolated and dedicated deployment is available.",
            icon: "Building2",
            accent: "verdigris",
            bullets: ["Customer tenancy", "Dedicated endpoints", "Air-gapped option"],
          },
          {
            title: "Access and break-glass",
            body: "Role-based access with logged administrative actions. Our own access to a customer estate requires customer approval, is time-bound, and is written to the customer's own trace store.",
            icon: "ShieldCheck",
            accent: "slate",
            bullets: ["RBAC", "Customer-approved", "Time-bound", "Logged where you can see it"],
          },
          {
            title: "Training data position",
            body: "Customer data trains the customer's models and nothing else. It is not pooled across customers and there is no arrangement under which it could be.",
            icon: "Database",
            accent: "azure",
            bullets: ["No cross-customer pooling", "No third-party training"],
          },
          {
            title: "Residency enforcement",
            body: "Routing enforces residency per request from attributes on the request. A route carrying a localisation constraint fails rather than falling back to a non-compliant endpoint.",
            icon: "Globe",
            accent: "verdigris",
            bullets: ["Per-request", "Fails closed"],
          },
          {
            title: "Audit trail",
            body: "Every decision carries its trigger, evidence with record-level lineage, model versions, policy gate and outcome, retained to match the underlying business record.",
            icon: "Activity",
            accent: "ember",
            bullets: ["Queryable", "Audit pack export", "Customer-set retention"],
          },
        ],
      },
      {
        key: "trust-docs",
        kind: SectionKind.LINK_LIST,
        order: 3,
        eyebrow: "Documents",
        title: "What your risk function will want",
        subtitle:
          "Some of these are public. The rest are available under NDA — ask your named architect, or use the contact form below.",
        entries: [
          {
            title: "Subprocessor register",
            subtitle: "Current subprocessors by function and region · public",
            href: "https://app.basinwright.com/trust/subprocessors",
            icon: "Users",
          },
          {
            title: "Data processing agreement",
            subtitle: "Standard DPA including SCCs · public",
            href: "https://app.basinwright.com/trust/dpa",
            icon: "FileText",
          },
          {
            title: "Security architecture overview",
            subtitle: "Network, identity, encryption and isolation model · under NDA",
            href: "https://app.basinwright.com/trust/security-architecture",
            icon: "Shield",
          },
          {
            title: "Security questionnaires",
            subtitle: "CAIQ, SIG and most bespoke bank formats · completed on request",
            href: "/#contact",
            icon: "FileText",
          },
          {
            title: "Privacy Statement",
            subtitle: "How we handle personal data on this site and in the platform",
            href: "/privacy",
            icon: "Lock",
          },
        ],
      },
      {
        key: "trust-faq",
        kind: SectionKind.FAQ,
        order: 4,
        eyebrow: "Security questions",
        title: "The ones we are asked most",
        entries: [
          {
            title: "Do you train on our data?",
            body: "We train your models on your data. We do not train anything else on it, we do not pool it with other customers' data, and there is no arrangement under which we could. Where a workload uses a third-party hosted model, that provider's terms are stated on the route and zero-retention terms are used where available.",
          },
          {
            title: "Where is our data processed?",
            body: "In the regions you configure. Routing enforces residency per request from attributes on the request, and routes carrying a localisation or sovereignty constraint fail rather than falling back when no compliant endpoint is available. That failure behaviour is the default and is deliberate.",
          },
          {
            title: "Can you access our estate?",
            body: "Only through a break-glass path that requires customer approval, is time-bound, and is logged to your own trace store where you can see it. On bring-your-own-key deployments you can revoke our access unilaterally and we cannot restore it.",
          },
          {
            title: "What happens to our data if we leave?",
            body: "The artefacts are already yours and already exported continuously — weights, corpora, the entity graph, evaluation suites, pipeline definitions and decision history. On termination the estate keeps running; there is no data to hand back because it was never only in our custody.",
          },
          {
            title: "How do you handle vulnerabilities?",
            body: "Coordinated disclosure through security@basinwright.com, with acknowledgement within one business day. Critical vulnerabilities affecting customer estates are notified to affected customers within 24 hours of confirmation, with the mitigation and the timeline.",
          },
          {
            title: "Do you use subprocessors?",
            body: "Yes, and the register is public. Changes are notified 30 days in advance, and customers on Enterprise and Sovereign tiers can object. Sovereign estates use no subprocessors outside the host jurisdiction.",
          },
        ],
      },
      {
        key: "trust-contact",
        kind: SectionKind.CONTACT,
        order: 5,
        eyebrow: "Security review",
        title: "Send us your questionnaire",
        subtitle:
          "We complete standard security questionnaires — CAIQ, SIG and most bespoke bank formats — and we would rather do that than have you infer answers from this page.",
      },
    ],
  },

  /* ----------------------------------------------------------------- Privacy */
  {
    slug: "privacy",
    title: "Privacy Statement",
    eyebrow: "Legal",
    subtitle:
      "How BasinWright handles personal data on this website, in the platform, and in the course of delivering an engagement.",
    seoDescription:
      "The BasinWright Privacy Statement: what personal data we process, why, on what lawful basis, how long we keep it and your rights.",
    order: 20,
    sections: [
      {
        key: "privacy-body",
        kind: SectionKind.PROSE,
        order: 0,
        body: `*Last updated 1 July 2026. This statement is provided as an example of the document structure this site's CMS produces and should be reviewed by your own counsel before publication.*

## Who we are

BasinWright is the controller for personal data described in the "This website" and "Recruitment" sections below. Where we operate a platform estate on behalf of a customer, that customer is the controller and BasinWright is the processor, acting on documented instructions under the data processing agreement between us.

## This website

We process the following when you use basinwright.com.

**Information you give us.** Name, work email address, company, role, and anything you write in a contact form, a chat conversation or a demo configuration. We use it to respond to you and, where you have asked us to, to follow up about our services. Lawful basis: legitimate interests in responding to business enquiries, and consent where marketing follow-up applies.

**Chat conversations.** Messages exchanged with the assistant on this site are retained so we can answer follow-up questions and improve the assistant. Do not put confidential information or personal data about third parties into it.

**Demo configurations.** If you configure the interactive console — the industry, systems and decisions you select — that configuration is stored alongside your enquiry, because it is the most useful thing we have for preparing a relevant conversation.

**Technical data.** Standard server logs including IP address, user agent and requested paths, retained for security and diagnostics. We do not use advertising cookies or third-party analytics trackers on this site.

Retention: enquiry records for 24 months from last contact; chat conversations for 12 months; server logs for 90 days.

## The platform

Where BasinWright operates an estate for a customer, personal data within that estate is processed on the customer's instructions under the data processing agreement.

- Customer data is used to serve the customer's own workloads and to train the customer's own models. It is not used to train models for any other party and is not pooled across customers.
- Sub-processing is limited to the published subprocessor register, with 30 days notice of change.
- Data is processed in the regions the customer configures. Routes carrying a residency constraint fail rather than falling back to a non-compliant endpoint.
- Retention within an estate is configured by the customer, and trace records are typically retained to match the underlying business record.

Data subject requests relating to platform data should be directed to the customer as controller. We support customers in fulfilling them within the timelines the agreement specifies.

## Recruitment

Applications, CVs, interview notes and assessment results are processed to evaluate candidates. Lawful basis: steps prior to entering a contract, and legitimate interests in maintaining a record of hiring decisions.

Unsuccessful applicants' data is retained for 12 months so we can contact you about later roles, unless you ask us not to.

## International transfers

Where personal data is transferred outside its country of origin, we rely on adequacy decisions where they exist and on standard contractual clauses otherwise, with a transfer impact assessment on file. Sovereign estates do not transfer data outside the host jurisdiction.

## Your rights

Depending on your jurisdiction you may have the right to access, correct, delete, restrict or object to processing of your personal data, and to receive it in a portable form. Where we rely on consent you can withdraw it at any time.

To exercise a right, write to privacy@basinwright.com. We respond within one month and will tell you if we need longer. You also have the right to complain to your local data protection authority.

## Security

Encryption in transit and at rest, role-based access control, and logged administrative access. We hold no third-party security certification at the time of writing — the [Trust Centre](/trust) sets out exactly which controls are implemented and where the audit programme stands.

## Changes

Material changes to this statement are notified to customers in advance through the account contact, and the revision date above is updated on every change.

## Contact

privacy@basinwright.com — or write to the data protection contact named in your agreement.`,
      },
    ],
  },

  /* ------------------------------------------------------------------- Terms */
  {
    slug: "terms",
    title: "Terms of Service",
    eyebrow: "Legal",
    subtitle:
      "The terms that apply to use of basinwright.com, the developer portal and the BasinWright platform.",
    seoDescription:
      "BasinWright Terms of Service covering the website, developer portal subscriptions, platform use, customer ownership of artefacts and liability.",
    order: 21,
    sections: [
      {
        key: "terms-body",
        kind: SectionKind.PROSE,
        order: 0,
        body: `*Last updated 1 July 2026. This document is provided as an example of the structure this site's CMS produces and should be reviewed by your own counsel before publication. Where a signed master agreement exists between BasinWright and a customer, that agreement prevails over these terms.*

## 1. Scope

These terms govern use of basinwright.com, the developer portal at app.basinwright.com, and the BasinWright platform where no separate signed agreement applies. By creating an account or using the services you accept them.

## 2. Accounts and subscriptions

Access to the developer portal — documentation, API reference, SDKs, the CLI, the Terraform provider and code samples — requires an active subscription. Subscriptions are per organisation, and credentials may not be shared outside it.

You are responsible for activity under your credentials, for keeping them secure, and for notifying us promptly of any suspected compromise.

## 3. Acceptable use

You may not use the services to:

- break any applicable law, or to infringe anyone's rights;
- attempt to circumvent access controls, rate limits or isolation boundaries;
- generate material that facilitates serious harm, including weapons development, targeted harassment or the sexual exploitation of children;
- present model output as human-authored where doing so is deceptive and materially affects someone's decisions;
- benchmark or resell the services without our written agreement.

We may suspend access where use presents an immediate risk to the platform, to other customers or to third parties. Where we do, we will tell you why and what would restore it.

## 4. Your data and your artefacts

You retain all rights in the data you provide.

You own the artefacts derived from it: model weights trained or tuned on your data, prepared training corpora, the resolved entity graph, evaluation suites, pipeline and agent definitions, and the decision history your estate produces. These are made available to you continuously in open, documented formats — not only on termination.

We do not use your data to train models for any other party, and we do not pool it across customers.

## 5. Our intellectual property

We retain all rights in the platform itself: the control plane, the runtime, tooling, documentation and any base model weights we have licensed from third parties. Nothing in these terms transfers those rights, and the ownership position in clause 4 does not extend to them.

## 6. Third-party models and services

Some workloads are served by third-party model providers. The applicable provider terms are stated on the route and in the documentation. Where zero-retention terms are available from a provider we use them by default; where they are not, the position is stated before you can route to that provider.

## 7. Service levels and support

Service level commitments, severity definitions and response targets are as published on the [Support](/support) page for standard tiers, or as set out in your agreement. Starter tier is provided without a service level commitment.

## 8. Fees

Fees are as quoted at purchase. Usage-based charges are billed in arrears; committed capacity is billed in advance. Fees exclude taxes. Overdue amounts may attract interest at the statutory rate.

## 9. Changes to the services

We may change the services, and we publish material changes in the [release notes](/release-notes). Deprecations are announced with the replacement and a removal date on the release that announces them, with a minimum of six months before removal for anything with a stable interface.

## 10. Term and termination

Subscriptions run for the term selected and renew unless cancelled before the renewal date. Either party may terminate for material breach not cured within 30 days of written notice.

On termination, your artefacts remain yours. Because they are made available continuously under clause 4, there is no export window to run against — but we will assist with a final transfer on request for 90 days after termination.

## 11. Warranties and disclaimers

We warrant that we will provide the services with reasonable skill and care, in accordance with the documentation, and in compliance with applicable law.

Model outputs are probabilistic. We do not warrant that any output is accurate, complete or fit for a particular purpose, and you are responsible for the controls you place around outputs used in consequential decisions. Except as expressly stated, the services are provided without further warranties to the extent permitted by law.

## 12. Liability

Neither party excludes liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be excluded.

Subject to that, neither party is liable for indirect or consequential loss, or for loss of profit, revenue, goodwill or anticipated savings. Each party's total liability in any twelve month period is limited to the fees paid or payable in that period.

## 13. Confidentiality

Each party will protect the other's confidential information with at least the care it applies to its own, and use it only to perform under these terms. This survives termination for three years, and indefinitely for anything that is a trade secret.

## 14. Governing law

These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction, without prejudice to any mandatory rights you have in your country of residence.

## 15. Contact

legal@basinwright.com`,
      },
    ],
  },
];
