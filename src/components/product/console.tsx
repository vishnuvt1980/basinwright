import { Icon } from "@/components/icon";
import { Mark } from "@/components/ui/mark";
import { cn } from "@/components/ui/primitives";

/* ---------------------------------------------------------------------------
   The product console, drawn.

   The site's problem was that it read like a consultancy: everything it said
   was about work we would do, and nothing on it showed the thing that work
   lands in. This is that thing — the console's own chrome and its own module
   names, drawn in the site's tokens rather than screenshotted.

   Drawn rather than screenshotted for four reasons, in order of how much they
   cost to get wrong: a PNG cannot theme, and half this site's visitors are on
   the dark palette; a PNG cannot reflow, and most of them are on a phone; a
   screenshot of a real console shows real account state, which is nobody's
   business but the account holder's; and a screenshot goes stale the first time
   a button moves, silently, with nobody watching for it.

   **Nothing in here carries a number.** No throughput, no accuracy, no volumes,
   no counts of anything. What the panels show is structure — which modules
   exist, which columns a registry has, which states a deployment can be in —
   and structure is checkable by anyone we show the real console to. A metric in
   a marketing mock-up is a claim about a customer we do not have.
--------------------------------------------------------------------------- */

/// The console's own left rail, in the console's own order.
const RAIL = [
  { icon: "LayoutDashboard", label: "Overview" },
  { icon: "Boxes", label: "Models" },
  { icon: "Database", label: "Data Hub" },
  { icon: "Shield", label: "Guardrails" },
  { icon: "Server", label: "Compute" },
  { icon: "Activity", label: "Observability" },
];

/**
 * An application window: title bar, left rail, and whatever panel is handed to
 * it. Static markup — no client JavaScript reaches the browser for any of it.
 */
export function Console({
  module,
  children,
  className,
}: {
  /// The module name shown beside the mark, as the real console shows it.
  module: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--bw-shadow-panel)]",
        className,
      )}
      // The whole thing is one illustration. Its labels are real product
      // vocabulary, and a screen reader hearing them read out of context would
      // take them for navigation it can use.
      role="img"
      aria-label={`The BasinWright console, ${module}`}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2.5 border-b border-line bg-raised/60 px-4 py-2.5">
        <Mark className="size-5" />
        <span className="font-display text-sm tracking-tight text-ink">BasinWright</span>
        <span className="h-3.5 w-px bg-line-strong" aria-hidden />
        <span className="text-xs font-medium text-ink-2">{module}</span>
      </div>

      <div className="flex">
        {/* The rail. Gone below `sm`, where it would cost a third of the width
            to say nothing the module label has not already said. */}
        <div className="hidden shrink-0 flex-col gap-1 border-r border-line bg-raised/30 p-2 sm:flex">
          {RAIL.map((item, i) => (
            <span
              key={item.label}
              title={item.label}
              className={cn(
                "flex size-8 items-center justify-center rounded-md",
                i === 0 ? "bg-accent/12 text-accent" : "text-ink-3",
              )}
            >
              <Icon name={item.icon} className="size-4" />
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared furniture                                                           */
/* -------------------------------------------------------------------------- */

/// A status pill. `tone` is the state's meaning, not a colour name: `live` for
/// something running, `work` for something on its way there, `flat` for a
/// statement of fact with no state attached.
export function Pill({
  children,
  tone = "flat",
}: {
  children: React.ReactNode;
  tone?: "live" | "work" | "flat";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[0.65rem] tracking-wide whitespace-nowrap",
        tone === "live" && "bg-[var(--bw-mark-intelligence)]/12 text-[var(--bw-mark-intelligence)]",
        tone === "work" && "bg-accent/12 text-accent",
        tone === "flat" && "bg-raised text-ink-3",
      )}
    >
      {tone === "live" ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      ) : null}
      {children}
    </span>
  );
}

/// The label above a panel, in the console's own small-caps.
export function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.6rem] tracking-[0.14em] text-ink-3 uppercase">
      {children}
    </p>
  );
}

/// One row of a list panel: glyph, name, sub-label, and a pill on the end.
export function Row({
  icon,
  name,
  sub,
  children,
}: {
  icon?: string;
  name: string;
  sub?: string;
  /// The pill, or whatever else belongs hard right.
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line/70 py-2.5 last:border-b-0">
      {icon ? (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-raised text-ink-3">
          <Icon name={icon} className="size-3.5" />
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.8rem] font-medium text-ink">{name}</p>
        {sub ? (
          <p className="truncate font-mono text-[0.65rem] text-ink-3">{sub}</p>
        ) : null}
      </div>

      {children}
    </div>
  );
}
