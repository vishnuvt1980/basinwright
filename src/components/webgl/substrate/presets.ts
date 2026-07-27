/* ---------------------------------------------------------------------------
   What the simulation is currently simulating.

   The topology — some sources, a hub, three engines, a decision, an owner — is
   the product's shape and does not change. What flows through it does: the
   systems that feed it, the cases it works, the disruption an operator can
   throw at it, and how loud the whole thing runs.

   This module holds only that running state. The catalogue it is built from
   lives in `@/lib/industries`, and the code that turns a visitor's answers into
   one of these lives in `./configure`. Keeping the three apart is what lets the
   case board read the active content without importing any of the machinery
   that produced it.
--------------------------------------------------------------------------- */

import { DEFAULT_SOURCES } from "@/lib/industries";

import { setSources } from "./topology";

export type CaseTemplate = {
  title: string;
  trigger: string;
  decision: string;
  impact: string;
  /// Skills the agent council checks out to reach this decision. Must exist in
  /// `AGENTS`, or the case will never light anything up.
  skills: string[];
};

export type RuntimePreset = {
  /// Changes whenever the content does, so a React tree can key an engine on it
  /// and get a clean rebuild instead of a half-swapped board.
  id: string;
  /// The rotation. Cases open from this list, in order, forever.
  cases: CaseTemplate[];
  /// What "Inject disruption" throws at the board.
  disruption: CaseTemplate;
  /// Multiplies the ambient record rate: a global operator's board is busier
  /// than a single-region one's, and it should look it.
  intensity: number;
};

/* -------------------------------------------------------------------------- */
/* The default board                                                          */
/* -------------------------------------------------------------------------- */

/**
 * What runs before a visitor has told us anything about themselves.
 *
 * Deliberately generic — cross-industry supply and finance decisions every one
 * of our sectors would recognise. The moment they configure the console this is
 * replaced wholesale.
 */
export const DEFAULT_PRESET: RuntimePreset = {
  id: "default",
  intensity: 1,
  cases: [
    {
      title: "Carrier ETA slip — Dock 18",
      trigger: "Carrier ETA slipped 6h against a committed service level",
      decision: "Reroute 240 units via the secondary distribution centre",
      impact: "$2.9M revenue protected · 93% service recovery",
      skills: ["detect", "retrieve", "simulate", "explain"],
    },
    {
      title: "Lane cost spike — west corridor",
      trigger: "Spot freight 31% over contract on four consecutive loads",
      decision: "Pre-book two carriers for a 14-day window",
      impact: "$1.1M penalty avoided · 31% less expedite spend",
      skills: ["correlate", "retrieve", "bound", "weigh"],
    },
    {
      title: "Stockout risk — line 44-2189",
      trigger: "Demand signal diverging from the replenishment plan",
      decision: "Hold promotional stock for tier-1 accounts",
      impact: "$1.9M margin defended · fill rate back to 88%",
      skills: ["detect", "simulate", "weigh", "explain"],
    },
    {
      title: "Supplier clause conflict",
      trigger: "Contract §7.2 contradicts the supplier surcharge notice",
      decision: "Invoke clause 14b and withhold the surcharge",
      impact: "$480K claim blocked · dispute pack assembled",
      skills: ["retrieve", "cite", "bound", "explain"],
    },
    {
      title: "Cold-chain excursion",
      trigger: "Reefer telemetry breached 8°C for 22 minutes",
      decision: "Divert the batch to a secondary quality hold",
      impact: "$1.3M write-off avoided · audit trail sealed",
      skills: ["detect", "correlate", "simulate", "cite"],
    },
    {
      title: "Duplicate invoice run",
      trigger: "318 ledger rows matched across two ERP instances",
      decision: "Block the payment run and merge to the golden record",
      impact: "$840K double payment prevented",
      skills: ["correlate", "bound", "cite", "weigh"],
    },
  ],
  disruption: {
    title: "Port strike — west corridor",
    trigger: "Operator-injected disruption across three lanes",
    decision: "Split volume: air-lift tier-1, rail the remainder",
    impact: "$6.4M exposure contained · 71% of commitments held",
    skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
  },
};

/**
 * The preset the simulation is currently running.
 *
 * Read by the case board every time it opens a case, so swapping it takes
 * effect on the next case rather than requiring a restart — but source *count*
 * does require a restart, which is why `applyPreset` is documented as something
 * you call before building an engine.
 */
export let activePreset: RuntimePreset = DEFAULT_PRESET;

/**
 * Switches the running content.
 *
 * Call before constructing an engine. `setSources` rewrites the ingest side of
 * the topology in place, and the field seeds its residents and its per-source
 * counters from whatever it finds there at construction time.
 */
export function applyPreset(
  preset: RuntimePreset,
  sources: { label: string; sub: string }[],
) {
  activePreset = preset;
  setSources(sources.length ? sources : DEFAULT_SOURCES);
}
