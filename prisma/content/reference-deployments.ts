import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Reference deployments.

   These are worked designs, not customer stories. BasinWright is early and has
   no case studies to publish; presenting these as engagements — named or
   anonymised — would be a lie either way, and an anonymised lie is still one.

   So each piece describes a problem shape we can defend from first principles,
   the design we would propose for it, and what we would expect to be measured
   afterwards. There are deliberately no outcome figures and no `metrics` band:
   an outcome number with no customer behind it is the exact claim this
   collection exists to avoid.

   The standing disclosure lives on the collection itself (see COLLECTIONS in
   src/lib/library.ts) so it renders above every one of these, on the index and
   on the article, and cannot be edited away one document at a time.
--------------------------------------------------------------------------- */

export const referenceDeployments: DocSeed[] = [
  {
    kind: DocKind.REFERENCE,
    slug: "fraud-decisioning-retail-banking",
    title: "Fraud decisioning: when the alert is not the unit of work",
    subtitle:
      "A retail bank's alert queue, and why raising thresholds is the only lever left once nobody owns the decision.",
    excerpt:
      "Rules engine, two bolted-on scores, three review queues that each think they are the queue of record. The models are usually fine. What is missing is assembled evidence.",
    category: "Fraud & Financial Crime",
    industry: "Banking",
    author: "Lodestar",
    authorRole: "Financial Services Field Agent",
    readMinutes: 8,
    featured: true,
    publishedAt: "2026-06-18",
    tags: ["Fraud", "Decisioning", "Governance", "Cognitive Data Hub"],
    icon: "Landmark",
    accent: "brass",
    seoDescription:
      "A worked design for fraud decisioning in retail banking: governed records, three concurrent evidence lanes, and human review only where policy requires it.",
    body: `## The shape of the problem

A retail bank's fraud operation typically runs a rules engine written over a decade or more, one or two machine-learning scores bolted on at different times by different vendors, and several human review queues that each believe they are the queue of record.

Alert volume outruns clearing capacity. The backlog ages. When it gets bad enough, thresholds go up — which is another way of saying the bank stops looking at a category of risk until the queue feels manageable again.

Nobody in the building thinks this is good. The reason it persists is structural: no single team owns the decision. The rules belong to financial crime, the scores to the data science group, the queues to operations, and the audit obligation to a fourth team that can only inspect the outcome after the fact.

## Why the obvious fix does not work

The obvious fix is a better model. It rarely is the problem.

Both scores in a setup like this are usually reasonably calibrated on the data they have seen. What is broken is that **nothing in the estate can say why a case was flagged in terms a reviewer can act on**. An analyst opening an alert sees a score, a rule id and a transaction. To decide, they open the core banking record, the card platform, the KYC file, and the shared inbox where the branch network reports anything unusual.

Most of the handling time is retrieval, not judgement. The operation is not short of intelligence. It is short of assembled evidence.

> The unit of work was never the alert. It is the decision — and in most estates no system holds one.

## The design

### 1. A governed record, before any model runs

The Cognitive Data Hub ingests the systems that matter — core banking, cards, KYC, the branch reporting inbox, device telemetry, and the sanctions and watchlist bureau. Entity resolution collapses the customer across all of them into one governed record with lineage back to every source row.

This is the unglamorous half and it takes the longest. It is also the half that makes everything above it possible. Expect a few per cent of records to fail the quality bar and go to quarantine rather than into the decision path. The instinct is to treat that as a defect. It is the opposite: a funnel with no rejects is one nobody has run.

### 2. Three evidence lanes, running concurrently

Every case opens three lanes at once:

- **Ground** — Cognitive RAG retrieves the customer's history, prior dispositions, related parties and any narrative the branch network filed.
- **Verify** — deterministic models check the case against real constraints: velocity limits, geography, device reputation, sanctions exposure. These are not learned, and they are not negotiable.
- **Explain** — a reasoning model weighs the assembled evidence and drafts the rationale a reviewer will read.

No lane decides alone. A case only leaves the board when the evidence quorum is satisfied, and confidence is computed from lane agreement rather than asserted by a single score.

### 3. Human approval where policy demands it, and nowhere else

The reflexive design puts a human in front of everything, which is how the queue got there. Map the actual regulatory obligation instead — it is usually narrower than the operation assumes, and the remainder can be auto-dispositioned with full trace, subject to a blind sample.

The cases that do go to a human arrive with the evidence already assembled.

## What to measure afterwards

Agree these before go-live, and measure them against the manual baseline rather than against each other:

- Time from trigger to decision, at the median and at P95.
- False positive rate — the number that decides whether a legitimate customer gets declined at a supermarket till.
- Analyst handling time, split into retrieval and judgement. The split is the interesting part.
- Agreement between automated dispositions and a blind human re-work sample.
- Time to produce an audit pack for a regulator's sample.

## Where it runs

Inside the bank's own tenancy, in-region, with the bank holding the keys. The models are trained on the bank's governed data, evaluated against its own baselines, and portable out if it ever wants to take them elsewhere.

We build it, run it and watch it. The bank owns it.`,
  },

  {
    kind: DocKind.REFERENCE,
    slug: "clinical-documentation-grounding",
    title: "Ambient clinical documentation, and the discipline of refusing",
    subtitle:
      "Why scribe pilots end at the safety review, and what a system has to be able to do instead: nothing.",
    excerpt:
      "The transcripts are good. The notes are not. The failure is never dramatic hallucination — it is smoothing, a note that reads correctly and contains three lines nobody said.",
    category: "Clinical Operations",
    industry: "Healthcare",
    author: "Cartograph",
    authorRole: "Data Science Agent",
    readMinutes: 7,
    featured: true,
    publishedAt: "2026-05-29",
    tags: ["Healthcare", "Document Intelligence", "Grounding", "Safety"],
    icon: "HeartPulse",
    accent: "verdigris",
    seoDescription:
      "A worked design for grounded ambient clinical documentation: hard grounding gates, a deterministic medication lane, and evaluation that can block a release.",
    body: `## The shape of the problem

Clinicians spend a large part of every day on documentation, most of it after the last patient. In staff surveys it reliably ranks among the top reasons for leaving — often above pay.

Ambient scribe pilots address exactly this, and a good number of them are abandoned at the clinical safety review. Not because the transcription is poor. Because a proportion of generated lines assert something the encounter did not support, and in a clinical setting that is not a quality problem. It is a safety problem, and it ends a pilot.

## Why the obvious fix does not work

The failure has little to do with model quality. **The system has no way to refuse.**

A model asked to write a clinical note will write a clinical note. Given a partial transcript and a template with a "past medical history" heading, it fills that heading — from the most plausible completion available, which is not the same thing as the patient's actual history.

The failure mode is not hallucination in the dramatic sense. It is smoothing: a note that reads correctly, is structurally complete, and contains lines nobody said. A better model smooths more convincingly.

## The design

### Grounding as a hard gate, not a prompt instruction

Every generated span has to be traceable to one of two sources: the encounter audio, or a retrieved element of the patient's governed record. Spans that cannot be traced are not written. The note comes back with the section empty and a marker saying the system had nothing to support it.

This produces notes that are visibly incomplete, and that is the hardest thing to sell internally. An empty "review of systems" heading looks like a broken product. It is the product working — the alternative is a filled-in heading that is sometimes wrong.

### A deterministic lane over medications and allergies

Medications, allergies and dosages never pass through a generative path at all. They are retrieved from the record, checked against the pharmacy system, and rendered. If the two disagree, the note flags the disagreement rather than resolving it.

### Evaluation that can block a release

The clinical safety group owns an evaluation suite built from annotated encounters, and the bar is set on unsupported-claim rate rather than on any fluency measure. No model version reaches a clinician without clearing it. A suite that has never rejected a candidate version is not a gate.

## What to measure afterwards

- Unsupported-claim rate, measured continuously against a rolling audit sample rather than reported once at pilot.
- Note acceptance: accepted unchanged, accepted with cosmetic edits, materially rewritten.
- Documentation minutes per clinician per day, against a pre-deployment baseline.
- Rate of flagged medication disagreements, and how many were real.

## Where it runs

Inside the provider's tenancy, in-country, on dedicated endpoints with no data leaving the estate. Information governance has read access to every trace, and the evaluation suite is the provider's asset rather than ours.

The uncomfortable property of this design is that the win comes from making the system do *less*. A pilot generates more. A production system generates less and is trusted, and being trusted is what makes any time saving real.`,
  },

  {
    kind: DocKind.REFERENCE,
    slug: "asset-inspection-at-the-edge",
    title: "Asset inspection: moving the model to the data",
    subtitle:
      "When the review queue looks like a headcount problem and is actually a transport problem.",
    excerpt:
      "A capacity-bound inspection programme where most of the engineers' time goes on footage of assets that are fine. The constraint is bandwidth, not judgement.",
    category: "Asset Integrity",
    industry: "Energy",
    author: "Anvil",
    authorRole: "Compute Systems Agent",
    readMinutes: 7,
    publishedAt: "2026-05-12",
    tags: ["Edge AI", "Vision", "Predictive Maintenance"],
    icon: "Zap",
    accent: "ember",
    seoDescription:
      "A worked design for edge inspection of distributed assets: quantised vision at the site, a governed defect corpus at the centre, engineers on judgement.",
    body: `## The shape of the problem

An operator with distributed assets — wind turbines, pipeline segments, substations — flies drone inspections and ships the footage to a central team who review it frame by frame.

Getting through the whole estate takes months. By the time an engineer reviews footage of a given asset, the footage is old. Defects that were early-stage when filmed are not early-stage when found, and a repair that would have been a repair becomes a replacement.

Attempts to automate this stall on the same rock: the sites have no meaningful bandwidth. An offshore platform cannot ship raw 4K inspection footage to a central cloud, and the compliance position on where that footage may be processed is usually not flexible.

## Why the obvious fix does not work

The bottleneck gets framed as review capacity, and the plan is to hire more engineers.

It is a transport problem. The review work that matters — deciding what to do about a defect — is a small fraction of what the engineers spend their time on. The rest is looking at footage of assets that are fine.

Hiring scales the wrong half.

## The design

### Inference at the edge, on the site's own hardware

A quantised vision model runs on a single accelerator in the site's existing equipment cabin, processing footage where it lands. Frames with no candidate defect never leave the site — they are scored, logged and discarded on the retention schedule.

Only flagged frames go back to the centre, which is a volume the available link handles comfortably, and which satisfies the compliance position because the raw estate footage never moves.

### A governed defect corpus at the centre

Every confirmed defect, every engineer disposition and every eventual maintenance outcome is written back into a governed corpus with lineage to the frame, the asset, the position and the flight. That corpus is what the next model version trains on.

This is the loop that makes the programme compound. The first model trains on public data and whatever historical annotations exist. Later versions train on the operator's own confirmed dispositions, and get materially better at the failure modes specific to its equipment and its weather.

### Engineers on judgement, not triage

Engineers see a queue of candidate defects with the frame, the asset's history, the model's confidence and comparable prior dispositions already assembled. They decide. They do not search.

## What to measure afterwards

- Full-estate inspection cycle time, against the pre-deployment baseline.
- Proportion of defects caught at an early stage — the category that separates a repair from a replacement.
- Unplanned downtime, year over year.
- Share of captured data that leaves the site, as a compliance measure rather than a performance one.
- False negative rate on a human-reviewed sample of *discarded* frames. This is the one teams forget, and it is the one that matters.

## Where it runs

Edge inference on the operator's own hardware at each site. The governed corpus and the training estate sit in the operator's private region. The model weights are the operator's — which matters more than usual here, because the corpus those weights encode is an operating history nobody else has.`,
  },

  {
    kind: DocKind.REFERENCE,
    slug: "service-agents-with-real-authority",
    title: "Customer service agents that are allowed to do things",
    subtitle:
      "Deflection measured as avoidance rewards a bot that frustrates people into giving up. Resolution is the honest unit.",
    excerpt:
      "A bot that can read a knowledge base but cannot change anything ends every real request in a handover, and the customer repeats themselves to a human who starts cold.",
    category: "Customer Operations",
    industry: "Telecommunications",
    author: "Beacon",
    authorRole: "Customer Engineering Agent",
    readMinutes: 8,
    publishedAt: "2026-04-22",
    tags: ["Agents", "Customer Service", "Tool Calling", "Approval Gates"],
    icon: "RadioTower",
    accent: "slate",
    seoDescription:
      "A worked design for enterprise service agents with real tool access: typed contracts, policy gates written by the risk owner, and a hard handover rule.",
    body: `## The shape of the problem

A large service operation handles millions of contacts a year across voice, chat and app, with tier one usually outsourced. Earlier chatbot programmes reach modest deflection and a satisfaction score well below the human baseline — the familiar pattern where the bot handles easy cases badly and everyone learns to type "agent" immediately.

The reason is structural. The bot can read a knowledge base. It cannot *do* anything. Every request requiring an action — a plan change, a credit, a SIM swap, a fault ticket — ends in a handover, and the customer repeats themselves to a human who starts cold.

## Why the obvious fix does not work

Deflection gets measured as *conversations that did not reach a human*. That metric rewards a bot that frustrates people into giving up, and it will report success while satisfaction falls.

The honest unit is resolution: the customer's problem is in the state they wanted, and they did not have to ask twice. Measured that way, most deflection numbers are a fraction of what is reported.

## The design

### Agents with tool access to the systems of record

The agent calls the billing platform, the provisioning system, the fault database, the CRM and the order pipeline directly — each tool with a typed contract and its own permission scope.

An agent that can change a customer's plan is a different product from one that can describe how to change a plan. It is also a different risk, which is what the next two pieces are for.

### Approval gates written against real policy, not vibes

Every tool carries a policy written by whoever owns the risk. Applying a small account credit is autonomous. Above a threshold, the agent assembles the case and routes it to a supervisor queue, and the customer is told that is happening. Cancelling a service is never autonomous. Neither is anything touching a vulnerable-customer flag.

Build exactly what the regulatory team writes, including the parts that look over-cautious. Relaxing a gate later, on the evidence of the traces, is a conversation with a foundation under it.

### A hard handover rule

The agent hands to a human on three triggers: the customer asks, confidence on the assembled evidence drops below the lane threshold, or the conversation crosses a distress signal. On handover the human receives the full transcript, the retrieved account context and the agent's own summary of what it tried. Nobody starts cold.

## What to measure afterwards

- Resolution rate on the honest definition, not the avoidance one.
- Satisfaction on agent-handled cases against the tier-one human baseline. A well-built agent can beat it, because it holds the whole account in context, never puts anyone on hold, and has no handle-time target.
- Escalation rate — and treat it as a floor to protect rather than a number to drive down. Driving it down makes the agent reluctant to hand over, which moves failures from "escalated unnecessarily" to "resolved incorrectly with confidence".
- Fully loaded cost per resolution.

## Where it runs

The operator's own cloud tenancy, in-region, with the agent runtime and every tool call traced: what was retrieved, which tools were called with which arguments, which policy gate applied, and what the customer was told.

That trace store is what answers a regulator asking about automated customer handling, and it is the reason to build it before you need it rather than after.`,
  },

  {
    kind: DocKind.REFERENCE,
    slug: "sovereign-estate-air-gapped",
    title: "A sovereign estate with no external dependency",
    subtitle:
      "The requirement is not 'hosted locally'. It is that the capability keeps working if every foreign vendor disappears overnight.",
    excerpt:
      "The requirement that separates sovereign AI from AI that happens to be hosted locally — and the one most of the market cannot meet, including on its own architecture diagrams.",
    category: "Sovereign AI",
    industry: "Public Sector",
    author: "Sovereign",
    authorRole: "Regulated Programmes Agent",
    readMinutes: 8,
    featured: true,
    publishedAt: "2026-03-30",
    tags: ["Sovereign AI", "Air-gapped", "Government", "Ownership"],
    icon: "Building2",
    accent: "ember",
    seoDescription:
      "A worked design for an air-gapped sovereign AI estate: in-country weights, offline supply, local evaluation ownership, and an exit plan written before deployment.",
    body: `## The shape of the requirement

A national digital agency writes a brief that is unusually strict, and unusually clear: the capability has to keep working if every foreign vendor — including us — becomes unavailable overnight.

Not "data stays in the country". Not "hosted in a local region". The whole thing: weights, training corpora, evaluation suites, orchestration, operational runbooks and the skills to run them, all inside the national estate, with no callback to anything outside it.

## Why most answers do not meet it

It rules out every API-based frontier model. It rules out any control plane that phones home for licensing, telemetry or model updates. It rules out the standard managed operating model, in which the vendor monitors the estate continuously from its own operations centres.

What it does not rule out is a platform designed to be handed over. That is a property you either build in from the start or retrofit badly.

## The design

### An air-gapped control plane

The full control plane runs inside the agency's facility with no egress. Licensing is offline. Model updates arrive on physical media through the agency's own import process, and are promoted only after the agency's evaluation suite clears them — a process the agency runs, not the vendor.

### An open-weight model estate, tuned in-country

Built on open-weight foundation models, further trained on the agency's governed corpora inside the facility. No dependency on a model anybody can withdraw.

Not everything needs to be a large model. Narrow, well-specified services are frequently served better by a small domain-tuned model, which matters when the compute budget is finite because you cannot rent elasticity.

### Cleared personnel, and a transfer plan from week one

On-site engineering with the relevant national clearances is the deployment model. It is not the destination.

The contract should specify a capability transfer: every runbook, every evaluation suite, every training pipeline, and a named agency counterpart for each vendor role, with dates. The measure of success is the vendor's people being on call and on the roadmap rather than on the rota.

### An exit plan, written before the first deployment

The agency holds the weights, the corpora, the evaluation suites, the pipeline definitions and the runbooks. If the relationship ends, the estate keeps running. Write what that transition looks like in the first month, before there is anything to transition.

Vendors do not usually volunteer this. It is the entire point of the product.

## What it costs

Expect a capability gap against hosted frontier models at deployment, narrowing as domain training compounds. Expect compute costs meaningfully above an elastic public-cloud equivalent, because you are buying peak rather than renting it. Expect the operating model to be the longest lead item — clearances and capability transfer take longer than hardware.

## The part that generalises

Almost every enterprise asks a version of the sovereign question eventually, even with no government in the picture: *what happens to us if you go away?*

For most vendors the honest answer is "you start over". Designing for this one means answering it in writing, in advance, with a mechanism behind it. There was never a good reason that should be reserved for the customers with a flag.`,
  },

  {
    kind: DocKind.REFERENCE,
    slug: "supply-chain-disruption-replanning",
    title: "Supply chain: closing the gap between knowing and reacting",
    subtitle:
      "Finding out late and re-planning slowly are two problems, and the interaction between them is worse than either.",
    excerpt:
      "Most expedite spend — air freight, premium sourcing, overtime — is buying back the window between an event and a response. That window is addressable.",
    category: "Supply Chain",
    industry: "Manufacturing",
    author: "Meridian",
    authorRole: "Enterprise Architecture Agent",
    readMinutes: 7,
    publishedAt: "2026-03-11",
    tags: ["Supply Chain", "Agents", "Predictive Analytics"],
    icon: "Factory",
    accent: "brass",
    seoDescription:
      "A worked design for supply chain disruption detection and re-planning: tier-two signal ingestion, entity resolution over the supplier master, and agents that propose.",
    body: `## The shape of the problem

A manufacturer with a multi-tier supplier base runs planning on a well-configured ERP and a capable planning team. The team is good. The process is not.

Disruption reaches the business through three channels: a supplier telling them, a delivery not arriving, or somebody reading the news. The first is rare, the second is late by definition, and the third is unreliable.

Once a disruption is known, re-planning takes days — mostly spent assembling the picture rather than deciding. Which parts are affected. Which builds those parts are in. What the alternates are. Whether the alternates are qualified. What it does to the committed dates.

## Why the obvious fix does not work

The two gaps interact. A late signal followed by a slow re-plan means a long window between an event and a response, and most expedite spend is buying exactly that window back.

Improving visibility alone shortens the first gap and leaves the second. Buying a planning optimiser alone does the reverse. Neither pays for itself.

## The design

### Signal ingestion across the tier-two base

Shipment telemetry, supplier financial-health feeds, port and freight data, weather and regional advisories, plus a licensed news and filings feed — all resolved against the supplier master in the Cognitive Data Hub.

Entity resolution matters more here than anywhere else. A supplier appears in the ERP under one legal name, in the freight data under a facility code, in the financial feed under a parent company, and in the news under a brand. Collapsing those into one governed supplier record is what makes a signal actionable rather than merely interesting.

### Predictive propagation, not just event detection

The useful output is not "there was a typhoon". It is "this typhoon affects the facility that makes your bracket, that bracket is in three builds, and the earliest impact is nineteen days out". Deterministic models compute the propagation; the agent explains it.

### An agent that proposes, a planner who decides

The agent assembles the affected bill of materials, retrieves qualified alternates with lead times and pricing, models two or three re-plan options against the committed schedule, and writes up the trade-offs.

It does not commit the re-plan. A planner does, from a screen where the options are already costed. Measure the agent on how good the options are, not on how many it executes.

## What to measure afterwards

- Median disruption warning lead time, against the previous baseline.
- Re-plan cycle time — and specifically the split between assembling the picture and deciding.
- Expedite spend, year over year. This is usually where the business case lives.
- Acceptance rate on proposed options: unchanged, modified, rejected. The *modified* bucket is the interesting one, and every modification is training signal.

## Where it runs

The manufacturer's private cloud, with connectors into the ERP and the plant systems. The supplier corpus, the propagation models and the agent's tuned weights are the manufacturer's assets — which is not a legal nicety when that corpus encodes years of how a specific supply base behaves under stress.`,
  },

  {
    kind: DocKind.REFERENCE,
    slug: "claims-triage-single-pass",
    title: "Claims: assessing everything at once instead of in sequence",
    subtitle:
      "Severity, fraud and recovery are three readings of the same evidence, and all three are most accurate when the evidence is freshest.",
    excerpt:
      "A claims chain optimised at every handoff and never questioned as a sequence. Straightforward claims travel the same path as complex ones because there is only one path.",
    category: "Claims",
    industry: "Insurance",
    author: "Ledger",
    authorRole: "Governance & Assurance Agent",
    readMinutes: 8,
    publishedAt: "2026-02-19",
    tags: ["Insurance", "Claims", "Decisioning", "Fraud"],
    icon: "Umbrella",
    accent: "verdigris",
    seoDescription:
      "A worked design for insurance claims triage: one assessment pass at first notice, an explicit eligibility gate, and subrogation identified where it is visible.",
    body: `## The shape of the problem

A carrier takes first notice of loss by phone, app and broker feed, then hands the claim along a chain: intake sets it up, an adjuster assesses severity, a special investigations referral happens if something looks odd, and a subrogation review happens at the end if anyone remembers.

Straightforward claims — a windscreen, a simple property leak, a low-value collision with clear liability — take as long as complex ones, because they travel the same chain.

Subrogation is the quiet loss. Recovery opportunities are most visible at first notice, when the claimant is describing what happened and who else was involved. By the time a review runs weeks later, the detail has gone cold.

## Why the obvious fix does not work

Carriers optimise each handoff and never question the chain. Every stage is reasonably efficient. The *sequence* is the problem.

Severity, fraud indicators and recovery potential are not sequential questions. They are three readings of the same evidence, and they are all most accurate at the moment the evidence is freshest.

## The design

### One pass at first notice

Every claim opens all three assessments at once against the same assembled evidence: the policy record, claimant history, the loss description, photos and documents, telematics where the policy carries it, bureau and rating data, and the fraud consortium lists.

Deterministic models handle coverage verification, policy limits and constraint checks — is this loss in scope, is the policy in force, does the described damage fit the vehicle. Retrieval assembles comparable prior claims and their eventual development. The reasoning lane weighs it and writes the assessment a handler reads.

### An eligibility gate, not a confidence threshold

Straight-through settlement applies only to claims passing an explicit eligibility test written by the claims and compliance functions: value band, coverage clarity, no injury, no third-party dispute, no fraud indicator above threshold, claimant not flagged vulnerable.

This is deliberately not "settle it if the model is confident". Confidence is one input to eligibility, not a substitute for it — a model can be extremely confident about a claim that policy says a human must look at.

### Subrogation identified where it is visible

Recovery potential is assessed at notice, from the loss narrative and the parties involved, and written onto the claim as a structured flag with the evidence attached. It stops being a review that happens later and becomes a field that exists from the start.

## What to measure afterwards

- Median notice-to-reserve, and the same-day settlement rate among *eligible* claims.
- Reserve accuracy against 90-day development, which is the only honest way to measure it.
- Recovery identified at first notice versus at later review.
- Leakage, computed by the actuarial function and treated with appropriate scepticism.

## The governance position

Every automated settlement carries the eligibility test result, the evidence set, the model versions that ran and the computed confidence per lane.

The control to insist on: a monthly sample of automated settlements re-worked by a human handler blind to the automated outcome, with disagreements going to a governance group. Never reduce that sample rate because agreement is high — that is exactly when the measurement is cheap.`,
  },

  {
    kind: DocKind.REFERENCE,
    slug: "network-exception-replanning",
    title: "Logistics: a control tower that can only watch",
    subtitle:
      "Every dashboard improvement makes the gap between seeing a problem and changing the network more visible without making it smaller.",
    excerpt:
      "Visibility is rarely the constraint. Between a controller spotting a problem and the network actually changing sit several phone calls, two systems, and a driver who has already left.",
    category: "Operations",
    industry: "Logistics",
    author: "Filament",
    authorRole: "Agent Runtime Engineer",
    readMinutes: 7,
    publishedAt: "2026-01-28",
    tags: ["Logistics", "Agents", "Optimisation", "Observability"],
    icon: "Truck",
    accent: "slate",
    seoDescription:
      "A worked design for logistics exception handling: cost-ranked triage, agents that resolve inside a defined envelope, and hard compliance constraints.",
    body: `## The shape of the problem

A mixed freight network runs thousands of movements a day across road, rail and air, with a control tower of dashboards and controllers. Operators typically invest heavily in visibility, and it works — when something goes wrong, somebody usually sees it within minutes.

Seeing it is not the constraint. Between a controller spotting a problem and the network actually changing sit several phone calls, two systems, and a driver who has already left. The gap between exception and resolution routinely exceeds the window in which a resolution would have helped.

## Why the obvious fix does not work

The control tower is an observation deck attached to a manual process. Every dashboard improvement makes the gap more visible without making it smaller.

There is also a volume problem nobody says out loud. With hundreds of exceptions a day and a fixed number of controllers, the tower can give each exception only minutes of attention if it does nothing else. In practice controllers triage by instinct, and the exceptions that get attention are the loud ones rather than the expensive ones.

## The design

### Exception classification against actual cost

Every exception is scored on what it will cost if nothing changes — contractual penalty, downstream connection risk, customer tier, recovery options remaining. That score, not arrival order or volume, orders the queue.

Expect the first week to be uncomfortable. A class of exception the tower has always treated as urgent often turns out to be cheap, and a quiet category turns out to be the most expensive thing in the network.

### Agents that resolve within a defined envelope

The re-planning agent holds tool access to the transport management system, the rostering platform and carrier booking APIs. Inside a defined envelope — cost delta under a threshold, no service-level breach, no driver-hours violation, no hazardous-goods implication — it resolves autonomously and logs what it did.

Outside the envelope it assembles the options and puts them in front of a controller with the trade-offs costed.

### Compliance as hard constraints

Driver hours, vehicle restrictions and dangerous-goods rules are deterministic checks, not learned behaviour and not model judgement. An option that violates one is never presented, never mind executed. This is the boundary that makes transport compliance willing to sign off.

## What to measure afterwards

- Share of exceptions resolved with no human touch, and median exception-to-resolution against the useful window.
- On-time delivery, network-wide.
- Empty running kilometres — continuous re-planning takes repositioning opportunities when they appear rather than at shift boundaries.
- Quarterly review of which exception classes should move in or out of autonomous handling, based on the traces.

## Where it runs

The operator's cloud tenancy, with dedicated endpoints for the latency-sensitive path. Every autonomous resolution carries a full trace — the exception, the cost model output, the options considered, the constraint checks, the tool calls made and the outcome.

That trace store tends to be worth more than expected outside operations. Insurers ask for it.`,
  },
];
