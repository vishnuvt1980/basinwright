"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { SubstrateChapter } from "@/components/sections/substrate-chapters";
import { cn } from "@/components/ui/primitives";
import {
  EMPTY_SNAPSHOT,
  createSubstrate,
  type HudCase,
  type HudSnapshot,
  type Substrate,
  type Verdict,
} from "@/components/webgl/substrate/engine";
import { chapterEmphasis, type Anchor } from "@/components/webgl/substrate/topology";

/**
 * The instrument: the WebGL field with the HUD that reads it.
 *
 * This whole module is behind a dynamic import, so nothing here — the shaders,
 * the simulation, the HUD — is in the homepage payload. It mounts only once a
 * machine has cleared the capability gate and the section is in range.
 *
 * The HUD never invents a number. Everything on screen is a value the
 * simulation produced, published as one immutable snapshot about seven times a
 * second, which is as fast as any of it can be read anyway.
 */

const LANES = ["GROUND", "VERIFY", "EXPLAIN"] as const;
const LANE_INK = ["--sub-ground", "--sub-verify", "--sub-explain"] as const;

const PHASE_LABEL = {
  gathering: "GATHERING",
  deliberating: "DELIBERATING",
  decided: "DECIDED",
} as const;

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

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

/* -------------------------------------------------------------------------- */
/* Snapshot store                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The simulation publishes into this; React reads out of it. A store rather
 * than `useState` because the first publish happens synchronously while the
 * engine is being constructed inside an effect, and because it keeps the
 * ~7Hz republish out of the effect graph entirely.
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
/* Instrument                                                                 */
/* -------------------------------------------------------------------------- */

export default function SubstrateInstrument({
  chapters,
  chapter,
  hint,
  animated,
  paused,
  onVerdict,
  onSelectChapter,
}: {
  chapters: SubstrateChapter[];
  /// Index of the chapter the scroll position has reached.
  chapter: number;
  /// The interaction hint from the CMS, shown under the case board.
  hint: string | null;
  /// False under reduced motion — the simulation runs at a calmer rate.
  animated: boolean;
  paused: boolean;
  onVerdict: (verdict: Verdict) => void;
  onSelectChapter: (index: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Substrate | null>(null);

  const store = useMemo(() => createSnapshotStore(), []);
  const snapshot = useSyncExternalStore(store.subscribe, store.get, store.get);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;

    const substrate = createSubstrate({
      canvas: element,
      animated,
      onSnapshot: store.set,
      onVerdict,
    });

    // No WebGL2 despite the capability probe saying otherwise — hand the
    // section back to the plain narrative rather than leaving a black box.
    if (!substrate) {
      onVerdict("abort");
      return;
    }

    engine.current = substrate;
    return () => {
      engine.current = null;
      substrate.dispose();
    };
  }, [animated, onVerdict, store]);

  useEffect(() => {
    engine.current?.setChapter(chapter);
  }, [chapter]);

  useEffect(() => {
    engine.current?.setPaused(paused);
  }, [paused]);

  const highlight = useCallback((caseId: number | null) => {
    engine.current?.setHighlight(caseId);
  }, []);

  const active = chapters[chapter];

  return (
    <div
      data-substrate
      role="group"
      aria-label="Live simulation of the cognitive substrate"
      className="flex h-full flex-col overflow-hidden border-y border-shade-800 bg-shade-950 text-tint-100"
    >
      <TopRail
        meters={snapshot.meters}
        onInject={() => engine.current?.inject()}
      />

      {/* Narrower rails on narrower screens: below xl every pixel the rails
          take is a pixel the field cannot use, and the field is the argument. */}
      <div className="grid min-h-0 flex-1 grid-cols-[14rem_minmax(0,1fr)_15rem] xl:grid-cols-[17rem_minmax(0,1fr)_18rem]">
        {/* Left rail — the narrative, and what is arriving. The chapter copy
            keeps its full height whatever the viewport; the signal list is
            what gives way, because it is a list and scrolling one is normal. */}
        <div className="flex min-h-0 flex-col gap-4 overflow-hidden border-r border-shade-800 p-4 xl:gap-5 xl:p-5">
          <ChapterPanel
            chapters={chapters}
            chapter={chapter}
            onSelect={onSelectChapter}
          />

          {hint ? (
            <p className="shrink-0 border-l-2 border-shade-700 pl-2.5 text-[0.7rem] leading-relaxed text-shade-300">
              {hint}
            </p>
          ) : null}

          <SourceRail
            sources={snapshot.sources}
            onBurst={(id) => engine.current?.burst(id)}
          />
        </div>

        {/* Stage — the canvas fills its cell and the captions are placed from
            world coordinates on top of it. */}
        <div className="relative flex min-h-0 flex-col">
          <canvas ref={canvas} aria-hidden className="block min-h-0 w-full flex-1" />

          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {snapshot.labels.map((label) => (
              <span
                key={label.id}
                style={{
                  left: label.x,
                  top: label.y,
                  transform: LABEL_TRANSFORM[label.anchor],
                  opacity: 0.35 + 0.65 * chapterEmphasis(label.group, chapter),
                }}
                className={cn(
                  "absolute block whitespace-nowrap transition-opacity duration-500",
                  LABEL_ALIGN[label.anchor],
                )}
              >
                <b className="block text-[0.7rem] font-semibold tracking-wide text-tint-100">
                  {label.label}
                </b>
                {/* The second line is the first thing to go when the field is
                    small enough that captions start meeting each other. */}
                <small className="hidden font-mono text-[0.6rem] text-shade-300 xl:block">
                  {label.sub}
                </small>
              </span>
            ))}
          </div>

          <Legend />
        </div>

        {/* Right rail — who is working, and what has been decided. The council
            is fixed; the ledger takes what is left and scrolls, because it is a
            feed and its newest entry is the one that matters. */}
        <div className="flex min-h-0 flex-col gap-4 overflow-hidden border-l border-shade-800 p-4 xl:gap-5 xl:p-5">
          <AgentCouncil agents={snapshot.agents} />
          <Ledger entries={snapshot.ledger} />
        </div>
      </div>

      <CaseBoardPanel
        cases={snapshot.cases}
        hub={snapshot.hub}
        stage={active?.stage ?? null}
        onHighlight={highlight}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chrome                                                                     */
/* -------------------------------------------------------------------------- */

function PanelHeading({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <h3 className="mb-2.5 flex items-baseline justify-between gap-2 font-mono text-[0.65rem] tracking-[0.14em] text-shade-300 uppercase">
      <span className="whitespace-nowrap">{children}</span>
      {/* The hints are affordances, not information — first to go when the
          column is too narrow to hold them on one line. */}
      {hint ? (
        <span className="hidden text-[0.6rem] tracking-normal whitespace-nowrap normal-case xl:inline">
          {hint}
        </span>
      ) : null}
    </h3>
  );
}

function TopRail({
  meters,
  onInject,
}: {
  meters: HudSnapshot["meters"];
  onInject: () => void;
}) {
  const readouts = [
    { label: "Ingest", value: meters.ingest, unit: "rec/min" },
    { label: "In field", value: meters.live, unit: "records" },
    { label: "Cases open", value: meters.inflight, unit: "concurrent" },
    { label: "Decided", value: meters.decided, unit: "this session", accent: true },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-shade-800 px-5 py-3">
      <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.14em] text-shade-300 uppercase">
        <span className="size-1.5 animate-shimmer rounded-full bg-[var(--sub-verify)]" />
        Live simulation
      </p>

      <dl className="ml-auto flex items-end gap-7">
        {readouts.map((readout) => (
          <div key={readout.label} className="text-right">
            <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-shade-300 uppercase">
              {readout.label}
            </dt>
            <dd className="flex items-baseline justify-end gap-1.5">
              <span
                className={cn(
                  "font-mono text-lg leading-tight tabular-nums",
                  readout.accent ? "text-[var(--sub-decided)]" : "text-tint-50",
                )}
              >
                {fmt(readout.value)}
              </span>
              <span className="text-[0.6rem] text-shade-300">
                {readout.unit}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={onInject}
        className="flex items-center gap-2 rounded-md border border-[var(--sub-reject)]/40 px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.12em] text-[var(--sub-reject)] uppercase transition-colors hover:bg-[var(--sub-reject)]/12 focus-visible:outline-tint-50"
      >
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
        Inject disruption
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Left rail                                                                  */
/* -------------------------------------------------------------------------- */

function ChapterPanel({
  chapters,
  chapter,
  onSelect,
}: {
  chapters: SubstrateChapter[];
  chapter: number;
  onSelect: (index: number) => void;
}) {
  const active = chapters[chapter];

  return (
    <section className="shrink-0">
      {/* The dots double as a position readout and as a way back to a chapter
          the visitor has already scrolled past. */}
      <ol className="mb-3 flex items-center gap-1.5">
        {chapters.map((entry, index) => (
          <li key={entry.id} className="flex-1">
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={index === chapter ? "step" : undefined}
              aria-label={entry.stage ?? entry.title}
              className={cn(
                "block h-0.5 w-full transition-colors duration-500",
                index === chapter
                  ? "bg-[var(--sub-context)]"
                  : "bg-shade-700 hover:bg-shade-600",
              )}
            />
          </li>
        ))}
      </ol>

      {active ? (
        // Keyed so a chapter change replays the fade rather than mutating text
        // in place, which reads as a glitch at this size.
        <div key={active.id} className="[animation:substrate-chapter-in_0.5s_ease-out]">
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--sub-context)] uppercase">
            {String(chapter + 1).padStart(2, "0")} · {active.stage ?? "Substrate"}
          </p>
          <h3 className="mt-2 text-[0.95rem] leading-snug text-balance text-tint-50">
            {active.title}
          </h3>
          {active.body ? (
            <p className="mt-2 text-xs leading-relaxed text-pretty text-tint-500">
              {active.body}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function SourceRail({
  sources,
  onBurst,
}: {
  sources: HudSnapshot["sources"];
  onBurst: (id: string) => void;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <PanelHeading hint="click to burst">Connected signals</PanelHeading>

      <ul className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto no-scrollbar">
        {sources.map((source) => (
          <li key={source.id}>
            <button
              type="button"
              onClick={() => onBurst(source.id)}
              title={`Inject a burst from ${source.label}`}
              className="group relative flex w-full items-center gap-2 overflow-hidden rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-shade-900 active:bg-shade-800"
            >
              {/* Load bar: the sampled arrival rate, not an animation. */}
              <span
                aria-hidden
                style={{ transform: `scaleX(${source.load})` }}
                className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--sub-context)]/10 transition-transform duration-300"
              />
              <span className="relative size-1.5 shrink-0 rounded-full bg-[var(--sub-raw)]" />
              <span className="relative min-w-0 flex-1 truncate text-xs text-tint-100">
                {source.label}
              </span>
              <span className="relative font-mono text-[0.65rem] tabular-nums text-shade-300">
                {source.rate.toFixed(0)}/s
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/// What resolution actually did to the traffic. Sits in the bottom band rather
/// than in a rail: these are totals for the whole field, and the band is the
/// one row wide enough to show all four without truncating the labels.
function HubStats({ hub }: { hub: HudSnapshot["hub"] }) {
  const rows = [
    { label: "Duplicates collapsed", value: hub.merged },
    { label: "Held in quarantine", value: hub.quarantined },
    { label: "Remediated & released", value: hub.remediated },
    { label: "Delivered decision-grade", value: hub.delivered },
  ];

  return (
    <dl className="hidden items-baseline gap-5 lg:flex">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline gap-1.5">
          <dt className="text-[0.7rem] whitespace-nowrap text-shade-300">
            {row.label}
          </dt>
          <dd className="font-mono text-[0.7rem] tabular-nums text-tint-100">
            {fmt(row.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage furniture                                                            */
/* -------------------------------------------------------------------------- */

/// Names what the colours mean, so a still frame is readable on its own.
function Legend() {
  const swatches = [
    { ink: "--sub-raw", label: "raw · unverified" },
    { ink: "--sub-context", label: "resolved · governed" },
    { ink: "--sub-reject", label: "quarantined · remediating" },
    { ink: "--sub-decided", label: "decision-grade" },
  ];

  return (
    // In flow rather than over the canvas: a caption sitting on the field
    // lands on whichever node happens to be underneath it.
    <ul className="flex shrink-0 flex-wrap items-center justify-center gap-x-6 gap-y-1.5 border-t border-shade-800/60 px-5 py-2.5 font-mono text-[0.6rem] text-shade-300">
      {swatches.map((swatch) => (
        <li key={swatch.ink} className="flex items-center gap-1.5">
          <span
            aria-hidden
            style={{ background: `var(${swatch.ink})` }}
            className="size-1.5 rounded-full"
          />
          {swatch.label}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Right rail                                                                 */
/* -------------------------------------------------------------------------- */

function AgentCouncil({ agents }: { agents: HudSnapshot["agents"] }) {
  return (
    <section className="shrink-0">
      <PanelHeading>Agent council</PanelHeading>

      <ul className="flex flex-col gap-2">
        {agents.map((agent) => (
          <li
            key={agent.id}
            data-tone={agent.tone}
            className={cn(
              "flex items-center gap-2.5 rounded-sm border px-2.5 py-2 transition-colors duration-300",
              agent.active
                ? "border-[color-mix(in_oklab,var(--tone)_55%,transparent)] bg-shade-900"
                : "border-shade-800",
            )}
          >
            <span className="font-mono text-[0.6rem] text-shade-300">
              {agent.code}
            </span>

            <div className="min-w-0 flex-1">
              <b className="block truncate text-xs font-medium text-tint-50">
                {agent.name}
              </b>
              <span className="mt-1 flex flex-wrap gap-1">
                {agent.skills.map((skill) => (
                  <i
                    key={skill.name}
                    className={cn(
                      "rounded-xs px-1 py-px font-mono text-[0.55rem] not-italic transition-colors duration-300",
                      skill.running
                        ? "bg-[color-mix(in_oklab,var(--tone)_28%,transparent)] text-tint-50"
                        : "bg-shade-900 text-shade-300",
                    )}
                  >
                    {skill.name}
                  </i>
                ))}
              </span>
            </div>

            <span className="font-mono text-[0.65rem] tabular-nums text-shade-300">
              {fmt(agent.xp)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Ledger({ entries }: { entries: HudSnapshot["ledger"] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <PanelHeading>Decision ledger</PanelHeading>

      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto no-scrollbar">
        {entries.map((entry) => (
          <li
            key={entry.ref}
            className={cn(
              "rounded-sm border-l-2 bg-shade-900/60 py-2 pr-2 pl-2.5",
              entry.priority
                ? "border-[var(--sub-reject)]"
                : "border-[var(--sub-decided)]",
            )}
          >
            <b className="block text-xs leading-snug font-medium text-tint-50">
              {entry.decision}
            </b>
            <p className="mt-1 text-[0.7rem] leading-snug text-tint-500">
              {entry.impact}
            </p>
            <p className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[0.6rem] text-shade-300">
              <span>{entry.ref}</span>
              <span>
                {(entry.confidence * 100).toFixed(1)}% · {entry.sources} source
                {entry.sources === 1 ? "" : "s"}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Case board                                                                 */
/* -------------------------------------------------------------------------- */

function CaseBoardPanel({
  cases,
  hub,
  stage,
  onHighlight,
}: {
  cases: HudCase[];
  hub: HudSnapshot["hub"];
  /// The stage name of the chapter on screen, for the header.
  stage: string | null;
  onHighlight: (caseId: number | null) => void;
}) {
  return (
    <div className="border-t border-shade-800 px-4 py-4 xl:px-5">
      <div className="mb-3 flex items-baseline justify-between gap-6">
        <PanelHeading hint="hover to trace provenance">
          Cases in flight{stage ? ` · ${stage}` : ""}
        </PanelHeading>
        <HubStats hub={hub} />
      </div>

      <ul className="grid grid-cols-5 gap-3">
        {cases.map((entry) => (
          <li
            key={entry.id}
            onPointerEnter={() => onHighlight(entry.id)}
            onPointerLeave={() => onHighlight(null)}
            className={cn(
              "rounded-sm border bg-shade-900/50 p-2.5 transition-colors duration-300",
              entry.phase === "decided"
                ? "border-[color-mix(in_oklab,var(--sub-decided)_45%,transparent)]"
                : entry.priority
                  ? "border-[color-mix(in_oklab,var(--sub-reject)_45%,transparent)]"
                  : "border-shade-800 hover:border-shade-600",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <b className="font-mono text-[0.6rem] text-shade-300">
                {entry.ref}
              </b>
              <em
                className={cn(
                  "font-mono text-[0.55rem] tracking-[0.1em] not-italic",
                  entry.phase === "decided"
                    ? "text-[var(--sub-decided)]"
                    : entry.phase === "deliberating"
                      ? "text-[var(--sub-explain)]"
                      : "text-shade-300",
                )}
              >
                {PHASE_LABEL[entry.phase]}
              </em>
            </div>

            <p className="mt-1.5 truncate text-xs font-medium text-tint-50">
              {entry.title}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-snug text-tint-500">
              {entry.line}
            </p>

            {/* One track per engine lane. A case decides only when all three
                are full — which is the point the copy makes beside it. */}
            <div className="mt-2.5 flex flex-col gap-1">
              {entry.tracks.map((value, lane) => (
                <span key={LANES[lane]} className="flex items-center gap-1.5">
                  <u className="w-11 shrink-0 font-mono text-[0.5rem] tracking-[0.08em] text-shade-300 no-underline">
                    {LANES[lane]}
                  </u>
                  <span className="h-0.5 flex-1 bg-shade-800">
                    <span
                      style={{
                        width: `${value * 100}%`,
                        background: `var(${LANE_INK[lane]})`,
                      }}
                      className="block h-full transition-[width] duration-300"
                    />
                  </span>
                </span>
              ))}
            </div>

            <p className="mt-2 flex items-center justify-between gap-2 font-mono text-[0.55rem] text-shade-300">
              <span>{(entry.confidence * 100).toFixed(1)}%</span>
              <span>{entry.records} records</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
