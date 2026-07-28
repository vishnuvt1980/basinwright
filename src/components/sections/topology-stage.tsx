"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { IconTile } from "@/components/icon";
import type { TopologyLayer } from "@/components/sections/topology-layers";
import { Chip, cn } from "@/components/ui/primitives";
import { useGraphics } from "@/components/webgl/graphics-store";
import type { FpsVerdict, Quality } from "@/components/webgl/platform-scene";

/// Keeps three.js out of the homepage payload — it arrives only once a capable
/// machine scrolls the section into range.
const PlatformScene = dynamic(() => import("@/components/webgl/platform-scene"), {
  ssr: false,
});

/// Start fetching the scene chunk this far before the section arrives.
const PREFETCH_MARGIN = "400px 0px";

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

export function TopologyStage({
  layers,
  caption,
  children,
}: {
  layers: TopologyLayer[];
  /// Resting copy for the detail panel, from the section body.
  caption: string | null;
  /// The server-rendered SVG diagram. Shown whenever the scene is not running,
  /// which includes the no-JS case.
  children: ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  // Mounted once the section is close, kept mounted afterwards.
  const [near, setNear] = useState(false);
  const [onscreen, setOnscreen] = useState(false);
  const [quality, setQuality] = useState<Quality>(2);
  // Set when the runtime frame-rate guard gives up on this machine.
  const [tooSlow, setTooSlow] = useState(false);

  const { sceneEnabled, sceneAnimated } = useGraphics();
  const tabHidden = useTabHidden();

  const active = pinned ?? hovered;

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    // Two thresholds: one to decide when to load and mount, a tighter one to
    // decide whether the render loop should be running at all.
    const prefetch = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          prefetch.disconnect();
        }
      },
      { rootMargin: PREFETCH_MARGIN },
    );

    const presence = new IntersectionObserver(([entry]) =>
      setOnscreen(entry.isIntersecting),
    );

    prefetch.observe(element);
    presence.observe(element);

    return () => {
      prefetch.disconnect();
      presence.disconnect();
    };
  }, []);

  // A pinned layer otherwise only releases by clicking the same rail item
  // again, which is easy to lose track of. Escape is the expected way out.
  useEffect(() => {
    if (pinned === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPinned(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pinned]);

  const handleVerdict = useCallback((verdict: FpsVerdict) => {
    // One step down, then out. Never let the page stutter to keep the effect.
    if (verdict === "abort") setTooSlow(true);
    else setQuality((current) => (current === 2 ? 1 : current));
  }, []);

  const select = useCallback((index: number) => {
    setPinned((current) => (current === index ? null : index));
  }, []);

  const clear = useCallback(() => setPinned(null), []);

  const showScene = sceneEnabled && near && !tooSlow;
  const detail = active === null ? null : layers[active];

  // The rail reads top-down to match the stack it describes, so the top layer
  // comes first while the data stays ordered from the base up.
  const railOrder = useMemo(
    () => layers.map((_, index) => index).reverse(),
    [layers],
  );

  return (
    <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
      {/* Rail */}
      <div className="flex flex-col">
        <ul className="flex flex-col">
          {railOrder.map((index) => {
            const layer = layers[index];
            const isActive = active === index;

            return (
              <li key={layer.id}>
                <button
                  type="button"
                  aria-pressed={pinned === index}
                  onPointerEnter={() => setHovered(index)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  onClick={() => select(index)}
                  className={cn(
                    "group flex w-full items-center gap-4 border-l py-4 pl-5 text-left transition-colors duration-400",
                    isActive
                      ? "border-accent bg-raised/40"
                      : "border-line hover:border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs transition-colors duration-400",
                      isActive ? "text-accent" : "text-ink-3",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <IconTile
                    name={layer.icon}
                    tone={layer.tone}
                    size="sm"
                    className={cn(
                      "transition-transform duration-400",
                      isActive && "-translate-y-0.5",
                    )}
                  />

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[0.95rem] font-medium transition-colors duration-400",
                        isActive ? "text-ink" : "text-ink-2",
                      )}
                    >
                      {layer.title}
                    </span>
                    {layer.subtitle ? (
                      <span className="block truncate text-xs text-ink-3">
                        {layer.subtitle}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Detail panel. Fixed minimum height so pointing at a layer never
            reflows the section. */}
        <div
          data-tone={detail?.tone}
          className="panel mt-8 flex min-h-44 flex-col justify-center p-6"
        >
          {detail ? (
            <>
              <p className="text-sm leading-relaxed text-ink-2">{detail.body}</p>
              {detail.nodes.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {detail.nodes.map((node) => (
                    <Chip
                      key={node}
                      className="border-[color-mix(in_oklab,var(--tone)_35%,transparent)] font-mono text-[0.7rem] text-ink-2"
                    >
                      {node}
                    </Chip>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-relaxed text-ink-3">{caption}</p>
          )}
        </div>
      </div>

      {/* Stage — the canvas and the fallback occupy exactly the same box. */}
      <div className="flex flex-col">
        <div
          ref={stage}
          data-topology-stage
          // Omitted rather than emptied when nothing is active — see the
          // specificity note beside these rules in globals.css.
          data-topology-active={active ?? undefined}
          className="relative aspect-3/2 w-full"
        >
          {/* Both renderings are taken out of flow, so the box is sized purely
              by its aspect ratio and swapping them shifts nothing. */}
          {showScene ? (
            <div className="absolute inset-0">
              <PlatformScene
                layers={layers}
                active={active}
                animated={sceneAnimated}
                quality={quality}
                paused={!onscreen || tabHidden}
                onHover={setHovered}
                onSelect={select}
                onClear={clear}
                onVerdict={handleVerdict}
              />
            </div>
          ) : (
            <div className="absolute inset-0">{children}</div>
          )}
        </div>

        <Legend />
      </div>
    </div>
  );
}

/// Names the two directions of travel, so the still fallback carries the same
/// idea the pulses do.
function Legend() {
  return (
    <ul className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-xs text-ink-3">
      <li className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
        Request travelling up the stack
      </li>
      <li className="flex items-center gap-2">
        <span
          className="size-1.5 rounded-full bg-teal-500"
          aria-hidden
        />
        Retrieved context settling back down
      </li>
    </ul>
  );
}
