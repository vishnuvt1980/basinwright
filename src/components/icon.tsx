import {
  FLUENT_ICONS,
  type FluentIconName,
} from "@/components/fluent-icons.generated";
import { cn } from "@/components/ui/primitives";

export type IconName = FluentIconName;

export const TONES = [
  "azure",
  "teal",
  "green",
  "brass",
  "amber",
  "ember",
  "berry",
  "purple",
] as const;

export type Tone = (typeof TONES)[number];

/// Icons the CMS may pick from — chrome glyphs (chevrons, spinners) are
/// excluded so the picker stays meaningful.
const CHROME: ReadonlySet<string> = new Set([
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "ArrowUpRight", "Check",
  "ChevronRight", "ChevronDown", "Circle", "Dismiss", "Menu", "EyeOff", "Plus",
  "Trash", "LogOut", "ExternalLink", "Inbox", "Settings", "LayoutList",
  "Spinner", "Sun", "Moon", "Desktop",
]);

export const ICON_NAMES = (Object.keys(FLUENT_ICONS) as IconName[])
  .filter((n) => !CHROME.has(n))
  .sort();

/// Stable hue per concept: "Agent Platform" gets the same tone everywhere it
/// appears, and reordering a section never reshuffles the colours.
export function toneFor(seed: string | null | undefined): Tone {
  if (!seed) return "brass";

  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return TONES[Math.abs(hash) % TONES.length];
}

/// Maps the CMS `accent` field onto a tone, for sections that set one.
/// The original four accent words the CMS was seeded with, each pointing at
/// the tone it was always drawn in.
const ACCENT_TONE: Record<string, Tone> = {
  brass: "brass",
  verdigris: "teal",
  ember: "amber",
  slate: "azure",
};

const TONE_NAMES: ReadonlySet<string> = new Set(TONES);

/**
 * A tone for an entry's `accent`.
 *
 * Two vocabularies are accepted. The four words above are what the seed has
 * always used; a tone's own name is also taken as itself, so an editor who
 * wants the green one can write "green" rather than learning which of brass,
 * verdigris, ember and slate happens to mean it.
 *
 * An unrecognised accent falls back to a hash of the seed, which is a stable
 * colour rather than a right one — so a typo looks arbitrary instead of
 * looking broken.
 */
export function toneForAccent(accent: string | null | undefined, fallbackSeed?: string): Tone {
  if (accent && TONE_NAMES.has(accent)) return accent as Tone;
  return (accent && ACCENT_TONE[accent]) || toneFor(fallbackSeed);
}

function resolve(name?: string | null) {
  return (name && FLUENT_ICONS[name as IconName]) || FLUENT_ICONS.Circle;
}

/**
 * A bare Fluent glyph. Inherits `currentColor`, so colour comes from the
 * surrounding element — usually `<IconTile>`.
 */
export function Icon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const icon = resolve(name);

  return (
    <svg
      viewBox={icon.viewBox}
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={cn("shrink-0", className)}
      // Path data is generated at build time from @fluentui/svg-icons — a
      // trusted, vendored source. No user input reaches this.
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

const TILE_SIZES = {
  sm: { tile: "size-8 rounded-lg", glyph: "size-4" },
  md: { tile: "size-11", glyph: "size-5" },
  lg: { tile: "size-14 rounded-2xl", glyph: "size-7" },
} as const;

/**
 * Fluent-style tinted container. The tone drives tint, ring and glyph colour
 * from one hue, and flips automatically between light and dark.
 */
export function IconTile({
  name,
  tone,
  size = "md",
  className,
}: {
  name?: string | null;
  /// Omit to derive a stable tone from the icon name.
  tone?: Tone;
  size?: keyof typeof TILE_SIZES;
  className?: string;
}) {
  const dims = TILE_SIZES[size];

  return (
    <span
      data-tone={tone ?? toneFor(name)}
      className={cn("icon-tile", dims.tile, className)}
    >
      <Icon name={name} className={dims.glyph} />
    </span>
  );
}
