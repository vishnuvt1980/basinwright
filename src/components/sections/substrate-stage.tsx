"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { SubstrateChapter } from "@/components/sections/substrate-chapters";
import { useGraphics } from "@/components/webgl/graphics-store";
import { demoConfigRevision } from "@/lib/demo-config";
import { useDemoConfig } from "@/lib/demo-config-store";

/// Keeps the simulation and its readouts out of every payload but this page's.
/// Client only, but not gated on hardware: the rail is DOM and SVG now, so
/// there is no context to acquire and no machine to disqualify.
const CaseLine = dynamic(() => import("@/components/caseline/case-line"), {
  ssr: false,
});

/// The full console. Fetched only when the visitor asks for it.
const CaseConsole = dynamic(() => import("@/components/caseline/case-console"), {
  ssr: false,
});

/// The questions that turn the console into their console. Fetched on the same
/// click, and never before it.
const SubstrateConfigurator = dynamic(
  () => import("@/components/webgl/substrate-configurator"),
  { ssr: false },
);

/* -------------------------------------------------------------------------- */
/* Tab visibility                                                             */
/* -------------------------------------------------------------------------- */

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const hiddenSnapshot = () => document.visibilityState === "hidden";

function useTabHidden() {
  return useSyncExternalStore(subscribeVisibility, hiddenSnapshot, () => false);
}

/* -------------------------------------------------------------------------- */
/* Stage                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The live substrate: the rail, and the console it opens into.
 *
 * This used to be the homepage hero's banner. It is nobody's banner now — a
 * simulation is the wrong thing to meet a first-time visitor with, because it
 * answers a question ("how does it work") that they have not asked yet. It
 * lives on its own page, which people reach on purpose.
 *
 * Renders nothing at all when the visitor has switched graphics off, or before
 * their saved configuration has been read. The written walkthrough underneath
 * carries the same argument in both cases, which is why it is not conditional.
 */
export function SubstrateStage({
  chapters,
  hint,
  cta,
}: {
  chapters: SubstrateChapter[];
  /// The interaction hint from the CMS.
  hint: string | null;
  /// The one call to action the rail is allowed, under the story.
  cta: { label: string; href: string } | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const [onscreen, setOnscreen] = useState(true);

  /* The console is a three-state affair: shut, asking what to build, or
     running. A returning visitor skips the middle state — they already told us
     once, and being asked again is the opposite of being remembered. */
  const [stage, setStage] = useState<"shut" | "asking" | "running">("shut");

  // `ready` is false until localStorage has been read. Until then there is
  // nothing worth building an engine from, and building one now would only mean
  // tearing it down a tick later when the saved configuration arrives.
  const { ready, config } = useDemoConfig();

  // Only the visitor's own choice can take the rail away — `sceneEnabled`
  // additionally requires a GPU and a wide viewport, neither of which this
  // drawing needs.
  const { choice } = useGraphics();
  const tabHidden = useTabHidden();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const presence = new IntersectionObserver(([entry]) =>
      setOnscreen(entry.isIntersecting),
    );
    presence.observe(element);
    return () => presence.disconnect();
  }, []);

  /* First visit asks the questions; every visit after runs what they answered.
     Read from the store so a reconfiguration made in this session is what the
     next click picks up. */
  const openConsole = useCallback(
    () => setStage(config ? "running" : "asking"),
    [config],
  );

  /* Stable identities, because both simulations take these as effect
     dependencies: a fresh closure on a theme flip would tear down a running
     engine and build another one in its place. */
  const shut = useCallback(() => setStage("shut"), []);
  const ask = useCallback(() => setStage("asking"), []);
  const run = useCallback(() => setStage("running"), []);

  if (choice === "off" || chapters.length === 0) return null;

  return (
    <>
      {/* Tall on purpose. The drawing needs a height budget, and a 720px laptop
          does not have one to spare — so it is allowed to run past the fold on
          a short screen rather than squeezing the diagram until its cards
          clip. */}
      <div
        ref={ref}
        className="relative min-h-[44rem] lg:h-[min(86svh,54rem)] lg:min-h-[48rem]"
      >
        {ready ? (
          <CaseLine
            // A reconfiguration changes how many systems feed the board, which
            // the rail reads once at construction. Rebuild rather than swap
            // under a running engine.
            key={demoConfigRevision(config)}
            chapters={chapters}
            hint={hint}
            cta={cta}
            config={config}
            animated={!reduced}
            // One simulation at a time: the console runs its own.
            paused={!onscreen || tabHidden || stage !== "shut"}
            onOpenDemo={openConsole}
          />
        ) : null}
      </div>

      {stage === "asking" ? (
        <SubstrateConfigurator
          initial={config}
          // The configurator persists before it hands back, so the store — and
          // with it the rail and the contact form — is already current.
          onRun={run}
          onCancel={shut}
        />
      ) : null}

      {stage === "running" ? (
        <CaseConsole
          key={demoConfigRevision(config)}
          chapters={chapters}
          config={config}
          animated={!reduced}
          onClose={shut}
          onReconfigure={ask}
        />
      ) : null}
    </>
  );
}
