import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Blog — shorter, opinionated pieces from the people doing the work.
--------------------------------------------------------------------------- */

export const blog: DocSeed[] = [
  {
    kind: DocKind.BLOG,
    slug: "why-your-rag-pilot-stalled",
    title: "Your RAG pilot did not stall on the model",
    excerpt:
      "The pilot worked on one system with documents a human picked. Production is four systems that disagree about who the customer is. That is the whole story.",
    category: "Engineering",
    author: "Priya Raghunathan",
    authorRole: "Principal Architect, Enterprise Intelligence",
    readMinutes: 6,
    featured: true,
    publishedAt: "2026-07-16",
    tags: ["RAG", "Data", "Production"],
    icon: "Search",
    accent: "brass",
    seoDescription:
      "Enterprise RAG pilots rarely fail on model quality. They fail at entity resolution, chunking that ignores structure, and retrieval with no scope.",
    body: `There is a version of the same meeting that happens in every organisation trying this.

The pilot demoed beautifully in March. It is July, it is not in production, and the room is discussing whether to try a different model. It is almost never the model.

Here is what tends to have happened, in the order it usually happens.

## The pilot had a curated corpus

Someone picked the documents. Possibly they did not think of it as picking — they pointed at a SharePoint site that happened to be well-maintained, or exported the sixty PDFs the team actually uses.

That corpus was internally consistent, current, and about one thing. Production is none of those. Production has the 2019 version of the policy sitting next to the 2024 version with no metadata distinguishing them, and retrieval has no reason to prefer either.

**Fix:** version and date every document at ingest, and make recency a retrieval signal rather than a hope. Then go find the superseded documents and mark them superseded. This is boring and it is most of the win.

## Retrieval had no entity scope

The pilot asked questions about one customer at a time and a human typed the customer's name. In production the system has to work out which customer, from an identifier that exists differently in four systems.

Vector search returns similar content. Similar is not "about the same entity". The failure mode is an answer that blends two customers, and it is fluent, and it is the failure that ends programmes because it is the one an executive notices personally.

**Fix:** resolve entities before you retrieve. Scope retrieval to the resolved entity. This is the single highest-leverage change available and it is a data project, not a model project.

## Chunking ignored the document's structure

Fixed-size chunking with overlap is the default in every tutorial and it is wrong for almost every enterprise document.

Contracts have clauses. Policies have sections with scope statements at the top. Clinical notes have headings that determine how the content should be read. A 512-token window sliced through the middle of a clause produces a chunk that says something the clause does not.

**Fix:** chunk on the document's own structure, and carry the section path as metadata so the model knows a retrieved paragraph came from "Section 4.2 — Exclusions" rather than from nowhere.

## Nothing could say "I don't know"

The pilot was measured on whether answers were good. Nobody measured how often it answered when it should have declined.

A retrieval system that always returns its top five results will always produce an answer, including when the corpus contains nothing relevant. The model will then write something plausible from those five irrelevant chunks, because that is what it is for.

**Fix:** score retrieval quality independently and make an explicit abstain decision before generation. Then measure correct refusals as a first-class outcome. Systems that can decline get trusted; systems that always answer get audited.

## Evaluation was three people saying it seemed good

The pilot's quality bar was vibes in a demo. That works for a demo and provides no way to tell whether a change helped.

**Fix:** a hundred real questions with graded rubrics beats ten thousand synthetic ones. Build it from things that have actually gone wrong.

---

None of these are model problems. All of them are visible in the first week of production and invisible in a pilot, which is why pilots that go well are weak evidence.

If your pilot is stalling, the useful question is not "which model should we try". It is "what did the pilot's setup do for us that production does not".`,
  },

  {
    kind: DocKind.BLOG,
    slug: "the-decision-is-the-unit-of-work",
    title: "The decision is the unit of work",
    excerpt:
      "Alerts, tickets, cases and documents are all proxies. Building around the decision instead changes what you measure and what you build.",
    category: "Architecture",
    author: "Marcus Feld",
    authorRole: "Field CTO, Financial Services",
    readMinutes: 5,
    publishedAt: "2026-07-02",
    tags: ["Architecture", "Decisioning", "Design"],
    icon: "Scale",
    accent: "verdigris",
    seoDescription:
      "Why enterprise AI systems should be built around the decision rather than the alert, the ticket or the document.",
    body: `Every operational system in a large enterprise is organised around an artefact. Fraud has alerts. Claims have notices. Service has tickets. Legal has documents.

None of those are the thing the business cares about. The business cares about the decision that gets made — pay or don't, block or don't, escalate or don't — and the artefact is just what triggers it.

That distinction sounds like semantics until you look at what it changes.

## What it changes about measurement

Measure alerts and you get alert metrics: volume, clear rate, backlog. All of them can look excellent while the business outcome is bad. A team that clears 26,000 of 40,000 alerts a week has a 65% clear rate and an unbounded backlog, and the number does not tell you which is which.

Measure decisions and the questions get sharper. How long from trigger to decision. What fraction of decisions were later reversed. What each decision cost to make. What evidence supported it.

Those are answerable, comparable to the manual baseline, and they are the numbers a CFO recognises.

## What it changes about architecture

If the decision is the unit, it needs somewhere to live. In most estates it lives nowhere: it is implicit in a status field that got updated, with the reasoning in an analyst's head and possibly a free-text note.

Make it an object. A decision record holds the trigger, the assembled evidence with record-level lineage, the constraint checks that ran, the confidence per evidence lane, the policy gate that applied, the outcome, and who or what made it.

Once that object exists, several things you have been struggling with become easy. Audit is a query. Explaining a decision to a customer is a render. Training the next model version on your own history is a join. Detecting drift is a comparison over time on a stable schema.

## What it changes about where humans go

If work is organised around alerts, humans review alerts, and the queue grows with volume.

If it is organised around decisions, you can ask a much better question: which decisions actually change when a human makes them? For most operations the honest answer is a minority — and it is a specific, identifiable minority, at the policy boundary, where the lanes disagree, or where a party is vulnerable.

That is where humans belong. Everywhere else, a human is adding latency and a signature.

## The uncomfortable part

Adopting this framing usually reveals that nobody owns the decision. The rules belong to one team, the model to another, the queue to a third, and the audit obligation to a fourth.

That is not a technical finding, and no platform fixes it. But it does explain why the previous three attempts stalled, and it is better to know in week two than in month nine.`,
  },

  {
    kind: DocKind.BLOG,
    slug: "what-we-learned-running-agents-in-production",
    title: "Designing agents that hold up: what we build in from the start",
    excerpt:
      "Tool contracts matter more than model choice, approval queues decay on a schedule, and the escalation rate everyone wants to drive down is worth protecting.",
    category: "Engineering",
    author: "Rory Chen",
    authorRole: "Staff Engineer, Agent Runtime",
    readMinutes: 7,
    featured: true,
    publishedAt: "2026-06-24",
    tags: ["Agents", "Production", "Lessons"],
    icon: "Bot",
    accent: "slate",
    seoDescription:
      "How we design enterprise AI agents: tool contract design, why approval queues decay, and why escalation rate is a floor to protect rather than a target.",
    body: `*We are early: this is the design we build to and the reasoning behind it, not a retrospective on a fleet of live deployments.*

An agent with tool access changes state in systems of record. It moves money, alters entitlements, cancels services. Here is what we consider settled about building one, and why.

## Tool design matters more than model choice

The easy quarter to waste is the one spent arguing about models. The contracts are where the behaviour actually comes from.

An agent's competence is bounded by the tools it has. A tool that takes fifteen loosely-typed parameters and returns an untyped blob will produce bad behaviour from any model. A tool with three typed parameters, a clear name, an explicit failure mode and a docstring written for a reader who has never seen the system will produce good behaviour from a surprisingly small one.

Specific things that make the difference:

- **One tool, one verb.** "Manage subscription" became four tools. Error rates on each dropped sharply.
- **Return what changed, not just success.** An agent that sees the resulting state can verify its own work.
- **Make failures explicit and typed.** "Insufficient permission" and "record not found" need different recoveries. A generic error string means the agent guesses.
- **Never expose a general-purpose escape hatch.** A "run arbitrary query" tool added for flexibility will be used for exactly the things you did not want, and it destroys the property that makes the agent governable — that someone can read the tool register and enumerate what it can do.

## Approval queues rot, quietly

The responsible-looking design puts a human in front of a lot of actions. It degrades on a predictable schedule: volume outruns attention, reviewers start batch-approving, and median review time falls below the time it takes to read the case. The control stays on the org chart and stops existing in practice.

This is well documented in every other domain that has automated a review function, and there is no reason to expect agents to be the exception.

What works instead: put humans where their judgement changes the outcome — the policy boundary, disagreement between evidence lanes, vulnerable parties — and add a **blind random sample** of the autonomous population re-worked independently.

The blind sample is the control that actually tells you something. A rubber-stamped queue tells you nothing while producing a comforting audit trail.

## Escalation rate is a floor, not a target

Everyone's first instinct, including ours, is to drive escalation down. It looks like inefficiency.

Watch what happens when you succeed. The agent becomes reluctant to hand over, which means it handles cases it should not, which means the failures move from "handed to a human unnecessarily" — cheap — to "resolved incorrectly with confidence" — expensive and slow to detect.

So we treat the escalation rate as a floor to protect rather than a target to beat. When it drifts down, that is the thing to investigate, not the thing to celebrate.

## Memory needs a retention policy, on day one

Agents accumulate context. Left alone, an agent will carry a customer's irritated message from four months ago into today's conversation about a delivery date.

Decide what persists, for how long, and what is scoped to a single interaction. Then decide who can see it, because agent memory is personal data and it will be subject to access requests.

Decide it before launch. Retrofitting a retention policy onto accumulated agent memory is a data project, not a config change.

## Traces are the product

Tracing gets built for debugging and turns out to be the most-used part of the system.

Compliance answers regulators from it. Operations works out why a class of case behaves oddly. Product finds friction. And the traces are the highest-quality training data the organisation has, because every one is a real decision with real evidence and a known outcome.

Build the trace store first, retain it like a transaction record, and make it queryable by people who are not engineers.

## The estimate everyone gets wrong

How long the integration work takes. Optimism about connecting to systems of record is close to universal, and it is consistently the critical path. The model is a weekend. The connector to the thirty-year-old policy administration system is a quarter.`,
  },

  {
    kind: DocKind.BLOG,
    slug: "routing-across-model-providers",
    title: "Routing across providers is a policy problem wearing an engineering costume",
    excerpt:
      "Everyone builds the router for cost. The routes that matter are the ones driven by residency, capability and what happens when a provider deprecates a model.",
    category: "Platform",
    author: "Daniel Okonkwo",
    authorRole: "Head of Platform Engineering",
    readMinutes: 6,
    publishedAt: "2026-06-09",
    tags: ["Models", "Routing", "Platform", "Resilience"],
    icon: "Network",
    accent: "azure",
    seoDescription:
      "Model routing across providers: why residency, capability floors and deprecation resilience matter more than cost-based routing.",
    body: `Model routing gets pitched as a cost optimisation. Send the easy requests to the cheap model, the hard ones to the expensive one, save 40%.

That works, and it is the least interesting thing routing does.

## Residency is a routing decision

An estate operating across jurisdictions cannot send every request to the same place. A request touching EU personal data may need to be served in-region. A request from a regulated entity in one country may be prohibited from leaving it entirely.

This is not a preference to express in a config file somewhere and hope. It has to be enforced at the routing layer, from attributes carried on the request, with a hard failure when no compliant route exists.

The failure mode to design against is a fallback that silently degrades residency. If the in-region endpoint is unavailable, the correct behaviour is usually to fail — not to quietly serve the request somewhere the policy prohibits. That is a decision to make deliberately, in advance, with the risk owner in the room.

## Capability floors, not capability preferences

"Route to the cheapest model that can do the task" is a preference. What you need is a floor: this workload requires function calling, a 200k context, and a documented evaluation result above threshold on our suite.

Express the floor as a requirement on the route, not as a model name. Naming models in application code is how estates end up unable to move.

## Deprecation is the resilience case nobody plans for

Providers retire models. It is normal product management for them and an outage for you, with a notice period measured in months against enterprise change cycles measured in quarters.

Routing that abstracts the model is what turns that from an incident into a change ticket. But only if two things are true:

1. **No model names in application code.** Applications ask for a capability class. The route resolves it.
2. **Evaluation runs against the replacement before it is routed to.** Otherwise the abstraction has simply moved the surprise from deployment to production.

## Latency budgets belong in the route

Interactive paths and batch paths want different things. A customer-facing agent needs a P95 it can promise. An overnight document classification job does not care and would rather have the cheap route.

Put the budget on the route and let it choose. Applications should not be reasoning about which model is fast today.

## What routing should not do

**It should not silently change behaviour.** If a request is served by a different model than yesterday, the trace must say so. Debugging an output change without knowing the route changed is miserable.

**It should not route around a failing evaluation.** If the primary is failing quality checks, the answer is an alert, not a quiet substitution.

**It should not be clever without being observable.** Every routing decision should be inspectable after the fact, with the reason attached. A router nobody can audit is a source of unexplainable variance.

---

Build the router for policy first and cost second. The cost saving is real and it arrives anyway. The residency guarantee and the deprecation resilience are the parts you cannot retrofit under pressure.`,
  },

  {
    kind: DocKind.BLOG,
    slug: "gpu-capacity-planning-without-guesswork",
    title: "GPU capacity planning without the guesswork",
    excerpt:
      "Reserve the base, rent the peak, and fill the trough. Most estates get the first part right and leave the other two on the table.",
    category: "Infrastructure",
    author: "Tomas Lindqvist",
    authorRole: "Distinguished Engineer, Compute",
    readMinutes: 6,
    publishedAt: "2026-05-21",
    tags: ["Compute", "GPU", "Capacity", "FinOps"],
    icon: "Cpu",
    accent: "ember",
    seoDescription:
      "How to plan GPU capacity for enterprise AI: the reserve/burst crossover, filling the diurnal trough, and why memory bandwidth beats FLOPS for serving.",
    body: `Accelerator capacity planning goes wrong in two directions, and both are expensive.

Over-reserve and you own idle silicon. Under-reserve and you are paying spot prices during exactly the hours your business needs the capability, which is when spot prices are worst.

Here is the shape that works.

## Find the crossover honestly

Reserved capacity is cheaper per unit above some utilisation. Below it, serverless wins.

We would expect that crossover somewhere around a third to a half of sustained utilisation, depending on the accelerator and the commitment length — but treat that as a starting hypothesis to check against your own pricing rather than as a number to plan on. The important word is *sustained*. Peak utilisation is the number people quote and it is the wrong one — a cluster that hits 90% for two hours and 5% for twenty-two is a 12% cluster.

Measure sustained utilisation over a fortnight before committing to anything.

## Reserve the base, rent the peak

Enterprise load is diurnal and weekly. There is a floor it rarely drops below and a peak it rarely exceeds.

Reserve to the floor. Burst the rest. The mistake is reserving to the peak because that is what capacity planning traditionally means — in an environment with a working serverless path, reserving to peak is buying insurance you already have.

## Fill the trough, or stop calling it a saving

If you reserve capacity, you pay for it at 03:00 whether or not anything runs.

Things that fit in a trough: evaluation suite runs, batch document processing, embedding refresh, fine-tuning jobs, synthetic data generation, and any queue with a next-morning SLA.

This requires a scheduler that can preempt low-priority work when interactive load returns, and workloads that can tolerate preemption. It is genuinely more engineering. It is also the difference between 35% and 70% utilisation on the same hardware, which changes the crossover calculation entirely.

## Size on memory bandwidth, not FLOPS

For serving, the constraint is almost always memory bandwidth and capacity, not compute. A model that fits in HBM with room for the KV cache at your target concurrency will serve well on modest silicon. One that does not will serve badly on the best available.

Work backwards: model size, quantisation, target concurrency, context length, and therefore KV cache. That gives you the memory requirement, which gives you the accelerator, which gives you the count.

Doing it the other way around — picking the best accelerator and hoping — is how estates end up with expensive hardware running at low utilisation because the model was the wrong shape for it.

## Plan the interconnect for training, not for serving

Serving is mostly single-node. Training is not, and multi-node training is bounded by interconnect far more than by accelerator count.

If the roadmap includes training or substantial fine-tuning, the fabric decision is made at procurement time and is very difficult to change later. Plenty of estates have discovered they own a lot of accelerators they cannot train across.

## Instrument before you optimise

You cannot plan capacity you cannot see. Per-workload attribution — which team, which use case, which model, which route — should exist before the first optimisation.

Without it, every capacity conversation is a negotiation between people's impressions. With it, it is arithmetic, and arithmetic settles faster.`,
  },

  {
    kind: DocKind.BLOG,
    slug: "the-quarantine-lane",
    title: "In praise of the quarantine lane",
    excerpt:
      "A data pipeline with no rejects has not solved quality. It has decided to guess, and the guesses do not announce themselves.",
    category: "Data",
    author: "Aisha Rahman",
    authorRole: "Principal Data Scientist",
    readMinutes: 5,
    publishedAt: "2026-05-04",
    tags: ["Data", "Quality", "Governance"],
    icon: "Database",
    accent: "amber",
    seoDescription:
      "Why a quarantine lane with a real reject rate is a feature of enterprise data pipelines, not a defect — and how to keep it from becoming a landfill.",
    body: `The first time a customer sees the quarantine metric, the reaction is always the same: *four percent of our records are failing? That's a problem with your pipeline.*

It is not. It is the pipeline working, and the alternative is considerably worse.

## What quarantine is

Records arrive that cannot be resolved with adequate confidence. Two customer records that might be the same person and might be a parent and child with the same name. An address that resolves to three different postcodes. A supplier whose legal entity changed and whose historical rows now straddle two identities.

Something has to happen to these. There are exactly three options.

**Guess.** Pick the most likely resolution and carry on. This produces a clean-looking pipeline and silently wrong decisions downstream, which surface months later as a pattern of individually-explicable errors.

**Drop.** Discard them. Now your decisions are made on a filtered population, with a filter nobody characterised, correlated with exactly the messy edge cases that matter most.

**Quarantine.** Hold them, flag them, route them for remediation, and exclude them from the decision path until they are fixed or expired.

Only the third is defensible, and it is the only one that produces a number people find alarming.

## Why the number is reassuring

A reject rate of zero means one of two things: your data is perfect, or your quality bar is not doing anything.

We have never seen the first. Enterprise data comes from systems built over decades by teams that never agreed on a schema, migrated twice, and merged with an acquisition. A pipeline that finds nothing wrong with it is not looking.

Expect a non-trivial rate, higher in the first months and settling as remediation catches up with the backlog. What the steady-state number should be depends entirely on your source systems — the useful comparison is against your own trend, not against someone else's benchmark.

## How quarantine goes wrong

It becomes a landfill. Records go in, nothing comes out, and eighteen months later it holds 400,000 records nobody has looked at and the metric has been muted in the dashboard.

Three things prevent this.

**An owner.** A named person or team responsible for the remediation queue, with it in their objectives. Not "the data team" — a person.

**An expiry policy.** Some records will never be fixable. The source system is gone, the customer is gone, the context is unrecoverable. Say so explicitly, expire them on a schedule, and record that they were expired rather than resolved.

**Visible metrics.** Inflow, outflow, age distribution, and the reason breakdown. The age distribution is the one that matters — a stable total can hide a queue where nothing is moving.

## The reason breakdown is free diagnostics

Quarantine reasons, aggregated, are the highest-signal data quality report an organisation gets, because they are generated by actual use rather than by a profiling exercise.

One customer found that 40% of their quarantine came from a single upstream form that let users type a country name free-text. Fixing that form removed more bad data than the previous year's data quality programme.

That finding cost nothing. It fell out of counting rejects by reason, which is a thing you can only do if you have rejects.

## The sentence to keep

*A funnel with no rejects is not one anybody has run.*

If your quality gate has never stopped anything, it is not a gate. It is a log line.`,
  },

  {
    kind: DocKind.BLOG,
    slug: "human-approval-gates-that-work",
    title: "Human approval gates that people actually use",
    excerpt:
      "Put a human in front of everything and within ten weeks you have a rubber stamp with an audit trail. Here is where oversight belongs instead.",
    category: "Governance",
    author: "Elena Marchetti",
    authorRole: "Director of Governance & Assurance",
    readMinutes: 6,
    publishedAt: "2026-04-08",
    tags: ["Governance", "Agents", "Human Oversight"],
    icon: "Users",
    accent: "verdigris",
    seoDescription:
      "Designing human-in-the-loop controls for AI systems that survive contact with volume: where oversight belongs and why blind samples beat approval queues.",
    body: `Every AI governance document says "human in the loop". Very few say where, and the default answer — everywhere — produces a control that stops working on a predictable schedule.

## How approval queues fail

The mechanism is not mysterious.

A queue is created. Reviewers give each item real attention because the volume is low and the system is new. Volume grows. Attention per item falls. At some point the median review time drops below the time required to read the case, and from then on the queue is a rubber stamp.

The control still exists on the org chart. It still produces an audit trail. The audit trail is now evidence that oversight happened when it did not, which is strictly worse than having no control at all, because it is load-bearing in somebody's risk assessment.

We have watched this happen in about ten weeks, repeatedly, across very different organisations. It is not a culture problem.

## Where oversight actually belongs

**At the policy boundary.** Cases just inside or outside a threshold are where automated systems make their most expensive errors, and where human judgement adds most. Route them by construction.

**Where evidence lanes disagree.** If retrieval supports one conclusion and the deterministic checks support another, that disagreement is the signal. Do not let a confidence score average it away.

**Where a party is vulnerable.** Not a confidence question at all. A policy question, decided in advance, enforced in the runtime.

**On a blind random sample.** A fixed percentage of autonomous decisions, re-worked by a human who cannot see what the system decided. Disagreements go to a governance group.

That last one is the control that tells you whether the others are working, and it is the one most often missing.

## Why blind samples work when queues do not

A queue reviewer sees the system's answer first. Anchoring does the rest — the question stops being "what is right" and becomes "is this obviously wrong", which is a much weaker test.

A blind reviewer produces an independent judgement. Comparing the two gives you a real measure of agreement, and the disagreements are genuinely informative rather than being a list of things someone did not bother to challenge.

Sample rates of 1–5% are typical. Resist reducing the rate when agreement is high — that is exactly when the measurement is cheap and when drift will be hardest to notice.

## Make the reviewer's job possible

Where humans do review, the case must arrive assembled: the evidence, the lineage, comparable prior decisions, what the system concluded and why, and what happens next under each option.

If reviewing means opening four other systems, the review will be shallow regardless of intent. Time a handful of your own reviews and split them into retrieval and judgement — in most operations the first number dwarfs the second, and it is the one you can remove.

## Give reviewers somewhere to put disagreement

If a reviewer thinks the system is wrong in a way that will recur, there must be a route for that observation that is not a Slack message.

Overrides should be structured, categorised, and fed into the evaluation suite as candidate cases. A reviewer who sees their objection become a test case stays engaged. One who does not, stops objecting.

---

The goal is not maximum human involvement. It is oversight that is still real in month eighteen. Those are different designs, and only one of them survives volume.`,
  },

  {
    kind: DocKind.BLOG,
    slug: "from-pilot-to-platform-in-ninety-days",
    title: "From pilot to platform in ninety days",
    excerpt:
      "The sequence that works, the six weeks everyone wants to skip, and the two decisions that are almost impossible to reverse later.",
    category: "Delivery",
    author: "Nadia Halvorsen",
    authorRole: "Head of Customer Engineering",
    readMinutes: 7,
    publishedAt: "2026-03-24",
    tags: ["Delivery", "Programme", "Platform"],
    icon: "Rocket",
    accent: "brass",
    seoDescription:
      "A ninety-day sequence for taking enterprise AI from pilot to production platform, and the two architectural decisions that are hardest to reverse.",
    body: `Ninety days is achievable. It is achievable specifically when the first six weeks are spent on the part everyone wants to skip.

Here is the sequence, and what happens when it is reordered.

## Weeks 1–2: pick one decision and one entity

Not a use case. A decision — a specific choice the business makes repeatedly, with a known volume, a known current cost and a known owner.

And one entity that decision is about. Customer, supplier, asset, claim, patient. One.

The instinct is to scope broadly to justify the investment. Broad scope is why programmes take two years. A single decision with a single entity gets to production, and production is what unlocks the next one.

The test for a well-chosen decision: someone can tell you how many are made per week, how long each takes now, and what happens when one is wrong.

## Weeks 2–6: the governed record

This is the part that gets compressed, and compressing it is the single best predictor of a programme that stalls in month five.

Enumerate the systems that hold the entity. Honestly — including the shared mailbox and the spreadsheet. Resolve it across them. Get survivorship rules written down and signed by an owner, per attribute. Stand up quarantine with a named owner and an expiry policy. Capture lineage from the first record.

Nothing here demos. All of it determines whether anything built on top can be defended.

## Weeks 6–9: the decision path

Now build. Three evidence lanes: retrieval for grounding, deterministic checks for the non-negotiables, reasoning over both.

Write the eligibility policy before the model work, with the risk owner. Not a confidence threshold — an explicit test of when this decision may be made automatically.

Build the trace store in this window, not later. Retrofitting traces onto a running system is unpleasant and you will want them from the first shadow-mode decision.

## Weeks 9–11: shadow mode

Run the whole path in production, on production volume, deciding nothing. Compare against what humans actually decided.

This is where you find the things no test caught: the 6% of cases with a data shape nobody mentioned, the policy exception that lives in one team's heads, the upstream system that changes its response format on Sundays.

Two weeks minimum. Resist shortening it. Shadow mode is the cheapest place you will ever find these.

## Weeks 11–13: staged live

Start with the narrowest eligible slice — lowest value band, clearest cases. Widen weekly against measured agreement.

The blind sample starts here and never stops.

## The two decisions that are hard to reverse

**Where lineage is captured.** If you do not record which specific records produced which specific decision, at write time, you cannot reconstruct it later. Sources move on. This is the decision most often deferred and least often recoverable.

**How cost is attributed.** Tag every request with its business context from the first day. Retrofitting attribution across a live estate is a project, and until you have it, every capacity and value conversation is opinion.

Everything else — model choice, chunking strategy, prompt design, even the vector store — is changeable in an afternoon or a sprint. These two are not.

## What ninety days does not include

It does not include the second use case, which will be faster. It does not include change management, which runs in parallel and takes longer than the build. And it does not include the integration into the thirty-year-old system of record, which you should start in week one regardless of when you need it, because it will be the critical path.`,
  },
];
