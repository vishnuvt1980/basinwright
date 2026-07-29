"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { Icon } from "@/components/icon";
import type { SubstrateChapter } from "@/components/sections/substrate-chapters";
import { cn } from "@/components/ui/primitives";
import { applyDemoConfig } from "@/components/webgl/substrate/configure";
import { SOURCES } from "@/components/webgl/substrate/topology";
import { describeDemoConfig, type DemoConfig } from "@/lib/demo-config";

import { Ladder, Legend, Rail, type Source } from "./case-line";
import { INK_VAR, LANES, focusFor, segmentsFor } from "./geometry";
import {
  createCaseLine,
  projectMark,
  type BoardCase,
  type CaseLine as Engine,
  type Mark,
  type Snapshot,
} from "./simulation";
import type { Segment } from "./geometry";

/**
 * The full console — the same rail, at desk scale, with every instrument the
 * simulation can drive.
 *
 * The hero banner is the trailer for this. Here there is room for the whole
 * board, so nothing is summarised: what is arriving and how fast, what
 * resolution is doing to it, which agents hold which skills, which cases are in
 * flight and at what point, and what has been decided with what behind it.
 *
 * Everything on screen is a value the simulation produced. The rates are
 * measured, the cases are objects with their own clocks, and pointing at one
 * lights the systems that actually fed it.
 */

/// How long each chapter holds the stage. Slower than the banner's: a visitor
/// who opened the console is reading, not glancing.
const CHAPTER_MS = 10000;

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const PHASE_LABEL: Record<BoardCase["phase"], string> = {
  gathering: "GATHERING",
  deliberating: "DELIBERATING",
  decided: "DECIDED",
};

/* -------------------------------------------------------------------------- */
/* Snapshot store                                                             */
/* -------------------------------------------------------------------------- */

function createSnapshotStore() {
  let current: Snapshot | null = null;
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
/* Console                                                                    */
/* -------------------------------------------------------------------------- */

export default function CaseConsole({
  chapters,
  config,
  animated,
  onClose,
  onReconfigure,
}: {
  chapters: SubstrateChapter[];
  /// What the visitor asked the console to be. Null runs the default board.
  config: DemoConfig | null;
  /// False under reduced motion — nothing travels, the board still runs.
  animated: boolean;
  onClose: () => void;
  /// Reopens the configurator. The console is torn down first, so the next one
  /// is built against whatever they change.
  onReconfigure: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const engine = useRef<Engine | null>(null);
  const marksRef = useRef<SVGGElement>(null);
  const inkRef = useRef<string[]>([]);

  const store = useMemo(() => createSnapshotStore(), []);
  const snapshot = useSyncExternalStore(store.subscribe, store.get, store.get);

  const [chapter, setChapter] = useState(0);
  const [held, setHeld] = useState(false);

  const sources: Source[] = useMemo(() => {
    applyDemoConfig(config);
    return SOURCES.map((s) => ({ id: s.id, label: s.label, sub: s.sub }));
  }, [config]);

  const segments = useMemo(() => segmentsFor(sources.length), [sources.length]);

  // The top layer, so nothing on the page can paint over the console, and Esc
  // and focus containment come from the platform rather than from us.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const paint = useCallback(
    (marks: Mark[], segs: Segment[]) => {
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
    if (held || chapters.length < 2) return;
    const timer = setInterval(
      () => setChapter((current) => (current + 1) % chapters.length),
      CHAPTER_MS,
    );
    return () => clearInterval(timer);
  }, [held, chapters.length]);

  const trace = useCallback((caseId: number | null) => {
    engine.current?.setTrace(caseId);
  }, []);

  const active = chapters[chapter];
  const stage = focusFor(chapter).stage;

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label="Cognitive substrate — live console"
      className="m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-canvas p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {/* Two layouts, one tree. On a desk this is a fixed-height instrument
          panel: nothing scrolls but the lists inside it. On a phone there is no
          arrangement of nine panels that fits a viewport, so the whole console
          becomes one scrolling column and each panel takes the height it needs.
          Trying to fit it either way is what makes panels overlap. */}
      <div
        data-substrate
        className="flex h-dvh flex-col overflow-y-auto lg:overflow-hidden"
      >
        <TopRail
          snapshot={snapshot}
          context={config ? describeDemoConfig(config) : null}
          onInject={() => engine.current?.inject()}
          onReconfigure={onReconfigure}
          onClose={() => dialog.current?.close()}
        />

        {/* The rails are as narrow as their contents allow, because the centre
            column is what caps the drawing's width — and once the drawing is
            width-capped its type hits the legibility floor and the cards start
            clipping. Instruments give way to the picture, not the reverse. */}
        <div className="grid shrink-0 grid-cols-1 lg:min-h-0 lg:flex-1 lg:grid-cols-[15rem_minmax(0,1fr)_16rem] xl:grid-cols-[17rem_minmax(0,1fr)_18rem] 2xl:grid-cols-[19rem_minmax(0,1fr)_20rem]">
          {/* Left — what is arriving, and what resolution does to it. */}
          <div className="flex flex-col gap-4 border-line p-5 no-scrollbar lg:min-h-0 lg:overflow-y-auto lg:border-r">
            <div
              onPointerEnter={() => setHeld(true)}
              onPointerLeave={() => setHeld(false)}
              onFocusCapture={() => setHeld(true)}
              onBlurCapture={() => setHeld(false)}
              className="shrink-0"
            >
              <ChapterRail
                chapters={chapters}
                chapter={chapter}
                onSelect={setChapter}
              />
              {active ? <Chapter chapter={active} index={chapter} /> : null}
            </div>

            <SourceRail
              sources={snapshot?.sources ?? []}
              onBurst={(id) => engine.current?.burst(id)}
            />

            <HubStats hub={snapshot?.hub} />
          </div>

          {/* Centre — the rail. The same drawing the hero carries, and on a
              narrow screen the same ladder it falls back to: a stacked grid
              gives the rail no height to size itself from, and it collapses. */}
          <div className="flex flex-col lg:min-h-0">
            <div className="hidden min-h-0 flex-1 items-center justify-center px-3 py-4 lg:flex lg:[container-type:size]">
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
            <div className="px-5 py-4 lg:hidden">
              <Ladder
                sources={sources}
                snapshot={snapshot}
                chapter={chapter}
                stage={stage}
              />
            </div>
            <div className="shrink-0 px-5 pb-3">
              <Legend />
            </div>
          </div>

          {/* Right — who is working, and what has been decided. */}
          <div className="flex flex-col gap-6 border-line p-5 lg:min-h-0 lg:overflow-hidden lg:border-l">
            <AgentCouncil agents={snapshot?.agents ?? []} />
            <Ledger entries={snapshot?.ledger ?? []} />
          </div>
        </div>

        <CaseBoardPanel cases={snapshot?.board ?? []} onTrace={trace} />
      </div>
    </dialog>
  );
}

/* Proportions per shape, matching the hero's. Duplicated rather than exported
   because it is three numbers and a comment, and threading it through would
   couple two renderers that only happen to agree. */
const SHAPE_SCALE: [number, number][] = [
  [0.5, 1.5],
  [1, 1],
  [0.72, 1.9],
];

/* -------------------------------------------------------------------------- */
/* Chrome                                                                     */
/* -------------------------------------------------------------------------- */

function PanelHeading({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <h3 className="mb-3 flex items-baseline justify-between gap-2 font-mono text-[0.65rem] font-medium tracking-[0.14em] text-ink-3 uppercase">
      <span className="whitespace-nowrap">{children}</span>
      {hint ? (
        <span className="text-[0.6rem] tracking-normal whitespace-nowrap normal-case">
          {hint}
        </span>
      ) : null}
    </h3>
  );
}

function TopRail({
  snapshot,
  context,
  onInject,
  onReconfigure,
  onClose,
}: {
  snapshot: Snapshot | null;
  /// The visitor's industry and line of business, when they told us.
  context: string | null;
  onInject: () => void;
  onReconfigure: () => void;
  onClose: () => void;
}) {
  const m = snapshot?.meters;
  const readouts = [
    { label: "Ingest", value: m?.ingest ?? 0, unit: "rec/min" },
    { label: "In field", value: m?.live ?? 0, unit: "records" },
    { label: "Cases open", value: m?.inflight ?? 0, unit: "concurrent" },
    { label: "Decided", value: m?.decided ?? 0, unit: "this session" },
    { label: "Yours", value: m?.owned ?? 0, unit: "handed over", own: true },
  ];

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-5 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-mono text-[0.65rem] font-medium tracking-[0.14em] text-ink-2 uppercase">
          <span className="size-1.5 animate-shimmer rounded-full bg-[var(--sub-own)]" />
          Cognitive substrate · live
        </p>
        {context ? (
          <p className="mt-0.5 truncate text-[0.7rem] text-ink-3">{context}</p>
        ) : null}
      </div>

      <dl className="ml-auto flex items-end gap-5 xl:gap-7">
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
              <span className="hidden text-[0.6rem] text-ink-3 xl:inline">
                {readout.unit}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={onInject}
        className="flex items-center gap-2 rounded-md border border-[var(--sub-reject)]/50 px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.12em] text-[var(--sub-reject)] uppercase transition-colors hover:bg-[var(--sub-reject)]/12"
      >
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
        Inject disruption
      </button>

      <button
        type="button"
        onClick={onReconfigure}
        className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.12em] text-ink-2 uppercase transition-colors hover:border-accent/60 hover:text-ink"
      >
        <Icon name="SlidersHorizontal" className="size-3.5" />
        Reconfigure
      </button>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close the console"
        className="rounded-md border border-line p-2 text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
      >
        <Icon name="Dismiss" className="size-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Left rail                                                                  */
/* -------------------------------------------------------------------------- */

function ChapterRail({
  chapters,
  chapter,
  onSelect,
}: {
  chapters: SubstrateChapter[];
  chapter: number;
  onSelect: (index: number) => void;
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
              "block h-0.5 w-full transition-colors duration-500",
              index === chapter ? "bg-accent" : "bg-line hover:bg-line-strong",
            )}
          />
        </li>
      ))}
    </ol>
  );
}

function Chapter({ chapter, index }: { chapter: SubstrateChapter; index: number }) {
  return (
    <div key={chapter.id} className="[animation:substrate-chapter-in_0.5s_ease-out]">
      <p className="font-mono text-[0.65rem] font-medium tracking-[0.14em] text-accent uppercase">
        {String(index + 1).padStart(2, "0")} · {chapter.stage ?? "Substrate"}
      </p>

      {chapter.highlight ? (
        <p className="substrate-flare mt-2 inline-block px-2.5 py-1">
          <span className="substrate-flare-text text-base leading-snug font-semibold">
            {chapter.title}
          </span>
        </p>
      ) : (
        <h4 className="mt-2 text-base leading-snug text-balance text-ink">
          {chapter.title}
        </h4>
      )}

      {chapter.body ? (
        // Clamped: the rail has three panels to fit and the chapters vary in
        // length. The full text is on the page itself, under the banner.
        <p className="mt-2 line-clamp-3 text-[0.8rem] leading-relaxed text-pretty text-ink-2">
          {chapter.body}
        </p>
      ) : null}
    </div>
  );
}

function SourceRail({
  sources,
  onBurst,
}: {
  sources: Snapshot["sources"];
  onBurst: (id: string) => void;
}) {
  return (
    // The one flexible panel in the rail, and the only one allowed to scroll —
    // hence the floor, or a tall chapter squeezes the list out of existence.
    <section className="flex min-h-[7rem] flex-1 flex-col">
      <PanelHeading hint="click to burst">Connected signals</PanelHeading>

      <ul className="flex flex-col gap-0.5 no-scrollbar lg:min-h-0 lg:overflow-y-auto">
        {sources.map((source) => (
          <li key={source.id}>
            <button
              type="button"
              onClick={() => onBurst(source.id)}
              title={`Inject a burst from ${source.label}`}
              className="group relative flex w-full items-center gap-2 overflow-hidden rounded-sm border border-line px-2.5 py-2 text-left transition-colors hover:border-line-strong hover:bg-raised"
            >
              {/* Load bar: the sampled arrival rate, not an animation. */}
              <span
                aria-hidden
                style={{ transform: `scaleX(${source.load})` }}
                className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--sub-context)]/12 transition-transform duration-300"
              />
              <span className="relative size-1.5 shrink-0 rounded-full bg-[var(--sub-raw)]" />
              <span className="relative min-w-0 flex-1 truncate text-[0.8rem] text-ink">
                {source.label}
              </span>
              <span className="relative font-mono text-[0.7rem] tabular-nums text-ink-2">
                {source.rate.toFixed(1)}/s
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HubStats({ hub }: { hub: Snapshot["hub"] | undefined }) {
  const rows = [
    { label: "Duplicates collapsed", value: hub?.merged ?? 0 },
    { label: "Held in quarantine", value: hub?.quarantined ?? 0, ink: "--sub-reject" },
    { label: "Remediated & released", value: hub?.remediated ?? 0, ink: "--sub-context" },
    { label: "Delivered decision-grade", value: hub?.delivered ?? 0, ink: "--sub-decided" },
    { label: "Handed to your business", value: hub?.owned ?? 0, ink: "--sub-own" },
  ];

  return (
    <section className="shrink-0">
      <PanelHeading>What the hub is doing</PanelHeading>
      <dl className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt className="truncate text-[0.8rem] text-ink-2">{row.label}</dt>
            <dd
              style={row.ink ? { color: `var(${row.ink})` } : undefined}
              className="font-mono text-[0.8rem] tabular-nums text-ink"
            >
              {fmt(row.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Right rail                                                                 */
/* -------------------------------------------------------------------------- */

function AgentCouncil({ agents }: { agents: Snapshot["agents"] }) {
  return (
    <section className="shrink-0">
      <PanelHeading>Agent council</PanelHeading>
      <p className="mb-3 text-[0.8rem] leading-relaxed text-ink-2">
        Skills are interoperable — a case checks out whichever it needs, from
        whichever agent holds it. Experience accrues per agent.
      </p>

      <ul className="flex flex-col gap-2">
        {agents.map((agent) => (
          <li
            key={agent.id}
            data-tone={agent.tone}
            className={cn(
              "flex items-center gap-2.5 rounded-sm border px-2.5 py-2 transition-colors duration-300",
              agent.active
                ? "border-[color-mix(in_oklab,var(--tone)_60%,transparent)] bg-raised"
                : "border-line",
            )}
          >
            <span className="font-mono text-[0.65rem] text-[var(--tone)]">
              {agent.code}
            </span>

            <div className="min-w-0 flex-1">
              <b className="block truncate text-[0.8rem] font-medium text-ink">
                {agent.name}
              </b>
              <span className="mt-1 flex flex-wrap gap-1">
                {agent.skills.map((skill) => (
                  <i
                    key={skill.name}
                    className={cn(
                      "rounded-xs px-1 py-px font-mono text-[0.6rem] not-italic transition-colors duration-300",
                      skill.running
                        ? "bg-[color-mix(in_oklab,var(--tone)_30%,transparent)] text-ink"
                        : "bg-raised text-ink-3",
                    )}
                  >
                    {skill.name}
                  </i>
                ))}
              </span>
            </div>

            <span className="font-mono text-[0.7rem] tabular-nums text-ink-2">
              {fmt(agent.xp)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Ledger({ entries }: { entries: Snapshot["ledger"] }) {
  return (
    <section className="flex flex-col lg:min-h-0 lg:flex-1">
      <PanelHeading>Decision ledger</PanelHeading>

      <ul className="flex flex-col gap-2 no-scrollbar lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {entries.map((entry) => (
          <li
            key={entry.ref}
            className={cn(
              "rounded-sm border border-line border-l-2 bg-raised/60 py-2.5 pr-2.5 pl-3",
              entry.priority
                ? "border-l-[var(--sub-reject)]"
                : "border-l-[var(--sub-own)]",
            )}
          >
            <b className="block text-[0.8rem] leading-snug font-medium text-ink">
              {entry.decision}
            </b>
            <p className="mt-1 text-[0.75rem] leading-snug text-ink-2">
              {entry.impact}
            </p>
            <p className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[0.65rem] text-ink-3">
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
  onTrace,
}: {
  cases: BoardCase[];
  onTrace: (caseId: number | null) => void;
}) {
  return (
    <div className="shrink-0 border-t border-line px-5 py-4">
      <PanelHeading hint="hover to trace provenance">Cases in flight</PanelHeading>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {cases.map((entry) => (
          <li
            key={entry.id}
            onPointerEnter={() => onTrace(entry.id)}
            onPointerLeave={() => onTrace(null)}
            className={cn(
              "rounded-sm border bg-raised/50 p-3 transition-colors duration-300",
              entry.phase === "decided"
                ? "border-[color-mix(in_oklab,var(--sub-own)_55%,transparent)]"
                : entry.priority
                  ? "border-[color-mix(in_oklab,var(--sub-reject)_55%,transparent)]"
                  : "border-line hover:border-line-strong",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <b className="font-mono text-[0.65rem] text-ink-3">{entry.ref}</b>
              <em
                className={cn(
                  "font-mono text-[0.6rem] tracking-[0.1em] not-italic",
                  entry.phase === "decided"
                    ? "text-[var(--sub-own)]"
                    : entry.phase === "deliberating"
                      ? "text-[var(--sub-explain)]"
                      : "text-ink-3",
                )}
              >
                {PHASE_LABEL[entry.phase]}
              </em>
            </div>

            <p className="mt-1.5 truncate text-[0.85rem] font-medium text-ink">
              {entry.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[0.75rem] leading-snug text-ink-2">
              {entry.line}
            </p>

            {/* One track per engine lane. A case decides only when all three are
                full — which is the point the copy makes beside it. */}
            <div className="mt-3 flex flex-col gap-1">
              {entry.tracks.map((value, lane) => (
                <span key={LANES[lane].id} className="flex items-center gap-1.5">
                  <u className="w-12 shrink-0 font-mono text-[0.55rem] tracking-[0.08em] text-ink-3 no-underline">
                    {LANES[lane].verb}
                  </u>
                  <span className="h-0.5 flex-1 bg-line">
                    <span
                      style={{
                        width: `${value * 100}%`,
                        background: INK_VAR[LANES[lane].ink],
                      }}
                      className="block h-full transition-[width] duration-300"
                    />
                  </span>
                </span>
              ))}
            </div>

            <p className="mt-2 flex items-center justify-between gap-2 font-mono text-[0.6rem] text-ink-3">
              <span>confidence {(entry.confidence * 100).toFixed(1)}%</span>
              <span>{entry.records} records</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
