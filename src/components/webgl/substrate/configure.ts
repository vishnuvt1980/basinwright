/* ---------------------------------------------------------------------------
   From a visitor's answers to a running board.

   The one place that knows how a `DemoConfig` becomes a simulation. Everything
   it touches is module state the engine reads at construction time, so this has
   to run *before* an engine is built and never while one is stepping.

   Imported only by the React components that open the console — never by the
   simulation modules themselves, which is what keeps `cases.ts` free of any
   dependency on the industry catalogue.
--------------------------------------------------------------------------- */

import { demoConfigRevision, type DemoConfig } from "@/lib/demo-config";
import { findIndustry, findRegion, findScale } from "@/lib/industries";

import { nameAgents } from "./cases";
import { applyPreset, DEFAULT_PRESET, type CaseTemplate } from "./presets";
import { DEFAULT_CAPTIONS, HUB, OPS, OWNERSHIP } from "./topology";

/**
 * A visitor's own words, turned into the disruption the operator injects.
 *
 * Their sentence goes on the board verbatim as the trigger. The decision and
 * the impact stay ours — the point of the button is to show the substrate
 * absorbing something nobody planned for, and we can honestly claim it responds
 * without claiming to know what their number would be.
 */
function painAsDisruption(pain: string, fallback: CaseTemplate): CaseTemplate {
  const trimmed = pain.trim();
  if (!trimmed) return fallback;
  return {
    title: trimmed.length > 58 ? `${trimmed.slice(0, 57)}…` : trimmed,
    trigger: trimmed,
    decision: "Pulled to the front of the board, evidence gathered across every lane",
    impact: "Grounded, verified and explained before anyone had to ask twice",
    skills: ["detect", "correlate", "retrieve", "simulate", "weigh", "explain"],
  };
}

/**
 * Points the whole simulation at one visitor's world.
 *
 * Pass null to put it back to the default board. Returns the preset id, which
 * changes whenever the content does — the React tree keys the engine on it so a
 * reconfiguration rebuilds rather than half-swaps.
 */
export function applyDemoConfig(config: DemoConfig | null): string {
  if (!config) {
    applyPreset(DEFAULT_PRESET, []);
    nameAgents(null);
    HUB.sub = DEFAULT_CAPTIONS.governance;
    OPS[1].sub = DEFAULT_CAPTIONS.tenancy;
    OWNERSHIP.label = DEFAULT_CAPTIONS.owner.label;
    OWNERSHIP.sub = DEFAULT_CAPTIONS.owner.sub;
    return DEFAULT_PRESET.id;
  }

  const industry = findIndustry(config.industry);
  if (!industry) return applyDemoConfig(null);

  const sources = config.sources
    .map((id) => industry.sources.find((s) => s.id === id))
    .filter((s) => s !== undefined)
    .map((s) => ({ label: s.label, sub: s.sub }));

  const cases = config.useCases
    .map((id) => industry.useCases.find((c) => c.id === id))
    .filter((c) => c !== undefined)
    .map(
      (c): CaseTemplate => ({
        title: c.title,
        trigger: c.trigger,
        decision: c.decision,
        impact: c.impact,
        skills: c.skills,
      }),
    );

  // Both bounds are enforced when the config is parsed, so an empty list here
  // means the catalogue moved under a stored config. Fall back rather than run
  // a board with nothing on it.
  if (!sources.length || !cases.length) return applyDemoConfig(null);

  const scale = findScale(config.scale);
  const region = findRegion(config.region);
  const company = config.company.trim();
  const revision = demoConfigRevision(config);

  applyPreset(
    {
      id: revision,
      cases,
      disruption: painAsDisruption(config.pain, industry.disruption),
      intensity: scale?.intensity ?? 1,
    },
    sources,
  );

  nameAgents(industry.agents);

  HUB.sub = region?.governance ?? DEFAULT_CAPTIONS.governance;
  OPS[1].sub = region?.tenancy ?? DEFAULT_CAPTIONS.tenancy;

  // The last node is the argument the whole picture is making. Putting their
  // own name on it is the single highest-value thing a configuration can do.
  OWNERSHIP.label = company || DEFAULT_CAPTIONS.owner.label;
  OWNERSHIP.sub = company
    ? "owns the model · owns the intelligence"
    : DEFAULT_CAPTIONS.owner.sub;

  return revision;
}
