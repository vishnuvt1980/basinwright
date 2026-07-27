import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Newsroom. Short, factual, and dated — the company record rather than a blog.
--------------------------------------------------------------------------- */

export const news: DocSeed[] = [
  {
    kind: DocKind.NEWS,
    slug: "frankfurt-sovereign-region-live",
    title: "BasinWright opens a sovereign region in Frankfurt",
    excerpt:
      "The Frankfurt region brings in-country training, serving and evaluation to customers with EU localisation requirements, and takes the network to 38 regions.",
    category: "Infrastructure",
    readMinutes: 3,
    featured: true,
    publishedAt: "2026-07-21",
    tags: ["Regions", "EU", "Sovereignty"],
    icon: "Globe",
    accent: "azure",
    seoDescription:
      "BasinWright's Frankfurt sovereign region is live, offering in-country training, serving and evaluation for EU data localisation requirements.",
    body: `BasinWright's Frankfurt region entered general availability today, bringing the network to 38 operating regions.

Frankfurt is a full sovereign region rather than a serving point of presence. Customers can train, tune, evaluate and serve entirely in-country, with the governed data plane, the model estate and the trace store all resident and processed within the region.

## What is available

- Dedicated endpoints across the frontier and open-weight catalogue
- Multi-node training capacity on H200 and B200
- The Cognitive Data Hub, including entity resolution and quarantine
- Evaluation and promotion gating, in-region
- Trace retention with no egress path

Serverless inference in Frankfurt follows in the next quarter.

## Who it is for

The region was built in response to customers in financial services, healthcare and the public sector whose requirements go beyond storage residency to full processing localisation — including inference context, vector indexes, logs and backups.

Existing customers can request migration through their named architect. New workloads can select the region at deployment time; routing policy will enforce it per request, and requests that cannot be served compliantly in-region fail rather than falling back.

Documentation for region selection and residency policy is available in the developer portal.`,
  },

  {
    kind: DocKind.NEWS,
    slug: "b200-capacity-general-availability",
    title: "B200 capacity now generally available across nine regions",
    excerpt:
      "Blackwell-class capacity moves out of limited preview, with committed multi-node reservations available for training workloads.",
    category: "Compute",
    readMinutes: 2,
    publishedAt: "2026-06-27",
    tags: ["Compute", "GPU", "Capacity"],
    icon: "Cpu",
    accent: "ember",
    seoDescription:
      "BasinWright B200 GPU capacity is generally available across nine regions, with committed multi-node reservations for training workloads.",
    body: `B200 capacity has moved from limited preview to general availability in nine regions, with three more scheduled before the end of the year.

Both serving and multi-node training configurations are available. Training reservations are offered on three, six and twelve month commitments, with interconnect provisioned for the reservation rather than shared across tenants.

## Practical notes

Customers running large-context serving workloads should expect the most benefit here — the memory capacity change is more consequential for serving throughput at long context than the raw compute figure suggests.

For training, the interconnect provisioning is the part worth planning around. Multi-node throughput is bounded by fabric far more than by accelerator count, and fabric is allocated at reservation time.

Capacity planning guidance, including the reserve-versus-burst crossover for the new configurations, is in the developer portal. Existing committed customers can request a review of their allocation through their named architect.`,
  },

  {
    kind: DocKind.NEWS,
    slug: "iso-42001-certification",
    title: "BasinWright certified to ISO/IEC 42001",
    excerpt:
      "The AI management system certification joins ISO 27001, SOC 2 Type II and the sector attestations already held across the platform.",
    category: "Compliance",
    readMinutes: 2,
    publishedAt: "2026-06-03",
    tags: ["Compliance", "Certification", "Governance"],
    icon: "ShieldCheck",
    accent: "verdigris",
    seoDescription:
      "BasinWright has achieved ISO/IEC 42001 certification for its AI management system, alongside ISO 27001 and SOC 2 Type II.",
    body: `BasinWright has been certified to ISO/IEC 42001, the international standard for artificial intelligence management systems, following an audit covering the platform, the operating model and the delivery organisation.

The scope includes model lifecycle governance, evaluation and promotion gating, incident handling, and the controls around customer-owned model estates.

## What this covers

ISO/IEC 42001 addresses how an organisation governs AI systems across their lifecycle — risk assessment, impact evaluation, data governance, human oversight and continual improvement. It sits alongside, rather than replacing, the security and operational certifications already held.

Current attestations available in the Trust Centre:

| Certification | Scope | Status |
| --- | --- | --- |
| ISO/IEC 42001 | AI management system | Certified |
| ISO/IEC 27001 | Information security | Certified |
| SOC 2 Type II | Security, availability, confidentiality | Annual |
| ISO/IEC 27017 | Cloud security controls | Certified |
| ISO/IEC 27018 | Cloud personal data | Certified |

Certificates, the current SOC 2 report and the subprocessor register are available in the Trust Centre. Customers under NDA can request the full audit scope statement through their named architect.`,
  },

  {
    kind: DocKind.NEWS,
    slug: "partner-programme-launch",
    title: "BasinWright launches its partner programme",
    excerpt:
      "Three tiers covering systems integrators, technology partners and independent software vendors, with shared delivery accreditation.",
    category: "Company",
    readMinutes: 3,
    publishedAt: "2026-05-14",
    tags: ["Partners", "Company", "Ecosystem"],
    icon: "Handshake",
    accent: "brass",
    seoDescription:
      "The BasinWright partner programme opens with three tiers for systems integrators, technology partners and ISVs, including delivery accreditation.",
    body: `The BasinWright partner programme is open for applications, formalising arrangements that have until now been handled engagement by engagement.

## Three tracks

**Delivery partners** — systems integrators and consultancies delivering BasinWright estates. Accreditation covers the platform, the governed data layer and the operating model, with certification at architect and engineer levels.

**Technology partners** — data platforms, security vendors, observability providers and industry software whose products join the estate. Includes joint reference architectures and co-engineered connectors.

**Independent software vendors** — teams publishing models, agents and extensions to the Marketplace, with commercial and compliance terms attached to each listing.

## Accreditation

Delivery accreditation is not a slide deck. Partner engineers complete assessed work on a reference estate covering entity resolution, evaluation gating, agent tool design and incident handling. Certification is time-limited and renewed against the current platform.

We were deliberate about this. A partner-delivered estate carries our name in the customer's risk register, and the failure modes in this work are not obvious to teams whose experience is in conventional systems integration.

Applications are open through the partner page, with the first accreditation cohorts running in the third quarter.`,
  },

  {
    kind: DocKind.NEWS,
    slug: "marketplace-general-availability",
    title: "BasinWright Marketplace reaches general availability",
    excerpt:
      "Vetted models, agents and extensions with commercial and compliance terms attached, plus private listings for internal reuse.",
    category: "Product",
    readMinutes: 2,
    publishedAt: "2026-04-02",
    tags: ["Marketplace", "Product", "Agents"],
    icon: "Store",
    accent: "slate",
    seoDescription:
      "BasinWright Marketplace is generally available, offering vetted models, agents and extensions with commercial and compliance terms attached.",
    body: `The Marketplace is generally available, with 140 listings at launch across models, agents, connectors and evaluation suites.

Every listing carries its commercial terms, its data handling position and its evaluation results in a standard form, so procurement and risk review can happen against a consistent artefact rather than a vendor's marketing page.

## Private listings

The capability customers asked for most during preview was not the public catalogue. It was private listings: publishing an internally-built agent, connector or evaluation suite to your own organisation, with versioning, access control and deployment from the same place.

Large estates were rebuilding the same claims-document extractor in four business units. Private listings make internal reuse the path of least resistance.

## Vetting

Public listings are reviewed before publication: provenance of any model weights, licence compatibility, data handling claims, and a baseline evaluation run on our harness. Listings that make claims we cannot substantiate are not published.

Publisher applications run through the partner programme. Listing and integration documentation is in the developer portal.`,
  },

  {
    kind: DocKind.NEWS,
    slug: "sovereign-programme-southeast-asia",
    title: "Sovereign programme expands into Southeast Asia",
    excerpt:
      "Two national deployments enter delivery, with in-country engineering teams and capability transfer written into both contracts.",
    category: "Company",
    readMinutes: 2,
    publishedAt: "2026-02-05",
    tags: ["Sovereign AI", "Government", "Company"],
    icon: "Building2",
    accent: "ember",
    seoDescription:
      "BasinWright's sovereign AI programme expands into Southeast Asia with two national deployments and contractual capability transfer.",
    body: `Two national sovereign deployments in Southeast Asia have entered delivery, taking the sovereign programme to nine countries.

Both are air-gapped estates built on open-weight foundation models trained in-country, with the governed data plane, the model estate, the evaluation suites and the trace store held entirely within the national facility.

## Capability transfer

As with every engagement in the programme, both contracts specify a capability transfer with named local counterparts for each BasinWright operating role, a dated transfer plan, and an exit position agreed before the first deployment.

Local engineering teams are being recruited in both countries, with roles across platform engineering, data engineering and applied evaluation.

## Why the exit position comes first

It is the clause vendors least like to write and the one that makes the rest credible. An estate the customer cannot run without us is not sovereign, whatever the architecture diagram says.

Details of the programme, including the artefact inventory that constitutes a transfer, are covered in our whitepaper on sovereign reference architecture.`,
  },
];
