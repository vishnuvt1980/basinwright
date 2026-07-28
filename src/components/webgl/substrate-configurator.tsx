"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "@/components/icon";
import { Button, cn } from "@/components/ui/primitives";
import { defaultConfigFor, type DemoConfig } from "@/lib/demo-config";
import { saveDemoConfig } from "@/lib/demo-config-store";
import {
  INDUSTRIES,
  MAX_SOURCES,
  MAX_USE_CASES,
  MIN_SOURCES,
  MIN_USE_CASES,
  REGIONS,
  SCALES,
  findIndustry,
} from "@/lib/industries";

/**
 * The step between "Open the full console" and the console itself.
 *
 * A generic demo is a slide. This is what turns it into their operation: the
 * systems on the board are the ones they named, the decisions crossing it are
 * the ones they picked, and the last node carries their own name. Every answer
 * is optional except the two that the simulation cannot run without — how many
 * systems feed it, and what work flows through it.
 *
 * The answers are theirs, not ours: they are kept in localStorage, and attached
 * to a contact form submission only if the visitor later chooses to send one.
 */

const field =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors focus:border-accent focus:outline-none";

/* -------------------------------------------------------------------------- */
/* Field chrome                                                               */
/* -------------------------------------------------------------------------- */

function Label({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <span className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-[0.7rem] tracking-[0.14em] text-ink-3 uppercase">
        {children}
      </span>
      {hint ? <span className="text-[0.7rem] text-ink-3">{hint}</span> : null}
    </span>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  note,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  /// One line under the control explaining what the choice changes.
  note?: string;
}) {
  return (
    <label className="flex flex-col">
      <Label>{label}</Label>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(field, "cursor-pointer appearance-none pr-10")}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="ChevronDown"
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-3"
        />
      </span>
      {note ? (
        <span className="mt-2 text-[0.75rem] leading-relaxed text-ink-3">
          {note}
        </span>
      ) : null}
    </label>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  note,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  note?: string;
  maxLength: number;
}) {
  return (
    <label className="flex flex-col">
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(field, "placeholder:text-ink-3")}
      />
      {note ? (
        <span className="mt-2 text-[0.75rem] leading-relaxed text-ink-3">
          {note}
        </span>
      ) : null}
    </label>
  );
}

/// A bounded multi-select. Selection is capped rather than policed: once the
/// board is full, the options that are not on it stop responding instead of
/// throwing an error at someone who was only exploring.
function Chips({
  label,
  hint,
  options,
  selected,
  min,
  max,
  onToggle,
}: {
  label: string;
  hint: string;
  options: { id: string; label: string; sub?: string }[];
  selected: string[];
  min: number;
  max: number;
  onToggle: (id: string) => void;
}) {
  const short = selected.length < min;
  const full = selected.length >= max;

  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <Label
        hint={
          <span className={cn(short && "text-[var(--sub-reject)]")}>
            {selected.length} of {max} · {hint}
          </span>
        }
      >
        {label}
      </Label>

      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option.id);
          const locked = full && !on;
          return (
            <li key={option.id}>
              <button
                type="button"
                aria-pressed={on}
                disabled={locked}
                onClick={() => onToggle(option.id)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors",
                  on
                    ? "border-accent bg-[color-mix(in_oklab,var(--bw-accent)_10%,transparent)] text-ink"
                    : locked
                      ? "cursor-not-allowed border-line text-ink-3 opacity-50"
                      : "border-line text-ink-2 hover:border-line-strong hover:bg-raised hover:text-ink",
                )}
              >
                <span className="flex items-center gap-1.5 text-[0.8rem] font-medium">
                  <Icon
                    name={on ? "Check" : "Plus"}
                    className={cn("size-3.5", on ? "text-accent" : "text-ink-3")}
                  />
                  {option.label}
                </span>
                {option.sub ? (
                  <span className="pl-5 font-mono text-[0.65rem] text-ink-3">
                    {option.sub}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Configurator                                                               */
/* -------------------------------------------------------------------------- */

export default function SubstrateConfigurator({
  initial,
  onRun,
  onCancel,
}: {
  /// What they chose last time, when they have been here before.
  initial: DemoConfig | null;
  onRun: () => void;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [config, setConfig] = useState<DemoConfig>(
    () => initial ?? defaultConfigFor(INDUSTRIES[0]),
  );

  // Esc and focus containment come from the platform rather than from us.
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const industry = findIndustry(config.industry) ?? INDUSTRIES[0];

  // Switching industry rebuilds everything that is drawn from its catalogue,
  // and keeps everything that is about the visitor rather than their sector.
  const setIndustry = (id: string) => {
    const next = findIndustry(id);
    if (!next) return;
    setConfig((current) => ({
      ...defaultConfigFor(next),
      company: current.company,
      scale: current.scale,
      region: current.region,
      pain: current.pain,
    }));
  };

  const toggle = (key: "sources" | "useCases", max: number) => (id: string) =>
    setConfig((current) => {
      const on = current[key].includes(id);
      if (!on && current[key].length >= max) return current;
      return {
        ...current,
        [key]: on
          ? current[key].filter((value) => value !== id)
          : [...current[key], id],
      };
    });

  const enough =
    config.sources.length >= MIN_SOURCES &&
    config.useCases.length >= MIN_USE_CASES;

  const run = () => {
    if (!enough) return;
    // Persist first: the store publishes, so the hero, the banner and the
    // contact form are all looking at this configuration before the console
    // built from it exists.
    saveDemoConfig(config);
    onRun();
  };

  return (
    <dialog
      ref={dialog}
      onClose={onCancel}
      aria-label="Configure the substrate console"
      className="m-auto max-h-[92dvh] w-[min(64rem,94vw)] overflow-hidden rounded-2xl border border-line bg-canvas p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div data-substrate className="flex max-h-[92dvh] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-6 border-b border-line px-6 py-5 sm:px-8">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.65rem] font-medium tracking-[0.14em] text-ink-2 uppercase">
              <span className="size-1.5 animate-shimmer rounded-full bg-[var(--sub-own)]" />
              Before we start the simulation
            </p>
            <h2 className="mt-2 font-display text-[1.5rem] leading-tight text-ink sm:text-[1.75rem]">
              Run the console on your operation
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2">
              Nothing below is a mock-up. The systems you name become the ingest
              side of the board, the decisions you pick are the ones that cross
              it, and the last node carries your name.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close"
            className="shrink-0 rounded-md border border-line p-2 text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          >
            <Icon name="Dismiss" className="size-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Industry"
              value={industry.id}
              onChange={setIndustry}
              options={INDUSTRIES}
              note={industry.blurb}
            />
            <Select
              label="Line of business"
              value={config.segment}
              onChange={(segment) =>
                setConfig((current) => ({ ...current, segment }))
              }
              options={industry.segments}
            />
            <Text
              label="Your organisation"
              value={config.company}
              maxLength={80}
              onChange={(company) =>
                setConfig((current) => ({ ...current, company }))
              }
              placeholder="Your organisation"
              note="Names the last node on the board — the one that owns what comes out."
            />
            <Select
              label="Operating scale"
              value={config.scale}
              onChange={(scale) => setConfig((current) => ({ ...current, scale }))}
              options={SCALES.map((s) => ({
                id: s.id,
                label: `${s.label} — ${s.sub}`,
              }))}
              note="Sets how much traffic the field carries."
            />
            <Select
              label="Data residency"
              value={config.region}
              onChange={(region) =>
                setConfig((current) => ({ ...current, region }))
              }
              options={REGIONS}
              note="Governs the hub and names the tenancy we deploy into."
            />
          </div>

          <Chips
            label="Your data sources"
            hint={`pick at least ${MIN_SOURCES}`}
            options={industry.sources.map((s) => ({
              id: s.id,
              label: s.label,
              sub: s.sub,
            }))}
            selected={config.sources}
            min={MIN_SOURCES}
            max={MAX_SOURCES}
            onToggle={toggle("sources", MAX_SOURCES)}
          />

          <Chips
            label="Decisions you want it working"
            hint={`pick at least ${MIN_USE_CASES}`}
            options={industry.useCases.map((c) => ({
              id: c.id,
              label: c.label,
            }))}
            selected={config.useCases}
            min={MIN_USE_CASES}
            max={MAX_USE_CASES}
            onToggle={toggle("useCases", MAX_USE_CASES)}
          />

          <Text
            label="What is hurting most right now?"
            value={config.pain}
            maxLength={240}
            onChange={(pain) => setConfig((current) => ({ ...current, pain }))}
            placeholder="A single late valve keeps holding our turnaround window"
            note="Optional. Whatever you write becomes the disruption you can throw at the board yourself."
          />
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-4 sm:px-8">
          <p className="text-xs text-ink-3">
            {enough
              ? "Stored in this browser only. Nothing is sent unless you contact us."
              : `Choose at least ${MIN_SOURCES} data sources and ${MIN_USE_CASES} decisions.`}
          </p>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </Button>
            <Button type="button" onClick={run} disabled={!enough}>
              Run my console
              <Icon name="ArrowRight" className="size-4" />
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
