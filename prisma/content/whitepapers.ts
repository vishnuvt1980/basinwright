import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Whitepapers — the long-form architectural arguments.

   Two of these are marked `gated`: the summary is public, and the reference
   implementation and appendices live in the developer portal behind the
   subscription. The reader gets the whole argument either way.
--------------------------------------------------------------------------- */

export const whitepapers: DocSeed[] = [
  {
    kind: DocKind.WHITEPAPER,
    slug: "sovereign-ai-reference-architecture",
    title: "A reference architecture for sovereign AI",
    subtitle:
      "What it takes to build an AI capability that survives the withdrawal of every foreign vendor in it.",
    excerpt:
      "Data residency is not sovereignty. This paper sets out the seven dependencies a sovereign estate has to eliminate, and the architecture that eliminates them.",
    category: "Architecture",
    author: "Sovereign",
    authorRole: "Regulated Programmes Agent",
    readMinutes: 22,
    featured: true,
    publishedAt: "2026-06-02",
    tags: ["Sovereign AI", "Architecture", "Government", "Air-gapped"],
    icon: "Building2",
    accent: "ember",
    seoDescription:
      "A reference architecture for sovereign AI: the seven dependencies that make an estate non-sovereign, and how to eliminate each one.",
    body: `## Summary

Most procurement documents that ask for "sovereign AI" are asking for data residency. Residency is necessary and nowhere near sufficient. An estate whose data never leaves the country but whose models can be withdrawn, whose control plane phones home for licences, and whose operators are all foreign nationals is not sovereign in any sense that survives a bad week.

This paper defines sovereignty operationally: **an estate is sovereign if it continues to function, and can continue to be improved, when every external party is unavailable.** It then works through the seven dependencies that break that property, and what each one costs to eliminate.

## Why residency is the wrong test

Residency answers "where does the data sit". It says nothing about:

- who can stop the system working,
- who can change what it does,
- who can rebuild it if it breaks,
- and who owns what it has learned.

A capability can pass every residency test and still be a rental. If the model is served through an API you do not control, the answer to all four questions is "somebody else".

## The seven dependencies

### 1. Model availability

If the estate depends on a hosted frontier model, the vendor's commercial, legal or political decisions are your availability. Model deprecation is normal product management for the vendor and an outage for you.

**Elimination:** open-weight foundation models held in-country, with weights on media you control. This is a real capability trade — the best open-weight models trail the best hosted ones — and it is a trade sovereign programmes should make consciously rather than discover later.

### 2. Control plane licensing

Many enterprise platforms validate licences over the network. In an air-gapped estate that is a hard failure, and in a partially-connected one it is a lever somebody else holds.

**Elimination:** offline licence material with a validity window long enough to survive any plausible disruption, and a documented degraded mode when it expires.

### 3. Model updates and supply

If new model versions arrive only over the network, an air gap freezes the estate at its deployment-day capability.

**Elimination:** a physical import path with the receiving country's own inspection and evaluation process in front of promotion. The point is not that media crosses the gap — it is that the *decision to promote* is made in-country.

### 4. Training capability

An estate that can serve models but not train them is a museum. The first time a domain shifts, it is stuck.

**Elimination:** in-country compute sized for the retraining cadence, not just the serving load. This is the single largest cost line in a sovereign programme and the one most often cut first.

### 5. Evaluation

Whoever owns the evaluation suite decides what "good enough to deploy" means. If that is the vendor, the vendor is setting your safety bar.

**Elimination:** evaluation suites authored and owned in-country, versioned as national assets, with promotion gated on them.

### 6. Operations

A system that only a foreign team can run is available only as long as that team is. This is where most "sovereign" deployments quietly fail — the architecture is sound and the rota is not.

**Elimination:** a named local counterpart for every operating role, a written transfer plan with dates, and periodic exercises where the local team runs the estate unaided.

### 7. Exit

The last dependency is the one nobody writes down: what happens when the relationship ends. If the answer is "start over", every other guarantee was decoration.

**Elimination:** a written exit position, agreed before the first deployment, specifying exactly which artefacts transfer — weights, corpora, evaluation suites, pipeline definitions, runbooks — and in what format.

## The architecture

The estate divides into four planes, and the sovereignty question is asked separately of each.

**Compute plane.** In-country accelerators, sized for serve plus retrain. Physical access controlled by the host. No remote management path that the host cannot sever.

**Data plane.** The governed corpus, entity resolution, quarantine and lineage. This is the plane that accumulates value, and it must never have an egress path. Everything downstream is reproducible from it; nothing else is.

**Model plane.** Open-weight base models, domain models trained in-country, versioned weights, and the evaluation suites that gate promotion. Weights are held by the host, not by the vendor.

**Control plane.** Orchestration, policy, routing, observability, audit. Offline-licensed, with an explicit degraded mode and no telemetry egress.

Around all four sits the operating model — runbooks, rotas, clearances and the transfer plan — which is not an architectural diagram but is the thing that most often determines whether the diagram is true.

## What it costs

Sovereignty is not free and the honest numbers matter more than the architecture.

Expect a capability gap against hosted frontier models at deployment, narrowing over time as domain training compounds. Expect compute costs materially above an elastic public-cloud equivalent, because you are buying peak rather than renting it — model it against your own utilisation before committing to a figure. Expect the operating model to be the longest lead item — clearances and capability transfer take longer than hardware.

Against that: the estate keeps working, it improves on your own data, and nobody else decides when it stops.

## What we recommend

Start with the data plane. It is the plane that accumulates irreplaceable value, it is the least glamorous, and it is the one that determines whether everything above it can be rebuilt. A sovereign programme that begins with GPUs and gets to entity resolution in year two has spent a year producing decisions it cannot defend.

Then write the exit plan. Before the first deployment, while nobody is under pressure, and with the specificity of a contract rather than the vagueness of a principle.`,
  },

  {
    kind: DocKind.WHITEPAPER,
    slug: "governing-agentic-systems",
    title: "Governing agentic systems in regulated enterprises",
    subtitle:
      "A control framework for software that takes actions, written for people who will have to defend it.",
    excerpt:
      "Agents that only produce text are a content risk. Agents that call tools are an operational one. This paper sets out the six controls that make the second kind defensible.",
    category: "Governance",
    author: "Ledger",
    authorRole: "Governance & Assurance Agent",
    readMinutes: 19,
    featured: true,
    publishedAt: "2026-05-07",
    tags: ["Agents", "Governance", "Risk", "Audit"],
    icon: "Scale",
    accent: "verdigris",
    seoDescription:
      "A control framework for agentic AI in regulated enterprises: scoped tool contracts, policy gates, evidence quorum, traces, evaluation and kill switches.",
    body: `## Summary

The governance conversation about generative AI has been dominated by output risk: what the model says, whether it is biased, whether it made something up. That framing was adequate while models only produced text.

An agent with tool access is a different object. It changes state in systems of record. It moves money, alters entitlements, files tickets, cancels services and books capacity. The relevant discipline is not content moderation — it is the same discipline that governs any other automated actor in a regulated firm: scoped authority, segregation of duties, approval thresholds, evidence retention and the ability to stop it.

This paper sets out six controls. None of them are novel. What is novel is applying them to a component that is probabilistic at its core.

## Control 1: Typed, scoped tool contracts

Every action an agent can take must be a declared tool with a typed contract, a permission scope and an owner. No general-purpose execution surfaces — no arbitrary shell, no unconstrained database access, no "call any internal API" adapter.

The test: someone in second line should be able to read the tool register and enumerate, exhaustively, everything the agent is capable of doing. If the answer is "it depends what it decides to do", the system is not governable.

Scopes should be per-tool, not per-agent. An agent that can read the billing platform and write to the ticketing system holds two different scopes, and they should be revocable independently.

## Control 2: Policy gates written by the risk owner

For each tool, the conditions under which it may be invoked autonomously must be written by whoever owns the risk — not by the engineering team, and not inferred from a prompt.

In practice these are threshold rules and they should be boring: value bands, customer flags, jurisdiction, time of day, cumulative exposure within a window. Boring is the goal, because a gate that requires interpretation is a gate that will be interpreted differently under pressure.

Two failure patterns to avoid:

- **Prompt-as-policy.** Putting the rule in the system prompt makes compliance a function of model behaviour. Gates must be enforced outside the model, in the runtime, where they cannot be argued with.
- **Confidence-as-policy.** "Act when confidence exceeds 0.9" conflates two different questions. Confidence is an input to eligibility. Eligibility is a policy decision.

## Control 3: Evidence quorum before consequential action

Consequential actions should require agreement across independent evidence lanes rather than a single model's judgement: retrieved evidence, deterministic constraint checks, and reasoning over both.

The deterministic lane is the one that carries the non-negotiables — limits, entitlements, hours-of-service, sanctions, coverage. These are not things to be learned. They are things to be checked, and an option that fails them should never be surfaced, let alone executed.

## Control 4: A trace for every action, retained like a transaction record

Every agent action produces a trace containing: the trigger, the evidence retrieved with record-level lineage, the tools called with their arguments, the policy gate that applied, the model versions in play, the computed confidence per lane, and the outcome.

Retention should match the underlying business record, not the shorter retention that log infrastructure defaults to. If a payment record is held for seven years, the trace of the agent that authorised it should be too.

The practical test is a regulator asking for a sample of 200 decisions from eighteen months ago. If producing that pack is a project, the control is not in place.

## Control 5: Evaluation gates before promotion, on the risk owner's suite

No agent version reaches production without clearing an evaluation suite owned by the risk function. The suite should be weighted toward the failure modes that matter to the firm rather than toward general capability benchmarks.

Two properties matter more than suite size:

- **It must be able to fail a release.** A suite that has never blocked a promotion is not a gate, it is a report.
- **It must be versioned and owned outside engineering.** Otherwise the bar moves quietly whenever it is inconvenient.

## Control 6: A kill switch that has been used

Every agent needs a documented, tested mechanism to stop it — per-tool, per-agent and estate-wide — that does not require an engineer to deploy anything.

Test it on a schedule, in production, during business hours. An untested kill switch is an assumption.

## Segregation of duties

The uncomfortable question in most implementations is who can change the policy gates. If the same team can write the agent and relax the threshold it operates under, the control is nominal.

Gate definitions should live under change control with the risk owner as approver, versioned separately from the agent code, with an audit trail on every change. This is standard practice for limits systems and it should be standard here.

## Where human review actually belongs

The reflexive answer — a human approves everything — produces a queue, and queues degrade. Within six months the reviewer is approving in batches without reading, which is worse than no control because it manufactures evidence of oversight that did not happen.

Put humans where judgement changes the outcome: cases at the boundary of policy, cases with vulnerable parties, cases where the evidence lanes disagree, and a continuous random sample of the autonomous population, re-worked blind.

The blind sample is the control most often missing and the one that tells you whether any of the others are working.

## Applying this

None of this requires a new regulatory framework. Firms already know how to govern automated actors with limited authority, because they have been doing it with trading systems, payment engines and workflow automation for decades.

The mistake is treating an agent as an AI problem and routing it to a model risk process designed for scorecards. It is an operational risk problem with a probabilistic component, and the existing operational controls apply with one addition: the evidence trail has to capture what the system considered, not only what it did.`,
  },

  {
    kind: DocKind.WHITEPAPER,
    slug: "cognitive-data-hub-entity-resolution",
    title: "Entity resolution is the whole game",
    subtitle:
      "Why enterprise AI programmes stall at the data layer, and what a governed record actually requires.",
    excerpt:
      "Enterprise AI programmes rarely stall on the model. They stall the moment two systems disagree about who the customer is.",
    category: "Data",
    author: "Meridian",
    authorRole: "Enterprise Architecture Agent",
    readMinutes: 17,
    publishedAt: "2026-04-14",
    tags: ["Data", "Entity Resolution", "Cognitive Data Hub", "Lineage"],
    icon: "Database",
    accent: "brass",
    seoDescription:
      "Why enterprise AI stalls at entity resolution, and what a governed record requires: survivorship, quarantine, lineage and a quality bar with real rejects.",
    body: `## Summary

Enterprise AI programmes stall in a place the organisation rarely expects. It is seldom the model, seldom the infrastructure, and seldom the use case.

It is the point where the system has to answer a question about an entity that exists differently in four systems, and cannot.

This paper is about that layer: what a governed record is, why survivorship rules are a business decision rather than a technical one, why quarantine is a feature, and why lineage has to be at record level to be worth anything.

## The shape of the failure

A typical pilot works. It works because it was scoped to one system, usually the one with the cleanest data, and because a human picked the documents.

The move to production is where the estate arrives. Now the customer is in the CRM with one identifier, in the billing platform with another, in the document store as a name on a PDF, and in the support system as an email address that belongs to their assistant.

The retrieval layer does what it is designed to do: it returns the most similar content. Similar is not the same as *about the same entity*. The system produces an answer that blends two customers, and it produces it fluently, and somebody notices in a meeting.

At that point the programme has a credibility problem that is much more expensive than the technical one underneath it.

## What a governed record requires

### Resolution, not deduplication

Deduplication removes copies of the same row. Resolution decides that four different rows, with different identifiers, different spellings and different completeness, refer to one real-world entity — and produces a single record with a durable identity that survives future arrivals.

The difference matters because the entity is the unit everything downstream reasons about. Retrieval scoped to an entity is a fundamentally different operation from retrieval that hopes similarity implies identity.

### Survivorship rules owned by the business

When two sources disagree about an attribute, something must decide which wins. That decision is not technical.

Which system is authoritative for a customer's legal name? For their address? For their risk classification? The answers differ by attribute, by jurisdiction, and sometimes by product line, and they are the business's answers to give.

Letting engineering pick survivorship rules — usually "most recently updated wins" — produces records that are internally consistent and wrong in ways nobody detects for months.

### A quality bar with real rejects

A record that cannot be resolved with adequate confidence must not enter the decision path. It goes to quarantine: held, flagged, and routed for remediation.

Organisations resist this. Any visible quarantine rate reads as a defect in the pipeline. It is the opposite: a pipeline with no rejects is one that has silently decided to guess, and the guesses do not announce themselves.

Quarantine needs three things to work: a remediation path with an owner, an expiry policy for records nobody will ever fix, and visible metrics — because an unwatched quarantine becomes a landfill within a quarter.

### Lineage at record level

"This answer came from the customer corpus" is not lineage. It is a citation of a filing cabinet.

Useful lineage identifies the specific records that contributed to a specific output, their source systems, their versions at the time of use, and the survivorship decisions applied. It has to be captured at write time — reconstructing it later is not possible once the sources have moved on.

The test is a regulator, an auditor or an angry customer asking why a particular decision came out the way it did, eighteen months after the fact, about a record that has since changed four times.

## Why this layer is undervalued

It does not demo. Nobody has ever been promoted for a survivorship rule.

The demo is the agent answering a question in natural language. The reason the agent can answer correctly at estate scale is four months of unglamorous work underneath it, and that work is invisible precisely when it is done well.

The sequencing consequence is real. Programmes that start with the model and reach the data layer in year two spend year one producing outputs they cannot defend, and then have to explain why the numbers changed when the foundation was fixed.

## A practical order of work

1. **Pick the entity that matters most.** Customer, supplier, asset, patient, policy. One. The instinct to resolve everything at once is how this becomes a three-year programme with no output.
2. **Enumerate its systems of record honestly.** Including the shared inbox and the spreadsheet. Especially those — they exist because a real gap exists.
3. **Get survivorship rules written down and signed by an owner.** Per attribute. This will surface disagreements that predate the AI programme by a decade.
4. **Set the quality bar, and instrument quarantine before go-live.** With an owner and an expiry policy.
5. **Capture lineage from the first record.** Retrofitting is not possible.
6. **Only then build on top of it.**

Every step here is deferrable and every deferral compounds. The order matters more than the pace: the work deferred here is the work that determines whether anything above it can be defended.`,
  },

  {
    kind: DocKind.WHITEPAPER,
    slug: "evaluating-models-before-promotion",
    title: "Evaluation suites that can actually fail a release",
    subtitle:
      "Building a promotion gate the business owns, weighted to the failures that matter to it.",
    excerpt:
      "Public benchmarks tell you how a model does on somebody else's problem. This paper covers building the suite that decides whether a model touches yours.",
    category: "Evaluation",
    author: "Loom",
    authorRole: "Applied Evaluation Agent",
    readMinutes: 16,
    publishedAt: "2026-03-19",
    tags: ["Evaluation", "MLOps", "Governance", "Quality"],
    icon: "Microscope",
    accent: "slate",
    gated: true,
    seoDescription:
      "How to build enterprise evaluation suites that gate promotion: failure-weighted sets, graded rubrics, drift-aware refresh and suites the business owns.",
    body: `## Summary

Public benchmarks answer a question no enterprise is asking. They measure general capability on tasks chosen by researchers, and they are increasingly contaminated by their own popularity.

The question an enterprise is asking is narrower and more consequential: *does this version of this model, on our data, in our workflow, fail in ways we cannot accept?*

Answering it requires a suite the business owns, weighted toward the firm's own failure modes, with the authority to block a release. This paper covers how to build one.

## The property that matters most

An evaluation suite that has never blocked a promotion is not a gate. It is a report with a gate's job title.

Before anything else, establish that the suite can stop a release, that stopping a release is a normal outcome rather than an incident, and that the person who owns the suite does not report to the person shipping the model.

Everything else in this paper is detail by comparison.

## Build the set from failures, not from coverage

The instinct is to sample representatively — take 500 random cases and measure accuracy. This produces a number that is stable, comforting and nearly useless, because the cases that matter are rare by construction.

Build instead from:

- **Historical failures.** Every incident, complaint, overturned decision and near-miss the firm already has. These are the failure modes you know are real.
- **Adversarial cases.** Written by domain experts who are trying to break it. An underwriter who has spent twenty years finding the edge of a policy wording is a better adversary than any red-team framework.
- **Boundary cases.** Just inside and just outside every policy threshold. This is where automated systems produce their most expensive errors.
- **A representative sample.** Still needed — as a regression floor, not as the headline.

Weight them explicitly. A suite where a catastrophic failure counts the same as a formatting error will report an average that hides the thing you built it to catch.

## Grade with rubrics, not with similarity

String similarity against a reference answer measures whether the model phrased something the way the annotator did. For most enterprise tasks that is not the property under test.

Use graded rubrics per case, authored by the domain owner, scoring the dimensions that matter: is it factually supported by the retrieved evidence, does it apply the correct policy, does it hedge where it should, does it refuse where it must, is any claim present that the evidence does not support.

Rubric grading can be model-assisted, and should be spot-checked by humans on a fixed sample rate. The spot-check rate is a control, not an optimisation target.

## Measure refusal as a first-class outcome

Most suites score correct answers and treat everything else as failure. This produces models tuned to always answer, which is exactly the behaviour that ends clinical and financial pilots.

Score four outcomes separately: correct answer, incorrect answer, correct refusal, incorrect refusal. An incorrect answer and an incorrect refusal have very different costs, and collapsing them hides the trade you are actually making.

## Refresh the suite, and watch it drift

A suite built in January measures January's world. Products change, policies change, and the distribution of what arrives changes.

Two mechanisms:

- **Continuous accrual.** Every production failure, every human override and every sampled disagreement becomes a candidate case. Review the queue monthly.
- **Staleness audit.** Annually, sample the suite and ask whether each case still reflects current policy. Cases that encode a superseded rule are worse than no case, because they punish correct behaviour.

## Run it on the whole system, not the model alone

The unit under test is the deployed path: retrieval, prompt assembly, the deterministic checks, the model, the post-processing and the policy gates.

Model-only evaluation misses the majority of production failures, which come from retrieval returning the wrong thing, a gate misconfigured, or a prompt template that silently truncates. Test what you ship.

## Report it in a form a risk committee can use

Not a leaderboard. A short document: what changed, what the suite says, which cases regressed, what the failure-weighted score is against the promotion threshold, and an explicit recommendation with a name attached.

The suite produces evidence. A person makes the call. Automating the call away is how organisations end up unable to explain why a release went out.

---

*The reference implementation — suite scaffolding, rubric schemas, the grading harness and the promotion-gate integration — is in the developer portal, along with worked examples for financial services, clinical and industrial workloads.*`,
  },

  {
    kind: DocKind.WHITEPAPER,
    slug: "total-cost-of-inference",
    title: "The total cost of inference",
    subtitle:
      "A costing model for enterprise AI that survives contact with a CFO.",
    excerpt:
      "Per-token pricing is the smallest line in the bill. This paper builds the full cost stack — including the four costs that only appear in year two.",
    category: "Economics",
    author: "Anvil",
    authorRole: "Compute Systems Agent",
    readMinutes: 15,
    publishedAt: "2026-02-27",
    tags: ["Cost", "FinOps", "Compute", "Capacity Planning"],
    icon: "LineChart",
    accent: "amber",
    seoDescription:
      "A complete costing model for enterprise AI: serving, retrieval, evaluation, retraining, idle capacity and the year-two costs most business cases omit.",
    body: `## Summary

Most enterprise AI business cases are built on a per-token price. That price is real, and it is typically 20–35% of what the capability actually costs to run.

This paper builds the full stack, including four cost lines that reliably appear in year two and are reliably absent from year-one business cases.

## The visible cost

**Serving compute.** Tokens in, tokens out, at the model's rate — or, on dedicated capacity, the accelerator hours you have reserved.

The first structural decision is between the two. Serverless pricing is linear in usage and excellent at low and spiky volume. Dedicated capacity is fixed and cheaper per unit above a crossover point — plausibly somewhere around a third to a half of sustained utilisation, though that is a figure to derive from your own pricing rather than to inherit.

The mistake is choosing once. Most estates should run both: dedicated capacity sized to the reliable base load, serverless absorbing the peak.

## The costs that are usually missed

### Retrieval

Every grounded request does work before the model runs: embedding the query, searching the index, assembling and re-ranking context. At scale this is a meaningful compute line of its own, and it grows with corpus size rather than with request volume.

Index maintenance is the part that surprises people. A corpus that changes daily needs continuous re-embedding, and re-embedding the whole corpus after a model change is a project with a bill.

### Evaluation

Running a real evaluation suite against a candidate version costs compute, and running it against every candidate — including the ones you reject — costs more.

Budget for evaluation as a standing line rather than a project cost. A firm that spends nothing on evaluation is not saving money; it is deferring an incident.

### Retraining

Domain models decay. Not dramatically — a slow drift as the world moves away from the training distribution.

Budget for a retraining cadence from the start: data preparation, training compute, evaluation, and the staged rollout. Quarterly is typical for fast-moving domains, annually for stable ones. A business case with no retraining line is a business case for year one only.

### Idle capacity

Dedicated capacity is paid for whether or not it is used, and enterprise load is diurnal. A workload sized for the 09:00–17:00 peak in one time zone is substantially idle for two thirds of the day.

This is recoverable — batch work, evaluation runs, retraining and lower-priority queues all fit into the trough — but only if the platform can schedule across them. If it cannot, the idle time is simply cost.

## The costs nobody puts in a model

**Integration.** Connectors into systems of record, and the maintenance when those systems change. This is ordinary enterprise integration work and it does not become cheaper because AI is involved.

**Data preparation.** Entity resolution, survivorship rules, quarantine remediation. Front-loaded, substantial, and the highest-leverage money in the programme.

**Human review.** If policy requires human approval on a proportion of decisions, that is a per-decision operating cost that scales with volume. It belongs in the unit economics, not in a footnote.

**Change management.** The cost of people learning to work differently. Consistently underestimated and consistently the reason a deployed capability produces no measured benefit.

## A unit that survives scrutiny

Per-token cost is not a decision-grade unit. **Cost per decision** is, because it is comparable to the thing being replaced.

Cost per decision = (serving + retrieval + evaluation + amortised retraining + attributed idle + human review) ÷ decisions.

Computing this requires cost attribution down to the workload, which requires tagging every request with its business context from day one. Retrofitting attribution across a live estate is unpleasant.

Once you have it, the conversation changes. "Inference is expensive" becomes "this decision costs 14 units to make automatically and 90 to make manually, and here is the distribution". That is a conversation a CFO can act on.

## Where the savings actually are

In roughly this order:

1. **Right-sizing the model.** The largest available model is the default and it is usually wrong. Most enterprise tasks are served well by a substantially smaller domain-tuned model, at a fraction of the cost and latency.
2. **Caching.** Enterprise query distributions are far more repetitive than people expect, and semantic caching on a stable corpus can remove a large share of load. Measure your own repeat rate before sizing the benefit.
3. **Routing.** Send the easy majority to a small model and escalate on uncertainty. This is where cost-aware routing earns its complexity.
4. **Scheduling the trough.** Filling idle dedicated capacity with batch and evaluation work.
5. **Prompt discipline.** Context windows are billed. Retrieval that returns twelve documents when four would do is a cost line disguised as thoroughness.`,
  },

  {
    kind: DocKind.WHITEPAPER,
    slug: "owning-your-model-estate",
    title: "Owning your model estate",
    subtitle:
      "What ownership means when the asset is weights, corpora and evaluation — and how to make it real in a contract.",
    excerpt:
      "Everyone says you own your data. Almost nobody says you own the model trained on it. This paper is about the difference, and what to put in writing.",
    category: "Strategy",
    author: "Sovereign",
    authorRole: "Regulated Programmes Agent",
    readMinutes: 14,
    publishedAt: "2026-01-15",
    tags: ["Ownership", "Strategy", "Procurement", "Exit"],
    icon: "Lock",
    accent: "verdigris",
    gated: true,
    seoDescription:
      "What it means to own your model estate: the six artefacts that constitute ownership, and the contractual language that makes it enforceable.",
    body: `## Summary

"You own your data" is now standard language in AI contracts. It is also close to meaningless, because the data was already yours and it is not where the value has moved.

The value has moved into the artefacts derived from that data: the resolved entity graph, the tuned weights, the evaluation suite, the pipeline definitions and the accumulated decision history. Those are what make the capability work, and their ownership is frequently unaddressed or quietly assigned to the vendor.

This paper enumerates the six artefacts that constitute real ownership and what has to be true of each.

## Why the distinction is not academic

Consider an insurer three years into a claims automation programme. The models have been trained on four million of its own claims, tuned against its own outcomes, and evaluated against a suite its claims function wrote.

If the vendor relationship ends and the insurer keeps only its raw data, it has kept the least valuable artefact. Three years of encoded operational knowledge is gone, and the replacement programme starts at zero — not because the data is missing but because everything derived from it was somebody else's.

The switching cost that creates is not a side effect of the commercial model. In many cases it *is* the commercial model.

## The six artefacts

### 1. Model weights

Every version, in a portable format, with the tokeniser and configuration needed to load them elsewhere.

The common weakening: access to weights only through the vendor's runtime. That is not possession, it is a viewing right that ends with the contract.

### 2. Training and tuning corpora

The prepared datasets, including labels, splits and preprocessing. Raw source data is not sufficient — the preparation is a substantial part of the work and encodes decisions that are expensive to reconstruct.

### 3. The resolved entity graph

The governed records, survivorship decisions, lineage and quarantine state. This is the artefact with the longest half-life; models get retrained, the entity graph accretes.

### 4. Evaluation suites

Cases, rubrics, weights and thresholds. Whoever holds these defines what "safe to deploy" means. If it is the vendor, the buyer has outsourced its own safety bar.

### 5. Pipeline and orchestration definitions

Training pipelines, retrieval configuration, agent definitions, tool contracts and policy gates — as portable definitions, not as configuration inside a proprietary console.

### 6. Decision history

Every trace: what was decided, on what evidence, by which version, under which policy. This is both the audit record and, in practice, the most valuable training data the organisation has.

## What to put in the contract

Ownership language should specify **artefact, format, cadence and destination**, not intent.

- *Artefact*: enumerated as above, not "the deliverables".
- *Format*: open and documented. "The vendor's export format" is a dependency wearing a guarantee's clothing.
- *Cadence*: continuously available or on a defined schedule — not "on termination", which is when relations are worst and cooperation is least likely.
- *Destination*: a repository the buyer controls.

Add a **restoration test**: at least annually, the buyer stands up the estate from the escrowed artefacts in an environment the vendor does not operate, and confirms it runs. Untested escrow is a belief.

## The vendor's legitimate interests

This is not a demand for the vendor's own intellectual property. Base model weights the vendor licensed, the platform source code, and generic tooling are reasonably the vendor's.

The line is derivation: artefacts derived from the buyer's data and the buyer's decisions belong to the buyer. That line is clean and most disputes come from vendors preferring it blurred.

## Why we take this position

We build, deploy and operate these estates, and we would rather compete on whether we are good at that than on whether leaving is painful.

A customer who could leave next quarter and does not is telling you something real. A customer who cannot leave is telling you nothing at all, and that is a worse business to be in than it looks — it removes the only reliable signal you had.

---

*Model contract clauses, an artefact inventory template and the restoration-test runbook are available in the developer portal.*`,
  },
];
