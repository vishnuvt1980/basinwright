"use client";

import { Icon } from "@/components/icon";
import { cn } from "@/components/ui/primitives";
import { setGraphicsChoice, useGraphics } from "@/components/webgl/graphics-store";

/**
 * Turns the site's WebGL layers on and off, and remembers the answer.
 *
 * It stays mounted when graphics are off — hiding the control would leave the
 * visitor no way back — and it writes an explicit choice rather than returning
 * to "auto", because once someone has touched it the decision is theirs.
 *
 * One instance governs the whole site, so it lives in the header: `compact` is
 * the glyph that sits beside the theme control in the bar, `pill` the labelled
 * switch the mobile sheet has room for.
 */
export function GraphicsToggle({
  className,
  variant = "pill",
}: {
  className?: string;
  variant?: "pill" | "compact";
}) {
  const { sceneEnabled, heroEnabled, supported } = useGraphics();

  // Nothing to offer on a machine that cannot render either layer. This is
  // also the state during SSR and hydration, so callers reserve the row's
  // height to keep the control from shifting anything when it appears.
  if (!supported) return null;

  const on = sceneEnabled || heroEnabled;
  const label = `Immersive graphics: ${on ? "On" : "Off"}`;

  if (variant === "compact") {
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={label}
        title={label}
        onClick={() => setGraphicsChoice(on ? "off" : "on")}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full border backdrop-blur-sm transition-colors duration-300",
          on
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-line bg-surface/70 text-ink-3 hover:border-line-strong hover:text-ink-2",
          className,
        )}
      >
        {/* One mark in both states, struck through when off — the same glyph
            in a different colour reads as decoration, not as a state. */}
        <span className="relative inline-flex size-4 items-center justify-center">
          <Icon name="Sparkles" className="size-4" />
          {on ? null : (
            <span
              aria-hidden
              className="absolute h-[1.5px] w-[1.35rem] -rotate-45 rounded-full bg-current"
            />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setGraphicsChoice(on ? "off" : "on")}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full border border-line bg-surface/70 py-1.5 pr-4 pl-1.5 text-xs text-ink-2 backdrop-blur-sm transition-colors duration-300 hover:border-accent/60 hover:text-ink",
        className,
      )}
    >
      {/* Switch track */}
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300",
          on ? "bg-accent/80" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full transition-transform duration-300",
            on
              ? "translate-x-4 bg-[var(--bw-on-accent)]"
              : "translate-x-0 bg-ink-3",
          )}
        />
      </span>

      <span className="whitespace-nowrap">
        Immersive graphics:{" "}
        <span className={cn("font-medium", on ? "text-accent" : "text-ink-2")}>
          {on ? "On" : "Off"}
        </span>
      </span>
    </button>
  );
}
