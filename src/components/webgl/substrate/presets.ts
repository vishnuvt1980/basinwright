/* ---------------------------------------------------------------------------
   What the simulation is simulating.

   Everything industry-specific lives here and nowhere else: the systems that
   feed the substrate, and the cases it works. The topology — six sources, a
   hub, three engines, a decision, an owner — is the product's shape and does
   not change; only the names on it and the work flowing through it do.

   That split is deliberate. Tailoring the demo to a visitor's industry, their
   own source systems and their own use cases is a matter of adding a preset
   below and calling `applyPreset`, not of touching the renderer, the field or
   the case board.
--------------------------------------------------------------------------- */

/// One connected system. Positional: the six entries map onto the six source
/// nodes in the topology, top to bottom, so a preset swaps names without
/// moving anything.
export type SourcePreset = { label: string; sub: string };

export type CaseTemplate = {
  title: string;
  trigger: string;
  decision: string;
  impact: string;
  /// Skills the agent council checks out to reach this decision. Must exist in
  /// `AGENTS`, or the case will never light anything up.
  skills: string[];
};

export type SubstratePreset = {
  id: string;
  /// Shown when the visitor is choosing.
  label: string;
  sources: SourcePreset[];
  cases: CaseTemplate[];
};

/* -------------------------------------------------------------------------- */

export const SUPPLY_CHAIN: SubstratePreset = {
  id: "supply-chain",
  label: "Supply chain & logistics",
  sources: [
    { label: "SAP S/4HANA", sub: "orders · deliveries" },
    { label: "Salesforce", sub: "accounts · cases" },
    { label: "IoT Telemetry", sub: "sensors · scans" },
    { label: "Event Streams", sub: "kafka · webhooks" },
    { label: "SharePoint", sub: "contracts · email" },
    { label: "Snowflake", sub: "gl · invoices" },
  ],
  cases: [
    {
      title: "Carrier ETA slip — Dock 18",
      trigger: "Carrier ETA slipped 6h against a committed SLA",
      decision: "Reroute 240 units via the Chennai DC",
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
      title: "Stockout risk — SKU 44-2189",
      trigger: "Demand signal diverging from the replenishment plan",
      decision: "Hold promotional stock for tier-1 accounts",
      impact: "$1.9M margin defended · fill rate back to 88%",
      skills: ["detect", "simulate", "weigh", "explain"],
    },
    {
      title: "Supplier clause conflict",
      trigger: "Contract §7.2 contradicts the supplier surcharge notice",
      decision: "Invoke clause 14b, withhold the surcharge",
      impact: "$480K claim blocked · dispute pack assembled",
      skills: ["retrieve", "cite", "bound", "explain"],
    },
    {
      title: "Cold-chain excursion",
      trigger: "Reefer telemetry breached 8°C for 22 minutes",
      decision: "Divert the batch to secondary QA hold",
      impact: "$1.3M write-off avoided · audit trail sealed",
      skills: ["detect", "correlate", "simulate", "cite"],
    },
    {
      title: "Duplicate invoice run",
      trigger: "318 ledger rows matched across two ERP instances",
      decision: "Block the payment run, merge to the golden record",
      impact: "$840K double-payment prevented",
      skills: ["correlate", "bound", "cite", "weigh"],
    },
  ],
};

/// The disruption the operator injects by hand. Kept apart from the rotation
/// because it is meant to arrive out of nowhere and run hot.
export const DISRUPTION: CaseTemplate = {
  title: "Port strike — west corridor",
  trigger: "Operator-injected disruption across three lanes",
  decision: "Split volume: air-lift tier-1, rail the remainder",
  impact: "$6.4M exposure contained · 71% of SLAs held",
  skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
};

export const PRESETS: SubstratePreset[] = [SUPPLY_CHAIN];

/// The preset the simulation is currently running. Read by the topology when
/// it names its source nodes and by the case board when it opens a case.
export let activePreset: SubstratePreset = SUPPLY_CHAIN;

/**
 * Switches the running content.
 *
 * Call before constructing the engine. The topology's source nodes are shared
 * objects — the lattice, the residents and the labels all point at them — so
 * the names are rewritten in place rather than rebuilt, and nothing that holds
 * a reference goes stale.
 */
export function applyPreset(
  preset: SubstratePreset,
  sourceNodes: { label: string; sub: string }[],
) {
  activePreset = preset;
  preset.sources.forEach((source, index) => {
    const node = sourceNodes[index];
    if (!node) return;
    node.label = source.label;
    node.sub = source.sub;
  });
}
