import { PrismaClient, SectionKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type EntrySeed = {
  title: string;
  subtitle?: string;
  body?: string;
  icon?: string;
  href?: string;
  badge?: string;
  accent?: string;
  bullets?: string[];
};

type SectionSeed = {
  key: string;
  kind: SectionKind;
  order: number;
  eyebrow?: string;
  title?: string;
  headlineLines?: string[];
  subtitle?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaLabel2?: string;
  ctaHref2?: string;
  meta?: Record<string, unknown>;
  entries?: EntrySeed[];
};

const sections: SectionSeed[] = [
  {
    key: "hero",
    kind: SectionKind.HERO,
    order: 0,
    eyebrow: "Enterprise Intelligence as a Service",
    headlineLines: [
      "Enterprise AI Infrastructure.",
      "Intelligent Models.",
      "Business Outcomes.",
    ],
    subtitle:
      "Deploy Foundation Models, AI Agents, GPU Infrastructure, and Enterprise AI Platforms from a single operating environment.",
    body: "Built for governments, enterprises, financial institutions, healthcare, manufacturing, telecom, energy and defence.",
    ctaLabel: "Start Building",
    ctaHref: "#contact",
    ctaLabel2: "Talk to an AI Architect",
    ctaHref2: "#contact",
    entries: [
      { title: "Foundation models served", subtitle: "400+", icon: "Boxes" },
      { title: "Inference uptime SLA", subtitle: "99.99%", icon: "Activity" },
      { title: "Deployment regions", subtitle: "38", icon: "Globe" },
      { title: "GPU hours delivered", subtitle: "12M+", icon: "Cpu" },
    ],
  },
  {
    key: "logos",
    kind: SectionKind.LOGO_WALL,
    order: 1,
    eyebrow: "Trusted by Enterprise",
    title: "Running in production inside regulated organisations",
    entries: [
      { title: "Meridian Bank" },
      { title: "Halcyon Health" },
      { title: "Northwind Energy" },
      { title: "Arcadia Telecom" },
      { title: "Sovereign Digital" },
      { title: "Kestrel Defence" },
      { title: "Lumen Manufacturing" },
      { title: "Orbit Logistics" },
    ],
  },
  {
    key: "platform",
    kind: SectionKind.PLATFORM_GRID,
    order: 2,
    eyebrow: "The AI Platform for Modern Enterprises",
    title: "Everything your organisation needs, in one operating environment",
    subtitle:
      "Instead of managing multiple vendors, APIs, GPUs, cloud providers and AI models, BasinWright delivers one unified environment.",
    entries: [
      {
        title: "Foundation Models",
        body: "Hundreds of frontier and open models behind one API contract.",
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
    key: "why",
    kind: SectionKind.WHY_PILLARS,
    order: 3,
    eyebrow: "Why BasinWright",
    title: "One platform, engineered for the enterprise floor",
    subtitle:
      "The infrastructure, intelligence, and governance to build, deploy and scale AI across your organisation.",
    entries: [
      {
        title: "One Platform",
        subtitle: "Access the world's leading AI models",
        body: "No infrastructure complexity. One contract, one control plane, one bill — across every model and every region you operate in.",
        icon: "Layers",
        accent: "brass",
        bullets: [
          "Unified model API",
          "Single control plane",
          "Consolidated billing",
          "Portable workloads",
        ],
      },
      {
        title: "Enterprise Ready",
        subtitle: "Built for the standards you are already held to",
        body: "Security, compliance and private AI are defaults rather than add-ons, with identity and audit wired through every layer.",
        icon: "ShieldCheck",
        accent: "verdigris",
        bullets: [
          "Security",
          "Compliance",
          "Private AI",
          "Role-based Access",
          "Audit",
          "Identity",
        ],
      },
      {
        title: "High Performance Compute",
        subtitle: "Deploy on the substrate that fits the workload",
        body: "From a single accelerator to multi-node training clusters, across public, private and hybrid infrastructure.",
        icon: "Cpu",
        accent: "ember",
        bullets: [
          "NVIDIA GPUs",
          "AMD GPUs",
          "Multi-node clusters",
          "Private Cloud",
          "Public Cloud",
          "Hybrid Infrastructure",
        ],
      },
      {
        title: "AI Agents",
        subtitle: "Autonomous systems that understand your organisation",
        body: "Agents that hold context, plan multi-step work, call your internal tools and escalate to a human when policy requires it.",
        icon: "Bot",
        accent: "slate",
        bullets: [
          "Grounded in your data",
          "Human approval gates",
          "Tool and API calling",
          "Full execution traces",
        ],
      },
    ],
  },
  {
    key: "agents",
    kind: SectionKind.AGENTS,
    order: 4,
    eyebrow: "BasinWright Agents",
    title: "Deploy a digital workforce that knows how your business runs",
    subtitle:
      "Agents ship with memory, planning, reasoning, tool calling, workflow automation, human approval and knowledge retrieval.",
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
    key: "models",
    kind: SectionKind.MODELS,
    order: 5,
    eyebrow: "AI Models",
    title: "Hundreds of enterprise-ready models, one integration",
    subtitle:
      "Route across providers by cost, latency, residency or capability — without rewriting a line of application code.",
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
        title: "Large Language Models",
        body: "Reasoning, drafting and synthesis at frontier quality.",
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
    key: "products",
    kind: SectionKind.PRODUCTS,
    order: 6,
    eyebrow: "Products",
    title: "An ecosystem, not an endpoint",
    subtitle:
      "Models as a Service is one product inside a larger enterprise intelligence platform.",
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
  {
    key: "industries",
    kind: SectionKind.INDUSTRIES,
    order: 7,
    eyebrow: "Industries",
    title: "Deployed where the stakes are highest",
    subtitle:
      "Sector-specific controls, residency and evaluation baselines out of the box.",
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
    key: "solutions",
    kind: SectionKind.SOLUTIONS,
    order: 8,
    eyebrow: "Solutions",
    title: "Outcomes teams put into production first",
    entries: [
      {
        title: "Enterprise AI",
        body: "A governed foundation every business unit can build on.",
        icon: "Building2",
      },
      {
        title: "Generative AI",
        body: "Drafting, synthesis and content operations at scale.",
        icon: "Sparkles",
      },
      {
        title: "Agentic AI",
        body: "Multi-step work executed autonomously under policy.",
        icon: "Bot",
      },
      {
        title: "Knowledge Intelligence",
        body: "Institutional memory made searchable and answerable.",
        icon: "Library",
      },
      {
        title: "Customer Service AI",
        body: "Deflection and resolution with full conversation context.",
        icon: "Headset",
      },
      {
        title: "Fraud Detection",
        body: "Anomaly signals fused across transactions and behaviour.",
        icon: "ShieldAlert",
      },
      {
        title: "Digital Workforce",
        body: "Agent teams that absorb repetitive operational load.",
        icon: "Users",
      },
      {
        title: "Document Intelligence",
        body: "Extraction and reasoning over contracts, claims and filings.",
        icon: "FileText",
      },
      {
        title: "Predictive Analytics",
        body: "Forecasting grounded in your own operational history.",
        icon: "LineChart",
      },
      {
        title: "AI Search",
        body: "Semantic retrieval across every repository you run.",
        icon: "Search",
      },
      {
        title: "Supply Chain Intelligence",
        body: "Disruption detection and automated re-planning.",
        icon: "Truck",
      },
    ],
  },
  {
    key: "infrastructure",
    kind: SectionKind.INFRASTRUCTURE,
    order: 9,
    eyebrow: "Infrastructure & Developers",
    title: "Meet your estate where it already is",
    subtitle:
      "Ship with the SDKs your teams use, onto the infrastructure your policy allows.",
    meta: {
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
    entries: [
      { title: "Private Cloud", icon: "Cloud" },
      { title: "Public Cloud", icon: "CloudCog" },
      { title: "Hybrid Cloud", icon: "CloudCog" },
      { title: "On-Premises", icon: "Server" },
      { title: "Air-Gapped Deployment", icon: "Lock" },
      { title: "Edge AI", icon: "Radio" },
      { title: "Multi-Cloud", icon: "Cloudy" },
      { title: "GPU Clusters", icon: "Cpu" },
    ],
  },
  {
    key: "pricing",
    kind: SectionKind.PRICING,
    order: 10,
    eyebrow: "Pricing",
    title: "Start on a laptop. Scale to a sovereign estate.",
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
          "99.99% uptime SLA",
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
          "Cleared personnel",
          "Bespoke model estate",
        ],
      },
    ],
  },
  {
    key: "cta",
    kind: SectionKind.CTA,
    order: 11,
    eyebrow: "Talk to us",
    title: "Building the Infrastructure for Enterprise Intelligence",
    subtitle:
      "AI Models. Agentic Systems. High-Performance Compute. Enterprise Knowledge. Secure Deployment.",
    ctaLabel: "Start Building",
    ctaHref: "#contact",
    ctaLabel2: "Book a Demo",
    ctaHref2: "#contact",
  },
];

const settings = [
  { key: "site.name", value: "BasinWright", label: "Site name", group: "brand", order: 0 },
  {
    key: "site.tagline",
    value: "Enterprise Intelligence as a Service",
    label: "Tagline",
    group: "brand",
    order: 1,
  },
  {
    key: "site.description",
    value:
      "BasinWright provides the infrastructure, intelligence, and enterprise platform to build, deploy, govern, and scale AI across your organisation.",
    label: "Meta description",
    group: "brand",
    type: "textarea",
    order: 2,
  },
  {
    key: "footer.tagline",
    value: "Building the Infrastructure for Enterprise Intelligence",
    label: "Footer tagline",
    group: "footer",
    order: 0,
  },
  {
    key: "footer.subline",
    value:
      "AI Models. Agentic Systems. High-Performance Compute. Enterprise Knowledge. Secure Deployment.",
    label: "Footer subline",
    group: "footer",
    type: "textarea",
    order: 1,
  },
  {
    key: "footer.legal",
    value: "© BasinWright. All rights reserved.",
    label: "Legal line",
    group: "footer",
    order: 2,
  },
  {
    key: "contact.email",
    value: "architects@basinwright.com",
    label: "Contact email",
    group: "contact",
    type: "email",
    order: 0,
  },
  {
    key: "chat.title",
    value: "BasinWright Architect",
    label: "Chat assistant name",
    group: "ai",
    order: 0,
  },
  {
    key: "chat.greeting",
    value:
      "I'm the BasinWright architect assistant. Ask me about deployment models, GPU capacity, agent governance or how we'd fit your estate.",
    label: "Chat greeting",
    group: "ai",
    type: "textarea",
    order: 1,
  },
  {
    key: "chat.suggestions",
    value:
      "How does sovereign deployment work?|Compare MaaS and dedicated endpoints|Which agents suit a bank?|What does onboarding look like?",
    label: "Chat suggestions (pipe-separated)",
    group: "ai",
    type: "textarea",
    order: 2,
  },
];

const headerNav = [
  { label: "Products", href: "#products" },
  { label: "Solutions", href: "#solutions" },
  { label: "Industries", href: "#industries" },
  { label: "Models", href: "#models" },
  { label: "Pricing", href: "#pricing" },
];

const footerNav: { group: string; items: { label: string; href: string }[] }[] = [
  {
    group: "Products",
    items: [
      { label: "BasinWright MaaS", href: "#products" },
      { label: "BasinWright Compute", href: "#products" },
      { label: "BasinWright Agents", href: "#products" },
      { label: "BasinWright Studio", href: "#products" },
      { label: "BasinWright Knowledge", href: "#products" },
      { label: "BasinWright Marketplace", href: "#products" },
    ],
  },
  {
    group: "Developers",
    items: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "SDKs", href: "#" },
      { label: "CLI", href: "#" },
      { label: "Terraform", href: "#" },
      { label: "GitHub", href: "#" },
    ],
  },
  {
    group: "Company",
    items: [
      { label: "About", href: "#" },
      { label: "Leadership", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Careers", href: "#" },
      { label: "News", href: "#" },
      { label: "Research", href: "#" },
    ],
  },
  {
    group: "Resources",
    items: [
      { label: "Case Studies", href: "#" },
      { label: "Whitepapers", href: "#" },
      { label: "Learning Centre", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Release Notes", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
];

async function main() {
  console.log("Seeding BasinWright…");

  // --- Admin user ---------------------------------------------------------
  const email = process.env.ADMIN_EMAIL ?? "admin@basinwright.com";
  const password = process.env.ADMIN_PASSWORD ?? "basinwright";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email,
      name: process.env.ADMIN_NAME ?? "BasinWright Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`  admin user → ${email}`);

  // --- Sections & entries -------------------------------------------------
  // Replace wholesale so re-seeding is idempotent.
  await prisma.entry.deleteMany();
  await prisma.section.deleteMany();

  for (const s of sections) {
    const { entries = [], meta, ...rest } = s;
    await prisma.section.create({
      data: {
        ...rest,
        headlineLines: s.headlineLines ?? [],
        meta: meta as never,
        entries: {
          create: entries.map((e, i) => ({
            ...e,
            bullets: e.bullets ?? [],
            order: i,
          })),
        },
      },
    });
  }
  console.log(`  ${sections.length} sections seeded`);

  // --- Settings -----------------------------------------------------------
  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { label: setting.label, group: setting.group, order: setting.order },
      create: setting,
    });
  }
  console.log(`  ${settings.length} settings seeded`);

  // --- Navigation ---------------------------------------------------------
  await prisma.navItem.deleteMany();
  for (const [i, item] of headerNav.entries()) {
    await prisma.navItem.create({
      data: { ...item, order: i, location: "header" },
    });
  }
  let order = 0;
  for (const column of footerNav) {
    for (const item of column.items) {
      await prisma.navItem.create({
        data: { ...item, order: order++, location: "footer", group: column.group },
      });
    }
  }
  console.log("  navigation seeded");

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
