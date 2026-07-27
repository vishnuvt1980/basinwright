"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { ICON_NAMES } from "@/components/icon";
import { cn } from "@/components/ui/primitives";
import type { ActionState } from "@/app/admin/actions";

const control =
  "w-full rounded-lg border border-basin-600/70 bg-basin-900/70 px-3.5 py-2.5 text-sm text-parchment-100 placeholder:text-basin-600 transition-colors focus:border-brass-500/70 focus:outline-none";

export function Label({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span className="text-xs uppercase tracking-[0.14em] text-basin-400">
        {children}
      </span>
      {hint ? <span className="text-[0.7rem] text-basin-600">{hint}</span> : null}
    </span>
  );
}

export function TextField({
  label,
  hint,
  className,
  ...props
}: React.ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <Label hint={hint}>{label}</Label>
      <input className={control} {...props} />
    </label>
  );
}

export function TextArea({
  label,
  hint,
  className,
  ...props
}: React.ComponentProps<"textarea"> & { label: string; hint?: string }) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <Label hint={hint}>{label}</Label>
      <textarea className={cn(control, "resize-y leading-relaxed")} {...props} />
    </label>
  );
}

export function IconField({
  label = "Icon",
  defaultValue,
  name = "icon",
}: {
  label?: string;
  defaultValue?: string | null;
  name?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <Label>{label}</Label>
      <select name={name} defaultValue={defaultValue ?? ""} className={control}>
        <option value="">— none —</option>
        {ICON_NAMES.map((icon) => (
          <option key={icon} value={icon}>
            {icon}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AccentField({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <label className="flex flex-col gap-2">
      <Label>Accent</Label>
      <select name="accent" defaultValue={defaultValue ?? ""} className={control}>
        <option value="">— default —</option>
        {["brass", "verdigris", "ember", "slate"].map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-brass-500"
      />
      <span className="text-sm text-basin-200">{label}</span>
    </label>
  );
}

/// Submit button that reflects the enclosing form's pending state.
export function SubmitButton({
  children = "Save",
  className,
  variant = "primary",
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "danger";
}) {
  const { pending } = useFormStatus();

  const styles = {
    primary:
      "bg-linear-to-b from-brass-300 to-brass-500 text-basin-950 hover:from-brass-200 hover:to-brass-400",
    ghost: "border border-basin-600 text-basin-200 hover:border-basin-400",
    danger: "border border-ember-500/40 text-ember-300 hover:bg-ember-500/10",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50",
        styles,
        className,
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function StatusMessage({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;

  return (
    <p
      role="status"
      className={cn(
        "rounded-lg px-3.5 py-2.5 text-sm",
        state.status === "success"
          ? "bg-verdigris-500/10 text-verdigris-300"
          : "bg-ember-500/10 text-ember-300",
      )}
    >
      {state.message}
    </p>
  );
}
