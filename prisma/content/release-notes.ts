import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Release notes. Platform-wide, monthly, newest first. Deprecations are listed
   with their removal date on the release that announces them, not later.
--------------------------------------------------------------------------- */

export const releaseNotes: DocSeed[] = [
  {
    kind: DocKind.RELEASE_NOTE,
    slug: "release-2026-7",
    title: "Platform release 2026.7",
    version: "2026.7",
    excerpt:
      "Evidence quorum becomes the default for consequential decisions, Frankfurt enters GA, and the trace store gains a query API.",
    category: "Platform",
    readMinutes: 4,
    featured: true,
    publishedAt: "2026-07-21",
    tags: ["Release", "Decisioning", "Regions", "Observability"],
    icon: "Rocket",
    accent: "brass",
    seoDescription:
      "BasinWright platform release 2026.7: evidence quorum by default, Frankfurt sovereign region GA, trace query API and routing policy changes.",
    body: `## New

**Evidence quorum by default.** Consequential decision paths now require agreement across grounding, deterministic checks and reasoning before automating. Single-lane operation remains available per decision class. Existing decision paths are unchanged until you opt in; new paths default to quorum.

**Frankfurt sovereign region.** Generally available for training, serving, the governed data plane and evaluation. Serverless inference follows next quarter.

**Trace query API.** The trace store is now queryable over a documented API — filter by decision class, policy gate, model version, confidence band and outcome, and export in the audit pack format. Previously this was console-only.

**Residency failure policy.** Routes can now be configured to fail rather than fall back when no compliant endpoint is available. This is now the default for routes carrying a localisation or sovereignty constraint.

## Improved

- Re-ranking latency reduced by roughly 30% on the default cross-encoder path.
- Quarantine reason mix is now tracked as a first-class drift signal with alerting, following our research on early drift detection.
- Tool registers export to a review-friendly format for risk functions.
- Evaluation runs can be scheduled into reserved-capacity troughs, which materially changes the economics of frequent evaluation.
- Agent memory retention policies are now configurable per agent rather than per estate.

## Fixed

- Fixed a case where structure-aware chunking dropped the section path on documents with nested numbered headings.
- Fixed cost attribution under-counting retries against the originating workload.
- Corrected an off-by-one in trace pagination that could omit the final record of a page.
- Fixed a race in the promotion gate that could allow two candidate versions to promote concurrently.

## Deprecated

| Item | Replacement | Removal |
| --- | --- | --- |
| Model-name routing in the request body | Capability-class routes | 2027.1 |
| Legacy trace export (v1 schema) | Audit pack export | 2026.11 |
| Per-estate agent memory policy | Per-agent policy | 2027.1 |

Migration guides for each are in the developer portal.`,
  },

  {
    kind: DocKind.RELEASE_NOTE,
    slug: "release-2026-6",
    title: "Platform release 2026.6",
    version: "2026.6",
    excerpt:
      "B200 capacity reaches GA, private Marketplace listings arrive, and evaluation gates can now block promotion on a per-case basis.",
    category: "Platform",
    readMinutes: 3,
    publishedAt: "2026-06-23",
    tags: ["Release", "Compute", "Marketplace", "Evaluation"],
    icon: "Rocket",
    accent: "brass",
    seoDescription:
      "BasinWright platform release 2026.6: B200 GA, private Marketplace listings, per-case evaluation gates and distillation pipelines.",
    body: `## New

**B200 capacity generally available** in nine regions, for both serving and multi-node training. Training reservations include provisioned interconnect.

**Private Marketplace listings.** Publish an internally-built agent, connector or evaluation suite to your own organisation with versioning, access control and one-click deployment.

**Per-case promotion gates.** An evaluation suite can now designate individual cases as hard gates — failing one blocks promotion regardless of the aggregate score. Previously only the aggregate threshold could block.

**Distillation pipelines.** Capture production frontier-model traffic with human corrections and tune a small model on it, as a managed pipeline rather than an export-and-reimport exercise.

## Improved

- Entity resolution throughput improved roughly 2× on corpora above 50 million records.
- Survivorship rules can now be expressed per attribute per jurisdiction.
- Hybrid retrieval fusion weights are tunable per corpus rather than per estate.
- Agent tool registers now surface unused tools, which is a useful prompt to remove surface area.

## Fixed

- Fixed quarantine records being re-evaluated on every ingest cycle rather than on change.
- Fixed a case where the abstention threshold was not applied to hybrid retrieval results.
- Corrected timezone handling in scheduled evaluation runs for estates spanning regions.

## Deprecated

| Item | Replacement | Removal |
| --- | --- | --- |
| Aggregate-only evaluation thresholds | Per-case hard gates | 2026.12 |
| Estate-level fusion weights | Per-corpus weights | 2026.10 |`,
  },

  {
    kind: DocKind.RELEASE_NOTE,
    slug: "release-2026-5",
    title: "Platform release 2026.5",
    version: "2026.5",
    excerpt:
      "Blind-sample review lands as a platform capability, structure-aware chunking becomes the default, and cost per decision is now a reported metric.",
    category: "Platform",
    readMinutes: 3,
    publishedAt: "2026-05-19",
    tags: ["Release", "Governance", "Retrieval", "Cost"],
    icon: "Rocket",
    accent: "brass",
    seoDescription:
      "BasinWright platform release 2026.5: blind-sample review, structure-aware chunking by default, and cost-per-decision reporting.",
    body: `## New

**Blind-sample review.** Configure a percentage of autonomous decisions to be routed for independent human re-work, with the system's own outcome hidden from the reviewer. Disagreements are collected, categorised and available as candidate evaluation cases.

This is the control we most often see missing in governance designs, and it now ships as part of the platform rather than as something each estate builds.

**Cost per decision.** Reported natively, combining serving, retrieval, evaluation, amortised retraining, attributed idle capacity and human review time. Available per use case and per business unit.

**Structure-aware chunking by default** for supported document types, carrying the section path as retrieval metadata. Fixed-window chunking remains available.

## Improved

- Policy gates are versioned separately from agent definitions, with their own change-control trail.
- Idempotency keys are now required on state-changing tools rather than recommended.
- Trace retention is configurable to match the underlying business record rather than the log retention default.
- Quarantine now has a first-class expiry policy with an audit record for expired items.

## Fixed

- Fixed reviewers occasionally seeing the automated outcome in the blind-sample preview pane.
- Fixed idle capacity being attributed evenly rather than to the reserving workload.
- Fixed a case where an escalated request was billed to the escalation route rather than the originating workload.

## Deprecated

| Item | Replacement | Removal |
| --- | --- | --- |
| Prompt-embedded policy rules | Runtime policy gates | 2026.9 |
| Shared agent/policy versioning | Independent policy versions | 2026.11 |`,
  },

  {
    kind: DocKind.RELEASE_NOTE,
    slug: "release-2026-4",
    title: "Platform release 2026.4",
    version: "2026.4",
    excerpt:
      "Marketplace general availability, typed tool error taxonomy, and retrieval abstention scoring.",
    category: "Platform",
    readMinutes: 3,
    publishedAt: "2026-04-14",
    tags: ["Release", "Marketplace", "Agents", "Retrieval"],
    icon: "Rocket",
    accent: "brass",
    seoDescription:
      "BasinWright platform release 2026.4: Marketplace GA, typed tool error taxonomy and independent retrieval abstention scoring.",
    body: `## New

**Marketplace general availability** with 140 launch listings across models, agents, connectors and evaluation suites, each carrying commercial terms, data handling position and evaluation results in a standard form.

**Typed tool errors.** Tool contracts now declare their failure modes as a typed taxonomy — permission, not found, locked, validation, upstream unavailable — with retryability declared per type. Agents recover far more sensibly than they did from generic error strings.

**Retrieval abstention scoring.** Retrieval quality is now scored independently of generation, with an explicit abstain decision before the model runs. Correct refusal is reported as a first-class outcome in evaluation.

## Improved

- Tool selection accuracy improved for registers above twenty tools through hierarchical composition.
- Vector index refresh is incremental rather than full-corpus on document change.
- Lineage capture extended to cover survivorship decisions, not only source records.
- Multi-node training job scheduling accounts for interconnect topology.

## Fixed

- Fixed a case where superseded document versions could be retrieved when recency weighting was disabled.
- Fixed agent memory leaking across sessions where the same principal held two concurrent conversations.
- Fixed evaluation results being cached across model versions with the same tag.

## Deprecated

| Item | Replacement | Removal |
| --- | --- | --- |
| Untyped tool error strings | Typed error taxonomy | 2026.10 |
| Full-corpus index rebuild API | Incremental refresh | 2026.8 |`,
  },

  {
    kind: DocKind.RELEASE_NOTE,
    slug: "release-2026-3",
    title: "Platform release 2026.3",
    version: "2026.3",
    excerpt:
      "Per-attribute survivorship rules, agent tool permission scoping, and the first version of the audit pack export.",
    category: "Platform",
    readMinutes: 3,
    publishedAt: "2026-03-17",
    tags: ["Release", "Data", "Agents", "Audit"],
    icon: "Rocket",
    accent: "brass",
    seoDescription:
      "BasinWright platform release 2026.3: per-attribute survivorship rules, per-tool permission scoping and audit pack export.",
    body: `## New

**Per-attribute survivorship rules.** Which source system is authoritative can now be declared per attribute rather than per entity, with an owner recorded against each rule and a change-control trail.

This reflects how organisations actually work: the CRM may be authoritative for a contact preference while the core system is authoritative for a legal name, and a single per-entity rule cannot express that.

**Per-tool permission scoping.** Agent permissions are granted and revoked per tool rather than per agent, and the trace records which scope was exercised.

**Audit pack export.** Produce a regulator-ready pack for a filtered set of decisions: the decision record, the evidence with record-level lineage, the constraint checks, the policy gate, the model versions and the outcome.

## Improved

- Quarantine reason breakdown reported by source system, which turns out to be the fastest route to finding a broken upstream form.
- Evaluation rubrics support graded criteria alongside pass/fail.
- Cost attribution tags propagate through agent tool calls to downstream requests.

## Fixed

- Fixed entity re-resolution not re-running downstream lineage updates.
- Fixed a case where policy gate changes applied to in-flight decisions.
- Fixed export truncation on packs above 10,000 decisions.

## Deprecated

| Item | Replacement | Removal |
| --- | --- | --- |
| Per-entity survivorship rules | Per-attribute rules | 2026.9 |
| Per-agent permission grants | Per-tool scoping | 2026.9 |`,
  },

  {
    kind: DocKind.RELEASE_NOTE,
    slug: "release-2026-2",
    title: "Platform release 2026.2",
    version: "2026.2",
    excerpt:
      "Capability-class routing, the tool register, and quarantine as a first-class stage in the data plane.",
    category: "Platform",
    readMinutes: 3,
    publishedAt: "2026-02-18",
    tags: ["Release", "Routing", "Agents", "Data"],
    icon: "Rocket",
    accent: "brass",
    seoDescription:
      "BasinWright platform release 2026.2: capability-class routing, the agent tool register and quarantine as a first-class data plane stage.",
    body: `## New

**Capability-class routing.** Applications request a capability — function calling, context length, evaluated quality floor, residency — and the route resolves it to a model. Model names in application code become unnecessary, which is what makes provider deprecation a change ticket rather than an incident.

**Tool register.** Every tool an agent can call, with its contract, permission scope, owner and policy gate, in one exportable view. Built for risk functions to read, which meant writing it for people who do not read code.

**Quarantine as a first-class stage.** Records failing the quality bar are held, flagged and routed for remediation rather than guessed at or dropped, with inflow, outflow, age distribution and reason breakdown reported.

## Improved

- Hybrid retrieval available on all corpora, not only those explicitly configured for it.
- Entity resolution confidence exposed to retrieval scoping decisions.
- Trace store retention extended to match business record retention.
- Evaluation suites are versioned as independent artefacts with their own ownership.

## Fixed

- Fixed routing fallbacks that could cross a residency boundary when the primary endpoint was unavailable. This was the change that led to the explicit residency failure policy in 2026.7.
- Fixed quarantined records being included in retrieval scope.
- Fixed lineage records not capturing the corpus version at time of use.

## Deprecated

| Item | Replacement | Removal |
| --- | --- | --- |
| Direct model-name requests | Capability-class routes | 2027.1 |
| Implicit retrieval scope | Explicit entity scoping | 2026.8 |`,
  },
];
