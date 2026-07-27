/* ---------------------------------------------------------------------------
   The visitor's console configuration.

   One object, written once when they set the console up, read in three very
   different places: the browser (to build the simulation), the contact form (to
   attach to a submission) and /admin (to read back what they asked for). So it
   has to survive a round trip through localStorage and through Postgres, and it
   has to be summarisable without a browser.

   Nothing here touches storage or the DOM, which is what lets a server
   component import it. Reading and writing live next door, in
   `./demo-config-store`, behind a client-only external store.
--------------------------------------------------------------------------- */

import {
  MAX_SOURCES,
  MAX_USE_CASES,
  MIN_SOURCES,
  MIN_USE_CASES,
  findIndustry,
  findRegion,
  findScale,
  type Industry,
} from "@/lib/industries";

export type DemoConfig = {
  industry: string;
  segment: string;
  /// The visitor's own organisation. Free text, and allowed to be empty — it
  /// names the last node on the board, which is the whole point of the picture.
  company: string;
  /// Source ids from the industry's catalogue, 3–6 of them.
  sources: string[];
  /// Use case ids from the industry's catalogue, 2–6 of them.
  useCases: string[];
  scale: string;
  region: string;
  /// Free text: what is hurting right now. Becomes the disruption the operator
  /// injects, so the visitor's own words end up on the board.
  pain: string;
  /// ISO timestamp of when they configured it.
  savedAt: string;
};

export const DEMO_CONFIG_KEY = "bw.substrate.config.v1";

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

/// The configuration an industry starts from — every pre-ticked source and use
/// case, capped at what the board can hold.
export function defaultConfigFor(industry: Industry): DemoConfig {
  return {
    industry: industry.id,
    segment: industry.segments[0]?.id ?? "",
    company: "",
    sources: industry.sources
      .filter((s) => s.preselected)
      .slice(0, MAX_SOURCES)
      .map((s) => s.id),
    useCases: industry.useCases
      .filter((c) => c.preselected)
      .slice(0, MAX_USE_CASES)
      .map((c) => c.id),
    scale: "national",
    region: "global",
    pain: "",
    savedAt: "",
  };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const str = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const ids = (value: unknown, allowed: Set<string>, max: number) =>
  Array.isArray(value)
    ? [...new Set(value.filter((v): v is string => typeof v === "string"))]
        .filter((v) => allowed.has(v))
        .slice(0, max)
    : [];

/**
 * Narrows anything shaped roughly like a config into one we will actually run.
 *
 * Applied to whatever came out of localStorage *and* to whatever arrived on the
 * form post, because both are visitor-controlled. Unknown industries, unknown
 * source ids and short selections all fail closed to null rather than being
 * patched up — a half-valid console is worse than the default one.
 */
export function parseDemoConfig(value: unknown): DemoConfig | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  const industry = findIndustry(str(raw.industry, 64));
  if (!industry) return null;

  const sources = ids(
    raw.sources,
    new Set(industry.sources.map((s) => s.id)),
    MAX_SOURCES,
  );
  const useCases = ids(
    raw.useCases,
    new Set(industry.useCases.map((c) => c.id)),
    MAX_USE_CASES,
  );
  if (sources.length < MIN_SOURCES || useCases.length < MIN_USE_CASES) return null;

  const segment = str(raw.segment, 64);
  const scale = str(raw.scale, 64);
  const region = str(raw.region, 64);

  return {
    industry: industry.id,
    segment: industry.segments.some((s) => s.id === segment) ? segment : "",
    company: str(raw.company, 80),
    sources,
    useCases,
    scale: findScale(scale) ? scale : "national",
    region: findRegion(region) ? region : "global",
    pain: str(raw.pain, 240),
    savedAt: str(raw.savedAt, 40),
  };
}

/* -------------------------------------------------------------------------- */
/* Identity                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Everything about a configuration that changes what ends up on screen.
 *
 * Used as a React key on the simulation, so a reconfiguration that swapped a
 * single source rebuilds the engine rather than leaving it half-swapped. Lives
 * here rather than beside the simulation so the hero can compute it without
 * pulling the substrate modules into its own bundle.
 */
export function demoConfigRevision(config: DemoConfig | null): string {
  if (!config) return "default";
  return [
    config.industry,
    config.segment,
    config.company.trim(),
    config.sources.join("+"),
    config.useCases.join("+"),
    config.scale,
    config.region,
    config.pain.trim(),
  ].join("|");
}

/* -------------------------------------------------------------------------- */
/* Reading it back                                                            */
/* -------------------------------------------------------------------------- */

export type ConfigSummaryRow = { label: string; value: string };

/**
 * Turns a stored configuration into rows a human can read.
 *
 * Ids are meaningless to whoever picks up the lead, and the catalogue is the
 * only thing that knows what "long-lead-valve" was called on screen — so the
 * translation happens here, against the same table the browser used.
 */
export function summariseDemoConfig(config: DemoConfig): ConfigSummaryRow[] {
  const industry = findIndustry(config.industry);
  if (!industry) return [];

  const segment = industry.segments.find((s) => s.id === config.segment);
  const scale = findScale(config.scale);
  const region = findRegion(config.region);

  const sources = config.sources
    .map((id) => industry.sources.find((s) => s.id === id)?.label)
    .filter(Boolean) as string[];
  const useCases = config.useCases
    .map((id) => industry.useCases.find((c) => c.id === id)?.label)
    .filter(Boolean) as string[];

  const rows: ConfigSummaryRow[] = [{ label: "Industry", value: industry.label }];
  if (segment) rows.push({ label: "Line of business", value: segment.label });
  if (config.company) rows.push({ label: "Organisation", value: config.company });
  if (scale) rows.push({ label: "Operating scale", value: `${scale.label} — ${scale.sub}` });
  if (region) rows.push({ label: "Region", value: region.label });
  if (sources.length) rows.push({ label: "Data sources", value: sources.join(", ") });
  if (useCases.length) rows.push({ label: "Use cases", value: useCases.join(", ") });
  if (config.pain) rows.push({ label: "Biggest pain right now", value: config.pain });

  return rows;
}

/// A single line for a list view, where a table would be too much.
export function describeDemoConfig(config: DemoConfig): string {
  const industry = findIndustry(config.industry);
  if (!industry) return "Configured console";
  const segment = industry.segments.find((s) => s.id === config.segment);
  return [industry.label, segment?.label].filter(Boolean).join(" · ");
}
