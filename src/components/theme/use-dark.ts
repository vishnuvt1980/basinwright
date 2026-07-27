"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the page is currently rendering dark.
 *
 * Reads the resolved theme rather than the visitor's choice: the inline theme
 * script stamps `data-theme` on `<html>` before first paint, and the toggle
 * rewrites it, so "system" has already been collapsed to light or dark by the
 * time anything reads this. That makes one hook cover all three settings.
 *
 * Anything drawing its own pixels — a canvas, a shader — needs this, because
 * CSS custom properties do not reach into a WebGL context.
 */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.dataset.theme === "dark";

/// The server cannot know; the light rendering is the safe first paint, and
/// the canvas this feeds is client-only anyway.
const getServerSnapshot = () => false;

export function useIsDark(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
