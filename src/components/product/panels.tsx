import { Icon, IconTile } from "@/components/icon";
import { Console, PanelLabel, Pill, Row } from "@/components/product/console";

/* ---------------------------------------------------------------------------
   What the console is showing.

   Four panels, each one a real surface of the product. Every name in here is a
   name the product actually uses — the modules are the console's modules, the
   models are catalogue entries, the serving targets are the three we serve on.
   Nothing is invented to fill a row, and nothing carries a metric.

   `PANELS` is what the CMS picks from: a block sets `meta.panel` and gets one
   of these. An unknown value falls back to the module grid rather than
   rendering an empty window.
--------------------------------------------------------------------------- */

/* --------------------------------------------------------------- Modules */

const MODULES = [
  { name: "Model 360", sub: "drift · evidence", icon: "Activity", tone: "azure" },
  { name: "Deployments", sub: "endpoints · rollback", icon: "Rocket", tone: "brass" },
  { name: "GPU 360", sub: "fleet · utilisation", icon: "Cpu", tone: "teal" },
  { name: "Data Hub", sub: "stores · queries", icon: "Database", tone: "green" },
  { name: "Guardrails", sub: "screening · evaluators", icon: "Shield", tone: "berry" },
  { name: "Automations", sub: "workflows · triggers", icon: "Zap", tone: "amber" },
] as const;

function ModulesPanel() {
  return (
    <Console module="Overview">
      <PanelLabel>Modules</PanelLabel>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {MODULES.map((module) => (
          <div
            key={module.name}
            className="flex flex-col items-start gap-2.5 rounded-lg border border-line bg-canvas/40 p-3"
          >
            <IconTile name={module.icon} tone={module.tone} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[0.8rem] font-medium text-ink">{module.name}</p>
              <p className="truncate font-mono text-[0.65rem] text-ink-3">{module.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </Console>
  );
}

/* ------------------------------------------------------------- Catalogue */

/// Catalogue entries, with the domain each sits in. These are the AI-safety
/// screeners, which are the ones a visitor can see for themselves in the
/// product — so they are the honest ones to draw.
const CATALOGUE = [
  { name: "PromptShield Injection Detector", sub: "AI security", state: "Shipping" },
  { name: "LeakSentry Data Leakage Detector", sub: "AI security", state: "Shipping" },
  { name: "GovernanceLens Compliance Scorer", sub: "EU AI Act · NIST AI RMF · ISO 42001", state: "Shipping" },
  { name: "RAGArmor Vulnerability Scanner", sub: "Knowledge & GenAI", state: "Shipping" },
  { name: "PoisonGuard Training Data Screener", sub: "AI security", state: "Shipping" },
] as const;

function CataloguePanel() {
  return (
    <Console module="Models & Registry">
      <div className="flex items-center justify-between gap-4">
        <PanelLabel>Catalogue</PanelLabel>
        <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[0.6rem] text-ink-3">
          tune to your data
        </span>
      </div>

      <div className="mt-1.5">
        {CATALOGUE.map((entry) => (
          <Row key={entry.name} icon="Boxes" name={entry.name} sub={entry.sub}>
            <Pill tone="live">{entry.state}</Pill>
          </Row>
        ))}
        <Row icon="Plus" name="Not in the catalogue" sub="specified, then built on the same pipeline">
          <Pill tone="work">Build to order</Pill>
        </Row>
      </div>
    </Console>
  );
}

/* -------------------------------------------------------------- Model 360 */

/// What a model carries once it is running. The order is the order the evidence
/// is produced in: explain the call, sign it, keep its lineage, then watch it.
const EVIDENCE = [
  {
    name: "Reason codes & contributing factors",
    sub: "tabular models",
    state: "On by default",
    icon: "Scale",
  },
  {
    name: "Cited source passages",
    sub: "retrieval & LLM models",
    state: "On by default",
    icon: "FileText",
  },
  {
    name: "Signed reasoning receipt",
    sub: "Ed25519 · output linked to its inputs",
    state: "Hash chain intact",
    icon: "Lock",
  },
  {
    name: "Data-to-decision lineage",
    sub: "versioned config · change history",
    state: "Retained",
    icon: "Network",
  },
  {
    name: "Drift & accuracy decay",
    sub: "PSI / CSI · statistical monitoring",
    state: "Watched",
    icon: "Activity",
  },
  {
    name: "Evaluators",
    sub: "rubric scoring, continuous",
    state: "Watched",
    icon: "Microscope",
  },
] as const;

function Model360Panel() {
  return (
    <Console module="Model 360">
      <PanelLabel>Evidence on every decision</PanelLabel>

      <div className="mt-1.5">
        {EVIDENCE.map((item) => (
          <Row key={item.name} icon={item.icon} name={item.name} sub={item.sub}>
            <Pill tone="live">{item.state}</Pill>
          </Row>
        ))}
      </div>
    </Console>
  );
}

/* ---------------------------------------------------------------- Serving */

const SERVING = [
  {
    name: "CPU serving",
    sub: "inside your environment",
    fit: "scoring · forecasting · classification",
    icon: "Server",
  },
  {
    name: "Cloud GPU",
    sub: "provisioned on demand",
    fit: "embeddings · document intelligence · LLM inference",
    icon: "Cloud",
  },
  {
    name: "Your own GPU",
    sub: "on-premises, inside your perimeter",
    fit: "sovereignty & residency-constrained work",
    icon: "Lock",
  },
] as const;

function ServingPanel() {
  return (
    <Console module="Deployments">
      <PanelLabel>Serving targets</PanelLabel>

      <div className="mt-3 flex flex-col gap-2.5">
        {SERVING.map((target) => (
          <div key={target.name} className="rounded-lg border border-line bg-canvas/40 p-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-raised text-ink-3">
                <Icon name={target.icon} className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8rem] font-medium text-ink">{target.name}</p>
                <p className="truncate font-mono text-[0.65rem] text-ink-3">{target.sub}</p>
              </div>
              <Pill tone="live">Available</Pill>
            </div>
            <p className="mt-2 border-t border-line/70 pt-2 text-[0.7rem] text-ink-2">
              {target.fit}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 font-mono text-[0.65rem] text-ink-3">
        versioned · logged · rollback-ready
      </p>
    </Console>
  );
}

/* -------------------------------------------------------------------------- */

export const PANELS = {
  modules: ModulesPanel,
  catalogue: CataloguePanel,
  model360: Model360Panel,
  serving: ServingPanel,
} as const;

export type PanelName = keyof typeof PANELS;

/// The CMS names a panel in `meta.panel`. A typo draws the module grid rather
/// than an empty window.
export function panelFor(name: string | null): PanelName {
  return name && name in PANELS ? (name as PanelName) : "modules";
}
