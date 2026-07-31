"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";

import { Icon } from "@/components/icon";
import {
  ACCEPT_ALL,
  ESSENTIAL_ONLY,
  manageConsent,
  openConsentPreferences,
  saveConsent,
  setConsentDraft,
  snoozeConsent,
  useConsent,
  type ConsentCategories,
} from "@/components/site/consent-store";
import { Button, cn } from "@/components/ui/primitives";

/* ---------------------------------------------------------------------------
   The consent banner.

   The copy is held to the same standard as the rest of the site: it describes
   what this site actually does. There is no advertising pixel and no
   third-party analytics tracker on basinwright.com — the Privacy Statement says
   so in as many words — so the categories offered here are the two that are
   real (the storage the site cannot run without, and the storage that remembers
   your preferences) plus product analytics, which is off until it is switched
   on and stays off if the browser has already said no.

   A banner claiming categories we do not have would be the same failure as a
   metric we cannot stand behind, on a page that links to a privacy statement
   somebody's counsel may well read.
--------------------------------------------------------------------------- */

const CATEGORIES = [
  {
    key: "essential" as const,
    title: "Strictly necessary",
    body: "Session and security storage, and the state that makes the site work at all. These cannot be switched off.",
  },
  {
    key: "functional" as const,
    title: "Preferences",
    body: "Remembers your theme, whether the immersive graphics are on, and your conversation with the assistant, so the site behaves the same way next time.",
  },
  {
    key: "analytics" as const,
    title: "Product analytics",
    body: "Aggregate page and feature usage, used only to decide what to build next. Off unless you turn it on, and never shared with an advertising network.",
  },
];

export function CookieConsent() {
  const { open, managing, signal, draft } = useConsent();

  // Escape closes it the same way the × does.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") snoozeConsent();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          role="region"
          aria-label="Privacy preferences"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-60 border-t border-line-strong bg-surface shadow-[var(--bw-shadow-panel)]"
        >
          <div className="container-bw relative max-h-[85dvh] overflow-y-auto py-6 sm:py-7">
            <button
              type="button"
              onClick={snoozeConsent}
              aria-label="Close, and ask again next visit"
              className="absolute top-5 right-5 inline-flex size-8 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-raised hover:text-ink sm:right-6"
            >
              <Icon name="Dismiss" className="size-4" />
            </button>

            {/* Only shown when there is something to confirm — a strip that
                appears for everybody says nothing. */}
            {signal ? (
              <div
                data-tone="green"
                className="mb-5 flex max-w-2xl items-center gap-2.5 rounded-md border border-[color-mix(in_oklab,var(--tone)_40%,transparent)] bg-[color-mix(in_oklab,var(--tone)_10%,transparent)] px-3.5 py-2.5"
              >
                <Icon name="ShieldCheck" className="size-4 shrink-0 text-[var(--tone)]" />
                <p className="text-sm text-ink-2">Opt-out preference signal honoured</p>
              </div>
            ) : null}

            <div className="grid gap-6 pr-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
              <div className="max-w-2xl">
                <h2 className="text-lg text-ink">We care about your privacy</h2>
                <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-2">
                  BasinWright uses cookies and similar storage to keep this site
                  working, to remember your preferences, and to understand which
                  parts of it are useful. We run no advertising trackers here and
                  never sell what we hold — the{" "}
                  <Link
                    href="/privacy"
                    className="text-accent underline underline-offset-2 hover:text-accent-strong"
                  >
                    Privacy Statement
                  </Link>{" "}
                  sets out all of it. &ldquo;Reject all&rdquo; keeps only what
                  the site cannot run without.
                </p>
              </div>

              {!managing ? (
                <div className="flex flex-wrap items-center gap-3">
                  {/* Three buttons of equal weight would make the choice look
                      harder than it is; managing is the tertiary action. */}
                  <Button variant="ghost" onClick={manageConsent}>
                    Manage preferences
                  </Button>
                  <Button variant="secondary" onClick={() => saveConsent(ESSENTIAL_ONLY)}>
                    Reject all
                  </Button>
                  <Button onClick={() => saveConsent(ACCEPT_ALL)}>Accept all</Button>
                </div>
              ) : null}
            </div>

            {managing ? (
              <div className="mt-6 border-t border-line pt-6">
                <ul className="grid gap-4 sm:grid-cols-3">
                  {CATEGORIES.map((category) => {
                    const locked = category.key === "essential";
                    // Analytics is forced off — and shown as such — while the
                    // browser is sending the opt-out signal.
                    const forced = category.key === "analytics" && signal;
                    const checked =
                      locked ||
                      (!forced && draft[category.key as keyof ConsentCategories]);

                    return (
                      <li
                        key={category.key}
                        className="panel flex flex-col gap-2 bg-raised p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-ink">
                            {category.title}
                          </h3>
                          <Toggle
                            label={category.title}
                            checked={Boolean(checked)}
                            disabled={locked || forced}
                            onChange={(next) =>
                              setConsentDraft({ [category.key]: next })
                            }
                          />
                        </div>
                        <p className="text-xs leading-relaxed text-ink-3">
                          {category.body}
                        </p>
                        {locked || forced ? (
                          <p className="mt-auto pt-1 text-xs text-ink-3 italic">
                            {locked
                              ? "Always active"
                              : "Held off by your browser's opt-out signal"}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button onClick={() => saveConsent(draft)}>Save my choices</Button>
                  <Button variant="secondary" onClick={() => saveConsent(ESSENTIAL_ONLY)}>
                    Reject all
                  </Button>
                  <Button variant="secondary" onClick={() => saveConsent(ACCEPT_ALL)}>
                    Accept all
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

/// A switch rather than a checkbox, because the row it sits in reads as a
/// setting. It is still a real checkbox underneath, so it takes focus,
/// announces its state and works from the keyboard.
function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-accent" : "bg-line-strong",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none ml-0.5 size-4 rounded-full bg-surface transition-transform duration-200",
          checked && "translate-x-4",
        )}
      />
      <span className="pointer-events-none absolute inset-0 rounded-full peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink" />
    </label>
  );
}

/// The way back in once a decision is stored — sits in the footer's legal row.
export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openConsentPreferences}>
      Cookie preferences
    </button>
  );
}
