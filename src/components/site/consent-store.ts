"use client";

import { useSyncExternalStore } from "react";

/**
 * The consent decision, and the banner that collects it.
 *
 * State lives in one module-level store rather than in `useState` + `useEffect`
 * for the same reason the graphics store does: the answer is derived from
 * `localStorage`, `sessionStorage` and a browser signal, none of which exist on
 * the server, and `useSyncExternalStore` hands the component an already-resolved
 * value instead of setting state from inside an effect.
 *
 * The banner and the footer's "Cookie preferences" link are separate components
 * in separate trees, so the open/closed state has to live somewhere both can
 * reach anyway.
 */

const STORAGE_KEY = "bw.consent";
const SNOOZE_KEY = "bw.consent.snoozed";

/// Bump when the categories change: a stored decision about an older set of
/// categories is not a decision about this one, so the banner comes back.
export const CONSENT_VERSION = 1;

export type ConsentCategories = {
  /// Theme, whether the immersive graphics are on, the chat transcript — the
  /// preferences the site keeps so it behaves the same way next visit.
  functional: boolean;
  /// Aggregate product analytics. Nothing is wired to it today; the switch is
  /// here so the answer is on record before anything is.
  analytics: boolean;
};

export type ConsentRecord = ConsentCategories & {
  v: number;
  at: string;
  /// True when the browser's opt-out signal, rather than a button, decided it.
  signal: boolean;
};

export const ACCEPT_ALL: ConsentCategories = { functional: true, analytics: true };
export const ESSENTIAL_ONLY: ConsentCategories = { functional: false, analytics: false };

export type ConsentState = {
  /// The stored decision, or null while there is none.
  record: ConsentRecord | null;
  /// Global Privacy Control — a browser-level "do not sell or share" signal,
  /// and a legally recognised opt-out in several US states. Honouring it is not
  /// optional, which is why the banner says out loud that it has.
  signal: boolean;
  open: boolean;
  /// Whether the per-category panel is showing rather than the plain banner.
  managing: boolean;
  /// The categories the switches currently show. Seeded from the stored
  /// decision, or from "everything on" for a first visit.
  draft: ConsentCategories;
};

const SERVER_STATE: ConsentState = {
  record: null,
  signal: false,
  open: false,
  managing: false,
  draft: ACCEPT_ALL,
};

const listeners = new Set<() => void>();

/// Cached so `getSnapshot` keeps returning the same object until something
/// actually changes — a fresh object every call re-renders forever.
let snapshot: ConsentState | null = null;

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    // Private browsing with storage blocked.
    return null;
  }
}

function write(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch {
    // Nothing to be done, and nothing that should break the page.
  }
}

function storedRecord(): ConsentRecord | null {
  const raw = read(() => localStorage, STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentRecord;
    return parsed?.v === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function optOutSignal() {
  return (
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  );
}

function resolve(): ConsentState {
  const record = storedRecord();
  const signal = optOutSignal();
  const snoozed = read(() => sessionStorage, SNOOZE_KEY) === "1";

  return {
    record,
    signal,
    open: !record && !snoozed,
    managing: false,
    draft: draftFor(record, signal),
  };
}

/// What the switches should show when the panel opens: the stored decision if
/// there is one, otherwise everything on — except analytics, which a browser
/// sending the opt-out signal has already answered.
function draftFor(record: ConsentRecord | null, signal: boolean): ConsentCategories {
  const base = record
    ? { functional: record.functional, analytics: record.analytics }
    : ACCEPT_ALL;
  return signal ? { ...base, analytics: false } : base;
}

function publish(next: Partial<ConsentState>) {
  snapshot = { ...(snapshot ??= resolve()), ...next };
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  // A decision taken in another tab settles it here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    snapshot = null;
    onChange();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): ConsentState {
  return (snapshot ??= resolve());
}

const getServerSnapshot = (): ConsentState => SERVER_STATE;

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

/// Stores a decision and closes the banner.
export function saveConsent(categories: ConsentCategories) {
  const { signal } = getSnapshot();

  const record: ConsentRecord = {
    ...categories,
    // A browser that has sent the opt-out signal cannot be talked out of it by
    // a button on our page.
    analytics: signal ? false : categories.analytics,
    v: CONSENT_VERSION,
    at: new Date().toISOString(),
    signal,
  };

  write(() => localStorage, STORAGE_KEY, JSON.stringify(record));
  try {
    sessionStorage.removeItem(SNOOZE_KEY);
  } catch {}

  publish({ record, open: false, managing: false, draft: draftFor(record, signal) });

  // Anything that later depends on consent — a tag, a logger — listens for this
  // rather than polling storage.
  window.dispatchEvent(new CustomEvent("bw:consent", { detail: record }));
}

/// The × and Escape. Not a decision: the banner goes away for this browsing
/// session and asks again next time, because the only other reading of "close"
/// is treating silence as a yes.
export function snoozeConsent() {
  write(() => sessionStorage, SNOOZE_KEY, "1");
  publish({ open: false, managing: false });
}

/// The footer link — reopens straight into the per-category panel, showing
/// whatever was chosen last time.
export function openConsentPreferences() {
  const { record, signal } = getSnapshot();
  publish({ open: true, managing: true, draft: draftFor(record, signal) });
}

export function manageConsent() {
  const { record, signal } = getSnapshot();
  publish({ managing: true, draft: draftFor(record, signal) });
}

export function setConsentDraft(patch: Partial<ConsentCategories>) {
  publish({ draft: { ...getSnapshot().draft, ...patch } });
}

/// Resolved consent state. During SSR and the hydration pass it reports a
/// closed banner and no decision, so the markup matches on both sides.
export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
