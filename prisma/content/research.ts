import { DocKind } from "@prisma/client";

import type { DocSeed } from "./types";

/* ---------------------------------------------------------------------------
   Research notes. Applied rather than academic: everything here was measured
   on real customer estates, with the method and the caveats stated.
--------------------------------------------------------------------------- */

export const research: DocSeed[] = [
  {
    kind: DocKind.RESEARCH,
    slug: "quorum-decisioning-evidence-lanes",
    title: "Evidence quorum reduces confident errors by 61%",
    subtitle:
      "Measuring what happens when a decision requires agreement across independent lanes rather than a single model's confidence.",
    excerpt:
      "We compared single-model confidence thresholds against three-lane evidence quorum across 1.4 million production decisions. The interesting result was not the accuracy change.",
    category: "Decisioning",
    author: "Hana Sato",
    authorRole: "Lead Researcher, Applied Evaluation",
    readMinutes: 9,
    featured: true,
    publishedAt: "2026-07-10",
    tags: ["Decisioning", "Evaluation", "Confidence"],
    icon: "Scale",
    accent: "verdigris",
    seoDescription:
      "Research on evidence quorum decisioning: requiring agreement across independent lanes cut confident errors by 61% across 1.4M production decisions.",
    body: `## What we tested

Two configurations, run in parallel on the same production traffic across four customer estates in financial services and insurance.

**Configuration A — single-lane confidence.** One reasoning model over assembled context, with an automation threshold on its self-reported confidence.

**Configuration B — three-lane quorum.** Retrieval grounding, deterministic constraint checks, and reasoning, each producing an independent assessment. Automation requires agreement across lanes; disagreement routes to a human.

1.4 million decisions over eleven weeks. Ground truth from eventual outcome where available, and from blind human re-work on a 4% sample where not.

## Headline result

Overall accuracy was close: 94.1% for A against 95.6% for B. A 1.5 point difference is real but would not by itself justify the additional complexity.

The result that matters is the **error distribution**.

| Outcome class | Config A | Config B | Change |
| --- | --- | --- | --- |
| Correct, automated | 88.2% | 86.9% | −1.3 pts |
| Correct, escalated | 5.9% | 8.7% | +2.8 pts |
| Incorrect, escalated | 2.1% | 3.2% | +1.1 pts |
| **Incorrect, automated** | **3.8%** | **1.2%** | **−68%** |

Configuration B automates slightly less and escalates more. In exchange, the errors it makes autonomously — the ones nobody catches until a customer complains or an auditor asks — fall by roughly two thirds.

Weighted by the customers' own cost rankings, confident errors fell 61% against a 1.3 point reduction in automation rate.

## Why single-lane confidence fails the way it does

Self-reported confidence is a property of the model's output distribution, not of the evidence. A model given a coherent but incomplete context will produce a confident, coherent, incomplete answer. Nothing in the confidence signal encodes *what was not retrieved*.

Quorum works because the lanes fail differently. Retrieval failure looks like weak grounding scores. A constraint violation is deterministic and does not care how fluent the reasoning is. Reasoning failure shows up as disagreement with the other two.

Confident errors require all three lanes to fail simultaneously, and their failure modes are close to independent.

## The deterministic lane does most of the work

Ablating each lane in turn:

- Removing **deterministic checks** returned confident errors to 3.1% — most of the gap.
- Removing **grounding** returned them to 2.4%.
- Removing **reasoning** hurt overall accuracy substantially but had modest effect on confident errors.

The non-negotiable checks — limits, entitlements, coverage, eligibility, hours — are cheap, uninteresting, and responsible for most of the benefit. This is not a satisfying finding and it has held in every estate we have measured it in.

## Caveats

Four estates, two sectors, and both with well-developed deterministic rule sets already available to encode. Domains with fewer hard constraints should expect a smaller effect.

Ground truth on the non-outcome-bearing portion comes from blind human re-work, which has its own error rate. We did not attempt to correct for it, and it plausibly compresses the difference between configurations rather than exaggerating it.

## What we changed

Evidence quorum is now the default configuration for consequential decisions on the platform, with single-lane operation available where the decision is genuinely low-consequence and the latency budget is tight.

The escalation increase is real and customers should plan for it. Two of the four estates initially treated the higher escalation rate as a regression to be tuned away. Both reversed that position after reviewing what was in the escalated population.`,
  },

  {
    kind: DocKind.RESEARCH,
    slug: "drift-detection-in-governed-corpora",
    title: "Detecting drift before accuracy moves",
    subtitle:
      "Corpus composition shifts weeks before downstream accuracy does. Watching the corpus buys the lead time.",
    excerpt:
      "Accuracy monitoring tells you a model has already degraded. We looked at whether corpus-level signals predict it, and by how long.",
    category: "Monitoring",
    author: "Aisha Rahman",
    authorRole: "Principal Data Scientist",
    readMinutes: 8,
    publishedAt: "2026-06-15",
    tags: ["Drift", "Monitoring", "Data", "Operations"],
    icon: "Activity",
    accent: "amber",
    seoDescription:
      "Research on drift detection in governed corpora: corpus composition signals predicted accuracy degradation by a median of 23 days across six estates.",
    body: `## The problem with accuracy monitoring

Accuracy monitoring is retrospective by construction. By the time a metric moves enough to trigger an alert, the model has been making worse decisions for as long as it took the signal to accumulate — typically weeks, and longer where ground truth arrives late.

For a claims model where outcomes settle over ninety days, accuracy-based alerting can be a quarter behind reality.

We tested whether signals available at the data layer predict it earlier.

## Method

Six estates, eighteen months of history, across insurance, banking, manufacturing and healthcare. For each, we reconstructed a weekly time series of corpus-level signals and compared their movement against the eventual accuracy degradation events the estates had recorded.

Signals tracked:

- **Composition shift** — distribution over source systems, document types and entity classes
- **Quarantine rate and reason mix** — what is failing the quality bar and why
- **Retrieval characteristics** — score distributions, abstention rate, result-set overlap
- **Vocabulary novelty** — proportion of terms absent from the training corpus
- **Entity churn** — rate of new entities and re-resolutions of existing ones

## Result

Corpus signals moved a median of **23 days** before accuracy degradation became detectable, with an interquartile range of 11 to 41 days.

Ranked by usefulness:

**1. Quarantine reason mix (not rate).** The strongest single predictor. The total rate is stable and uninformative; the *reason* distribution shifting is a reliable early signal that an upstream system has changed. Fourteen of nineteen degradation events were preceded by a reason-mix shift.

**2. Retrieval abstention rate.** Rising abstention means the corpus no longer covers what is being asked. It precedes accuracy loss because the system's first response to a coverage gap is to decline, and only later to answer badly from weak evidence.

**3. Vocabulary novelty.** Effective in domains with real terminology churn — new products, new regulations, new failure modes. Near-useless in stable domains, where it is flat and noisy.

**4. Composition shift.** Useful but noisy. Genuine seasonality is hard to separate from real shift without a long baseline.

**5. Entity churn.** Weakest as a leading indicator, though excellent for diagnosis after the fact.

## False positives

Composition shift and vocabulary novelty produced substantial false alarms — 30–40% of alerts led to no measurable degradation. Quarantine reason mix was cleaner, at roughly 15%.

For an alert that triggers a review rather than a rollback, that rate is acceptable. It would not be acceptable for automated intervention, and we do not recommend automated retraining on these signals.

## What we deployed

The platform now tracks all five, weighted toward the first two, with alerts routed to the estate's owning team as a *review* trigger rather than an incident.

The recommended response is boring: run the evaluation suite. If it clears, log the signal and continue. If it does not, you have found a degradation weeks before the accuracy metric would have shown it.

## Caveats

Nineteen degradation events across six estates is a small sample for the per-signal rankings, and the relative ordering should be treated as directional. The 23-day median is more robust than the ranking.

We could not test whether acting on early signals improves outcomes — that would require withholding the signal from a control group, which none of the estates were willing to do, reasonably.`,
  },

  {
    kind: DocKind.RESEARCH,
    slug: "small-models-on-domain-tasks",
    title: "Small models match frontier models on 71% of enterprise tasks",
    subtitle:
      "Where domain tuning closes the gap, where it does not, and the cost consequence.",
    excerpt:
      "We evaluated tuned sub-8B models against frontier models on 340 real enterprise tasks. The pattern in what they cannot do is more useful than the headline.",
    category: "Models",
    author: "Hana Sato",
    authorRole: "Lead Researcher, Applied Evaluation",
    readMinutes: 8,
    publishedAt: "2026-05-19",
    tags: ["Models", "Fine-tuning", "Cost", "Evaluation"],
    icon: "Shapes",
    accent: "purple",
    seoDescription:
      "Research comparing domain-tuned sub-8B models with frontier models on 340 enterprise tasks: parity on 71%, with a clear pattern in the remaining 29%.",
    body: `## Method

340 tasks drawn from production workloads across eleven customer estates, categorised by task type rather than by industry. For each, a frontier model with careful prompting was compared against a sub-8B open-weight model tuned on 500–5,000 domain examples.

Grading used each estate's own rubrics, by their own domain owners, blind to which system produced the output.

"Parity" means the tuned small model scored within one standard error of the frontier model on that estate's rubric.

## Result

Parity on 71% of tasks. The distribution by task type is where the useful information is.

**Parity, consistently:**

- Structured extraction from domain documents — 94% of tasks
- Classification into a defined taxonomy — 91%
- Format-constrained generation — 89%
- Summarisation against a fixed template — 84%
- Routing and triage — 82%

**Mixed:**

- Open-ended summarisation — 61%
- Question answering over retrieved context — 58%

**Frontier models clearly ahead:**

- Multi-step reasoning over several documents — 22%
- Tasks requiring general world knowledge outside the domain — 19%
- Novel task framing not seen in tuning — 14%
- Long-context synthesis beyond 32k — 11%

## The pattern

Small tuned models are strong where the task is *narrow and repeated* and weak where it requires *composition or generality*.

That is not a surprising finding stated abstractly. What is useful is how much enterprise work falls into the first category. Most of what these estates actually do all day is extraction, classification and templated generation — high volume, well defined, and repeated thousands of times.

The frontier model is doing work well within its capability on the majority of requests, at roughly twenty times the cost.

## Cost consequence

Across the eleven estates, routing the parity-eligible task types to tuned small models and escalating the rest reduced serving cost by 58–74%, with a median of 66%.

Latency improved substantially as a side effect: median time to first token fell by more than half, which matters for interactive paths and does not show up in a cost model.

## Distillation was the most effective route

Of the tuning approaches tried, the most reliable was distillation: use the frontier model in production for a period, capture inputs and outputs with human corrections, and tune the small model on that corpus.

This works because the training distribution is exactly the production distribution, including the awkward cases. Tuning on synthetic or curated examples underperformed it in every estate where we could compare.

The practical sequence: run frontier, accumulate, distil, route, escalate.

## Caveats

Sub-8B is a moving target and this evaluation was run against one generation of open-weight models. The parity boundary has moved once during our own measurement window and will move again.

Tasks were drawn from estates that had already reached production, which biases toward tasks that are well specified. Earlier-stage workloads with unstable requirements should expect worse results from a tuned model, because the tuning target keeps moving.

We did not evaluate agentic tool-use, which we would expect to fall closer to the multi-step reasoning category.`,
  },

  {
    kind: DocKind.RESEARCH,
    slug: "retrieval-under-entity-ambiguity",
    title: "Entity scoping beats every retrieval improvement we tested",
    subtitle:
      "Better embeddings, hybrid search and re-ranking all helped. None of them helped as much as knowing who the question was about.",
    excerpt:
      "We ablated six retrieval improvements against a controlled ambiguity benchmark. Entity scoping outperformed the other five combined.",
    category: "Retrieval",
    author: "Priya Raghunathan",
    authorRole: "Principal Architect, Enterprise Intelligence",
    readMinutes: 7,
    publishedAt: "2026-04-28",
    tags: ["Retrieval", "RAG", "Entity Resolution", "Data"],
    icon: "Search",
    accent: "brass",
    seoDescription:
      "Research on retrieval under entity ambiguity: entity scoping outperformed better embeddings, hybrid search, re-ranking and larger context combined.",
    body: `## The benchmark

We built a controlled benchmark from three customer estates, holding out questions where the correct answer depends on resolving which entity is being asked about.

These are not exotic. They are the ordinary case: two customers with the same surname at the same address, a supplier that appears under a parent and a trading name, a patient with records under a maiden name, an asset re-registered after a transfer.

1,900 questions with verified answers, and a corpus containing the confusable entities by construction.

## Configurations

Baseline: dense retrieval, fixed-size chunking, top-5, no re-ranking, no scoping.

Then, additively:

1. Better embedding model
2. Structure-aware chunking
3. Hybrid dense + lexical retrieval
4. Cross-encoder re-ranking
5. Larger context (top-20 instead of top-5)
6. **Entity scoping** — restrict retrieval to the resolved entity's records

## Result

Answer accuracy on the ambiguity benchmark:

| Configuration | Accuracy | Δ from baseline |
| --- | --- | --- |
| Baseline | 51.2% | — |
| + better embeddings | 56.8% | +5.6 |
| + structure-aware chunking | 61.4% | +10.2 |
| + hybrid retrieval | 66.1% | +14.9 |
| + re-ranking | 70.3% | +19.1 |
| + larger context | 68.9% | +17.7 |
| **+ entity scoping (alone, on baseline)** | **88.7%** | **+37.5** |
| All six combined | 93.4% | +42.2 |

Entity scoping applied to the otherwise-unimproved baseline beat all five other improvements stacked together.

Note the larger-context row: increasing top-k from 5 to 20 *reduced* accuracy relative to re-ranking alone. More context on an ambiguous corpus means more confusable material competing for attention.

## Why the gap is this large

The other five improvements make retrieval better at finding *similar* content. Entity ambiguity is not a similarity problem — the wrong customer's records are genuinely, correctly similar. A better retriever finds them more reliably.

Scoping changes the question from "what is similar" to "what is similar *within this entity's records*". No amount of retriever quality substitutes for that, because the information needed is not in the text.

## The blended-answer failure

We separately measured the failure mode that concerns customers most: an answer that combines facts about two different entities without indicating it has done so.

Baseline produced blended answers on 14.2% of ambiguity questions. With all five non-scoping improvements: 9.8%. With entity scoping: 0.9%.

Better retrieval reduced blending by about a third. Scoping close to eliminated it. That difference matters more than the accuracy numbers, because a blended answer is confidently wrong and does not look wrong.

## Caveats

This benchmark is deliberately adversarial. On a general question set where entity ambiguity is rare, the gap between configurations is much smaller, and the other improvements are worth having.

The point is not that embeddings and re-ranking do not matter. It is that they cannot fix this, and this is the failure that gets programmes cancelled.

Entity scoping also has a hard prerequisite: a resolved entity graph. Estates without one cannot apply this result, which is the actual finding — the retrieval improvement with the largest effect is a data layer investment, not a retrieval one.`,
  },

  {
    kind: DocKind.RESEARCH,
    slug: "cost-aware-routing-in-production",
    title: "Cost-aware routing: what it saves and what it costs you",
    subtitle:
      "Routing on predicted difficulty saved 44% of serving spend and introduced a failure mode worth knowing about.",
    excerpt:
      "Escalation-based routing works. It also creates a class of error that is invisible in aggregate metrics, and we think that is under-discussed.",
    category: "Platform",
    author: "Daniel Okonkwo",
    authorRole: "Head of Platform Engineering",
    readMinutes: 7,
    publishedAt: "2026-03-13",
    tags: ["Routing", "Cost", "Models", "Platform"],
    icon: "Network",
    accent: "azure",
    seoDescription:
      "Production measurements of cost-aware model routing: 44% serving cost reduction, and the silent-downgrade failure mode it introduces.",
    body: `## Configuration

Requests are first served by a small tuned model. An escalation decision — based on the small model's own uncertainty, retrieval grounding scores and task-type priors — sends a subset to a frontier model.

Measured across seven estates over fourteen weeks, roughly 4.2 million requests.

## What it saved

Serving cost fell 44% at the median, with a range of 31% to 68% depending on how much of the estate's traffic fell into the narrow-and-repeated category.

Escalation rates ranged from 12% to 34%. The estates with the lowest escalation rates were not the ones with the best routers — they were the ones with the most homogeneous workloads.

Median latency improved by 40%, since the majority path is now the fast one. P99 got slightly worse, because escalated requests pay for both models.

## The failure mode

Here is the part we think is under-discussed.

Escalation decisions have two error types. **Over-escalation** sends an easy request to the expensive model: costs money, harms nothing. **Under-escalation** keeps a hard request on the small model, which answers it — plausibly, fluently, and worse.

Under-escalation is invisible in aggregate metrics. Overall accuracy barely moves, because under-escalated requests are a small fraction. But they are not randomly distributed. They concentrate in exactly the cases where the small model is confidently wrong, which is a correlated, systematic population rather than noise.

In two estates, under-escalated requests were four times more likely than average to involve an unusual entity type. The router had learned that unusual entity types were rare, which is true, and had not learned that they were hard.

## Mitigations that worked

**Never route on the model's own confidence alone.** Combine it with retrieval grounding quality and task-type priors. Self-reported confidence is a property of the output distribution, not of task difficulty.

**Force-escalate a random sample.** We route 2% of eligible traffic to the frontier model regardless, and compare. That gives a continuous measure of the under-escalation gap rather than an assumption about it.

**Escalate on rarity, not just uncertainty.** Anything with an unusual entity type, an unusual document type or an out-of-distribution vocabulary profile escalates by policy.

**Escalate consequential decisions by policy.** If a decision crosses a value threshold or touches a flagged party, cost is not the relevant consideration.

## What we would tell someone starting

The saving is real and it arrives quickly. Build the 2% control sample on day one — retrofitting it means you have no baseline for the period you most want to understand.

And expect the router to be the component you tune most. Ours has been revised eleven times in fourteen weeks, and nine of those were about *when to escalate*, not about which model to escalate to.`,
  },
];
