"use client";

import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Icon } from "@/components/icon";
import type { SubstrateChapter } from "@/components/sections/substrate-chapters";
import { ButtonLink, cn } from "@/components/ui/primitives";
import { applyDemoConfig } from "@/components/webgl/substrate/configure";
/* The nodes, for their captions only — the geometry is this module's own. A
   configuration rewrites these in place: the region's governance line, the
   tenancy the model is deployed into, and, on the last node, the visitor's own
   company name. That last one is the single highest-value thing a configuration
   does, so the cards have to read it rather than hardcode over it. */
import {
  HUB as HUB_NODE,
  OPS as OPS_NODES,
  OWNERSHIP as OWNERSHIP_NODE,
  SOURCES,
} from "@/components/webgl/substrate/topology";
import type { DemoConfig } from "@/lib/demo-config";

import {
  BOX,
  CASE_BAND,
  DECISION,
  ESTATE_X,
  HUB,
  INK_VAR,
  LANES,
  LEGEND,
  OPS_BAND,
  OPS_STEPS,
  OWNERSHIP,
  QUARANTINE,
  STAGE_ANCHOR,
  focusFor,
  litFor,
  pathOf,
  place,
  segmentsFor,
  sourceRect,
  type Group,
  type Ink,
  type Rect,
  type Segment,
  type Stage,
} from "./geometry";
import {
  LANE_NEED,
  MARKS,
  createCaseLine,
  projectMark,
  type CaseLine as Engine,
  type Mark,
  type Snapshot,
} from "./simulation";

/**
 * The Case Line: the hero banner drawn as a process a person can read.
 *
 * The rule this component is built around is that a chapter change must be
 * visible. The copy claims something; the picture shows that exact thing
 * happening to one named case, which moves one station along the rail as the
 * story advances. Everything else on the rail keeps running behind it, quietly,
 * so the system still reads as continuous.
 *
 * Two layers, one coordinate space (`geometry.ts`): an SVG for the connective
 * tissue and the records in flight, and DOM cards laid over it for everything
 * with words on it. The cards being DOM is not an implementation detail — it is
 * why the labels are real text at any resolution, why they can be read by a
 * screen reader, and why this works on a phone, which the previous rendering
 * never did.
 */

/// How long each chapter holds the stage before the story moves on. Longer than
/// the old banner's seven seconds: there is now something to watch happen.
const CHAPTER_MS = 8200;

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/* Proportions per shape: a signal, a record, a document. Applied as a scale on
   a single dart geometry, so a respawned mark changes shape without touching
   the DOM node's attributes. */
const SHAPE_SCALE: [number, number][] = [
  [0.5, 1.5],
  [1, 1],
  [0.72, 1.9],
];

/* -------------------------------------------------------------------------- */
/* Snapshot store                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The simulation publishes into this; React reads out of it. A store rather
 * than `useState` because the first publish happens synchronously while the
 * engine is being constructed inside an effect — which `react-hooks/
 * set-state-in-effect` rejects, and rightly.
 */
function createSnapshotStore(initial: Snapshot | null) {
  let current = initial;
  const listeners = new Set<() => void>();

  return {
    set(next: Snapshot) {
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

export default function CaseLine({
  chapters,
  hint,
  cta,
  config,
  animated,
  paused,
  onOpenDemo,
}: {
  chapters: SubstrateChapter[];
  /// The interaction hint from the CMS.
  hint: string | null;
  /// The banner carries exactly one call to action, under the story.
  cta: { label: string; href: string } | null;
  config: DemoConfig | null;
  /// False under reduced motion — nothing travels, the numbers still move.
  animated: boolean;
  paused: boolean;
  onOpenDemo: () => void;
}) {
  const engine = useRef<Engine | null>(null);
  const marksRef = useRef<SVGGElement>(null);
  /// Last ink written per mark, so the hot loop only touches `fill` when the
  /// record actually changed state.
  const inkRef = useRef<Ink[]>([]);

  const store = useMemo(() => createSnapshotStore(null), []);
  const snapshot = useSyncExternalStore(store.subscribe, store.get, store.get);

  const [chapter, setChapter] = useState(0);
  // Set while the visitor is pointing at the rail: their attention beats the
  // timer's.
  const [held, setHeld] = useState(false);

  // The sources the visitor connected. Read once per configuration — the
  // simulation and the drawing must agree on how many there are.
  const sources = useMemo(() => {
    applyDemoConfig(config);
    return SOURCES.map((s) => ({ id: s.id, label: s.label, sub: s.sub }));
  }, [config]);

  const segments = useMemo(() => segmentsFor(sources.length), [sources.length]);

  const paint = useCallback(
    (marks: Mark[], segs: Segment[]) => {
      // Reduced motion stops the drawing, not the simulation: the counters, the
      // case and the ledger all keep moving, because they are information rather
      // than movement. Nothing travels across the screen.
      if (!animated) return;

      const group = marksRef.current;
      if (!group) return;

      const nodes = group.children;
      const inks = inkRef.current;

      for (let i = 0; i < marks.length && i < nodes.length; i++) {
        const node = nodes[i] as SVGRectElement;
        const mark = marks[i];
        const { x, y, angle, ink } = projectMark(mark, segs);
        const [sx, sy] = SHAPE_SCALE[mark.shape];

        node.setAttribute(
          "transform",
          `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(0)}) scale(${sx} ${sy})`,
        );
        if (inks[i] !== ink) {
          inks[i] = ink;
          node.setAttribute("fill", INK_VAR[ink]);
        }
      }
    },
    [animated],
  );

  useEffect(() => {
    const line = createCaseLine({ onFrame: paint, onSnapshot: store.set });
    engine.current = line;
    return () => {
      engine.current = null;
      line.dispose();
    };
  }, [paint, store, sources.length]);

  useEffect(() => {
    engine.current?.setChapter(chapter);
  }, [chapter]);

  useEffect(() => {
    engine.current?.setPaused(paused);
  }, [paused]);

  // The story advances on its own, and stops while the visitor is driving it or
  // the hero is off screen.
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
  const stage = focusFor(chapter).stage;
  const latest = snapshot?.ledger[0];

  return (
    <div className="relative flex h-full flex-col">
      {/* Status and readouts, clear of the fixed 4.5rem site header. */}
      <div className="relative z-10 pt-[5.25rem]">
        <div className="container-bw flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <p className="flex items-center gap-2 font-mono text-[0.65rem] font-medium tracking-[0.14em] text-ink-2 uppercase">
              <span className="size-1.5 animate-shimmer rounded-full bg-[var(--sub-own)]" />
              Live simulation
            </p>

            <button
              type="button"
              onClick={onOpenDemo}
              className="flex items-center gap-2 rounded-md border border-line bg-surface/70 px-3 py-1.5 text-xs font-medium text-ink-2 backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-ink"
            >
              Open the full console
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-3.5">
                <path d="M14 3.75a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V5.56l-6.72 6.72a.75.75 0 1 1-1.06-1.06L18.44 4.5h-3.69a.75.75 0 0 1-.75-.75ZM5 6.5a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-5a.75.75 0 0 1 1.5 0v5A2 2 0 0 1 17 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5a.75.75 0 0 1 0 1.5H5Z" />
              </svg>
            </button>
          </div>

          {snapshot ? <Meters snapshot={snapshot} /> : null}
        </div>
      </div>

      {/* The rail. Horizontal on a desk, vertical on a phone — the same
          stations, the same case, the same story, drawn to fit.

          The desk layout is a size container so the drawing can size itself off
          the height it has been given (`226cqh` is its own aspect ratio in
          container-height units) rather than being handed a width and having
          flex quietly squash the height out from under it. Get this wrong and
          every card clips its own text, which is how the first pass looked. */}
      <div className="relative z-0 min-h-0 flex-1 lg:[container-type:size]">
        <div className="container-bw hidden h-full items-center justify-center lg:flex">
          <Rail
            sources={sources}
            segments={segments}
            marksRef={marksRef}
            snapshot={snapshot}
            chapter={chapter}
            stage={stage}
            animated={animated}
          />
        </div>
        <div className="container-bw py-4 lg:hidden">
          <Ladder sources={sources} snapshot={snapshot} chapter={chapter} stage={stage} />
        </div>
      </div>

      {/* The story, with the legend above it and the one call to action below. */}
      <div className="relative z-10 pb-7">
        <div className="container-bw">
          <Legend />

          <div className="mt-4 grid items-end gap-6 lg:grid-cols-[minmax(0,52%)_minmax(0,1fr)]">
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
                <p className="mt-3 hidden text-[0.7rem] text-ink-3 xl:block">{hint}</p>
              ) : null}

              {cta ? (
                <ButtonLink
                  href={cta.href}
                  withArrow
                  className="mt-6 px-5 py-2.5 sm:px-7 sm:py-3.5"
                >
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
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The rail — desk                                                            */
/* -------------------------------------------------------------------------- */

export type Source = { id: string; label: string; sub: string };

/**
 * The drawing itself, exported because the console shows the same one.
 *
 * The hero and the console differ in what surrounds the rail — a story and one
 * call to action there, an operator's instruments here — never in the rail.
 * Two pictures of one product would be two products.
 */
export function Rail({
  sources,
  segments,
  marksRef,
  snapshot,
  chapter,
  stage,
  animated,
}: {
  sources: Source[];
  segments: Segment[];
  marksRef: React.RefObject<SVGGElement | null>;
  snapshot: Snapshot | null;
  chapter: number;
  stage: Stage;
  /// False under reduced motion: the marks are hidden, everything else runs.
  animated: boolean;
}) {
  const anchor = STAGE_ANCHOR[stage];
  const focus = snapshot?.focus;

  /* The marker is a card with words in it, so its centre cannot follow the
     first and last stations all the way to the edges without hanging off them.
     It is clamped, and its leader line runs to the true anchor instead. */
  const markerX = Math.min(Math.max(anchor.x, 210), BOX.w - 210);

  return (
    // Aspect-locked, which is what keeps the SVG's viewBox and the DOM cards'
    // percentages in register at every width. Container queries then size the
    // type off the box rather than the viewport, so the composition holds
    // instead of the labels outgrowing their cards.
    <div
      className="@container relative"
      style={
        {
          width: `min(80rem, 100%, ${((BOX.w / BOX.h) * 100).toFixed(1)}cqh)`,
          aspectRatio: `${BOX.w} / ${BOX.h}`,
          "--t-md": "clamp(11px, 1.04cqw, 15px)",
          "--t-sm": "clamp(9px, 0.78cqw, 11.5px)",
          "--t-xs": "clamp(8px, 0.66cqw, 10px)",
        } as React.CSSProperties
      }
    >
      <svg
        viewBox={`0 0 ${BOX.w} ${BOX.h}`}
        className="absolute inset-0 size-full"
        aria-hidden
      >
        {/* The routes. Drawn once, faintly — the lattice is permanent and it is
            the traffic that varies, never the topology. */}
        <g fill="none" strokeLinecap="round">
          {segments.map((seg) => (
            <path
              key={seg.id}
              d={pathOf(seg)}
              stroke={INK_VAR[seg.to]}
              strokeWidth={seg.id === "hand" ? 2 : 1.1}
              className="transition-opacity duration-700"
              opacity={routeLit(seg, chapter) ? 0.42 : 0.12}
            />
          ))}
        </g>

        {/* The line the decision crosses. Everything to its right is the
            customer's, and the whole picture is an argument for this edge. */}
        <g className="transition-opacity duration-700" opacity={litFor("ownership", chapter) ? 1 : 0.45}>
          <line
            x1={ESTATE_X}
            y1={CASE_BAND.y + CASE_BAND.h + 24}
            x2={ESTATE_X}
            y2={OPS_BAND.y - 12}
            stroke={INK_VAR.own}
            strokeWidth={1.4}
            strokeDasharray="5 6"
            opacity={0.7}
          />
          <text
            x={ESTATE_X + 10}
            y={OPS_BAND.y - 16}
            fill={INK_VAR.own}
            className="font-mono uppercase"
            style={{ fontSize: "var(--t-xs)", letterSpacing: "0.14em" }}
          >
            Your estate
          </text>
        </g>

        {/* The leader from the case marker down to whichever station it is
            pointing at. */}
        <motion.line
          // Both ends need a starting value: motion cannot animate an endpoint
          // it has never been told the current value of, and the console says so
          // rather than failing quietly.
          initial={{ x1: markerX, x2: anchor.x, y2: anchor.drop - 7 }}
          animate={{ x1: markerX, x2: anchor.x, y2: anchor.drop - 7 }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          y1={CASE_BAND.y + CASE_BAND.h}
          stroke={INK_VAR.context}
          strokeWidth={1.2}
          strokeDasharray="3 4"
          opacity={0.55}
        />

        {/* Records in flight. Allocated once; the frame loop writes transforms
            straight onto these nodes and never through React. Hidden rather than
            halted under reduced motion — see `paint`. */}
        <g ref={marksRef} className={cn(!animated && "hidden")}>
          {Array.from({ length: MARKS }, (_, i) => (
            <rect
              key={i}
              x={-3.6}
              y={-1.15}
              width={7.2}
              height={2.3}
              rx={1.15}
              fill={INK_VAR.raw}
              opacity={0.85}
            />
          ))}
        </g>
      </svg>

      {/* The case marker, riding its own lane along the top. */}
      {focus ? <CaseMarker focus={focus} anchor={markerX} /> : null}

      {/* Ingest. While the visitor points at a case in the console, the systems
          that actually fed it stay up and the rest recede — provenance shown
          rather than asserted. */}
      {sources.map((source, i) => {
        const traced = snapshot?.trace
          ? snapshot.trace.sourceIds.includes(source.id)
          : null;
        return (
          <SourceTile
            key={source.id}
            source={source}
            rect={sourceRect(i, sources.length)}
            lit={traced ?? litFor("source", chapter)}
            traced={traced}
          />
        );
      })}

      {/* Resolution, and what fails it. */}
      <Card rect={HUB} ink="context" lit={litFor("hub", chapter)}>
        <CardTitle>{HUB_NODE.label}</CardTitle>
        <CardSub>{HUB_NODE.sub}</CardSub>
        {stage === "resolve" && focus ? (
          <Collapse records={focus.records} merged={focus.merged} />
        ) : (
          <Readout items={[["golden records", fmt(snapshot?.hub.merged ?? 0)]]} />
        )}
      </Card>

      <Card rect={QUARANTINE} ink="reject" lit={litFor("quarantine", chapter)} tight>
        <CardTitle>Quarantine</CardTitle>
        <Readout
          items={[
            ["held", fmt(snapshot?.hub.quarantined ?? 0)],
            ["released", fmt(snapshot?.hub.remediated ?? 0)],
          ]}
        />
      </Card>

      {/* Three engines, three lanes, filling at their own rates. */}
      {LANES.map((lane, k) => (
        <Card key={lane.id} rect={lane.rect} ink={lane.ink} lit={litFor("engine", chapter)}>
          <CardTitle>{lane.label}</CardTitle>
          <CardSub>{lane.sub}</CardSub>
          <Quorum
            ink={lane.ink}
            have={focus?.evidence[k] ?? 0}
            need={LANE_NEED[k]}
            live={stage === "lanes"}
          />
        </Card>
      ))}

      {/* The decision, and the handover. */}
      <Card rect={DECISION} ink="decided" lit={litFor("decision", chapter)}>
        <CardTitle>Decision Layer</CardTitle>
        <CardSub>grounded · verified · actionable</CardSub>
        <Readout
          items={[
            ["confidence", `${Math.round((focus?.confidence ?? 0) * 100)}%`],
            ["records of lineage", `${focus?.records ?? 0}`],
          ]}
        />
      </Card>

      <Card rect={OWNERSHIP} ink="own" lit={litFor("ownership", chapter)}>
        <CardTitle>{OWNERSHIP_NODE.label}</CardTitle>
        <CardSub>{OWNERSHIP_NODE.sub}</CardSub>
        <Readout items={[["handed over", fmt(snapshot?.meters.owned ?? 0)]]} own />
      </Card>

      {/* BasinWright's own plane, bracketed underneath rather than threaded
          through — it is what we do so the data path keeps working, not a step
          in it. */}
      <OpsBand lit={litFor("ops", chapter)} />
    </div>
  );
}

/// Whether a route belongs to the part of the system the chapter is about.
function routeLit(seg: Segment, chapter: number) {
  const groups: Group[] =
    seg.id.startsWith("in")
      ? ["source", "hub"]
      : seg.id.startsWith("lane")
        ? ["hub", "engine"]
        : seg.id.startsWith("out")
          ? ["engine", "decision"]
          : seg.id === "hand"
            ? ["decision", "ownership"]
            : ["quarantine"];
  return groups.some((g) => litFor(g, chapter));
}

/* -------------------------------------------------------------------------- */
/* Cards                                                                      */
/* -------------------------------------------------------------------------- */

function Card({
  rect,
  ink,
  lit,
  tight,
  children,
}: {
  rect: Rect;
  ink: Ink;
  lit: boolean;
  /// Quarantine is a tray, not a station — less padding, no room for a sub.
  tight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        ...place(rect),
        borderColor: lit ? INK_VAR[ink] : undefined,
        paddingInline: tight ? "calc(var(--t-md) * 0.7)" : "calc(var(--t-md) * 0.85)",
      }}
      className={cn(
        "absolute flex flex-col justify-center overflow-hidden rounded-lg border bg-surface/85 backdrop-blur-[2px]",
        "transition-[opacity,border-color,box-shadow] duration-700",
        // Horizontal padding only: the cards are a fixed height and their
        // content is centred in it, so vertical padding buys nothing and costs
        // the last line of a readout.
        //
        // In `em` off the card's own type scale, never in per cent. A
        // percentage padding resolves against the *containing block* — the whole
        // 1300px drawing — not against the card, which silently left every card
        // with a third of the content width it looks like it has.
        lit ? "border-line-strong opacity-100 shadow-[0_1px_10px_-4px_rgb(0_0_0/0.25)]" : "border-line opacity-[0.62]",
      )}
    >
      {/* The state bar. Colour is meaning here, and the legend under the rail
          says which meaning. */}
      <span
        aria-hidden
        style={{ background: INK_VAR[ink] }}
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] transition-opacity duration-700",
          lit ? "opacity-100" : "opacity-50",
        )}
      />
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <b
      className="block leading-tight font-semibold text-ink"
      style={{ fontSize: "var(--t-md)" }}
    >
      {children}
    </b>
  );
}

function CardSub({ children }: { children: React.ReactNode }) {
  return (
    <small
      className="line-clamp-2 block font-mono leading-tight text-ink-3"
      style={{ fontSize: "var(--t-sm)" }}
    >
      {children}
    </small>
  );
}

/// A pair of measured values. Never a label without a number beside it — a
/// station that only names itself is the thing the old rendering did.
function Readout({
  items,
  own,
}: {
  items: [string, string][];
  own?: boolean;
}) {
  return (
    <dl className="mt-[0.3em] flex flex-wrap gap-x-[1em] gap-y-[0.1em]">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-baseline gap-[0.4em]">
          <dd
            className="font-mono tabular-nums"
            style={{
              fontSize: "var(--t-md)",
              color: own ? INK_VAR.own : "var(--bw-ink)",
            }}
          >
            {value}
          </dd>
          <dt
            className="font-mono whitespace-nowrap tracking-[0.1em] text-ink-3 uppercase"
            style={{ fontSize: "var(--t-xs)" }}
          >
            {label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function SourceTile({
  source,
  rect,
  lit,
  traced,
}: {
  source: Source;
  rect: Rect;
  lit: boolean;
  /// True when this system fed the traced case, false when another did, null
  /// when nothing is being traced.
  traced?: boolean | null;
}) {
  return (
    <div
      style={{
        ...place(rect),
        paddingInline: "calc(var(--t-md) * 0.7)",
        borderColor: traced ? INK_VAR.context : undefined,
      }}
      className={cn(
        "absolute flex flex-col justify-center overflow-hidden rounded-md border border-line bg-surface/80 backdrop-blur-[2px]",
        "transition-[opacity,border-color] duration-300",
        lit ? "opacity-100" : "opacity-[0.55]",
      )}
    >
      <span
        aria-hidden
        style={{ background: traced ? INK_VAR.context : INK_VAR.raw }}
        className="absolute inset-y-0 left-0 w-[2.5px] opacity-80 transition-colors duration-300"
      />
      <b
        className="block truncate leading-tight font-semibold text-ink"
        style={{ fontSize: "var(--t-sm)" }}
      >
        {source.label}
      </b>
      <small
        className="block truncate font-mono leading-tight text-ink-3"
        style={{ fontSize: "var(--t-xs)" }}
      >
        {source.sub}
      </small>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Station detail                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Duplicates collapsing into one governed record.
 *
 * The copy for this chapter says resolution "collapses duplicates into one
 * governed record". This is that sentence, drawn: `records` grey pips, of which
 * `merged` have already folded into the single blue one at the end.
 */
function Collapse({ records, merged }: { records: number; merged: number }) {
  const pips = Math.min(12, Math.max(records, 1));
  const done = Math.min(pips, merged);

  return (
    <div className="mt-[0.35em] flex items-center gap-[0.5em]">
      <div className="flex flex-1 flex-wrap gap-[0.28em]">
        {Array.from({ length: pips }, (_, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              background: i < done ? "transparent" : INK_VAR.raw,
              borderColor: INK_VAR.raw,
              width: "0.5em",
              height: "0.5em",
              fontSize: "var(--t-md)",
            }}
            className="block rounded-[1px] border transition-colors duration-500"
          />
        ))}
      </div>
      <span
        aria-hidden
        style={{ color: INK_VAR.context, fontSize: "var(--t-md)" }}
        className="font-mono"
      >
        →
      </span>
      <span
        aria-hidden
        style={{ background: INK_VAR.context, width: "0.7em", height: "0.7em", fontSize: "var(--t-md)" }}
        className="block rounded-[2px]"
      />
    </div>
  );
}

/**
 * A lane's evidence quorum.
 *
 * Three of these fill at three different rates while the case stands at the
 * lanes, which is the only honest way to draw "three concurrent lanes, not
 * three sequential steps".
 */
function Quorum({
  ink,
  have,
  need,
  live,
}: {
  ink: Ink;
  have: number;
  need: number;
  live: boolean;
}) {
  return (
    <div className="mt-[0.35em] flex items-center gap-[0.6em]">
      <div className="flex flex-1 gap-[0.25em]">
        {Array.from({ length: need }, (_, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              background: i < have ? INK_VAR[ink] : "var(--bw-line)",
              height: "0.34em",
              fontSize: "var(--t-md)",
            }}
            className="block flex-1 rounded-full transition-colors duration-300"
          />
        ))}
      </div>
      <span
        className="font-mono tabular-nums text-ink-3"
        style={{ fontSize: "var(--t-xs)" }}
      >
        {have}/{need}
        {live && have >= need ? " ✓" : ""}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The case marker                                                            */
/* -------------------------------------------------------------------------- */

/// What the case is doing, per station, in the fewest words that are still true.
const STAGE_STATE: Record<Stage, string> = {
  intake: "Arriving · unresolved",
  resolve: "Resolving · collapsing duplicates",
  lanes: "Gathering evidence · 3 lanes",
  decide: "Deliberating · council running",
  own: "Handed over · yours to keep",
};

function CaseMarker({
  focus,
  anchor,
}: {
  focus: NonNullable<Snapshot["focus"]>;
  anchor: number;
}) {
  return (
    /* Two elements, not one: motion drives `left` on a zero-width positioner,
       and the card centres itself on that point with its own transform. Putting
       both on one node loses the centring, because motion owns `transform`. */
    <motion.div
      initial={{ left: `${(anchor / BOX.w) * 100}%` }}
      animate={{ left: `${(anchor / BOX.w) * 100}%` }}
      transition={{ type: "spring", stiffness: 90, damping: 20 }}
      style={{
        top: `${(CASE_BAND.y / BOX.h) * 100}%`,
        height: `${(CASE_BAND.h / BOX.h) * 100}%`,
      }}
      className="absolute w-0"
    >
      {/* `w-max`, because the positioner above is zero-width: a block child of a
          zero-width containing block resolves `width: auto` to zero and the card
          collapses to a sliver with its text spilling out of it. */}
      <div className="flex h-full w-max -translate-x-1/2 flex-col justify-center rounded-lg border border-accent/60 bg-surface px-[1.1em] py-[0.4em] shadow-[0_2px_14px_-6px_rgb(0_0_0/0.35)]">
        <span
          className="flex items-baseline gap-[0.7em] whitespace-nowrap font-mono"
          style={{ fontSize: "var(--t-xs)" }}
        >
          <span className="tracking-[0.1em] text-accent uppercase">
            Tracking · {focus.ref}
          </span>
          <span className="tabular-nums text-ink-3">
            {Math.round(focus.confidence * 100)}%
          </span>
        </span>
        <b
          className="block whitespace-nowrap leading-tight font-semibold text-ink"
          style={{ fontSize: "var(--t-md)" }}
        >
          {focus.tmpl.title}
        </b>
        <span
          className="block whitespace-nowrap font-mono leading-tight text-ink-2"
          style={{ fontSize: "var(--t-sm)" }}
        >
          {STAGE_STATE[focus.stage]}
        </span>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Control plane                                                              */
/* -------------------------------------------------------------------------- */

function OpsBand({ lit }: { lit: boolean }) {
  return (
    <div
      style={{ ...place(OPS_BAND), paddingInline: "calc(var(--t-md) * 1.1)", gap: "calc(var(--t-md) * 1.6)" }}
      className={cn(
        "absolute flex items-center rounded-lg border border-dashed transition-opacity duration-700",
        lit ? "border-line-strong opacity-100" : "border-line opacity-[0.55]",
      )}
    >
      <span
        className="shrink-0 font-mono tracking-[0.12em] uppercase"
        style={{ fontSize: "var(--t-xs)", color: INK_VAR.ops }}
      >
        BasinWright runs it
      </span>
      <span className="h-[55%] w-px shrink-0 bg-line" aria-hidden />
      {OPS_STEPS.map((step, i) => (
        <span key={step.id} className="flex min-w-0 items-baseline gap-[0.5em]">
          <b
            className="whitespace-nowrap font-semibold text-ink"
            style={{ fontSize: "var(--t-sm)" }}
          >
            {step.label}
          </b>
          <small
            className="hidden truncate font-mono text-ink-3 @[52rem]:block"
            style={{ fontSize: "var(--t-xs)" }}
          >
            {OPS_NODES[i]?.sub ?? step.sub}
          </small>
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The rail — phone                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The same stations, stacked.
 *
 * The previous rendering drew nothing at all below 1024px, so a client opening
 * the link on a phone reviewed a page with no graphic on it. This is the same
 * argument in the same order, and it is the reason the diagram had to stop
 * being a shader.
 *
 * Exported for the console, which stacks its panels on a narrow screen and so
 * has no room for the rail either.
 */
export function Ladder({
  sources,
  snapshot,
  chapter,
  stage,
}: {
  sources: Source[];
  snapshot: Snapshot | null;
  chapter: number;
  stage: Stage;
}) {
  const focus = snapshot?.focus;

  const rungs: {
    stage: Stage;
    group: Group;
    ink: Ink;
    label: string;
    sub: string;
    detail: React.ReactNode;
  }[] = [
    {
      stage: "intake",
      group: "source",
      ink: "raw",
      label: "Your systems",
      sub: sources.map((s) => s.label).join(" · "),
      detail: <Pips n={focus?.records ?? 0} ink="raw" />,
    },
    {
      stage: "resolve",
      group: "hub",
      ink: "context",
      label: HUB_NODE.label,
      sub: HUB_NODE.sub,
      detail: (
        <span className="font-mono text-[0.7rem] text-ink-3">
          {fmt(snapshot?.hub.merged ?? 0)} merged ·{" "}
          <span style={{ color: INK_VAR.reject }}>
            {fmt(snapshot?.hub.quarantined ?? 0)} held
          </span>
        </span>
      ),
    },
    {
      stage: "lanes",
      group: "engine",
      ink: "verify",
      label: "Three engines, at once",
      sub: LANES.map((l) => l.verb.toLowerCase()).join(" · "),
      detail: (
        <div className="flex flex-col gap-1.5">
          {LANES.map((lane, k) => (
            <div key={lane.id} className="flex items-center gap-2">
              <span
                className="w-[6.5rem] shrink-0 truncate font-mono text-[0.65rem]"
                style={{ color: INK_VAR[lane.ink] }}
              >
                {lane.verb}
              </span>
              <div className="flex flex-1 gap-1">
                {Array.from({ length: LANE_NEED[k] }, (_, i) => (
                  <span
                    key={i}
                    className="block h-1 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      background:
                        i < (focus?.evidence[k] ?? 0)
                          ? INK_VAR[lane.ink]
                          : "var(--bw-line)",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      stage: "decide",
      group: "decision",
      ink: "decided",
      label: "Decision Layer",
      sub: "grounded · verified · actionable",
      detail: (
        <span className="font-mono text-[0.7rem] text-ink-3">
          {Math.round((focus?.confidence ?? 0) * 100)}% confidence ·{" "}
          {focus?.records ?? 0} records of lineage
        </span>
      ),
    },
    {
      stage: "own",
      group: "ownership",
      ink: "own",
      label: OWNERSHIP_NODE.label,
      sub: OWNERSHIP_NODE.sub,
      detail: (
        <span className="font-mono text-[0.7rem]" style={{ color: INK_VAR.own }}>
          {fmt(snapshot?.meters.owned ?? 0)} decisions handed over
        </span>
      ),
    },
  ];

  return (
    <div className="w-full lg:hidden">
      {focus ? (
        <div className="mb-4 rounded-lg border border-accent/50 bg-surface px-3 py-2">
          <p className="font-mono text-[0.6rem] tracking-[0.12em] text-accent uppercase">
            Tracking · {focus.ref} · {Math.round(focus.confidence * 100)}% confidence
          </p>
          <b className="mt-0.5 block text-sm leading-snug font-semibold text-ink">
            {focus.tmpl.title}
          </b>
          <span className="font-mono text-[0.7rem] text-ink-2">
            {STAGE_STATE[focus.stage]}
          </span>
        </div>
      ) : null}

      <ol className="relative flex flex-col gap-2.5 border-l border-line pl-5">
        {rungs.map((rung) => {
          const here = rung.stage === stage;
          const lit = litFor(rung.group, chapter);
          return (
            <li
              key={rung.stage}
              className={cn(
                "relative rounded-lg border px-3 py-2 transition-all duration-500",
                here
                  ? "border-line-strong bg-surface opacity-100"
                  : lit
                    ? "border-line bg-surface/70 opacity-90"
                    : "border-line bg-surface/50 opacity-60",
              )}
            >
              {/* The rung's node on the spine. */}
              <span
                aria-hidden
                style={{ background: INK_VAR[rung.ink] }}
                className={cn(
                  "absolute top-1/2 -left-[1.55rem] block size-2 -translate-y-1/2 rounded-full transition-transform duration-500",
                  here && "scale-150",
                )}
              />
              <b className="block text-[0.82rem] leading-tight font-semibold text-ink">
                {rung.label}
              </b>
              <small className="block truncate font-mono text-[0.65rem] text-ink-3">
                {rung.sub}
              </small>
              <div className="mt-1.5">{rung.detail}</div>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-line px-3 py-2 font-mono text-[0.65rem] text-ink-3">
        <span style={{ color: INK_VAR.ops }}>BasinWright runs it</span>
        <span className="text-ink-3">
          {OPS_STEPS.map((s) => s.label).join(" · ")}
        </span>
      </p>
    </div>
  );
}

function Pips({ n, ink }: { n: number; ink: Ink }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: Math.min(14, Math.max(n, 1)) }, (_, i) => (
        <span
          key={i}
          className="block size-1.5 rounded-[1px]"
          style={{ background: INK_VAR[ink], opacity: 0.75 }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Readouts                                                                   */
/* -------------------------------------------------------------------------- */

function Meters({ snapshot }: { snapshot: Snapshot }) {
  const readouts = [
    { label: "Ingest", value: snapshot.meters.ingest, unit: "rec/min" },
    { label: "In field", value: snapshot.meters.live, unit: "records" },
    { label: "Cases open", value: snapshot.meters.inflight, unit: "concurrent" },
    { label: "Yours", value: snapshot.meters.owned, unit: "decisions handed over", own: true },
  ];

  return (
    <dl className="flex items-end gap-5 sm:gap-7">
      {readouts.map((readout) => (
        <div key={readout.label} className="text-right">
          <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-ink-3 uppercase">
            {readout.label}
          </dt>
          <dd className="flex items-baseline justify-end gap-1.5">
            <span
              className={cn(
                "font-mono text-base leading-tight tabular-nums sm:text-lg",
                readout.own ? "text-[var(--sub-own)]" : "text-ink",
              )}
            >
              {fmt(readout.value)}
            </span>
            <span className="hidden text-[0.6rem] text-ink-3 sm:inline">
              {readout.unit}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/// Colour is the state of a record. Left unexplained it is decoration — which
/// is precisely how the previous rendering was read.
export function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3">
      <li className="font-mono text-[0.6rem] tracking-[0.12em] text-ink-3 uppercase">
        Colour is the record&rsquo;s state
      </li>
      {LEGEND.map((item) => (
        <li key={item.ink} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="block size-2 rounded-[1px]"
            style={{ background: INK_VAR[item.ink] }}
          />
          <span className="text-[0.7rem] text-ink-2">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

/// The last thing the substrate decided, as evidence that the picture is a
/// simulation rather than a loop.
function LatestDecision({ entry }: { entry: Snapshot["ledger"][number] }) {
  return (
    <article
      key={entry.ref}
      className="max-w-xs border-l-2 border-[var(--sub-own)] bg-surface/70 py-2.5 pr-3 pl-3 backdrop-blur-sm [animation:substrate-chapter-in_0.5s_ease-out]"
    >
      <p className="font-mono text-[0.6rem] tracking-[0.12em] text-ink-3 uppercase">
        Just decided · {entry.ref} · {Math.round(entry.confidence * 100)}%
      </p>
      <b className="mt-1 block text-xs leading-snug font-medium text-ink">
        {entry.decision}
      </b>
      <p className="mt-1 text-[0.7rem] leading-snug text-ink-2">{entry.impact}</p>
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
                    : "[animation:caseline-chapter-fill_8.2s_linear_forwards]",
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
    <div key={chapter.id} className="[animation:substrate-chapter-in_0.5s_ease-out]">
      <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase">
        {chapter.icon ? <Icon name={chapter.icon} className="size-3.5" /> : null}
        {String(index + 1).padStart(2, "0")} · {chapter.stage ?? "Substrate"}
      </p>

      {chapter.highlight ? (
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
