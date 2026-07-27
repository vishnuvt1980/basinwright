"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/components/ui/primitives";
import { THEME_STORAGE_KEY } from "@/components/theme/theme-script";

type Choice = "light" | "dark" | "system";

const OPTIONS: { value: Choice; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "Sun" },
  { value: "system", label: "System", icon: "Desktop" },
  { value: "dark", label: "Dark", icon: "Moon" },
];

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

// localStorage has no change event for the current tab, so toggles publish
// their own. `storage` covers other tabs.
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Choice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

// The server cannot know the visitor's stored choice; the inline theme script
// has already stamped the right theme, so rendering "system" first is safe.
const getServerSnapshot = (): Choice => "system";

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function apply(choice: Choice) {
  document.documentElement.dataset.theme =
    choice === "system" ? systemTheme() : choice;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ThemeToggle({ className }: { className?: string }) {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Follow the OS while the choice is "system".
  useEffect(() => {
    if (choice !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => apply("system");

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [choice]);

  const select = useCallback((next: Choice) => {
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing — the theme still applies for this page view.
    }

    apply(next);
    emit();
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface/70 p-0.5 backdrop-blur-sm",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = choice === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${option.label} theme`}
            title={`${option.label} theme`}
            onClick={() => select(option.value)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full transition-colors duration-200",
              active
                ? "bg-accent/15 text-accent"
                : "text-ink-3 hover:bg-raised hover:text-ink",
            )}
          >
            <Icon name={option.icon} className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
