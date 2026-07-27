"use client";

import dynamic from "next/dynamic";

import { useGraphics } from "@/components/webgl/graphics-store";

// WebGL has no server rendering path, and we only want the three.js chunk on
// devices that will actually benefit from it.
const BasinField = dynamic(() => import("./basin-field"), { ssr: false });

export function HeroCanvas() {
  // Capability detection and the visitor's stored preference both live in the
  // shared graphics store, so the one toggle in the topology section governs
  // this shader too.
  const { heroEnabled } = useGraphics();

  if (!heroEnabled) return null;

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
