import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Engineering notes.

   These were written as research results — "measured across 1.4 million
   production decisions on four customer estates", "seven estates over fourteen
   weeks". We have no such estates and ran no such studies, so the numbers went
   and the mechanisms stayed.

   What each note now does: explain why a design choice was made, state the
   mechanism it depends on, and set out the measurement that would confirm or
   kill it. Where a figure appears it is either cited to public literature or
   marked as an assumption we have not yet tested.

   The collection carries a standing disclosure to that effect — see
   COLLECTIONS in src/lib/library.ts.

   If we ever do run these studies, the results belong here, clearly dated and
   with the method stated. Until then this is design rationale, and it says so.
--------------------------------------------------------------------------- */

export const research: DocSeed[] = [
  {
    kind: DocKind.RESEARCH,
    slug: "quorum-decisioning-evidence-lanes",
    title: "Why we require an evidence quorum rather than a confidence score",
    subtitle:
      "Self-reported confidence is a property of the model's output distribution. It cannot encode what was never retrieved.",
    excerpt:
      "The design bet: independent lanes fail in independent ways, so requiring agreement collapses the confident-error class at the cost of a few more escalations.",
    category: "Decisioning",
    author: "Loom",
    authorRole: "Applied Evaluation Agent",
    readMinutes: 8,
    featured: true,
    publishedAt: "2026-07-10",
    tags: ["Decisioning", "Evaluation", "Confidence"],
    icon: "Scale",
    accent: "verdigris",
    seoDescription:
      "Why BasinWright requires agreement across independent evidence lanes rather than a single confidence threshold, and the measurement that would test it.",
    body: `## The choice

Two ways to decide whether an automated system may act without a human.

**Single-lane confidence.** One reasoning model over assembled context, with an automation threshold on its self-reported confidence.

**Evidence quorum.** Retrieval grounding, deterministic constraint checks and reasoning, each producing an independent assessment. Automation requires agreement; disagreement routes to a human.

The platform defaults to the second for consequential decisions. This note is why, and what would have to be true for that to be wrong.

## Why single-lane confidence fails the way it does

Self-reported confidence is a property of the model's output distribution, not of the evidence. A model given a coherent but *incomplete* context will produce a confident, coherent, incomplete answer. Nothing in the confidence signal encodes what was not retrieved.

That is not a calibration problem to be tuned away. It is structural: the signal is computed over the tokens the model produced, and the missing evidence never became tokens.

## The mechanism quorum relies on

Quorum works — if it works — because the lanes fail *differently*:

- Retrieval failure shows up as weak grounding scores.
- A constraint violation is deterministic and does not care how fluent the reasoning is.
- Reasoning failure shows up as disagreement with the other two.

A confident error then requires all three to fail simultaneously. The whole bet rests on those failure modes being close to independent, and that is the assumption most worth attacking. If retrieval and reasoning share an upstream cause — the same stale corpus, say — they are correlated and the quorum buys less than it appears to.

## What we expect, and what would falsify it

We expect quorum to **automate slightly less** and **escalate more**, in exchange for a large reduction in the errors that get made autonomously and are caught late.

That trade only looks good if the second effect dominates. The measurement that decides it, which any estate can run in shadow mode:

| Outcome class | What it costs |
| --- | --- |
| Correct, automated | The win |
| Correct, escalated | Cheap — a human's time |
| Incorrect, escalated | Cheap — the human catches it |
| **Incorrect, automated** | Expensive, and found late |

Run both configurations on the same traffic. If the reduction in the fourth row does not outweigh the loss in the first row on the estate's own cost weighting, single-lane is the right answer there and we would say so.

## The unglamorous part

Our expectation is that the **deterministic lane** does most of the work — limits, entitlements, coverage, eligibility, hours-of-service. Cheap, uninteresting checks that are not learned and not negotiable.

That is not a satisfying claim for an AI platform to make, which is one reason to state it plainly. The ablation that would test it: remove each lane in turn and watch the confident-error rate. If removing the deterministic checks moves it most, the boring lane is the load-bearing one.

## What this means in practice

Quorum is the default for consequential decisions and single-lane operation is available where the decision is genuinely low-consequence and the latency budget is tight.

Expect the escalation rate to rise when you switch. Two teams we have talked this through with assumed that was a regression to be tuned away. It is the mechanism working — and the population that lands in the escalation queue is the thing to go and read before deciding otherwise.`,
  },

  {
    kind: DocKind.RESEARCH,
    slug: "drift-detection-in-governed-corpora",
    title: "Watching the corpus instead of waiting for accuracy to move",
    subtitle:
      "Accuracy monitoring is retrospective by construction. Corpus-level signals are the only ones available earlier.",
    excerpt:
      "By the time an accuracy metric moves enough to alert, the model has been making worse decisions for as long as it took the signal to accumulate. Sometimes a quarter.",
    category: "Monitoring",
    author: "Cartograph",
    authorRole: "Data Science Agent",
    readMinutes: 7,
    publishedAt: "2026-06-15",
    tags: ["Drift", "Monitoring", "Data", "Operations"],
    icon: "Activity",
    accent: "amber",
    seoDescription:
      "Why BasinWright monitors corpus composition and quarantine reason mix as leading drift indicators, and how to validate them on your own estate.",
    body: `## The problem with accuracy monitoring

Accuracy monitoring is retrospective by construction. By the time a metric moves enough to trigger an alert, the model has been making worse decisions for as long as it took the signal to accumulate.

For a claims model where outcomes settle over ninety days, accuracy-based alerting can be a quarter behind reality. That is not a tuning problem. Ground truth simply does not exist yet.

So the question is whether anything available *earlier* carries signal.

## The candidates, and why each might work

**Quarantine reason mix.** Not the rate — the rate is usually stable and uninformative — but the *distribution of reasons*. The mechanism: an upstream system changing its behaviour shows up first as a different mix of why records fail the quality bar, before any of it reaches a model. This is the signal we weight most heavily, and it is the one with the clearest causal story.

**Retrieval abstention rate.** Rising abstention means the corpus no longer covers what is being asked. It should precede accuracy loss because a system's first response to a coverage gap is to decline, and only later to answer badly from weak evidence.

**Vocabulary novelty.** The proportion of terms absent from the training corpus. Should work in domains with real terminology churn — new products, new regulations — and be flat and noisy in stable ones. Expect it to be useless more often than not.

**Composition shift.** Distribution over source systems, document types and entity classes. Genuinely hard to separate from seasonality without a long baseline, so expect false alarms.

**Entity churn.** The rate of new entities and re-resolutions. We expect this to be weak as a leading indicator and excellent for diagnosis after the fact.

## What we do not know

We have not established how much lead time these actually buy. That requires a history of degradation events with corpus signals reconstructed alongside them, and it has to be done per estate — the answer will differ by domain, by how fast the upstream systems change, and by how long ground truth takes to arrive.

Any estate running this platform can produce that history, and it is worth doing deliberately rather than discovering after an incident.

## How to validate it on your own estate

1. Record all five signals weekly from go-live. They are cheap and you cannot reconstruct them later.
2. Log every degradation event with a date, including the ones caught by complaint rather than by monitoring.
3. After a handful of events, look backwards: which signals moved first, and by how long.
4. Weight your alerting on what actually led, not on this list.

## What we ship, and why it is conservative

The platform tracks all five, weighted toward quarantine reason mix and abstention, and routes them as a **review** trigger rather than an incident.

The recommended response is deliberately boring: run the evaluation suite. If it clears, log the signal and continue. If it does not, you have found a degradation before the accuracy metric would have shown it.

We do not recommend automated retraining on these signals, and we do not ship it. Composition shift and vocabulary novelty are noisy enough that automated intervention would fire on seasonality — and a retrain triggered by noise is a worse outcome than the drift it was chasing.`,
  },

  {
    kind: DocKind.RESEARCH,
    slug: "small-models-on-domain-tasks",
    title: "When a small tuned model is the right answer",
    subtitle:
      "Narrow and repeated favours a tuned small model. Composition and generality do not. Most enterprise volume is the first kind.",
    excerpt:
      "The largest available model is the default and it is usually the wrong one — not because it performs badly, but because it is doing work well within its capability at many times the cost.",
    category: "Models",
    author: "Loom",
    authorRole: "Applied Evaluation Agent",
    readMinutes: 8,
    publishedAt: "2026-05-19",
    tags: ["Models", "Fine-tuning", "Cost", "Evaluation"],
    icon: "Shapes",
    accent: "purple",
    seoDescription:
      "Which enterprise tasks suit a domain-tuned small model, which need a frontier model, and how to run the comparison on your own workload.",
    body: `## The claim we are making

Small domain-tuned models are strong where a task is **narrow and repeated**, and weak where it requires **composition or generality**.

Stated that abstractly it is not controversial. What makes it operationally interesting is how much enterprise work falls into the first category: extraction, classification, templated generation, routing — high volume, well defined, repeated thousands of times a day.

On that traffic a frontier model is doing work well within its capability, at many times the cost and latency of something that would do it just as well.

## Where we would expect parity, and why

**Likely parity** — the task has a fixed output shape and a bounded input distribution, so tuning has something stable to learn:

- Structured extraction from domain documents
- Classification into a defined taxonomy
- Format-constrained generation
- Summarisation against a fixed template
- Routing and triage

**Likely not** — the task requires knowledge or composition that was never in the tuning distribution:

- Multi-step reasoning over several documents
- Anything needing general world knowledge outside the domain
- Novel task framing not seen in tuning
- Long-context synthesis

**Genuinely uncertain**: open-ended summarisation, and question answering over retrieved context. These sit on the boundary and we would not predict them without testing.

We have not evaluated agentic tool-use and would expect it to fall closer to the multi-step reasoning category.

## The approach we would use

Distillation, rather than tuning on curated or synthetic examples: run the frontier model in production for a period, capture inputs and outputs with human corrections, and tune the small model on that corpus.

The reason is mechanical rather than clever. The training distribution ends up being exactly the production distribution, including the awkward cases that a curated set quietly omits.

The sequence: run frontier, accumulate, distil, route, escalate.

## How to test it on your own workload

Do not take the categories above on trust — the boundary moves with every model generation, and it will differ on your data.

1. Take a hundred real examples per task type, drawn from production rather than constructed.
2. Score both systems against **your** rubric, graded by **your** domain owners, blind to which system produced which output.
3. Define parity as within one standard error on that rubric, and decide the threshold before you look.
4. Route the task types that reach parity; escalate the rest on uncertainty and on rarity.
5. Keep a small forced-escalation sample so you can see the gap you are accepting.

## The caveat that matters most

"Small model" is a moving target. The parity boundary has moved with every open-weight generation and will move again, in the direction of more tasks being served well by less compute.

That argues for building the *routing* rather than picking a model: a route that resolves a capability class can absorb the next generation as a config change. A model name in application code cannot.`,
  },

  {
    kind: DocKind.RESEARCH,
    slug: "retrieval-under-entity-ambiguity",
    title: "Why entity scoping is the retrieval decision that matters",
    subtitle:
      "Better embeddings, hybrid search and re-ranking all make retrieval better at finding similar content. Entity ambiguity is not a similarity problem.",
    excerpt:
      "The wrong customer's records are genuinely, correctly similar. A better retriever finds them more reliably — which is the opposite of what you wanted.",
    category: "Retrieval",
    author: "Meridian",
    authorRole: "Enterprise Architecture Agent",
    readMinutes: 7,
    publishedAt: "2026-04-28",
    tags: ["Retrieval", "RAG", "Entity Resolution", "Data"],
    icon: "Search",
    accent: "brass",
    seoDescription:
      "Why entity scoping matters more than embedding quality or re-ranking for enterprise retrieval, and how to build a benchmark that exposes the difference.",
    body: `## The failure this is about

Two customers with the same surname at the same address. A supplier under a parent name and a trading name. A patient with records under a maiden name. An asset re-registered after a transfer.

These are not exotic cases. They are the ordinary condition of enterprise data, and they produce a specific failure: an answer that blends facts about two different entities without indicating it has done so.

That answer is fluent. It looks right. It is the failure that gets programmes cancelled, because it is the one an executive notices personally.

## Why better retrieval does not fix it

The usual retrieval improvements — a stronger embedding model, structure-aware chunking, hybrid dense-plus-lexical search, cross-encoder re-ranking — all make the system better at finding *similar* content.

Entity ambiguity is not a similarity problem. The wrong customer's records are genuinely, correctly similar to the query. A better retriever finds them **more** reliably.

The information needed to exclude them is not in the text at all. It is the fact that these records belong to a different resolved entity — which exists only if something upstream resolved entities in the first place.

## The design consequence

Retrieval is scoped to the resolved entity before similarity is considered at all. Scope first, rank second.

This changes the question from "what is similar" to "what is similar *within this entity's records*", and no amount of retriever quality substitutes for it.

The uncomfortable implication: the retrieval improvement we expect to matter most is not a retrieval investment. It is a data-layer one, and it has a hard prerequisite — a resolved entity graph. Estates without one cannot apply this at all, which is itself the finding.

## Larger context windows make it worse, not better

Worth stating separately because the instinct runs the other way. Increasing top-k on an ambiguous corpus pulls in *more* confusable material competing for attention. Retrieve broadly, re-rank, and pass few.

## How to test this properly

A general question set will not show the effect — entity ambiguity is rare in aggregate and dominant in the cases that matter. Build the benchmark adversarially:

1. Find real confusable entities in your own data: shared names, parent/subsidiary pairs, pre- and post-merger records, changed identifiers.
2. Write questions whose correct answer depends on resolving *which* entity is meant.
3. Verify the answers by hand. This is slow and there is no shortcut.
4. Measure two things separately: answer accuracy, and **blended-answer rate** — responses combining facts about two entities without flagging it.

The second number is the one to watch. An answer that is merely wrong gets caught. A blended answer is confidently wrong and does not look wrong.

## What we are not claiming

We have not run this benchmark at scale across production estates, and the relative contribution of each retrieval improvement will depend heavily on how ambiguous a given corpus is.

What we are claiming is the mechanism: scoping addresses a failure that ranking cannot, because the discriminating information is not in the text. That argument stands on its own, and the benchmark above is how you would check it on your data rather than take our word for it.`,
  },

  {
    kind: DocKind.RESEARCH,
    slug: "cost-aware-routing-in-production",
    title: "Cost-aware routing, and the failure mode it introduces",
    subtitle:
      "Escalation-based routing saves real money and creates a class of error that is invisible in aggregate metrics.",
    excerpt:
      "Under-escalation does not distribute randomly. It concentrates exactly where the small model is confidently wrong — a systematic population, not noise.",
    category: "Platform",
    author: "Keystone",
    authorRole: "Platform Engineering Agent",
    readMinutes: 7,
    publishedAt: "2026-03-13",
    tags: ["Routing", "Cost", "Models", "Platform"],
    icon: "Network",
    accent: "azure",
    seoDescription:
      "How escalation-based model routing works, the under-escalation failure mode it introduces, and the control sample that makes it visible.",
    body: `## The configuration

Requests are served first by a small tuned model. An escalation decision — based on the small model's uncertainty, retrieval grounding scores and task-type priors — sends a subset to a frontier model.

The saving is real and arrives quickly, because the majority path becomes the cheap one. Median latency improves for the same reason. P99 gets slightly worse, since escalated requests pay for both models.

That much is arithmetic. The part worth writing down is what it costs you that does not show up in a dashboard.

## The failure mode

Escalation decisions have two error types.

**Over-escalation** sends an easy request to the expensive model. It costs money and harms nothing.

**Under-escalation** keeps a hard request on the small model, which answers it — plausibly, fluently, and worse.

Under-escalation is invisible in aggregate metrics. Overall accuracy barely moves, because under-escalated requests are a small fraction of volume. But they are **not randomly distributed**. They concentrate exactly where the small model is confidently wrong, which is a systematic population rather than noise.

The mechanism is worth being precise about: a router trained or tuned on request distribution learns that unusual inputs are *rare*. Rare and *hard* are different properties, and nothing in the frequency signal distinguishes them.

## The controls that address it

**Never route on the model's own confidence alone.** Combine it with retrieval grounding quality and task-type priors. Self-reported confidence is a property of the output distribution, not of task difficulty — the same argument as in the [evidence quorum note](/research/quorum-decisioning-evidence-lanes).

**Force-escalate a random sample.** A small percentage of eligible traffic goes to the frontier model regardless, and the two outputs are compared. This is what converts the under-escalation gap from an assumption into a measurement.

Build this on day one. Retrofitting it means having no baseline for exactly the period you most want to understand.

**Escalate on rarity, not just uncertainty.** Unusual entity types, unusual document types, out-of-distribution vocabulary — escalate by policy rather than by learned judgement.

**Escalate consequential decisions by policy.** Above a value threshold or touching a flagged party, cost is not the relevant consideration.

## What to expect

The router will be the component you tune most, and most of the tuning will be about *when to escalate* rather than which model to escalate to.

Budget for that. A routing layer is not a thing you configure once; it is a thing you operate, and the control sample is what tells you whether it is still doing its job.`,
  },
];
