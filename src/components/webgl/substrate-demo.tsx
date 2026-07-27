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
import {
  EMPTY_SNAPSHOT,
  createSubstrate,
  type HudCase,
  type HudSnapshot,
  type Substrate,
} from "@/components/webgl/substrate/engine";
import { chapterEmphasis, type Anchor } from "@/components/webgl/substrate/topology";

/**
 * The substrate demo, full screen, with every instrument the simulation can
 * drive: what is arriving and how fast, what resolution is doing to it, which
 * agents are working, which cases are in flight and what has been decided.
 *
 * The hero banner is the trailer for this. Here there is room for the whole
 * console, so nothing is summarised and nothing is hidden behind a breakpoint.
 *
 * Everything on screen is a value the simulation produced. The counters are
 * sampled, the rates are measured, the cases are real objects with state, and
 * pointing at one lights up the exact records that produced it.
 */

/// How long each chapter holds the stage before the story moves on.
const CHAPTER_MS = 9000;

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

const LANES = ["GROUND", "VERIFY", "EXPLAIN"] as const;
const LANE_INK = ["--sub-ground", "--sub-verify", "--sub-explain"] as const;

const PHASE_LABEL = {
  gathering: "GATHERING",
  deliberating: "DELIBERATING",
  decided: "DECIDED",
} as const;

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/* -------------------------------------------------------------------------- */
/* Snapshot store                                                             */
/* -------------------------------------------------------------------------- */

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
/* Demo                                                                       */
/* -------------------------------------------------------------------------- */

export default function SubstrateDemo({
  chapters,
  dark,
  animated,
  onClose,
}: {
  chapters: SubstrateChapter[];
  dark: boolean;
  /// False under reduced motion — the simulation runs at a calmer rate.
  animated: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const safe = useRef<HTMLDivElement>(null);
  const engine = useRef<Substrate | null>(null);

  const store = useMemo(() => createSnapshotStore(), []);
  const snapshot = useSyncExternalStore(store.subscribe, store.get, store.get);

  const [chapter, setChapter] = useState(0);
  const [held, setHeld] = useState(false);

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
      // The visitor asked for this console explicitly. Stepping quality down is
      // right; closing it under them because a frame was slow is not.
      onVerdict: () => {},
    });

    if (!substrate) {
      onClose();
      return;
    }

    engine.current = substrate;
    return () => {
      engine.current = null;
      substrate.dispose();
    };
    // `dark` is applied through `setDark` rather than by rebuilding the engine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, onClose, store]);

  useEffect(() => {
    engine.current?.setDark(dark);
  }, [dark]);

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

  const highlight = useCallback((caseId: number | null) => {
    engine.current?.setHighlight(caseId);
  }, []);

  const active = chapters[chapter];

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label="Cognitive substrate — live demo"
      className="m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-canvas p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div data-substrate className="flex h-dvh flex-col">
        <TopRail
          meters={snapshot.meters}
          owned={snapshot.hub.owned}
          onInject={() => engine.current?.inject()}
          onClose={() => dialog.current?.close()}
        />

        <div className="grid min-h-0 flex-1 grid-cols-[17rem_minmax(0,1fr)_18rem] xl:grid-cols-[19rem_minmax(0,1fr)_20rem]">
          {/* Left — what is arriving, and what resolution does to it. */}
          {/* Fixed panels top and bottom, the signal list taking what is left.
              The hub's counters and the legend must never scroll out of sight:
              they are what makes the field readable. */}
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-r border-line p-5 no-scrollbar">
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
              sources={snapshot.sources}
              onBurst={(id) => engine.current?.burst(id)}
            />

            <HubStats hub={snapshot.hub} />
            <Legend />
          </div>

          {/* Centre — the field. */}
          <div className="relative min-h-0">
            <canvas ref={canvas} aria-hidden className="block size-full" />
            <div ref={safe} aria-hidden className="absolute inset-8" />

            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {snapshot.labels.map((label) => (
                <span
                  key={label.id}
                  style={{
                    left: label.x,
                    top: label.y,
                    transform: LABEL_TRANSFORM[label.anchor],
                    // Never below two thirds: a caption is a name, and a name
                    // that has faded out is just a smudge over the graphics.
                    opacity: 0.66 + 0.34 * chapterEmphasis(label.group, chapter),
                  }}
                  className={cn(
                    "absolute block whitespace-nowrap transition-opacity duration-500",
                    LABEL_ALIGN[label.anchor],
                  )}
                >
                  <b className="block text-[0.8rem] leading-tight font-semibold text-ink">
                    {label.label}
                  </b>
                  <small className="block font-mono text-[0.65rem] leading-tight text-ink-2">
                    {label.sub}
                  </small>
                </span>
              ))}
            </div>
          </div>

          {/* Right — who is working, and what has been decided. */}
          <div className="flex min-h-0 flex-col gap-6 overflow-hidden border-l border-line p-5">
            <AgentCouncil agents={snapshot.agents} />
            <Ledger entries={snapshot.ledger} />
          </div>
        </div>

        <CaseBoardPanel cases={snapshot.cases} onHighlight={highlight} />
      </div>
    </dialog>
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
  meters,
  owned,
  onInject,
  onClose,
}: {
  meters: HudSnapshot["meters"];
  owned: number;
  onInject: () => void;
  onClose: () => void;
}) {
  const readouts = [
    { label: "Ingest", value: meters.ingest, unit: "rec/min" },
    { label: "In field", value: meters.live, unit: "records" },
    { label: "Cases open", value: meters.inflight, unit: "concurrent" },
    { label: "Decided", value: meters.decided, unit: "this session" },
    { label: "Yours", value: owned, unit: "handed over", own: true },
  ];

  return (
    <div className="flex shrink-0 items-center gap-6 border-b border-line px-5 py-3">
      <p className="flex items-center gap-2 font-mono text-[0.65rem] font-medium tracking-[0.14em] text-ink-2 uppercase">
        <span className="size-1.5 animate-shimmer rounded-full bg-[var(--sub-own)]" />
        Cognitive substrate · live
      </p>

      <dl className="ml-auto flex items-end gap-7">
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
        onClick={onClose}
        aria-label="Close the demo"
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
              index === chapter
                ? "bg-accent"
                : "bg-line hover:bg-line-strong",
            )}
          />
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
        // Clamped: the rail has four panels to fit and the chapters vary in
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
  sources: HudSnapshot["sources"];
  onBurst: (id: string) => void;
}) {
  return (
    // The one flexible panel in the rail, and the only one allowed to scroll —
    // hence the floor, or a tall chapter squeezes the list out of existence.
    <section className="flex min-h-[7rem] flex-1 flex-col">
      <PanelHeading hint="click to burst">Connected signals</PanelHeading>

      <ul className="flex min-h-0 flex-col gap-0.5 overflow-y-auto no-scrollbar">
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
                {source.rate.toFixed(0)}/s
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HubStats({ hub }: { hub: HudSnapshot["hub"] }) {
  const rows = [
    { label: "Duplicates collapsed", value: hub.merged },
    { label: "Held in quarantine", value: hub.quarantined, ink: "--sub-reject" },
    { label: "Remediated & released", value: hub.remediated, ink: "--sub-context" },
    { label: "Delivered decision-grade", value: hub.delivered, ink: "--sub-decided" },
    { label: "Handed to your business", value: hub.owned, ink: "--sub-own" },
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

/// Names what the colours mean, so a still frame is readable on its own.
function Legend() {
  const swatches = [
    { ink: "--sub-raw", label: "raw · unverified" },
    { ink: "--sub-context", label: "resolved · governed" },
    { ink: "--sub-reject", label: "quarantined · remediating" },
    { ink: "--sub-ops", label: "built · deployed · monitored" },
    { ink: "--sub-decided", label: "decision-grade" },
    { ink: "--sub-own", label: "yours" },
  ];

  return (
    <section className="shrink-0">
      <PanelHeading>Resolution</PanelHeading>
      {/* Two columns: the rail has four panels to fit, and six swatches stacked
          push the last of them off the bottom. */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {swatches.map((swatch) => (
          <li
            key={swatch.ink}
            className="flex items-center gap-1.5 text-[0.7rem] leading-tight text-ink-2"
          >
            <span
              aria-hidden
              style={{ background: `var(${swatch.ink})` }}
              className="size-2 rounded-xs"
            />
            {swatch.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Right rail                                                                 */
/* -------------------------------------------------------------------------- */

function AgentCouncil({ agents }: { agents: HudSnapshot["agents"] }) {
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

function Ledger({ entries }: { entries: HudSnapshot["ledger"] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <PanelHeading>Decision ledger</PanelHeading>

      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto no-scrollbar">
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
  onHighlight,
}: {
  cases: HudCase[];
  onHighlight: (caseId: number | null) => void;
}) {
  return (
    <div className="shrink-0 border-t border-line px-5 py-4">
      <PanelHeading hint="hover to trace provenance">Cases in flight</PanelHeading>

      <ul className="grid grid-cols-5 gap-3">
        {cases.map((entry) => (
          <li
            key={entry.id}
            onPointerEnter={() => onHighlight(entry.id)}
            onPointerLeave={() => onHighlight(null)}
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

            {/* One track per engine lane. A case decides only when all three
                are full — which is the point the copy makes beside it. */}
            <div className="mt-3 flex flex-col gap-1">
              {entry.tracks.map((value, lane) => (
                <span key={LANES[lane]} className="flex items-center gap-1.5">
                  <u className="w-12 shrink-0 font-mono text-[0.55rem] tracking-[0.08em] text-ink-3 no-underline">
                    {LANES[lane]}
                  </u>
                  <span className="h-0.5 flex-1 bg-line">
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
