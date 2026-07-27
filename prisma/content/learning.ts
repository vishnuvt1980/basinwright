import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Learning Centre — explainers. Vendor-neutral where they can be, and written
   for someone who has to make a decision rather than pass an exam.
--------------------------------------------------------------------------- */

export const learning: DocSeed[] = [
  {
    kind: DocKind.ARTICLE,
    slug: "anatomy-of-an-enterprise-ai-platform",
    title: "The anatomy of an enterprise AI platform",
    subtitle: "The seven layers, what each one is responsible for, and which ones you can defer.",
    excerpt:
      "A map of what an enterprise AI platform is made of — from accelerators to the decision record — and an honest note on which layers you can put off.",
    category: "Foundations",
    author: "Priya Raghunathan",
    authorRole: "Principal Architect, Enterprise Intelligence",
    readMinutes: 11,
    featured: true,
    publishedAt: "2026-07-08",
    tags: ["Foundations", "Architecture", "Platform"],
    icon: "Layers",
    accent: "brass",
    seoDescription:
      "The seven layers of an enterprise AI platform — compute, models, data, retrieval, orchestration, governance and the decision record — and what each does.",
    body: `If you are being asked to buy, build or assemble an enterprise AI platform, it helps to have a map of what one is made of. Here is the one we use.

## Layer 1: Compute

Accelerators, the fabric between them, and the scheduler on top.

Two distinct workloads live here with different requirements. **Serving** is latency-sensitive, mostly single-node, and bounded by memory bandwidth. **Training** is throughput-sensitive, multi-node, and bounded by interconnect.

Estates that plan only for serving discover later that they own a lot of accelerators they cannot train across, and interconnect is decided at procurement time.

## Layer 2: Models

The catalogue: frontier models via API, open-weight models you host, and domain models you have tuned.

The thing that matters at this layer is not which models you have but whether applications reference them by name. If they do, you cannot move — and models get deprecated on the provider's schedule, not yours. Applications should ask for a capability class; something else resolves it to a model.

## Layer 3: Data

The governed record. Entity resolution, survivorship, quarantine, lineage.

This layer is where enterprise AI programmes actually succeed or fail, and it is the one most often deferred because it does not demo. Everything above it inherits its quality. A perfect model on an unresolved entity graph produces confident answers about the wrong customer.

## Layer 4: Retrieval

Turning a question into the right evidence: embedding, indexing, search, re-ranking, and the assembly of context.

Two properties separate production retrieval from a tutorial. It must be **scoped** — restricted to the resolved entity, the permitted documents and the current versions. And it must be able to **abstain** — return nothing and say so, rather than returning its top five results regardless of relevance.

## Layer 5: Orchestration

Agents, tools, workflows, approval gates and human handover.

The unit of design here is the tool contract. An agent's competence is bounded by its tools, and its risk profile is defined entirely by what those tools can do. A tool register that someone in a risk function can read and understand is not a nice-to-have; it is the thing that makes the layer governable.

## Layer 6: Governance

Policy enforcement, evaluation gates, cost attribution, drift detection, audit export.

The distinguishing question: can this layer stop something? A governance layer that observes and reports is monitoring. One that can block a promotion, refuse an action and halt an agent is governance.

## Layer 7: The decision record

The output. Every decision the system made, with its trigger, evidence, lineage, model versions, policy gate, confidence and outcome.

Most estates do not have this layer at all — the decision is implicit in a status field somewhere. Adding it turns audit into a query, explanation into a render, and your own operating history into training data.

## Which layers you can defer

Honestly:

- **Compute** — yes, initially. Start serverless, commit when sustained utilisation justifies it.
- **Models** — yes. Start with what is available; keep names out of application code so you can change your mind.
- **Data** — no. This is the one. Deferring it means producing outputs you cannot defend and redoing the work with a credibility deficit.
- **Retrieval** — partially. A simple implementation is fine to start; scoping and abstention are not optional.
- **Orchestration** — yes. Plenty of value ships before any agent exists.
- **Governance** — the evaluation gate, no. Everything else, mostly.
- **Decision record** — no, and specifically not lineage capture, which cannot be reconstructed after the fact.

The pattern: the layers you can defer are the ones you can change later. The ones you cannot defer are the ones that write history.`,
  },

  {
    kind: DocKind.ARTICLE,
    slug: "retrieval-augmented-generation-explained",
    title: "Retrieval-augmented generation, explained properly",
    subtitle: "What RAG actually does, where it breaks, and the four decisions that determine whether it works.",
    excerpt:
      "RAG is usually explained as 'search then generate'. That description is accurate and hides every decision that determines whether it works in an enterprise.",
    category: "Foundations",
    author: "Aisha Rahman",
    authorRole: "Principal Data Scientist",
    readMinutes: 10,
    publishedAt: "2026-06-30",
    tags: ["RAG", "Retrieval", "Foundations"],
    icon: "Search",
    accent: "azure",
    seoDescription:
      "A practical explanation of retrieval-augmented generation: chunking, embedding, scoping, re-ranking, abstention and where enterprise RAG actually breaks.",
    body: `RAG is usually introduced as: search your documents, put the results in the prompt, generate an answer. That is correct and it conceals every decision that matters.

## What the pipeline really is

**Ingestion.** Documents are parsed, split into chunks, embedded into vectors and indexed with metadata.

**Query time.** The question is embedded, similar chunks are retrieved, usually re-ranked, assembled into context, and passed to the model with instructions to answer from that context.

Five decisions inside that determine whether it works.

## Decision 1: how you chunk

The default — fixed-size windows with overlap — is wrong for most enterprise documents, because enterprise documents have structure that carries meaning.

A contract clause is a unit. A policy section has a scope statement at the top that governs everything below it. A clinical note has headings that change how content should be read. Slicing through those produces chunks that say things the document does not.

Chunk on the document's own structure. Carry the section path as metadata, so a retrieved paragraph arrives labelled "Section 4.2 — Exclusions" rather than floating free.

## Decision 2: what you retrieve against

Pure vector similarity is good at meaning and bad at exactness. It will happily miss a document that contains the exact policy number you asked for, because number strings embed poorly.

Hybrid retrieval — dense vectors plus keyword search, fused — is the practical default. Enterprise questions contain identifiers, and identifiers need lexical matching.

## Decision 3: scope

This is the one that separates a demo from a production system.

Retrieval must be restricted to what this question is about and what this user may see: the resolved entity, the permitted documents, the current versions, the right jurisdiction.

Unscoped retrieval produces the failure that ends enterprise programmes — an answer that blends two customers, fluently. Scope is enforced in the query, not hoped for in the prompt.

## Decision 4: re-ranking

Initial retrieval optimises for recall: get the candidates. Re-ranking optimises for precision: order them by actual relevance to this question, using a model that sees query and document together.

Retrieve twenty, re-rank, pass four. Passing twenty because the context window allows it costs money and measurably degrades answers — models attend worse across long, diluted contexts.

## Decision 5: whether it can abstain

A retrieval system that always returns its top results will always produce an answer, including when the corpus contains nothing relevant.

Score retrieval quality independently of generation. If the best candidates are weak, say so and stop. Measure correct refusal as a first-class outcome alongside correct answer.

## Where RAG is the wrong tool

RAG grounds an answer in retrieved text. It is poor at anything requiring computation, aggregation or exhaustive coverage.

"How many claims over 50,000 did we settle last quarter" is a query, not a retrieval. "Summarise every contract with an auto-renewal clause" needs exhaustive filtering, not top-k similarity.

Route those to a deterministic path. The most common enterprise RAG failure after unscoped retrieval is asking it to do arithmetic over a corpus by finding documents that mention numbers.

## The honest summary

RAG works well when the question is answerable from a small number of specific documents, the corpus is governed, retrieval is scoped, and the system is allowed to decline.

It works badly when any of those are missing — and three of the four are properties of your data layer, not your model.`,
  },

  {
    kind: DocKind.ARTICLE,
    slug: "serverless-versus-dedicated-endpoints",
    title: "Serverless or dedicated endpoints: how to actually decide",
    subtitle: "The crossover point, the latency difference, and the compliance constraints that decide it for you.",
    excerpt:
      "A decision guide for choosing between serverless inference and dedicated capacity, including the utilisation maths and the cases where there is no choice.",
    category: "Infrastructure",
    author: "Daniel Okonkwo",
    authorRole: "Head of Platform Engineering",
    readMinutes: 8,
    publishedAt: "2026-06-11",
    tags: ["Infrastructure", "Cost", "Deployment"],
    icon: "Server",
    accent: "ember",
    seoDescription:
      "Serverless versus dedicated inference endpoints: utilisation crossover, latency behaviour, residency constraints and why most estates should run both.",
    body: `Both options are correct for different workloads, and most estates should run both. Here is how to decide which goes where.

## Serverless inference

You send requests, you are billed per token, and capacity is somebody else's problem.

**Good for:** unpredictable or spiky volume, early-stage workloads, low sustained utilisation, and anything where you would rather not forecast.

**Costs you:** a cold-start tail on less common models, less control over the P99, noisy-neighbour variance, and — depending on the provider — less say over exactly where the request is served.

## Dedicated endpoints

Reserved capacity, yours, billed by the hour whether used or not.

**Good for:** predictable base load, latency-sensitive interactive paths, workloads with residency or isolation requirements, custom or fine-tuned models, and anything above the utilisation crossover.

**Costs you:** the idle hours, and a forecasting obligation.

## The crossover

Dedicated becomes cheaper above a sustained utilisation that, in our deployments, sits between 30% and 45%.

Two things people get wrong:

**Peak instead of sustained.** A cluster at 90% for two hours and 5% for twenty-two is not a 90% cluster. Measure the sustained figure over at least a fortnight.

**Ignoring the trough.** If you can fill idle hours with batch work, evaluation runs and embedding refresh, effective utilisation rises substantially and the crossover moves in dedicated's favour. That requires a scheduler that can preempt, and workloads that tolerate it.

## Latency

Dedicated is not automatically faster per token. What it is, is *more predictable*, and predictability is usually what the requirement actually needs.

If you have promised a customer-facing P95, you need a tail you control. Serverless P50 can be excellent while the P99 varies with somebody else's load.

## When it is not a choice

**Residency.** If the workload must be served in a specific jurisdiction or inside your own network boundary, that usually means dedicated.

**Isolation.** Some regulatory positions do not permit shared inference infrastructure regardless of logical separation.

**Custom weights.** A model you have fine-tuned generally needs somewhere to live.

**Air-gapped.** No serverless option exists by definition.

## The pattern that works

Reserve to the reliable base load. Burst to serverless above it. Route by workload class: interactive paths to dedicated for the predictable tail, batch and overflow to serverless.

Start every new workload serverless. Move it when its sustained utilisation earns it, not when someone estimates that it will.

## What to instrument first

You cannot make this decision from impressions. Before committing to anything, have per-workload request volume over time, sustained utilisation, latency distributions including the tail, and cost attributed to the workload rather than to the platform.

With those four numbers the decision is arithmetic. Without them it is a debate.`,
  },

  {
    kind: DocKind.ARTICLE,
    slug: "fine-tuning-prompting-or-retrieval",
    title: "Fine-tuning, prompting or retrieval: a decision guide",
    subtitle: "Three techniques that solve different problems and are routinely used for each other's.",
    excerpt:
      "Retrieval adds knowledge. Fine-tuning changes behaviour. Prompting shapes a single request. Most teams reach for the wrong one first.",
    category: "Foundations",
    author: "Hana Sato",
    authorRole: "Lead Researcher, Applied Evaluation",
    readMinutes: 9,
    publishedAt: "2026-05-26",
    tags: ["Fine-tuning", "RAG", "Prompting", "Foundations"],
    icon: "SlidersHorizontal",
    accent: "purple",
    seoDescription:
      "When to fine-tune, when to retrieve and when to prompt: what each technique actually changes, and the failure modes of using the wrong one.",
    body: `These three get discussed as alternatives on a cost-and-effort scale. They are not alternatives. They change different things.

## What each one actually does

**Prompting** shapes how the model handles a single request. It is the cheapest to change and it changes nothing durable.

**Retrieval** puts knowledge the model does not have into the context at query time. It adds *facts*.

**Fine-tuning** adjusts the model's weights so it behaves differently by default. It changes *behaviour*: format, tone, task-specific judgement, domain conventions.

The most common mistake is trying to add knowledge by fine-tuning. It sort of works, and it works badly: the knowledge is baked in at training time, becomes stale immediately, cannot be updated without retraining, and cannot be cited. Then somebody asks where a claim came from and there is no answer.

## Use retrieval when

- The knowledge changes. Prices, policies, inventory, case history.
- The answer must cite a source.
- Different users may see different subsets of it.
- The corpus is large relative to what fits in context.

Essentially every enterprise question about company-specific facts falls here.

## Use fine-tuning when

- You need a consistent output format that prompting achieves unreliably.
- The task has domain conventions that are hard to express as instructions — how a claims adjuster phrases a reserve rationale, how a radiologist structures an impression.
- Latency or cost require a smaller model to do a job a large one does well. This is the most underrated use: fine-tune a small model on the large model's outputs for a narrow task and serve it for a fraction of the cost.
- You have hundreds to thousands of high-quality examples of the behaviour you want.

## Use prompting when

- You are still learning what good output looks like.
- The requirement varies per request.
- The volume does not justify anything more.

Prompting is also the correct first attempt at everything. If it works, stop.

## They compose

The mature configuration is usually all three: a fine-tuned model that behaves the way the domain expects, retrieval supplying current governed facts, and prompting handling per-request variation.

Order of adoption: prompt first, add retrieval when facts are needed, fine-tune when behaviour is the remaining gap.

## Costs

**Prompting:** near zero to change, but longer prompts are billed on every request forever. A 2,000-token system prompt at scale is a real line item.

**Retrieval:** the index, the embedding refresh, the per-request retrieval compute, and the larger contexts. Grows with corpus size, not just request volume.

**Fine-tuning:** the training run, the data preparation — usually the largest part — the evaluation, and a retraining cadence, because a tuned model drifts as the domain moves.

## A caution about data preparation

Fine-tuning quality is dominated by dataset quality, not by hyperparameters. Five hundred carefully curated examples routinely beat fifty thousand scraped ones.

If your fine-tune underperforms, the answer is almost always in the data. Teams spend weeks on learning rates when the actual issue is that 15% of the training examples are wrong.`,
  },

  {
    kind: DocKind.ARTICLE,
    slug: "designing-evaluation-suites",
    title: "Designing an evaluation suite from scratch",
    subtitle: "A practical guide to the first hundred cases and the rubric that grades them.",
    excerpt:
      "You do not need ten thousand cases. You need a hundred that represent the ways this system can hurt you, graded by someone who knows.",
    category: "Evaluation",
    author: "Hana Sato",
    authorRole: "Lead Researcher, Applied Evaluation",
    readMinutes: 9,
    publishedAt: "2026-05-01",
    tags: ["Evaluation", "Quality", "Testing"],
    icon: "Microscope",
    accent: "slate",
    seoDescription:
      "How to build your first AI evaluation suite: sourcing cases from real failures, writing rubrics, scoring refusals and keeping the suite from going stale.",
    body: `Start smaller than you think and weight it harder than feels comfortable.

## Step 1: define what a failure costs

Before writing a single case, list the ways this system can hurt the organisation, and rank them.

For a claims system that might be: settling a fraudulent claim, refusing a valid one, breaching a regulatory timescale, exposing another claimant's data, or producing a rationale that will not survive a complaint.

This list determines everything about the suite. A suite that scores all errors equally will report an average that hides the one you built it for.

## Step 2: source cases from reality

In priority order:

**Historical failures.** Every incident, complaint, overturned decision and near-miss the organisation already has. These are known-real failure modes and they are free.

**Expert adversarial cases.** Ask three domain experts to spend a day trying to break it. An underwriter who has spent twenty years finding the edge of a policy wording will out-perform any automated red-team.

**Boundary cases.** Just inside and just outside every policy threshold. This is where automated systems produce their most expensive errors.

**Representative sample.** Ordinary cases, as a regression floor.

A hundred cases across these four beats a thousand random ones.

## Step 3: write rubrics, not reference answers

Do not grade on similarity to a golden answer — that measures phrasing.

For each case, write what a good response must do and must not do. Typically five to eight criteria, some pass/fail, some graded:

- Reaches the correct disposition.
- Every factual claim is supported by the retrieved evidence.
- Applies the correct policy version.
- Declines where the evidence is insufficient.
- Does not assert anything about parties not in scope.
- Rationale would survive a complaint.

The domain owner writes these. Not engineering — the person who will be accountable when it goes wrong.

## Step 4: score four outcomes, not two

Correct answer, incorrect answer, correct refusal, incorrect refusal.

Collapsing refusals into failure produces a system tuned to always answer, which is precisely the behaviour that ends clinical and financial deployments.

## Step 5: weight and set a threshold

Apply the cost ranking from step 1. A catastrophic failure might be worth twenty ordinary ones.

Then set a promotion threshold and write it down before you run anything, because thresholds set after seeing results are not thresholds.

Include hard gates: any case in the catastrophic class that fails blocks promotion regardless of the aggregate.

## Step 6: run it on the whole system

Not the model in isolation. The deployed path: retrieval, prompt assembly, deterministic checks, model, post-processing, policy gates.

Most production failures come from retrieval returning the wrong thing or a gate being misconfigured. Model-only evaluation cannot see either.

## Step 7: keep it alive

**Accrue.** Every production failure, human override and sampled disagreement becomes a candidate case. Review monthly.

**Audit for staleness.** Annually, check that each case still reflects current policy. A case encoding a superseded rule punishes correct behaviour, which is worse than no case at all.

## The property that matters most

The suite must be able to block a release, blocking must be a normal outcome rather than an incident, and the person who owns it must not report to the person shipping the model.

A suite that has never failed anything is a report wearing a gate's job title.`,
  },

  {
    kind: DocKind.ARTICLE,
    slug: "data-residency-and-sovereignty-basics",
    title: "Data residency, localisation and sovereignty are three different things",
    subtitle: "The distinctions that matter in a procurement document, and the questions that separate them.",
    excerpt:
      "These three terms get used interchangeably in requirements documents. They impose very different obligations, and conflating them is expensive.",
    category: "Compliance",
    author: "Grace Adeyemi",
    authorRole: "Director, Sovereign Programmes",
    readMinutes: 8,
    publishedAt: "2026-04-16",
    tags: ["Compliance", "Sovereignty", "Residency", "Government"],
    icon: "Globe",
    accent: "verdigris",
    seoDescription:
      "The difference between data residency, data localisation and digital sovereignty — and the questions to ask to find out which one you actually need.",
    body: `These three appear in the same sentence in most requirements documents and impose materially different obligations.

## Data residency

**Data is stored in a specified geography.**

The weakest of the three. It constrains storage location and typically says nothing about processing, about who can access it, or about who controls the system.

Data can be resident in a country and readable by an operations team on another continent, under another jurisdiction's legal compulsion. That is compatible with most residency clauses as written.

## Data localisation

**Data is stored *and processed* in a specified geography, and generally may not leave it.**

Stronger, and where most regulated enterprise requirements actually sit. It constrains the processing path, which for AI systems means inference and training must happen in-region — a much more demanding constraint than storage.

Common gaps to check: does it cover backups, does it cover logs and telemetry, does it cover the vector index, and does it cover the model's context window during inference.

## Digital sovereignty

**The capability remains under the jurisdiction's control, including when external parties withdraw.**

This is a control question, not a geography one. The test: *does this keep working, and can it keep improving, if every foreign party becomes unavailable?*

That implicates model availability, control-plane licensing, update supply, training capability, evaluation ownership, operational staffing and exit. Geography is a small part of it.

## Questions that establish which you need

Ask the risk owner:

1. **Where must the data be stored?** — residency.
2. **Where must it be processed?** — localisation.
3. **Who may access it, and under whose legal compulsion?** — this usually reveals that the requirement is stronger than the document says.
4. **What happens if the vendor withdraws the model?** — sovereignty. If the answer is "we would have a problem", it is a sovereignty requirement regardless of what the heading says.
5. **Who decides what is safe to deploy?** — evaluation ownership, and almost never asked.
6. **Could you run this without us in ninety days?** — the honest sovereignty test.

## What each costs

**Residency** is close to free in any multi-region platform.

**Localisation** costs the elasticity of a global estate: you cannot burst into another region during a spike, and you may need a dedicated deployment per jurisdiction.

**Sovereignty** costs the most — a capability gap against hosted frontier models, compute priced at peak rather than rented, and an operating model with local staffing and capability transfer. Expect 30–60% above an elastic equivalent.

Buying sovereignty when you needed localisation is one of the more expensive mistakes available in this market. Buying residency when you needed sovereignty is the cheaper mistake that surfaces at the worst possible moment.

## A note on multi-jurisdiction estates

Organisations operating across jurisdictions need routing that enforces this per request, from attributes on the request, with a hard failure when no compliant route exists.

The design decision to make deliberately, in advance: if the compliant endpoint is unavailable, does the request fail or fall back? For localisation and sovereignty requirements the answer is almost always that it fails — and that has to be built, because the convenient default is the other one.`,
  },

  {
    kind: DocKind.ARTICLE,
    slug: "agent-tool-calling-fundamentals",
    title: "Tool calling, properly: designing the surface an agent acts through",
    subtitle: "An agent is only as good as its tools. Here is what a good tool contract looks like.",
    excerpt:
      "Most agent failures attributed to the model are tool design failures. Typed contracts, one verb per tool, and explicit errors fix more than a bigger model will.",
    category: "Agents",
    author: "Rory Chen",
    authorRole: "Staff Engineer, Agent Runtime",
    readMinutes: 8,
    publishedAt: "2026-03-05",
    tags: ["Agents", "Tools", "Engineering"],
    icon: "Wrench",
    accent: "azure",
    seoDescription:
      "How to design tool contracts for enterprise AI agents: one verb per tool, typed parameters, explicit failure modes, scoped permissions and no escape hatches.",
    body: `An agent is a model plus a set of tools plus a policy about when it may use them. Most of the quality is in the second part, and most teams spend their attention on the first.

## One tool, one verb

A "manage subscription" tool that upgrades, downgrades, pauses and cancels depending on parameters is four tools sharing a name. The model has to infer which one it is invoking from parameter combinations, and it will occasionally infer wrong in a way that cancels something.

Split them. Error rates fall, permission scoping becomes possible, and the tool register becomes something a risk function can read.

## Type everything, and constrain it

Free-text parameters are where bad calls come from. Where a value is one of a known set, make it an enum. Where it is a date, make it a date with a format. Where it has a valid range, state the range.

The model sees the schema. A constrained schema is instruction that cannot be ignored, which is a categorically better mechanism than a sentence in a prompt.

## Name things for a reader who has never seen the system

Tool and parameter names are read by a model with no access to your internal conventions. A tool called *proc_adj_v2* with a parameter *fl* is a guessing game.

Write descriptions for a new joiner: what it does, when to use it, when *not* to use it, and what happens as a side effect. The "when not to use it" line is the most valuable and the most often omitted.

## Return what changed

A tool that returns *success: true* tells the agent nothing it can verify. Return the resulting state — the new plan, the new balance, the created ticket id.

This lets the agent confirm its own work, and it makes the trace far more useful when someone reads it eighteen months later.

## Make failure modes explicit and distinct

"Insufficient permission", "record not found", "record locked by another process" and "validation failed on field X" require different recoveries. A generic error string means the agent guesses, and guessing after a failure is where retry storms come from.

Type the errors. Say which are retryable.

## Scope permissions per tool, not per agent

An agent that reads billing and writes tickets holds two scopes. They should be grantable and revocable independently, and the trace should record which was exercised.

Per-agent permissions collapse into a superset that nobody can reason about within about two quarters.

## No escape hatches

The general-purpose tool — run arbitrary SQL, call any internal endpoint, execute a shell command — will be added for flexibility during development and will be used for exactly the things you did not want.

It also destroys the governance property that matters: that someone can read the tool register and enumerate everything the agent can do. Remove it before production. We did, after learning why.

## Idempotency

Agents retry. Networks fail mid-call. A tool that creates a duplicate refund on retry is a defect waiting for a bad afternoon.

Take an idempotency key on every state-changing tool, and honour it.

## Keep the set small

Beyond roughly twenty to thirty tools, selection accuracy degrades noticeably regardless of model.

If you need more surface area, compose: a small set of high-level tools that internally orchestrate, rather than a flat list of eighty primitives. The agent's job is deciding what to do, not assembling low-level calls.`,
  },

  {
    kind: DocKind.ARTICLE,
    slug: "cost-attribution-for-ai-workloads",
    title: "Cost attribution for AI workloads",
    subtitle: "Tag from day one, report cost per decision, and stop having opinion-based capacity meetings.",
    excerpt:
      "Without attribution, every conversation about AI cost is a negotiation between impressions. With it, the conversation is arithmetic.",
    category: "Economics",
    author: "Tomas Lindqvist",
    authorRole: "Distinguished Engineer, Compute",
    readMinutes: 7,
    publishedAt: "2026-02-11",
    tags: ["FinOps", "Cost", "Operations"],
    icon: "LineChart",
    accent: "amber",
    seoDescription:
      "How to attribute AI infrastructure cost to business workloads: what to tag, how to allocate shared and idle capacity, and why cost per decision is the right unit.",
    body: `The single most useful thing you can do in the first week of an AI programme costs almost nothing: tag every request with its business context.

## What to tag

At minimum, on every request:

- **Business unit** — who pays.
- **Use case** — which capability this serves.
- **Environment** — production, evaluation, development.
- **Model and route** — what actually served it.
- **Trigger type** — interactive, batch, retry, evaluation.

The last one matters more than it looks. Estates routinely discover that a meaningful share of their spend is retries and evaluation runs, which appear in no business case.

## Why day one

Retrofitting attribution across a live estate means threading context through call paths that were not designed to carry it, across services owned by different teams, while the estate is in use.

It is a quarter of work to add later and an afternoon to add at the start. And until it exists, every capacity and value conversation is people trading impressions.

## Allocate shared and idle capacity, do not hide it

Two lines get quietly dropped and both distort the picture.

**Shared services** — retrieval, embedding refresh, the trace store, the control plane — cost real money. Allocate them by usage, not evenly, and not into a central bucket nobody owns.

**Idle reserved capacity** is the honest one. If you reserve to base load, the trough is paid for. Attributing it to whoever justified the reservation makes the reserve-versus-burst decision visible instead of comfortable.

## Report cost per decision

Per-token cost is not decision-grade. It is not comparable to anything the business already measures.

Cost per decision is, because the manual baseline exists: this decision costs 14 units automatically and 90 manually, and here is the distribution.

Compute it as (serving + retrieval + evaluation + amortised retraining + attributed idle + human review) ÷ decisions. The human review term is the one people leave out, and for workloads with mandatory approval it can dominate.

## Distributions, not averages

Average cost per decision hides everything interesting. The distribution shows you the long tail — the 3% of cases that consume 40% of the compute because they trigger deep retrieval, long contexts and escalation.

That tail is where optimisation actually pays, and it is invisible in an average.

## Make it visible to the people who can change it

A cost dashboard only finance can see changes nothing.

Put cost per decision, by use case, in front of the teams who own those use cases, weekly. In our experience the first four weeks of visibility produce more saving than the following six months of optimisation work — because someone notices a job running hourly that only needed to run daily.

## What to do with the number

In rough order of payback:

1. Right-size the model. The largest available is the default and usually wrong.
2. Cache. Enterprise query distributions repeat far more than people expect.
3. Route. Small model for the easy majority, escalate on uncertainty.
4. Schedule the trough with batch and evaluation work.
5. Trim retrieval. Twelve documents where four would do is a cost line disguised as thoroughness.`,
  },
];
