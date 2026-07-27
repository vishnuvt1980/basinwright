"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// WebGL has no server rendering path, and we only want the three.js chunk on
// devices that will actually benefit from it.
const BasinField = dynamic(() => import("./basin-field"), { ssr: false });

/// Decided once per page load and cached. `getSnapshot` must return a stable
/// value or React re-renders forever, and re-evaluating on resize would
/// remount the canvas mid-scroll.
let cached: boolean | null = null;

function isCapable() {
  if (cached !== null) return cached;

  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    webgl = false;
  }

  cached =
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    webgl &&
    window.innerWidth >= 768 &&
    (navigator.hardwareConcurrency ?? 4) > 2;

  return cached;
}

// No subscription: the answer never changes within a page load.
const subscribe = () => () => {};

export function HeroCanvas() {
  const enabled = useSyncExternalStore(
    subscribe,
    isCapable,
    () => false, // server snapshot — never render the canvas during SSR
  );

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-0 [animation:fade-in_1.6s_ease-out_0.3s_forwards]"
      aria-hidden
    >
      <style>{`@keyframes fade-in { to { opacity: 1 } }`}</style>
      <BasinField />
    </div>
  );
}
