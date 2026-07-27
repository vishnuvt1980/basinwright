import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Case studies.

   Each one follows the same spine — the estate before, what was actually
   wrong, what we deployed, and what changed once it ran. The metrics band is
   the proof; the prose is the argument for why the number moved.
--------------------------------------------------------------------------- */

export const caseStudies: DocSeed[] = [
  {
    kind: DocKind.CASE_STUDY,
    slug: "meridian-bank-fraud-decisioning",
    title: "Meridian Bank cut fraud review backlog by 71% without adding analysts",
    subtitle:
      "A tier-one retail bank replaced a rules engine and three review queues with a single governed decision lane.",
    excerpt:
      "Meridian's fraud operation was drowning in alerts it could not explain. We rebuilt the decision — not the model — and the backlog collapsed.",
    category: "Fraud & Financial Crime",
    industry: "Banking",
    author: "Marcus Feld",
    authorRole: "Field CTO, Financial Services",
    readMinutes: 9,
    featured: true,
    publishedAt: "2026-06-18",
    tags: ["Fraud", "Decisioning", "Governance", "Cognitive Data Hub"],
    icon: "Landmark",
    accent: "brass",
    metrics: [
      { label: "Review backlog", value: "−71%", caption: "Within two quarters of go-live" },
      { label: "False positives", value: "−44%", caption: "Against the previous rules engine" },
      { label: "Time to decision", value: "3.1s", caption: "P95, end to end" },
      { label: "Analyst headcount", value: "Unchanged", caption: "Redeployed, not reduced" },
    ],
    seoDescription:
      "How Meridian Bank rebuilt fraud decisioning on BasinWright: 71% less backlog, 44% fewer false positives, and every decision explainable back to source records.",
    body: `## The estate before

Meridian ran fraud detection the way most retail banks do: a rules engine written over fifteen years, two machine-learning scores bolted onto it at different times by different vendors, and three human review queues that each believed they were the queue of record.

The rules engine produced roughly 40,000 alerts a week. Analysts cleared about 26,000. The rest aged. When the backlog got bad enough, the bank raised thresholds — which is another way of saying it stopped looking at a category of risk until the queue felt manageable again.

Nobody in the building thought this was good. The problem was that no single team owned the decision. The rules were owned by financial crime, the scores by the data science group, the queues by operations, and the audit obligation by a fourth team that could only inspect the outcome after the fact.

## What was actually wrong

We spent the first three weeks not building anything. The finding was not what the bank expected.

The models were fine. Both scores were reasonably calibrated on the data they had seen. What was broken was that **nothing in the estate could say why a case was flagged in terms a reviewer could act on**. An analyst opening an alert saw a score, a rule id, and a transaction. To decide, they had to open four other systems: the core banking record, the card platform, the KYC file, and a shared inbox where the branch network reported anything unusual.

The median case took eleven minutes, and nine of those were retrieval. The bank was not short of intelligence. It was short of assembled evidence.

> The unit of work was never the alert. It was the decision — and no system in the estate held one.

## What we deployed

Three things, in order.

### 1. A governed record, before any model ran

The Cognitive Data Hub ingested the six systems that mattered — core banking, cards, KYC, the branch reporting inbox, the device telemetry feed, and the sanctions and watchlist bureau. Entity resolution collapsed the customer across all six into one governed record with lineage back to every source row.

This is the unglamorous half of the project and it took the longest. It is also the half that made everything after it possible. Roughly 4% of records failed the quality bar and went to quarantine rather than into the decision path. Meridian's first instinct was to treat that as a defect. It is the opposite: a funnel with no rejects is one nobody has run.

### 2. Three evidence lanes, running concurrently

Every case opens three lanes at once:

- **Ground** — Cognitive RAG retrieves the customer's history, prior dispositions, related parties and any narrative the branch network filed.
- **Verify** — deterministic models check the case against real constraints: velocity limits, geography, device reputation, sanctions exposure. These are not learned, and they are not negotiable.
- **Explain** — an LLM weighs the assembled evidence and drafts the rationale a reviewer will read.

No lane can decide alone. A case only leaves the board when the evidence quorum is satisfied, and confidence is computed from lane agreement rather than asserted by any single score.

### 3. Human approval where policy demanded it, and nowhere else

Meridian's original design put a human in front of everything, which is why the queue existed. We mapped the actual regulatory obligation and found that mandatory human review applied to 18% of cases, not 100%. The remainder could be auto-dispositioned with full trace, subject to sampling.

The 18% still goes to a human. It arrives with the evidence already assembled.

## What changed

Backlog fell 71% in two quarters. The number that mattered more internally was the false positive rate, down 44% against the old rules engine — because that is the number that decides whether a legitimate customer gets their card declined at a supermarket till.

Median analyst handling time went from eleven minutes to under four, almost entirely by removing the retrieval work. Meridian did not reduce headcount. The financial crime group redeployed eleven analysts onto typologies work that had been shelved for three years.

The audit outcome is the part the bank talks about. Every disposition, automated or human, carries the record-level lineage of the evidence that produced it. When the regulator asked for a sample of 200 decisions, the pack was produced in an afternoon.

## Where it runs

The whole estate is deployed inside Meridian's own tenancy, in-region, with the bank holding the keys. The models are Meridian's — trained on Meridian's governed data, evaluated against Meridian's baselines, and portable out if the bank ever wants to take them elsewhere.

BasinWright builds it, runs it and watches it. Meridian owns it.`,
  },

  {
    kind: DocKind.CASE_STUDY,
    slug: "halcyon-health-clinical-documentation",
    title: "Halcyon Health gave 2,400 clinicians back 62 minutes a day",
    subtitle:
      "Ambient clinical documentation grounded in the record, with every generated line traceable to the encounter that produced it.",
    excerpt:
      "Documentation burden was the top-cited reason clinicians left Halcyon. The fix was not a better scribe — it was refusing to generate anything the record could not support.",
    category: "Clinical Operations",
    industry: "Healthcare",
    author: "Aisha Rahman",
    authorRole: "Principal Data Scientist",
    readMinutes: 8,
    featured: true,
    publishedAt: "2026-05-29",
    tags: ["Healthcare", "Document Intelligence", "Grounding", "Safety"],
    icon: "HeartPulse",
    accent: "verdigris",
    metrics: [
      { label: "Time returned", value: "62 min/day", caption: "Median, per clinician" },
      { label: "Unsupported claims", value: "0.3%", caption: "Down from 7.1% at pilot" },
      { label: "Note acceptance", value: "88%", caption: "Accepted with no edit or minor edit" },
      { label: "Coverage", value: "2,400", caption: "Clinicians across 14 sites" },
    ],
    seoDescription:
      "Halcyon Health deployed grounded ambient documentation on BasinWright, returning 62 minutes a day per clinician with unsupported claims below 0.3%.",
    body: `## The estate before

Halcyon operates fourteen sites and a single instance of a well-known electronic health record. Clinicians were spending between 90 and 140 minutes a day on documentation, most of it after the last patient of the day. In the annual staff survey, documentation burden was the top-cited reason for leaving — above pay.

Halcyon had already run an ambient scribe pilot with a general-purpose model. It was abandoned after eleven weeks. The transcripts were good. The notes were not: roughly 7% of generated lines asserted something the encounter did not support. In a clinical setting, that is not a quality problem. It is a safety problem, and it ends a pilot.

## What was actually wrong

The pilot failed for a reason that has nothing to do with model quality: **the system had no way to refuse**.

A model asked to write a clinical note will write a clinical note. Given a partial transcript and a template with a "past medical history" heading, it will fill that heading. It fills it from the most plausible completion available, which is not the same thing as the patient's actual history.

The failure mode was never hallucination in the dramatic sense. It was smoothing — a note that reads correctly, is structurally complete, and contains three lines nobody said.

## What we deployed

### Grounding as a hard gate, not a prompt instruction

Every generated span in a Halcyon note has to be traceable to one of two sources: the encounter audio, or a retrieved element of the patient's governed record. Spans that cannot be traced are not written. The note comes back with the section left empty and a marker telling the clinician the system had nothing to support it.

This produces notes that are visibly incomplete, and that was the hardest thing to sell internally. An empty "review of systems" heading looks like a broken product. It is the product working: the alternative is a filled-in heading that is wrong 7% of the time.

### A deterministic lane over the medication and allergy list

Medications, allergies, and dosages never pass through a generative path at all. They are retrieved from the record, checked against the pharmacy system, and rendered. If the two disagree, the note flags the disagreement rather than resolving it.

### Evaluation before every promotion

Halcyon's clinical safety group owns an evaluation suite of 1,800 annotated encounters. No model version reaches a clinician without clearing it, and the bar is set on unsupported-claim rate rather than on any fluency measure. Two candidate versions have been rejected since go-live.

## What changed

Median documentation time fell by 62 minutes a day. Note acceptance — accepted with no edit or only cosmetic edits — settled at 88% after the first eight weeks, once clinicians had learned that the empty headings were deliberate.

Unsupported claims sit at 0.3%, measured continuously against a rolling audit sample rather than reported at pilot and then forgotten. The clinical safety group reviews the trace for every flagged instance.

The staff survey the following year moved documentation burden from first place to fourth.

## Where it runs

Inside Halcyon's tenancy, in-country, on dedicated endpoints with no data leaving the estate. Halcyon's information governance committee has read access to every trace, and the evaluation suite is Halcyon's asset — not ours.

The uncomfortable truth of this deployment is that the win came from making the system do less. The pilot generated more. The production system generates less and is trusted, and being trusted is what made the 62 minutes real.`,
  },

  {
    kind: DocKind.CASE_STUDY,
    slug: "northwind-energy-turbine-inspection",
    title: "Northwind Energy inspects 1,900 turbines with eleven people",
    subtitle:
      "Vision models on the edge, a governed defect corpus at the centre, and an engineer in the loop only where it changes the outcome.",
    excerpt:
      "Northwind's inspection programme was capacity-bound, not skill-bound. Putting the model at the edge and the judgement at the centre unbound it.",
    category: "Asset Integrity",
    industry: "Energy",
    author: "Tomas Lindqvist",
    authorRole: "Distinguished Engineer, Compute",
    readMinutes: 7,
    publishedAt: "2026-05-12",
    tags: ["Edge AI", "Vision", "Predictive Maintenance"],
    icon: "Zap",
    accent: "ember",
    metrics: [
      { label: "Inspection cycle", value: "6 weeks", caption: "Down from 9 months" },
      { label: "Blade defects caught early", value: "3.4×", caption: "Versus scheduled inspection" },
      { label: "Unplanned downtime", value: "−28%", caption: "Year over year" },
      { label: "Data leaving site", value: "1.2%", caption: "Only flagged frames" },
    ],
    seoDescription:
      "Northwind Energy runs turbine inspection on BasinWright edge deployments — a nine-month cycle compressed to six weeks with 28% less unplanned downtime.",
    body: `## The estate before

Northwind operates 1,900 wind turbines across four offshore and eleven onshore sites. Blade inspection was drone-flown, and the footage came back to a central team of eleven engineers who reviewed it frame by frame.

The full estate took roughly nine months to get through. By the time an engineer reviewed footage of a blade, the footage was on average four months old. Defects that were early-stage when filmed were not early-stage when found.

Two previous attempts to automate this had stalled on the same rock: the sites have no meaningful bandwidth. An offshore platform cannot ship raw 4K inspection footage to a central cloud, and the compliance position on where that footage may be processed is not flexible.

## What was actually wrong

The bottleneck was framed as a review capacity problem. Northwind had costed a plan to hire nine more engineers.

It was a transport problem. The review work that mattered — deciding what to do about a defect — was maybe 6% of what the engineers spent their time on. The other 94% was looking at footage of turbines that were fine.

## What we deployed

### Inference at the edge, on the platform

A quantised vision model runs on a single accelerator in the site's existing equipment cabin. It processes the drone footage where it lands. Frames with no candidate defect never leave the site — they are scored, logged, and discarded on the retention schedule.

Only flagged frames go back to the centre: roughly 1.2% of captured data. That is a volume the available link handles comfortably, and it satisfies the compliance position because the raw estate footage never moves.

### A governed defect corpus at the centre

Every confirmed defect, every engineer disposition, and every eventual maintenance outcome is written back into a governed corpus with lineage to the frame, the turbine, the blade position, and the flight. That corpus is what the next model version trains on.

This is the loop that made the programme compound. The first model was trained on a public dataset and Northwind's 4,000 historical annotations. Eighteen months in, it trains on 61,000 of Northwind's own confirmed dispositions, and it is materially better at the failure modes specific to Northwind's turbine models and its weather.

### Engineers on judgement, not on triage

The eleven engineers now see a queue of candidate defects with the frame, the history of that blade, the model's confidence, and comparable prior dispositions already assembled. They decide. They do not search.

## What changed

Full-estate inspection cycle went from nine months to six weeks. Early-stage defect detection improved 3.4× against the previous scheduled-inspection baseline — the category that matters, because a blade repaired early is a repair and a blade repaired late is a replacement.

Unplanned downtime fell 28% year over year. Northwind did not hire the nine engineers.

## Where it runs

Edge inference on Northwind's own hardware at each site. The governed corpus and the training estate sit in Northwind's private region. Model weights are Northwind's — which matters here more than usual, because the corpus those weights encode is eighteen months of an operating history nobody else has.`,
  },

  {
    kind: DocKind.CASE_STUDY,
    slug: "arcadia-telecom-service-agents",
    title: "Arcadia Telecom deflected 2.1 million contacts without a worse experience",
    subtitle:
      "A digital workforce with real system access, real approval gates, and a hard rule about when to hand over.",
    excerpt:
      "Most deflection programmes trade customer experience for cost. Arcadia's did not, because the agents were allowed to actually do things.",
    category: "Customer Operations",
    industry: "Telecommunications",
    author: "Nadia Halvorsen",
    authorRole: "Head of Customer Engineering",
    readMinutes: 8,
    publishedAt: "2026-04-22",
    tags: ["Agents", "Customer Service", "Tool Calling", "Approval Gates"],
    icon: "RadioTower",
    accent: "slate",
    metrics: [
      { label: "Contacts deflected", value: "2.1M", caption: "First twelve months" },
      { label: "CSAT on agent-handled", value: "+6 pts", caption: "Versus tier-one human baseline" },
      { label: "Escalation rate", value: "9.4%", caption: "Handed to a human mid-conversation" },
      { label: "Cost per resolution", value: "−63%", caption: "Fully loaded" },
    ],
    seoDescription:
      "Arcadia Telecom's BasinWright digital workforce deflected 2.1M contacts in a year while customer satisfaction on agent-handled cases rose six points.",
    body: `## The estate before

Arcadia handles roughly nine million customer contacts a year across voice, chat and app. Tier one was outsourced to two BPOs. A previous chatbot programme had reached 14% deflection and a customer satisfaction score eleven points below the human baseline, which is the usual shape: the bot handles the easy cases badly and everyone learns to type "agent" immediately.

The reason was structural. The bot could read a knowledge base. It could not do anything. Every request that required an action — a plan change, a credit, a SIM swap, a fault ticket — ended in a handover, and the customer repeated themselves to a human who started cold.

## What was actually wrong

Deflection was being measured as *conversations that did not reach a human*. That metric rewards a bot that frustrates people into giving up.

The right unit was resolution: the customer's problem is in the state they wanted, and they did not have to ask twice. Under that definition, the old bot's real number was closer to 5%.

## What we deployed

### Agents with tool access to the systems of record

Arcadia's agents call the billing platform, the provisioning system, the network fault database, the CRM and the order pipeline directly. Twenty-three tools, each with a typed contract and its own permission scope.

An agent that can change a customer's plan is a different product from one that can describe how to change a plan. It is also a different risk, which is what the next two pieces are for.

### Approval gates written against real policy, not vibes

Every tool has a policy attached. Applying an account credit under 25 units is autonomous. Above that, the agent assembles the case and routes it to a supervisor queue, and the customer is told that is happening. Cancelling a service is never autonomous. Neither is anything touching a vulnerable-customer flag.

Arcadia's regulatory team wrote these gates. We built exactly what was written, including the parts we thought were over-cautious. Two of them were later relaxed by the same team once the traces showed what the agents actually did.

### A hard handover rule

The agent hands to a human on three triggers: the customer asks, the confidence on the assembled evidence drops below the lane threshold, or the conversation crosses a distress signal. On handover, the human receives the full transcript, the retrieved account context and the agent's own summary of what it tried. Nobody starts cold.

## What changed

2.1 million contacts resolved end to end in the first twelve months, on the resolution definition rather than the avoidance one.

The number that stopped the internal argument was satisfaction: agent-handled cases scored six points *above* the tier-one human baseline, not below it. The mechanism is unglamorous — the agent has the whole account in context, never puts anyone on hold, and does not have a handle time target.

Escalation runs at 9.4%. Arcadia treats that as a floor to protect rather than a number to drive down.

Fully loaded cost per resolution fell 63%. One BPO contract was not renewed; the other was restructured onto complex-case work.

## Where it runs

Arcadia's own cloud tenancy, in-region, with the agent runtime and every tool call traced. Each of the 2.1 million resolutions has a full execution trace — what was retrieved, which tools were called with which arguments, which policy gate applied, and what the customer was told.

When the telecoms regulator opened a routine review of automated customer handling, Arcadia answered it out of the trace store.`,
  },

  {
    kind: DocKind.CASE_STUDY,
    slug: "sovereign-digital-air-gapped-estate",
    title: "A national digital agency built a sovereign AI estate with no external dependency",
    subtitle:
      "Fully air-gapped, cleared personnel, in-country weights — and an exit plan written before the first deployment.",
    excerpt:
      "Sovereign Digital's requirement was not 'hosted locally'. It was that the entire capability keeps working if every foreign vendor disappears overnight.",
    category: "Sovereign AI",
    industry: "Public Sector",
    author: "Grace Adeyemi",
    authorRole: "Director, Sovereign Programmes",
    readMinutes: 9,
    featured: true,
    publishedAt: "2026-03-30",
    tags: ["Sovereign AI", "Air-gapped", "Government", "Ownership"],
    icon: "Building2",
    accent: "ember",
    metrics: [
      { label: "External network dependency", value: "None", caption: "Fully air-gapped estate" },
      { label: "Services live", value: "23", caption: "Across nine agencies" },
      { label: "Model estate", value: "In-country", caption: "Weights, corpora and evaluation" },
      { label: "Time to first service", value: "19 weeks", caption: "From contract to production" },
    ],
    seoDescription:
      "How a national digital agency stood up a fully air-gapped sovereign AI estate on BasinWright — in-country weights, cleared operations, and a written exit plan.",
    body: `## The requirement

Sovereign Digital is the shared digital services agency for a national government. The brief was unusually clear, and unusually strict.

The capability had to keep working if every foreign vendor — including us — became unavailable overnight. Not "data stays in the country". Not "hosted in a local region". The whole thing: weights, training corpora, evaluation suites, orchestration, operational runbooks and the skills to run them, all inside the national estate, with no callback to anything outside it.

This is the requirement that separates sovereign AI from AI that happens to be hosted locally, and most of the market cannot meet it.

## What that ruled out

It ruled out every API-based frontier model. It ruled out any control plane that phones home for licensing, telemetry or model updates. It ruled out our own standard operating model, in which we monitor the estate continuously from our operations centres.

What it did not rule out was the platform itself, because the platform was designed to be handed over.

## What we deployed

### An air-gapped control plane

The full BasinWright control plane runs inside the agency's facility with no egress. Licensing is offline. Model updates arrive on physical media through the agency's own import process, and are only promoted after the agency's evaluation suite clears them — a process the agency runs, not us.

### An open-weight model estate, tuned in-country

The estate is built on open-weight foundation models, further trained on the agency's governed corpora inside the facility. There is no dependency on a model anybody can withdraw. Nine domain models are in production, from citizen correspondence handling to procurement analysis.

Not everything is a large model. Six of the nine production services are built on models under 8B parameters, because that is what the task needed and the compute budget is finite when you cannot rent elasticity.

### Cleared personnel and a transfer plan from week one

Sixteen BasinWright engineers hold the relevant national clearances and work on site. That is the deployment model, but it was never the destination.

The contract specifies a capability transfer: every runbook, every evaluation suite, every training pipeline, and a named agency counterpart for each BasinWright role. Twenty-two months in, the agency runs the estate day to day. Our people are on call and on the roadmap, not on the rota.

### An exit plan, written before the first deployment

The agency holds the weights, the corpora, the evaluation suites, the pipeline definitions and the runbooks. If the relationship ends, the estate keeps running. We wrote what that transition looks like in the first month of the engagement, before there was anything to transition.

Vendors do not usually volunteer this. It is the entire point of the product.

## What changed

Twenty-three services across nine agencies, from a standing start to first production service in nineteen weeks.

The service the agency talks about publicly is citizen correspondence: 1.4 million items a year, previously triaged by hand across nine departments with wildly different service levels. It now routes, summarises and drafts responses, with a human approving every outbound item and a full trace on each one.

The service the agency talks about internally is procurement analysis, which found duplicate contracting across three departments in its first quarter.

## The part that generalises

Almost every enterprise we work with asks a version of the sovereign question eventually, even when there is no government in the picture: *what happens to us if you go away?*

For most vendors the honest answer is "you start over". Building this estate meant answering it in writing, in advance, with a mechanism behind it. We now do that for every customer, because there was never a good reason it should be reserved for the ones with a flag.`,
  },

  {
    kind: DocKind.CASE_STUDY,
    slug: "lumen-manufacturing-supply-chain",
    title: "Lumen Manufacturing re-plans its supply chain in minutes, not weeks",
    subtitle:
      "Disruption detection across 4,100 suppliers, with agents that propose the re-plan and a planner who approves it.",
    excerpt:
      "Lumen knew about disruptions late and re-planned slowly. The gap between those two facts cost more than either of them individually.",
    category: "Supply Chain",
    industry: "Manufacturing",
    author: "Priya Raghunathan",
    authorRole: "Principal Architect, Enterprise Intelligence",
    readMinutes: 7,
    publishedAt: "2026-03-11",
    tags: ["Supply Chain", "Agents", "Predictive Analytics"],
    icon: "Factory",
    accent: "brass",
    metrics: [
      { label: "Disruption lead time", value: "+11 days", caption: "Median earlier warning" },
      { label: "Re-plan cycle", value: "40 min", caption: "Down from 9 days" },
      { label: "Expedite spend", value: "−34%", caption: "Year over year" },
      { label: "Suppliers monitored", value: "4,100", caption: "Tier one and tier two" },
    ],
    seoDescription:
      "Lumen Manufacturing monitors 4,100 suppliers on BasinWright, cutting re-plan cycles from nine days to forty minutes and expedite spend by a third.",
    body: `## The estate before

Lumen makes industrial equipment across six plants with a supplier base of roughly 4,100 firms across two tiers. Supply chain planning ran on a well-configured ERP and a planning team of thirty-one people.

The team was good. The process was not. Disruption reached Lumen through three channels: a supplier telling them, a delivery not arriving, or somebody reading the news. The first is rare, the second is late by definition, and the third is unreliable.

Once a disruption was known, re-planning took about nine days — mostly spent assembling the picture, not deciding. Which parts are affected. Which builds those parts are in. What the alternates are. Whether the alternates are qualified. What it does to the committed dates.

## What was actually wrong

Two gaps, and the interaction between them was worse than either alone.

Lumen found out late, and then took a long time to react. An eleven-day-late signal followed by a nine-day re-plan means twenty days between an event and a response. Most of Lumen's expedite spend — air freight, premium sourcing, overtime — was buying back exactly that window.

## What we deployed

### Signal ingestion across the tier-two base

Shipment telemetry, supplier financial-health feeds, port and freight data, weather and regional advisories, plus a licensed news and filings feed, all resolved against Lumen's supplier master in the Cognitive Data Hub.

Entity resolution mattered more here than anywhere else in the project. A supplier appears in the ERP under one legal name, in the freight data under a facility code, in the financial feed under a parent company, and in the news under a brand. Collapsing those into one governed supplier record is what makes a signal actionable rather than merely interesting.

### Predictive lead time, not just event detection

The useful output is not "there was a typhoon". It is "this typhoon affects the facility that makes your bracket, that bracket is in three builds, and the earliest impact is nineteen days out". Deterministic models compute the propagation; the agent explains it.

### An agent that proposes, a planner who decides

The supply chain agent assembles the affected bill of materials, retrieves qualified alternates with their lead times and pricing, models two or three re-plan options against the committed schedule, and writes up the trade-offs.

It does not commit the re-plan. A planner does, in the ERP, from a screen where the options are already costed. That boundary was Lumen's and we did not argue with it — the agent is measured on how good the options are, not on how many it executes.

## What changed

Median disruption warning moved eleven days earlier. The re-plan cycle went from nine days to forty minutes of a planner's time.

Expedite spend fell 34% year over year, which is where the business case lived. The planning team is the same size and now spends its time on supplier development and qualification — the work that reduces the number of disruptions rather than reacting to them.

One number Lumen tracks that we did not expect: the agent's proposed option is accepted unchanged 71% of the time, modified 24%, and rejected 5%. The planning group treats the 24% as the interesting category and feeds every modification back as training signal.

## Where it runs

Lumen's private cloud, with connectors into SAP and the plant systems. The supplier corpus, the propagation models and the agent's tuned weights are Lumen's assets. Given that corpus encodes four years of how Lumen's specific supply base actually behaves under stress, that ownership is not a legal nicety.`,
  },

  {
    kind: DocKind.CASE_STUDY,
    slug: "calder-mutual-claims-triage",
    title: "Calder Mutual settles straightforward claims the same day",
    subtitle:
      "First notice of loss to reserve, with severity, fraud and subrogation assessed in one pass.",
    excerpt:
      "Calder's claims operation was organised around handoffs. Assessing everything at once turned a nine-day path into a same-day one for two thirds of claims.",
    category: "Claims",
    industry: "Insurance",
    author: "Elena Marchetti",
    authorRole: "Director of Governance & Assurance",
    readMinutes: 8,
    publishedAt: "2026-02-19",
    tags: ["Insurance", "Claims", "Decisioning", "Fraud"],
    icon: "Umbrella",
    accent: "verdigris",
    metrics: [
      { label: "Same-day settlement", value: "64%", caption: "Of eligible claims" },
      { label: "Reserve accuracy", value: "+22%", caption: "Against 90-day development" },
      { label: "Subrogation recovered", value: "+18%", caption: "Identified at FNOL" },
      { label: "Leakage", value: "−9.6%", caption: "Estimated, first full year" },
    ],
    seoDescription:
      "Calder Mutual rebuilt claims triage on BasinWright: same-day settlement on 64% of eligible claims, better reserves and more subrogation caught at first notice.",
    body: `## The estate before

Calder Mutual is a mid-size personal and commercial lines carrier. First notice of loss arrived by phone, app and broker feed, and was then handed along a chain: intake set up the claim, an adjuster assessed severity, a special investigations referral happened if something looked odd, and a subrogation review happened at the end if anyone remembered.

Median time from notice to reserve was nine days. Straightforward claims — a windscreen, a simple property leak, a low-value collision with clear liability — took the same nine days as complex ones, because they travelled the same chain.

Subrogation was the quiet loss. Recovery opportunities are most visible at first notice, when the claimant is describing what happened and who else was involved. By the time a subrogation review ran, six weeks later, the detail had gone cold.

## What was actually wrong

Calder had optimised each handoff and never questioned the chain. Every stage was reasonably efficient. The sequence was the problem.

Severity, fraud indicators and recovery potential are not sequential questions. They are three readings of the same evidence, and they are all most accurate at the moment the evidence is freshest.

## What we deployed

### One pass at first notice

Every claim opens all three assessments at once against the same assembled evidence: the policy record, the claimant history, the loss description, any photos or documents, telematics if the policy carries it, bureau and rating data, and the fraud consortium lists.

Deterministic models handle coverage verification, policy limits, and the constraint checks — is this loss even in scope, is the policy in force, does the described damage fit the vehicle. Cognitive RAG assembles comparable prior claims and their eventual development. The reasoning lane weighs it and writes the assessment a handler reads.

### An eligibility gate, not a confidence threshold

Straight-through settlement applies only to claims that pass an explicit eligibility test written by Calder's claims and compliance functions: value band, coverage clarity, no injury, no third-party dispute, no fraud indicator above threshold, claimant not flagged vulnerable.

This is deliberately not "settle it if the model is confident". Confidence is one input to eligibility, not a substitute for it. A model can be extremely confident about a claim that policy says a human must look at.

### Subrogation identified where it is visible

Recovery potential is assessed at notice, from the loss narrative and the parties involved, and written onto the claim as a structured flag with the evidence attached. It is no longer a review that happens later; it is a field that exists from the start.

## What changed

64% of eligible claims now settle the same day. Across all claims, median notice-to-reserve fell from nine days to under two.

Reserve accuracy — measured against 90-day development, which is the only honest way to measure it — improved 22%. Better reserves are worth more than they sound: they are what the finance function plans on.

Subrogation identified at first notice increased recovery by 18%.

Estimated leakage fell 9.6% in the first full year. Calder's actuarial function computes that figure and is appropriately sceptical of it; the components they are most confident in are the coverage-verification catches and the earlier subrogation.

## The governance position

Every automated settlement carries the eligibility test result, the evidence set, the model versions that ran, and the computed confidence per lane. Calder's regulator has been through two sample reviews.

The thing Calder's compliance function insisted on, and was right about: a monthly sample of automated settlements is re-worked by a human handler blind to the automated outcome. Where they disagree, the case goes to the governance group. That sample rate has never been reduced.`,
  },

  {
    kind: DocKind.CASE_STUDY,
    slug: "orbit-logistics-network-replanning",
    title: "Orbit Logistics turned a 40-person control tower into a decision engine",
    subtitle:
      "Continuous network re-planning across 12,000 daily movements, with exceptions surfaced instead of hunted.",
    excerpt:
      "Orbit's control tower could see everything and change almost nothing in time. Closing that gap was worth more than better visibility ever was.",
    category: "Operations",
    industry: "Logistics",
    author: "Rory Chen",
    authorRole: "Staff Engineer, Agent Runtime",
    readMinutes: 7,
    publishedAt: "2026-01-28",
    tags: ["Logistics", "Agents", "Optimisation", "Observability"],
    icon: "Truck",
    accent: "slate",
    metrics: [
      { label: "On-time delivery", value: "+7.9 pts", caption: "Network-wide" },
      { label: "Exceptions auto-resolved", value: "78%", caption: "No human touch" },
      { label: "Empty running", value: "−15%", caption: "Kilometres, year over year" },
      { label: "Daily movements", value: "12,000", caption: "Continuously re-planned" },
    ],
    seoDescription:
      "Orbit Logistics runs continuous network re-planning on BasinWright, auto-resolving 78% of exceptions and lifting on-time delivery nearly eight points.",
    body: `## The estate before

Orbit runs a mixed freight network: roughly 12,000 movements a day across road, rail and a small air component, with 2,600 vehicles and 340 sites.

The control tower was forty people watching very good dashboards. Orbit had invested heavily in visibility and it worked — if something went wrong, somebody usually saw it within minutes.

Seeing it was not the constraint. Between a controller spotting a problem and the network actually changing, there were typically four phone calls, two systems, and a driver who had already left. Orbit's own internal review put median exception-to-resolution at 3 hours 40 minutes, against a median useful window of about 90 minutes.

## What was actually wrong

The control tower was an observation deck attached to a manual process. Every dashboard improvement made the gap more visible without making it smaller.

There was also a volume problem nobody wanted to say out loud. At roughly 900 exceptions a day and forty controllers, the tower could give each exception about twenty minutes of attention if it did nothing else. In practice, controllers triaged by instinct, and the exceptions that got attention were the loud ones rather than the expensive ones.

## What we deployed

### Exception classification against actual cost

Every exception is scored on what it will cost if nothing changes — contractual penalty, downstream connection risk, customer tier, recovery options remaining. That score, not arrival order or volume, orders the queue.

The first week of this was uncomfortable. A class of exception the tower had always treated as urgent turned out to be cheap, and a quiet category involving rail connections turned out to be the single most expensive thing in the network.

### Agents that resolve within a defined envelope

The re-planning agent holds tool access to the transport management system, the driver rostering platform and the carrier booking APIs. Inside a defined envelope — cost delta under a threshold, no service-level breach, no driver-hours violation, no hazardous-goods implication — it resolves autonomously and logs what it did.

Outside the envelope it assembles the options and puts them in front of a controller with the trade-offs costed.

### Driver-hours and compliance as hard constraints

Driver hours, vehicle restrictions and dangerous-goods rules are deterministic checks, not learned behaviour and not model judgement. An option that violates one is never presented, never mind executed. This is the boundary that made the transport compliance function willing to sign off.

## What changed

78% of exceptions are now resolved with no human touch. Median exception-to-resolution across the network is under nine minutes, inside the useful window rather than well outside it.

On-time delivery rose 7.9 points network-wide. Empty running fell 15%, largely because the agent re-plans continuously rather than at shift boundaries, so a repositioning opportunity that appears at 14:20 is taken at 14:20.

The control tower is now twenty-six people, by attrition rather than redundancy, and the role has changed: they work the expensive 22%, and they own the envelope. Every quarter the tower reviews which exception classes should move in or out of autonomous handling, based on the traces.

## Where it runs

Orbit's cloud tenancy with dedicated endpoints for the latency-sensitive path. Every autonomous resolution carries a full trace — the exception, the cost model output, the options considered, the constraint checks, the tool calls made and the outcome.

Orbit's insurers asked for that trace store during a renewal. It reduced the premium.`,
  },
];
