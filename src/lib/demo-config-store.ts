"use client";

import { useSyncExternalStore } from "react";

import {
  DEMO_CONFIG_KEY,
  parseDemoConfig,
  type DemoConfig,
} from "@/lib/demo-config";

/**
 * The visitor's console configuration, as an external store.
 *
 * It has to be a store rather than a `useState`/`useEffect` pair for two
 * reasons. The `react-hooks/set-state-in-effect` rule rejects the pair outright,
 * and — more usefully — the configuration genuinely is external, shared state:
 * the hero reads it, the console writes it, and the contact form further down
 * the page has to pick up a configuration built minutes earlier without a
 * reload. One store gives all three the same answer at the same moment.
 *
 * `ready` is what stops the hero building a simulation from the default board
 * and then immediately tearing it down when the saved one arrives. It is false
 * exactly once — on the server and through hydration — and true from the first
 * client render onwards.
 */

export type DemoConfigState = {
  /// False until localStorage has actually been read.
  ready: boolean;
  config: DemoConfig | null;
};

const SERVER_STATE: DemoConfigState = { ready: false, config: null };

const listeners = new Set<() => void>();

/// Cached so `getSnapshot` returns the same object until something actually
/// changes; a fresh object every call makes React re-render forever.
let snapshot: DemoConfigState | null = null;

function read(): DemoConfigState {
  try {
    const raw = window.localStorage.getItem(DEMO_CONFIG_KEY);
    return { ready: true, config: raw ? parseDemoConfig(JSON.parse(raw)) : null };
  } catch {
    // Storage blocked, or a value written by an older catalogue. Either way
    // there is nothing to restore, and being asked the questions again is a far
    // better outcome than a console built from half a configuration.
    return { ready: true, config: null };
  }
}

function publish() {
  snapshot = null;
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // `storage` only fires in *other* tabs, so same-tab writes publish directly.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === DEMO_CONFIG_KEY) publish();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = (): DemoConfigState => (snapshot ??= read());
const getServerSnapshot = (): DemoConfigState => SERVER_STATE;

/* -------------------------------------------------------------------------- */
/* Writing                                                                    */
/* -------------------------------------------------------------------------- */

/// Stamps, persists and publishes. Returns what was stored, so the caller can
/// run the console from it without waiting for the store to come back round.
export function saveDemoConfig(config: DemoConfig): DemoConfig {
  const stamped = { ...config, savedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(DEMO_CONFIG_KEY, JSON.stringify(stamped));
  } catch {
    // Private browsing, or a full quota. The console still runs from this
    // session's copy; it just will not be remembered next time.
  }
  publish();
  return stamped;
}

export function clearDemoConfig() {
  try {
    window.localStorage.removeItem(DEMO_CONFIG_KEY);
  } catch {
    /* nothing to clear */
  }
  publish();
}

/* -------------------------------------------------------------------------- */
/* Reading                                                                    */
/* -------------------------------------------------------------------------- */

/// Safe to call from any client component. Reports `ready: false` during SSR
/// and the hydration pass, so markup matches on both sides.
export function useDemoConfig(): DemoConfigState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
