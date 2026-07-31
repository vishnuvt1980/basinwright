import { SectionKind } from "@prisma/client";

import type { PageSeed } from "./types";

/* ---------------------------------------------------------------------------
   The industry tier — the second level of the site.

   The homepage argues that we sell outcomes rather than infrastructure. These
   pages are where that has to be paid for: a CIO who believes the argument
   arrives here next, and what they want is evidence that we know their
   business, not ours.

   So the use cases on these pages are the real catalogue entries, taken from
   `src/lib/industries.ts` — the same table that drives the substrate
   configurator on the homepage. Anything a visitor reads here they can watch
   run in the console. That is deliberate: a use case we cannot simulate is a
   use case we should not be listing.

   Slugs nest — "industries/insurance" renders at /industries/insurance through
   the route at app/(site)/industries/[industry]. The index page is a plain
   "industries" slug and is served by the normal /[slug] route.
--------------------------------------------------------------------------- */

/// Shared closing block. Every industry page ends the same way, and writing it
/// four times is how the four drift apart.
const contactBlock = (slug: string, subtitle: string) => ({
  key: `industries-${slug}-cta`,
  kind: SectionKind.CONTACT,
  order: 5,
  eyebrow: "Talk to us",
  title: "Start with one decision",
  subtitle,
});

/// Likewise the reading list. Reference deployments are worked designs rather
/// than customer stories — the collection carries a standing notice saying so,
/// which is why it is safe to point at from a sales page.
const readingBlock = (slug: string) => ({
  key: `industries-${slug}-reading`,
  kind: SectionKind.DOC_LIST,
  order: 4,
  eyebrow: "Worked designs",
  title: "How we would build it",
  subtitle:
    "Reference deployments: a problem shape, the design we would propose for it, and what we would expect to be measured afterwards.",
  ctaLabel: "All reference deployments",
  ctaHref: "/reference-deployments",
  meta: { collection: "reference-deployments", limit: 3 },
});

export const industryPages: PageSeed[] = [
  /* ------------------------------------------------------------ The index */
  {
    slug: "industries",
    title: "Built for the industries where a wrong decision is expensive",
    eyebrow: "Industries",
    subtitle:
      "Regulated sectors have the same problem in four costumes: decisions made repeatedly, at volume, on evidence nobody can assemble fast enough. These are the four we are built around.",
    seoTitle: "Industries",
    seoDescription:
      "Enterprise AI for insurance, banking, manufacturing and energy — purpose-built models on your own data, governed and monitored against the outcome.",
    order: 6,
    sections: [
      {
        key: "industries-index-cards",
        kind: SectionKind.FEATURE_GRID,
        order: 0,
        eyebrow: "Where we go deep",
        title: "Four industries, and the decisions inside them",
        subtitle:
          "Each of these has a catalogue behind it — real use cases with the systems they read from and the metric they move.",
        entries: [
          {
            title: "Insurance",
            href: "/industries/insurance",
            icon: "Umbrella",
            accent: "brass",
            body: "Claims cycle time, premium leakage, underwriting consistency, and reserves that have to survive challenge.",
            bullets: [
              "FNOL severity",
              "Organised claim rings",
              "Subrogation recovery",
              "Underwriting drift",
              "Catastrophe response",
            ],
          },
          {
            title: "Banking & financial services",
            href: "/industries/banking",
            icon: "Landmark",
            accent: "verdigris",
            body: "Fraud loss without false declines, AML alerts worth an investigator's hour, and a reason code on every credit decline.",
            bullets: [
              "AML alert triage",
              "Authorised push payment fraud",
              "Covenant breach",
              "Intraday liquidity",
              "KYC refresh",
            ],
          },
          {
            title: "Manufacturing",
            href: "/industries/manufacturing",
            icon: "Factory",
            accent: "ember",
            body: "Engineering knowledge locked inside documents, quality evidence spread across systems, and production signals nobody reads in time.",
            bullets: [
              "Yield drift",
              "Failure forecasting",
              "Supplier quality",
              "Engineering change",
              "Warranty clusters",
            ],
          },
          {
            title: "Energy, oil & gas",
            href: "/industries/energy",
            icon: "Fuel",
            accent: "slate",
            body: "Spend leaking through specification mismatches and long-lead items, and vendor evaluations that take weeks of engineering time.",
            bullets: [
              "Long-lead expediting",
              "Single-source exposure",
              "Stranded spares",
              "Certificate mismatch",
              "Demurrage risk",
            ],
          },
        ],
      },
      {
        // The wider list. These are sectors the platform serves without a
        // dedicated catalogue behind them yet, and saying so plainly is better
        // than four more pages with nothing underneath.
        key: "industries-index-grid",
        kind: SectionKind.INDUSTRIES,
        order: 1,
        eyebrow: "Also deployed in",
        title: "The platform is not sector-specific. The models are.",
        subtitle:
          "The control plane, the governance model and the deployment options are the same everywhere. What changes per sector is the catalogue on top — and outside the four above, that is built to order.",
        entries: [
          { title: "Financial Services", icon: "Landmark" },
          { title: "Insurance", icon: "Umbrella" },
          { title: "Government", icon: "Building2" },
          { title: "Healthcare", icon: "HeartPulse" },
          { title: "Manufacturing", icon: "Factory" },
          { title: "Retail", icon: "ShoppingBag" },
          { title: "Energy", icon: "Zap" },
          { title: "Oil & Gas", icon: "Fuel" },
          { title: "Telecommunications", icon: "RadioTower" },
          { title: "Education", icon: "GraduationCap" },
          { title: "Transportation", icon: "Train" },
          { title: "Defence", icon: "Shield" },
        ],
      },
      {
        key: "industries-index-custom",
        kind: SectionKind.PROSE,
        order: 2,
        eyebrow: "Not on the list",
        title: "Custom model development is a product, not a research project",
        body: "If the decision you want moved is not in a catalogue above, the work is the same shape: we scope the outcome with you, build to it on the same authoring pipeline, deploy it under the same governance, and monitor it like everything else.\n\nWhat we will not do is take the brief and come back with a research proposal. Either a model can move the number on the data you have, or it cannot — and we would rather tell you which at the start than bill you to find out.",
      },
      {
        key: "industries-index-cta",
        kind: SectionKind.CONTACT,
        order: 3,
        eyebrow: "Talk to us",
        title: "Bring us a decision your organisation makes repeatedly",
        subtitle:
          "We will tell you honestly what the data underneath it looks like, whether a model can move it, and what a realistic target would be.",
      },
    ],
  },

  /* --------------------------------------------------------------- Insurance */
  {
    slug: "industries/insurance",
    title: "Insurance",
    eyebrow: "Industries",
    subtitle:
      "Accelerate claims. Detect fraud. Improve underwriting. Reserve with confidence — on numbers that survive an actuary, an auditor and a regulator in the same week.",
    seoTitle: "AI for insurance",
    seoDescription:
      "Purpose-built AI for claims, fraud, underwriting and reserving — trained on your book, deployed inside your boundary, and defensible under challenge.",
    order: 7,
    sections: [
      {
        key: "industries-insurance-problem",
        kind: SectionKind.PROSE,
        order: 0,
        eyebrow: "The problem",
        title: "The book is decided one case at a time, and nobody can see it whole",
        body: "An insurer makes the same handful of decisions hundreds of times a day. What reserve to open. Whether this claim looks like the last one that turned out to be organised. Whether the risk just bound sits inside appetite. Whether the loss that came in last month should have been ceded.\n\nEach of those decisions is made by somebody with part of the evidence. The photographs are in the adjuster's file, the exposure is in the cat model, the fee schedule is in a system the claims handler does not open, and the treaty is a PDF. The decision is not wrong because the people are wrong — it is wrong because assembling the evidence takes longer than the decision is allowed to take.\n\nThat is the shape of problem a model is genuinely good at, and it is why the answer has to be **explainable rather than merely accurate**. A severity score with no contributing factors does not survive a file review, and a fraud flag with no evidence trail does not survive a complaint.",
      },
      {
        key: "industries-insurance-usecases",
        kind: SectionKind.FEATURE_GRID,
        order: 1,
        eyebrow: "Use cases",
        title: "Where models earn their place",
        subtitle:
          "Each of these is a catalogue entry with a trained reference implementation behind it — and each is one you can watch run in the console on our homepage.",
        entries: [
          {
            title: "FNOL severity",
            subtitle: "Claims",
            icon: "Umbrella",
            accent: "brass",
            body: "First-notice photographs and text contradict the adjuster's opening reserve, and the gap is only found at closure.",
            bullets: ["Cycle time", "Reserve accuracy", "Reopen rate"],
          },
          {
            title: "Organised claim rings",
            subtitle: "Fraud",
            icon: "ShieldAlert",
            accent: "ember",
            body: "Claims that share a repair shop, a clinic and a phone number across postcodes — invisible one file at a time, obvious as a graph.",
            bullets: ["Fraud loss", "Referral precision", "Investigator hours"],
          },
          {
            title: "Missed subrogation",
            subtitle: "Recovery",
            icon: "Gavel",
            accent: "verdigris",
            body: "Third-party liability sits in the loss report in plain language and is never pursued, because nobody read the report as data.",
            bullets: ["Recovery rate", "Leakage", "Time to referral"],
          },
          {
            title: "Underwriting drift",
            subtitle: "Portfolio",
            icon: "LineChart",
            accent: "slate",
            body: "Bound risk quietly exceeds the appetite the cat model was calibrated against, one acceptable exception at a time.",
            bullets: ["Exposure vs appetite", "Rate adequacy", "Consistency"],
          },
          {
            title: "Medical bill leakage",
            subtitle: "Workers' compensation",
            icon: "HeartPulse",
            accent: "brass",
            body: "Billed codes exceed the fee schedule across hundreds of lines, at a volume no human review will ever reach.",
            bullets: ["Paid vs schedule", "Leakage recovered", "Review coverage"],
          },
          {
            title: "Catastrophe response",
            subtitle: "Event",
            icon: "Zap",
            accent: "ember",
            body: "A storm track crosses thousands of in-force policies, and the question is which ones to contact first, today.",
            bullets: ["Time to first contact", "Reserve accuracy", "Adjuster allocation"],
          },
        ],
      },
      {
        key: "industries-insurance-systems",
        kind: SectionKind.INFRASTRUCTURE,
        order: 2,
        eyebrow: "Connected to",
        title: "The systems your book already lives in",
        subtitle:
          "Read at query time through governed connectors. None of it is copied into a vendor database — the platform holds metadata, your data stays in your systems.",
        entries: [
          { title: "Policy administration", icon: "FileText" },
          { title: "Claims & FNOL", icon: "Inbox" },
          { title: "Adjuster documents", icon: "Library" },
          { title: "Telematics & IoT", icon: "Radio" },
          { title: "Bureau & rating data", icon: "Newspaper" },
          { title: "Finance & general ledger", icon: "Landmark" },
          { title: "Medical & clinical records", icon: "HeartPulse" },
          { title: "Reinsurance treaties", icon: "Handshake" },
        ],
      },
      {
        key: "industries-insurance-governance",
        kind: SectionKind.PROSE,
        order: 3,
        eyebrow: "Governance",
        title: "The ground you have to stand on",
        body: "Use cases arrive with the frameworks they were designed against already mapped, which is what shortens a model-validation cycle rather than lengthening it:\n\n- **IFRS 17** and **Solvency II** for reserving, capital and the numbers that carry an actuarial signature\n- **NAIC model bulletins** on the use of AI systems by insurers\n- **EU AI Act**, **NIST AI RMF** and **ISO 42001** for the governance of the model estate itself\n- **GDPR** and **PDPA** for the personal and medical data these models necessarily read\n\nFairness controls — approval-rate and error-rate parity — are standard on scoring models rather than a roadmap item, and every scoring model carries reason codes natively. That matters anywhere a declined claim or a rated-up renewal has to be explained to the person on the other end of it.",
      },
      readingBlock("insurance"),
      contactBlock(
        "insurance",
        "Bring us one claims or underwriting decision you make hundreds of times a month, and we will tell you what the evidence behind it actually looks like.",
      ),
    ],
  },

  /* ----------------------------------------------------------------- Banking */
  {
    slug: "industries/banking",
    title: "Banking & financial services",
    eyebrow: "Industries",
    subtitle:
      "Reduce fraud. Improve AML yield. Increase credit accuracy. Meet regulatory expectations — with a reason code on every decision and an evidence trail behind every alert.",
    seoTitle: "AI for banking and financial services",
    seoDescription:
      "Purpose-built AI for fraud, AML, credit and regulatory risk — deterministic where it must be defensible, deployed inside your own boundary.",
    order: 8,
    sections: [
      {
        key: "industries-banking-problem",
        kind: SectionKind.PROSE,
        order: 0,
        eyebrow: "The problem",
        title: "The models are not the hard part. Defending them is.",
        body: "Every bank already has scorecards, alert engines and thresholds. The difficulty is rarely building another model — it is that the ones in production generate more work than they resolve, and the ones that would resolve more work cannot get through model risk.\n\nAn AML engine that raises twelve hundred alerts on one corridor, of which almost all have historically been false, is not a detection problem. It is a triage problem, and triage is a ranking task with an evidence requirement attached. Equally, a fraud model that cuts loss by declining more good customers has not helped anybody; the constraint is the false-decline rate, not the catch rate.\n\nSo the useful question for a bank is not *can a model do this* but **can this model be explained to somebody whose job is to doubt it** — a validator under SR 11-7, an investigator writing up a case, a customer entitled to know why they were declined.",
      },
      {
        key: "industries-banking-usecases",
        kind: SectionKind.FEATURE_GRID,
        order: 1,
        eyebrow: "Use cases",
        title: "Where models earn their place",
        subtitle:
          "Deterministic where the decision has to be reproducible under challenge; language models where the problem is genuinely reading a document. Most of these are both.",
        entries: [
          {
            title: "AML alert triage",
            subtitle: "Financial crime",
            icon: "ShieldAlert",
            accent: "verdigris",
            body: "Alert storms on a single corridor, overwhelmingly false, ranked so the investigator's hour goes to the case that deserves it.",
            bullets: ["Alerts per SAR", "Investigator hours", "Detection coverage"],
          },
          {
            title: "Authorised push payment fraud",
            subtitle: "Payments",
            icon: "TrendingUp",
            accent: "ember",
            body: "A new, mule-linked beneficiary and an amount far off the customer's baseline — decided in the payment window, not afterwards.",
            bullets: ["Fraud loss", "False declines", "Decision latency"],
          },
          {
            title: "Covenant breach",
            subtitle: "Credit",
            icon: "FileText",
            accent: "brass",
            body: "Leverage running above covenant for consecutive quarters, buried in a reporting pack nobody reads until the relationship manager is told.",
            bullets: ["Time to detection", "Watchlist accuracy", "Provision timing"],
          },
          {
            title: "Card dispute backlog",
            subtitle: "Operations",
            icon: "Inbox",
            accent: "slate",
            body: "Merchant evidence contradicts the chargeback claim, across a backlog measured in hundreds of claims per analyst.",
            bullets: ["Cycle time", "Write-off rate", "Recovery"],
          },
          {
            title: "Intraday liquidity",
            subtitle: "Treasury",
            icon: "Activity",
            accent: "ember",
            body: "A nostro buffer projected to breach in the afternoon, forecast in the morning while there is still something to do about it.",
            bullets: ["Buffer breaches", "Forecast error", "Funding cost"],
          },
          {
            title: "KYC refresh",
            subtitle: "Onboarding & CDD",
            icon: "Users",
            accent: "verdigris",
            body: "A registry filing changes the ultimate beneficial owner, and the periodic review is eleven months away.",
            bullets: ["Refresh latency", "Coverage", "Manual review load"],
          },
        ],
      },
      {
        key: "industries-banking-systems",
        kind: SectionKind.INFRASTRUCTURE,
        order: 2,
        eyebrow: "Connected to",
        title: "The systems the decisions already live in",
        subtitle:
          "Read at query time through governed connectors, with credentials sealed per tenant. Your data does not move into a vendor database to be modelled.",
        entries: [
          { title: "Core banking", icon: "Landmark" },
          { title: "Payment rails", icon: "Network" },
          { title: "Card processor", icon: "ShoppingBag" },
          { title: "KYC & due diligence", icon: "Users" },
          { title: "Sanctions & PEP lists", icon: "Shield" },
          { title: "Data warehouse", icon: "Database" },
          { title: "Credit bureau feeds", icon: "LineChart" },
          { title: "Treasury & ALM", icon: "Activity" },
        ],
      },
      {
        key: "industries-banking-governance",
        kind: SectionKind.PROSE,
        order: 3,
        eyebrow: "Governance",
        title: "Built to be challenged",
        body: "Where a decision has to be reproducible and defensible, the model is deterministic by design — scorecards, gradient-boosted classifiers, anomaly detectors, survival and time-series models, graph networks and regulatory calculation engines. The same input gives the same output, the attribution is mathematical, and a model-risk team can take it apart without calling us.\n\nThe frameworks these were designed against ship mapped with them:\n\n- **SR 11-7** and **TRIM** model-risk expectations, with validation workflows and versioned configuration\n- **Basel III/IV** and **IFRS 9** for capital, provisioning and the numbers behind them\n- **BCBS 239** for risk data aggregation and lineage\n- **FATCA/CRS**, **MiFID II** and **MAR** where the obligation is reporting and conduct\n- **EU AI Act**, **NIST AI RMF** and **ISO 42001** across the model estate itself\n\nAdverse-action reason codes are native to every scoring model — which is not a feature so much as a legal precondition anywhere a declined applicant has a right to an explanation.",
      },
      readingBlock("banking"),
      contactBlock(
        "banking",
        "Bring us a threshold you cannot move because nobody can defend the model behind it. That is usually the fastest place to start.",
      ),
    ],
  },

  /* ----------------------------------------------------------- Manufacturing */
  {
    slug: "industries/manufacturing",
    title: "Manufacturing",
    eyebrow: "Industries",
    subtitle:
      "Engineering knowledge. Quality documentation. Production intelligence. Supplier collaboration — answers grounded in your own drawings, lots and process history.",
    seoTitle: "AI for manufacturing",
    seoDescription:
      "Purpose-built AI for yield, quality, maintenance and supplier performance — grounded in your MES, PLM and quality systems, deployed on your own infrastructure.",
    order: 9,
    sections: [
      {
        key: "industries-manufacturing-problem",
        kind: SectionKind.PROSE,
        order: 0,
        eyebrow: "The problem",
        title: "The plant already knows. It just cannot say it in time.",
        body: "A manufacturer is unusually well instrumented and unusually badly served by it. The historian has the vibration signature that preceded the last two bearing failures. The quality system has the lot that drifted. The PLM has the change order that obsoletes stock already committed. The warranty data has the build week that is about to become a campaign.\n\nAll of it is recorded. Almost none of it is connected, and the connection is the entire value. A scrap rate that moves three points against an unchanged recipe is not a mystery — it is a question whose answer is spread across four systems and two file shares, and the shift that could have acted on it ended six hours ago.\n\nThe second problem is language. A significant part of what a manufacturer knows is written down in drawings, specifications, deviation reports and supplier correspondence — **documents, not rows** — and that is precisely where retrieval grounded in your own corpus earns its keep, provided every answer arrives with the passage it came from.",
      },
      {
        key: "industries-manufacturing-usecases",
        kind: SectionKind.FEATURE_GRID,
        order: 1,
        eyebrow: "Use cases",
        title: "Where models earn their place",
        subtitle:
          "Time-series and anomaly models on the process side, grounded retrieval on the document side, and most of the useful ones combining the two.",
        entries: [
          {
            title: "Yield drift",
            subtitle: "Process",
            icon: "LineChart",
            accent: "ember",
            body: "Scrap moving against an unchanged recipe, caught as a signal rather than as a month-end variance.",
            bullets: ["Scrap rate", "Time to detection", "First-pass yield"],
          },
          {
            title: "Failure forecasting",
            subtitle: "Maintenance",
            icon: "Wrench",
            accent: "brass",
            body: "A vibration signature that matches the pattern preceding prior failures, with hours of warning rather than none.",
            bullets: ["Unplanned downtime", "MTBF", "Maintenance cost"],
          },
          {
            title: "Supplier quality drift",
            subtitle: "Inbound",
            icon: "Truck",
            accent: "verdigris",
            body: "Defect rate climbing across consecutive lots from one tier-two supplier, before it reaches the line.",
            bullets: ["PPM defect rate", "Line stoppages", "Supplier scorecard"],
          },
          {
            title: "Engineering change in flight",
            subtitle: "PLM",
            icon: "FileText",
            accent: "slate",
            body: "A change order that obsoletes stock already committed to live orders, surfaced against the commitments rather than in isolation.",
            bullets: ["Obsolescence write-off", "Change cycle time", "Order impact"],
          },
          {
            title: "Warranty clusters",
            subtitle: "Field",
            icon: "ShieldAlert",
            accent: "ember",
            body: "Field failures tracing back to a single station's drift in one build week, found before it becomes a campaign.",
            bullets: ["Warranty cost", "Campaign scope", "Time to root cause"],
          },
          {
            title: "Engineering knowledge",
            subtitle: "Documents",
            icon: "Library",
            accent: "brass",
            body: "Specifications, deviations and supplier correspondence made answerable — with citations, not confident guesses.",
            bullets: ["Search time", "Reuse of prior art", "Onboarding time"],
          },
        ],
      },
      {
        key: "industries-manufacturing-systems",
        kind: SectionKind.INFRASTRUCTURE,
        order: 2,
        eyebrow: "Connected to",
        title: "The systems the plant already runs on",
        subtitle:
          "Historians, execution systems and document stores, read where they are. For plants under residency or air-gap constraints, the whole thing runs inside the perimeter.",
        entries: [
          { title: "ERP — production & materials", icon: "Boxes" },
          { title: "Manufacturing execution", icon: "Factory" },
          { title: "SCADA & historian", icon: "Activity" },
          { title: "Quality management", icon: "ShieldCheck" },
          { title: "Maintenance management", icon: "Wrench" },
          { title: "PLM & engineering", icon: "Shapes" },
          { title: "Warranty & field service", icon: "Headset" },
          { title: "Supplier EDI", icon: "Truck" },
        ],
      },
      {
        key: "industries-manufacturing-governance",
        kind: SectionKind.PROSE,
        order: 3,
        eyebrow: "Governance",
        title: "Traceability is the requirement, not the paperwork",
        body: "Manufacturing is regulated less by prudential rules than by traceability obligations — and a model that cannot show its working is useless in a root-cause investigation regardless of what any regulator says.\n\nSo the same controls apply as everywhere else on the platform: full data-to-decision lineage, versioned model configuration, change history, and cited source passages on anything retrieval-based. When a warranty campaign is being scoped, the question *which lots, and on what evidence* has an answer with the records attached.\n\nOn the model estate itself, **EU AI Act**, **NIST AI RMF** and **ISO 42001** apply as they do to every deployment, and the **OWASP LLM Top 10** governs the retrieval and agentic components. Where the plant is subject to residency or air-gap constraints, the platform runs entirely on your own hardware with nothing leaving the network.",
      },
      readingBlock("manufacturing"),
      contactBlock(
        "manufacturing",
        "Bring us a line, a quality problem or a document store nobody can navigate. The first assessment is about your data, not our platform.",
      ),
    ],
  },

  /* ------------------------------------------------------------------ Energy */
  {
    slug: "industries/energy",
    title: "Energy, oil & gas",
    eyebrow: "Industries",
    subtitle:
      "Procurement intelligence. Technical specification search. Vendor evaluation. Asset maintenance — against a supply chain where a fortnight's slip costs more than the part.",
    seoTitle: "AI for energy, oil & gas",
    seoDescription:
      "Purpose-built AI for procurement, expediting, certification and turnaround planning — grounded in your ERP, contracts and yard data, deployable fully on-premises.",
    order: 10,
    sections: [
      {
        key: "industries-energy-problem",
        kind: SectionKind.PROSE,
        order: 0,
        eyebrow: "The problem",
        title: "The money leaks between the systems, not inside them",
        body: "In an asset-heavy operator, the expensive mistakes are almost never made inside a single system. They happen in the gaps: a long-lead valve that clears inspection after the turnaround window closed, a critical spare sitting in a yard three hundred miles from the rig waiting on it, heat numbers on a mill certificate that do not match the spools that arrived, a call-off priced well above the frame agreement nobody checked it against.\n\nEach of these is individually findable by a competent expeditor with enough time. None of them is findable across a portfolio, continuously, by anyone. And the cost of finding one late is not the price of the part — it is demurrage, liquidated damages, or a frozen scope that grows by fourteen work packs.\n\nMost of the evidence is also **unstructured**: specifications, certificates, contracts, packing lists, inspection reports. That is a language problem feeding a decision problem, which is exactly the split the platform is built around — a model reads the document, a deterministic model makes the call.",
      },
      {
        key: "industries-energy-usecases",
        kind: SectionKind.FEATURE_GRID,
        order: 1,
        eyebrow: "Use cases",
        title: "Where models earn their place",
        subtitle:
          "Procurement and supply chain is where this industry's catalogue is deepest, because it is where the leakage is largest and the evidence is worst organised.",
        entries: [
          {
            title: "Long-lead expediting",
            subtitle: "Turnaround",
            icon: "Clock",
            accent: "ember",
            body: "A critical item tracking late against a fixed shutdown window, flagged while the window can still be replanned.",
            bullets: ["Schedule slip", "Turnaround cost", "Expediting hours"],
          },
          {
            title: "Single-source exposure",
            subtitle: "Supply risk",
            icon: "ShieldAlert",
            accent: "slate",
            body: "One qualified vendor holding most of a critical spares list, quantified across the portfolio rather than felt anecdotally.",
            bullets: ["Concentration risk", "Qualified alternates", "Lead time"],
          },
          {
            title: "Stranded spares",
            subtitle: "Inventory",
            icon: "Boxes",
            accent: "brass",
            body: "The part an asset is waiting on already sitting in another yard, under a different description in a different system.",
            bullets: ["Working capital", "Downtime avoided", "Redeployment rate"],
          },
          {
            title: "Certificate mismatch",
            subtitle: "QA/QC",
            icon: "FileText",
            accent: "verdigris",
            body: "Heat numbers on the mill certificate disagreeing with what was delivered — caught at the gate rather than at installation.",
            bullets: ["Rejection rate", "Rework cost", "Compliance findings"],
          },
          {
            title: "Demurrage risk",
            subtitle: "Marine logistics",
            icon: "Truck",
            accent: "ember",
            body: "Berth congestion pushing discharge past laytime, forecast far enough ahead to re-sequence.",
            bullets: ["Demurrage paid", "Laytime utilisation", "Vessel turnaround"],
          },
          {
            title: "Price against frame agreement",
            subtitle: "Procurement",
            icon: "ShoppingCart",
            accent: "brass",
            body: "Call-offs priced above the agreement they were supposed to be governed by, across thousands of lines nobody re-checks.",
            bullets: ["Spend recovered", "Contract compliance", "Maverick spend"],
          },
        ],
      },
      {
        key: "industries-energy-systems",
        kind: SectionKind.INFRASTRUCTURE,
        order: 2,
        eyebrow: "Connected to",
        title: "The systems the supply chain already runs on",
        subtitle:
          "Contracts, certificates and yard data are usually the hardest to reach and the most valuable to connect. All of it is read in place.",
        entries: [
          { title: "ERP — materials & maintenance", icon: "Boxes" },
          { title: "Asset management", icon: "Factory" },
          { title: "Supplier & vendor portal", icon: "Handshake" },
          { title: "Expediting & inspection", icon: "Search" },
          { title: "Freight & marine logistics", icon: "Truck" },
          { title: "Contract repository", icon: "Gavel" },
          { title: "Warehouse & yard", icon: "Server" },
          { title: "QA/QC & certification", icon: "ShieldCheck" },
        ],
      },
      {
        key: "industries-energy-governance",
        kind: SectionKind.PROSE,
        order: 3,
        eyebrow: "Governance",
        title: "Sovereignty is usually decided before the model is",
        body: "Operators in this sector are frequently constrained by residency law, national-oil-company policy or plain security posture long before anyone has an opinion about a model. That is why the deployment options are not an afterthought here:\n\n- **On your own GPU, on-premises** — training and inference inside your perimeter, with no prompt or embedding data leaving the network\n- **In-country residency** where law or contract requires it\n- **Air-gapped** where the environment demands it\n\nThe governance is the same as everywhere else on the platform: credentials sealed with per-tenant keys, access enforced by attribute-based rules with deny-overrides, and every privileged action written to an immutable audit log. Sanctions and country-of-origin screening ride on top of that rather than beside it, which is what keeps a customs or trade-compliance question answerable from the same evidence trail as the commercial one.",
      },
      readingBlock("energy"),
      contactBlock(
        "energy",
        "Bring us a category of spend or a turnaround that slipped. The leakage is usually already visible in data you have.",
      ),
    ],
  },
];
