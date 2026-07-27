"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { SubstrateChapter } from "@/components/sections/substrate-chapters";
import { ButtonLink, cn } from "@/components/ui/primitives";
import {
  EMPTY_SNAPSHOT,
  createSubstrate,
  type HudSnapshot,
  type Substrate,
  type Verdict,
} from "@/components/webgl/substrate/engine";
import { chapterEmphasis, type Anchor } from "@/components/webgl/substrate/topology";

/**
 * The hero banner: the substrate simulation running behind the headline.
 *
 * This whole module is behind a dynamic import, so nothing here — the shaders,
 * the simulation, the readouts — is in the homepage payload. It mounts only
 * once a machine has cleared the capability gate.
 *
 * The story advances itself. A hero cannot ask the visitor to scroll through
 * seven chapters before reaching the rest of the page, so the chapters cycle,
 * pausing whenever the visitor takes over by pointing at the rail.
 *
 * Nothing on screen is invented: every number is a value the simulation
 * produced, published as one immutable snapshot about seven times a second.
 */

/// How long each chapter holds the stage before the story moves on.
const CHAPTER_MS = 7000;

/* Node captions are placed from world coordinates every layout, so the type can
   never drift away from the thing it names. */
const LABEL_TRANSFORM: Record<Anchor, string> = {
  right: "translate(0.9rem, -50%)",
  left: "translate(calc(-100% - 0.9rem), -50%)",
  top: "translate(-50%, calc(-100% - 2.4rem))",
  bottom: "translate(-50%, 2.4rem)",
};

const LABEL_ALIGN: Record<Anchor, string> = {
  right: "text-left",
  left: "text-right",
  top: "text-center",
  bottom: "text-center",
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/* -------------------------------------------------------------------------- */
/* Snapshot store                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The simulation publishes into this; React reads out of it. A store rather
 * than `useState` because the first publish happens synchronously while the
 * engine is being constructed inside an effect, and because it keeps the ~7Hz
 * republish out of the effect graph entirely.
 */
function createSnapshotStore() {
  let current: HudSnapshot = EMPTY_SNAPSHOT;
  const listeners = new Set<() => void>();

  return {
    set(next: HudSnapshot) {
      current = next;
      for (const listener of listeners) listener();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get: () => current,
  };
}

/* -------------------------------------------------------------------------- */
/* Banner                                                                     */
/* -------------------------------------------------------------------------- */

export default function SubstrateBanner({
  chapters,
  hint,
  cta,
  dark,
  animated,
  paused,
  onVerdict,
}: {
  chapters: SubstrateChapter[];
  /// The interaction hint from the CMS.
  hint: string | null;
  /// The banner carries exactly one call to action — it sits under the story,
  /// so the visitor reads the point before being asked to act on it.
  cta: { label: string; href: string } | null;
  dark: boolean;
  /// False under reduced motion — the simulation runs at a calmer rate.
  animated: boolean;
  paused: boolean;
  onVerdict: (verdict: Verdict) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const safe = useRef<HTMLDivElement>(null);
  const engine = useRef<Substrate | null>(null);

  const store = useMemo(() => createSnapshotStore(), []);
  const snapshot = useSyncExternalStore(store.subscribe, store.get, store.get);

  const [chapter, setChapter] = useState(0);
  // Set while the visitor is pointing at the rail: their attention beats the
  // timer's.
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    const field = safe.current;
    if (!element || !field) return;

    const substrate = createSubstrate({
      canvas: element,
      field,
      dark,
      animated,
      onSnapshot: store.set,
      onVerdict,
    });

    // No WebGL2 despite the capability probe saying otherwise — hand the hero
    // back to the plain rendering rather than leaving a black box.
    if (!substrate) {
      onVerdict("abort");
      return;
    }

    engine.current = substrate;
    return () => {
      engine.current = null;
      substrate.dispose();
    };
    // `dark` is applied through `setDark` below rather than by rebuilding the
    // engine: a theme switch should re-ink the field, not restart the story.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, onVerdict, store]);

  useEffect(() => {
    engine.current?.setDark(dark);
  }, [dark]);

  useEffect(() => {
    engine.current?.setChapter(chapter);
  }, [chapter]);

  useEffect(() => {
    engine.current?.setPaused(paused);
  }, [paused]);

  // The story advances on its own, and stops while the visitor is driving it
  // or the hero is off screen.
  useEffect(() => {
    if (paused || held || chapters.length < 2) return;
    const timer = setInterval(
      () => setChapter((current) => (current + 1) % chapters.length),
      CHAPTER_MS,
    );
    return () => clearInterval(timer);
  }, [paused, held, chapters.length]);

  const select = useCallback((index: number) => setChapter(index), []);

  const active = chapters[chapter];
  const latest = snapshot.ledger[0];

  return (
    <>
      {/* Full-bleed field. The canvas paints the page's own background colour,
          so there is no edge where it meets the rest of the hero. */}
      <canvas
        ref={canvas}
        aria-hidden
        className="absolute inset-0 -z-10 block size-full"
      />

      {/* The world is fitted into this box, never the whole canvas — the
          readouts sit above it and the story below it, and the field takes the
          full width in between. */}
      <div
        ref={safe}
        aria-hidden
        className="pointer-events-none absolute inset-x-[4%] top-[13%] bottom-[30%] sm:bottom-[28%]"
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {snapshot.labels.map((label) => (
          <span
            key={label.id}
            style={{
              left: label.x,
              top: label.y,
              transform: LABEL_TRANSFORM[label.anchor],
              opacity: 0.4 + 0.6 * chapterEmphasis(label.group, chapter),
            }}
            className={cn(
              "absolute block whitespace-nowrap transition-opacity duration-500",
              LABEL_ALIGN[label.anchor],
            )}
          >
            <b className="block text-[0.7rem] font-semibold tracking-wide text-ink">
              {label.label}
            </b>
            <small className="hidden font-mono text-[0.6rem] text-ink-3 xl:block">
              {label.sub}
            </small>
          </span>
        ))}
      </div>

      {/* Readouts, along the top, clear of the field. */}
      {/* Clear of the fixed site header, which is 4.5rem tall. */}
      <div className="pointer-events-none absolute inset-x-0 top-[5.5rem] z-10 hidden lg:block">
        <div className="container-bw flex items-start justify-between gap-6">
          <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.14em] text-ink-3 uppercase">
            <span className="size-1.5 animate-shimmer rounded-full bg-[var(--sub-own)]" />
            Live simulation
          </p>
          <Meters meters={snapshot.meters} owned={snapshot.hub.owned} />
        </div>
      </div>

      {/* The story, along the bottom, with the one call to action under it. */}
      <div className="absolute inset-x-0 bottom-7 z-10">
        <div className="container-bw grid items-end gap-6 lg:grid-cols-[minmax(0,52%)_minmax(0,1fr)]">
          <div
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            onFocusCapture={() => setHeld(true)}
            onBlurCapture={() => setHeld(false)}
          >
            <ChapterRail
              chapters={chapters}
              chapter={chapter}
              onSelect={select}
              paused={held || paused}
            />
            {active ? <Chapter chapter={active} index={chapter} /> : null}
            {hint ? (
              <p className="mt-3 hidden text-[0.7rem] text-ink-3 xl:block">
                {hint}
              </p>
            ) : null}

            {cta ? (
              <ButtonLink href={cta.href} withArrow className="mt-6 px-7 py-3.5">
                {cta.label}
              </ButtonLink>
            ) : null}
          </div>

          {latest ? (
            <div className="hidden justify-self-end lg:block">
              <LatestDecision entry={latest} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Readouts                                                                   */
/* -------------------------------------------------------------------------- */

function Meters({
  meters,
  owned,
}: {
  meters: HudSnapshot["meters"];
  owned: number;
}) {
  const readouts = [
    { label: "Ingest", value: meters.ingest, unit: "rec/min" },
    { label: "In field", value: meters.live, unit: "records" },
    { label: "Cases open", value: meters.inflight, unit: "concurrent" },
    { label: "Yours", value: owned, unit: "decisions handed over", own: true },
  ];

  return (
    <dl className="flex items-end gap-7">
      {readouts.map((readout) => (
        <div key={readout.label} className="text-right">
          <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-ink-3 uppercase">
            {readout.label}
          </dt>
          <dd className="flex items-baseline justify-end gap-1.5">
            <span
              className={cn(
                "font-mono text-lg leading-tight tabular-nums",
                readout.own ? "text-[var(--sub-own)]" : "text-ink",
              )}
            >
              {fmt(readout.value)}
            </span>
            <span className="text-[0.6rem] text-ink-3">{readout.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/// The last thing the substrate decided, as evidence that the picture is a
/// simulation rather than a loop.
function LatestDecision({ entry }: { entry: HudSnapshot["ledger"][number] }) {
  return (
    <article
      key={entry.ref}
      className="max-w-xs border-l-2 border-[var(--sub-own)] bg-surface/70 py-2.5 pr-3 pl-3 backdrop-blur-sm [animation:substrate-chapter-in_0.5s_ease-out]"
    >
      <p className="font-mono text-[0.6rem] tracking-[0.12em] text-ink-3 uppercase">
        Just decided · {entry.ref}
      </p>
      <b className="mt-1 block text-xs leading-snug font-medium text-ink">
        {entry.decision}
      </b>
      <p className="mt-1 text-[0.7rem] leading-snug text-ink-2">
        {entry.impact}
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* The story                                                                  */
/* -------------------------------------------------------------------------- */

function ChapterRail({
  chapters,
  chapter,
  onSelect,
  paused,
}: {
  chapters: SubstrateChapter[];
  chapter: number;
  onSelect: (index: number) => void;
  /// Freezes the fill, so a held chapter visibly stops advancing.
  paused: boolean;
}) {
  return (
    <ol className="mb-4 flex items-center gap-1.5">
      {chapters.map((entry, index) => (
        <li key={entry.id} className="flex-1">
          <button
            type="button"
            onClick={() => onSelect(index)}
            aria-current={index === chapter ? "step" : undefined}
            aria-label={entry.stage ?? entry.title}
            className={cn(
              "block h-0.5 w-full overflow-hidden transition-colors duration-500",
              index === chapter ? "bg-line-strong" : "bg-line hover:bg-line-strong",
            )}
          >
            {index === chapter ? (
              <span
                key={`${entry.id}-${paused}`}
                className={cn(
                  "block h-full w-full origin-left bg-accent",
                  paused
                    ? "scale-x-100"
                    : "[animation:substrate-chapter-fill_7s_linear_forwards]",
                )}
              />
            ) : null}
          </button>
        </li>
      ))}
    </ol>
  );
}

function Chapter({
  chapter,
  index,
}: {
  chapter: SubstrateChapter;
  index: number;
}) {
  return (
    // Keyed so a chapter change replays the fade rather than mutating text in
    // place, which reads as a glitch at this size.
    <div key={chapter.id} className="[animation:substrate-chapter-in_0.5s_ease-out]">
      <p className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase">
        {String(index + 1).padStart(2, "0")} · {chapter.stage ?? "Substrate"}
      </p>

      {chapter.highlight ? (
        // The one line the whole picture is arguing towards. It is allowed to
        // shout; every other chapter is not.
        <p className="substrate-flare mt-2 inline-block px-2.5 py-1">
          <span className="substrate-flare-text text-[1.05rem] leading-snug font-semibold">
            {chapter.title}
          </span>
        </p>
      ) : (
        <h2 className="mt-2 max-w-md text-[1.05rem] leading-snug text-balance text-ink">
          {chapter.title}
        </h2>
      )}

      {chapter.body ? (
        <p className="mt-2 max-w-md text-xs leading-relaxed text-pretty text-ink-2">
          {chapter.body}
        </p>
      ) : null}
    </div>
  );
}
