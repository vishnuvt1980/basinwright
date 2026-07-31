import { cn } from "@/components/ui/primitives";

/// Where the mark's three lit dots sit on Fluent's Grid Dots lattice. Read in
/// order they trace a check mark — the "Wright" in the name — and in colour they
/// run the substrate's own sequence: governed, proven, yours.
const LIT = [
  { x: 5, y: 12, className: "mark-compute", label: "Compute" },
  { x: 12, y: 19, className: "mark-data", label: "Data" },
  { x: 19, y: 5, className: "mark-intelligence", label: "Intelligence" },
];

/// The other six. Fluent's regular weight against the lit dots' filled weight,
/// so the three lead the lattice without being made outsized.
const UNLIT = [
  [5, 5],
  [12, 5],
  [12, 12],
  [19, 12],
  [5, 19],
  [19, 19],
];

/**
 * The BasinWright mark on its own.
 *
 * Lives here rather than inside the header because the product console draws it
 * too — in its title bar, where the real console has it. Two copies of a
 * nine-dot lattice would drift the first time one of them was nudged.
 *
 * `grouped` opts into the header's hover treatment, where the unlit dots come
 * up to full opacity as the wordmark is hovered.
 */
export function Mark({
  className,
  grouped = false,
}: {
  className?: string;
  grouped?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-7", className)} aria-hidden>
      <g
        className={cn(
          "mark-grid opacity-70",
          grouped && "transition-opacity duration-500 group-hover:opacity-100",
        )}
      >
        {UNLIT.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />
        ))}
      </g>
      {LIT.map((dot) => (
        <circle key={dot.label} cx={dot.x} cy={dot.y} r="2" className={dot.className} />
      ))}
    </svg>
  );
}
