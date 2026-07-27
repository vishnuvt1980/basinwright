"use client";

import { useSyncExternalStore } from "react";

/**
 * The site-wide "immersive graphics" gate.
 *
 * Two independent inputs decide whether a WebGL layer mounts:
 *
 *   1. Capability detection — is this machine likely to hold a steady frame
 *      rate, and does the visitor's OS want motion at all?
 *   2. An explicit choice, persisted in `localStorage`.
 *
 * The explicit choice wins in **both** directions: someone on a modest laptop
 * may force graphics on, someone on a workstation may force them off. Detection
 * only supplies the default.
 *
 * Two profiles come out of one detection pass, because the two scenes cost
 * very different things. The hero is a single full-bleed fragment shader and
 * runs almost anywhere; the topology scene has real geometry and needs a wider
 * viewport to compose in. One switch still governs both.
 *
 * Everything lives in a single external store so `useSyncExternalStore` hands
 * components an already-resolved answer. Deriving it during render would mean
 * touching `window` on the hydration pass, and a `useState`/`useEffect` pair is
 * rejected by the `react-hooks/set-state-in-effect` rule.
 */

export const GRAPHICS_STORAGE_KEY = "bw:graphics";

/// "auto" is the absence of a stored choice, not a stored value.
export type GraphicsChoice = "on" | "off" | "auto";

export type GraphicsState = {
  /// What the visitor picked. Drives the toggle's pressed state.
  choice: GraphicsChoice;
  /// Whether the topology scene should mount.
  sceneEnabled: boolean;
  /// False under `prefers-reduced-motion` — compose the scene, don't animate it.
  sceneAnimated: boolean;
  /// Whether the hero shader should mount.
  heroEnabled: boolean;
  /// Whether this machine can render *anything*. When false the toggle would be
  /// inert, so we don't offer it.
  supported: boolean;
};

/* -------------------------------------------------------------------------- */
/* Capability detection                                                       */
/* -------------------------------------------------------------------------- */

type Capability = {
  /// Structural — no context, or no room to compose in. Not overridable.
  sceneSupported: boolean;
  heroSupported: boolean;
  /// Scored — fast enough that we'd switch graphics on unprompted.
  sceneCapable: boolean;
  heroCapable: boolean;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/// Read fresh on every resolve rather than cached with the hardware probe: a
/// visitor who turns on Reduce Motion mid-session should be taken at their word
/// without having to reload.
function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/// Renderer strings belonging to software rasterisers. These report generous
/// texture limits and plenty of cores while drawing at single-digit frame
/// rates, so they have to be matched by name.
const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|basic render|microsoft basic|generic renderer|software adapter|\bsoftware\b/i;

/// Below this the topology composition has nowhere to go and its labels collide.
const SCENE_MIN_VIEWPORT = 1024;
const HERO_MIN_VIEWPORT = 768;

/// A GPU that cannot hold a 4K texture is not going to hold this scene.
const MIN_TEXTURE_SIZE = 4096;

/// Soft-signal total the scene has to clear to switch itself on.
const SCENE_SCORE_THRESHOLD = 3;

type ExtendedNavigator = Navigator & {
  /// Chromium only — absent on Safari and Firefox, where absence must stay neutral.
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function probe(): Capability {
  const nav = navigator as ExtendedNavigator;
  const cores = nav.hardwareConcurrency ?? 0;
  const width = window.innerWidth;

  let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  let webgl2 = false;
  try {
    const canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2");
    webgl2 = gl !== null;
    gl ??= canvas.getContext("webgl");
  } catch {
    gl = null;
  }

  const heroSupported = gl !== null && width >= HERO_MIN_VIEWPORT;
  // The hero shader is fill-rate bound but geometrically trivial; a couple of
  // real cores is the whole bar.
  const heroCapable = cores === 0 || cores > 2;

  const base: Capability = {
    heroSupported,
    heroCapable,
    sceneSupported: false,
    sceneCapable: false,
  };

  if (!gl || !webgl2 || width < SCENE_MIN_VIEWPORT) {
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return base;
  }

  try {
    // Software rasterisers and data-saver mode are outright disqualifiers
    // rather than negative scores — no amount of cores compensates.
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debug
      ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? "")
      : "";

    if (renderer && SOFTWARE_RENDERER.test(renderer)) {
      return { ...base, sceneSupported: true };
    }
    if (nav.connection?.saveData === true) {
      return { ...base, sceneSupported: true };
    }

    const maxTexture = (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) ?? 0;
    const maxBuffer =
      (gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number) ?? 0;
    if (Math.min(maxTexture, maxBuffer) < MIN_TEXTURE_SIZE) {
      return { ...base, sceneSupported: true };
    }

    // Everything below is a soft signal. Unknown values score 0, so a browser
    // withholding a metric is neither rewarded nor punished.
    let score = 0;

    if (cores >= 8) score += 2;
    else if (cores >= 6) score += 1;
    else if (cores > 0 && cores <= 4) score -= 2;

    const memory = nav.deviceMemory;
    if (memory !== undefined) {
      if (memory >= 8) score += 2;
      else if (memory >= 6) score += 1;
      else if (memory <= 4) score -= 2;
    }

    if (maxTexture >= 16384) score += 2;
    else if (maxTexture >= 8192) score += 1;

    // A renderer string we could read that isn't a rasteriser is itself mild
    // evidence of real hardware.
    if (renderer) score += 1;

    return {
      ...base,
      sceneSupported: true,
      sceneCapable: score >= SCENE_SCORE_THRESHOLD,
    };
  } finally {
    // The probe context counts against the browser's per-page context budget,
    // so hand it back before the real canvases ask for one.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

/// Decided once per page load. Re-running on resize would remount the canvases
/// mid-scroll, and `getSnapshot` has to be referentially stable anyway.
let capability: Capability | null = null;

/// A browser may refuse a WebGL context to a document that has never been
/// visible, so a page opened in a background tab probes as having no GPU at
/// all — and, cached, stays that way for the rest of the session. A result
/// that found *no* context is therefore provisional: it is re-taken the first
/// time the page is actually shown. A result that found one is final.
function provisional(c: Capability) {
  return !c.heroSupported && !c.sceneSupported;
}

/// Throws away a provisional result so the next resolve takes a fresh one.
function reprobe() {
  if (!capability || !provisional(capability)) return;
  capability = null;
  snapshot = null;
  for (const listener of listeners) listener();
}

let retryScheduled = false;

/// One retry, not a poll. A context request can fail in the first moments of a
/// page's life — GPU process still starting, nothing painted yet — and asking
/// again shortly afterwards either succeeds or settles the question. Waiting
/// for the page to become visible is not enough on its own: a pane that is
/// occluded rather than backgrounded never fires `visibilitychange`.
function scheduleRetry() {
  if (retryScheduled || !capability || !provisional(capability)) return;
  retryScheduled = true;
  setTimeout(reprobe, 600);
}

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

/// Cached so `getSnapshot` returns the same object until something actually
/// changes; a fresh object every call makes React re-render forever.
let snapshot: GraphicsState | null = null;

const SERVER_STATE: GraphicsState = {
  choice: "auto",
  sceneEnabled: false,
  sceneAnimated: false,
  heroEnabled: false,
  supported: false,
};

function storedChoice(): GraphicsChoice {
  try {
    const value = localStorage.getItem(GRAPHICS_STORAGE_KEY);
    return value === "on" || value === "off" ? value : "auto";
  } catch {
    // Private browsing with storage blocked — fall back to detection.
    return "auto";
  }
}

function resolve(): GraphicsState {
  capability ??= probe();
  const c = capability;
  const choice = storedChoice();
  const reducedMotion = prefersReducedMotion();

  // `*Supported` is structural and cannot be overridden: there is no context to
  // render into, or no room to render it in. Everything else can be.
  //
  // Reduced motion disqualifies by default, but an explicit "on" is a
  // deliberate, informed request — the topology scene honours it and composes
  // statically rather than refusing outright. The hero has no static form, so
  // reduced motion stays structural there.
  const forced = choice === "on";
  const off = choice === "off";

  const sceneEnabled =
    !off && c.sceneSupported && (forced || (c.sceneCapable && !reducedMotion));

  // The hero shader has no static form, so reduced motion rules it out
  // outright rather than composing it still.
  const heroEnabled =
    !off && c.heroSupported && !reducedMotion && (forced || c.heroCapable);

  return {
    choice,
    sceneEnabled,
    sceneAnimated: sceneEnabled && !reducedMotion,
    heroEnabled,
    supported: c.sceneSupported || c.heroSupported,
  };
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // `storage` only fires in *other* tabs, so same-tab writes publish directly.
  window.addEventListener("storage", onChange);

  const motion = window.matchMedia(REDUCED_MOTION);
  const onMotionChange = () => {
    snapshot = null;
    onChange();
  };
  motion.addEventListener("change", onMotionChange);

  const onVisibility = () => {
    if (document.visibilityState === "visible") reprobe();
  };
  document.addEventListener("visibilitychange", onVisibility);

  scheduleRetry();

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
    motion.removeEventListener("change", onMotionChange);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

function getSnapshot(): GraphicsState {
  return (snapshot ??= resolve());
}

const getServerSnapshot = (): GraphicsState => SERVER_STATE;

export function setGraphicsChoice(next: GraphicsChoice) {
  try {
    if (next === "auto") localStorage.removeItem(GRAPHICS_STORAGE_KEY);
    else localStorage.setItem(GRAPHICS_STORAGE_KEY, next);
  } catch {
    // Storage unavailable — the choice still applies for this page view.
  }

  snapshot = null;
  for (const listener of listeners) listener();
}

/// Resolved graphics state. Safe to call from any client component; during SSR
/// and the hydration pass it reports "off", so markup matches on both sides.
export function useGraphics(): GraphicsState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
