"use client";

import { useFormStatus } from "react-dom";

import { Icon, ICON_NAMES } from "@/components/icon";
import { cn } from "@/components/ui/primitives";
import type { ActionState } from "@/app/admin/actions";

const control =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 transition-colors focus:border-accent focus:outline-none";

export function Label({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span className="text-xs uppercase tracking-[0.14em] text-ink-3">
        {children}
      </span>
      {hint ? <span className="text-[0.7rem] text-ink-3">{hint}</span> : null}
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
        className="size-4 accent-[var(--bw-accent)]"
      />
      <span className="text-sm text-ink-2">{label}</span>
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
    primary: "bg-accent text-on-accent hover:bg-accent-strong",
    ghost: "border border-line-strong text-ink-2 hover:border-ink hover:text-ink",
    danger:
      "border border-[color-mix(in_oklab,var(--tone)_40%,transparent)] text-[var(--tone)] hover:bg-[color-mix(in_oklab,var(--tone)_12%,transparent)]",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      data-tone={variant === "danger" ? "ember" : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50",
        styles,
        className,
      )}
    >
      {pending ? <Icon name="Spinner" className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function StatusMessage({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;

  return (
    <p
      role="status"
      data-tone={state.status === "success" ? "green" : "ember"}
      className={cn(
        "rounded-lg px-3.5 py-2.5 text-sm text-[var(--tone)]",
        "bg-[color-mix(in_oklab,var(--tone)_12%,transparent)]",
      )}
    >
      {state.message}
    </p>
  );
}
