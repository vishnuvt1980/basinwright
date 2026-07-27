"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { submitLead, type LeadState } from "@/app/actions/leads";
import { Icon } from "@/components/icon";
import { Button, cn } from "@/components/ui/primitives";

const initialState: LeadState = { status: "idle" };

const fieldClass =
  "w-full rounded-xl border border-line-strong bg-surface/70 px-4 py-3 text-sm text-ink placeholder:text-ink-3 transition-colors focus:border-accent/70 focus:outline-none";

function Field({
  label,
  name,
  error,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.14em] text-ink-3">
        {label}
      </span>
      <input
        name={name}
        data-tone={error ? "ember" : undefined}
        className={cn(fieldClass, error && "border-[var(--tone)]")}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <span data-tone="ember" className="text-xs text-[var(--tone)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);

  if (state.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="panel flex flex-col items-center gap-4 p-12 text-center"
        role="status"
      >
        <span
          data-tone="green"
          className="inline-flex size-14 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--tone)_45%,transparent)] bg-[color-mix(in_oklab,var(--tone)_12%,transparent)] text-[var(--tone)]"
        >
          <Icon name="Check" className="size-7" />
        </span>
        <h3 className="font-display text-2xl text-ink">Request received</h3>
        <p className="max-w-sm text-sm leading-relaxed text-ink-2">
          {state.message}
        </p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="panel flex flex-col gap-5 p-8 sm:p-9">
      {/* Honeypot: visually and programmatically hidden from real users. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] size-0 opacity-0"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          name="name"
          required
          autoComplete="name"
          placeholder="Ada Whitfield"
          error={state.fieldErrors?.name}
        />
        <Field
          label="Work email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="ada@company.com"
          error={state.fieldErrors?.email}
        />
        <Field
          label="Organisation"
          name="company"
          autoComplete="organization"
          placeholder="Meridian Bank"
          error={state.fieldErrors?.company}
        />
        <Field
          label="Role"
          name="role"
          autoComplete="organization-title"
          placeholder="Head of AI Platform"
          error={state.fieldErrors?.role}
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-ink-3">
          What are you building?
        </span>
        <textarea
          name="message"
          rows={4}
          placeholder="We're consolidating three model vendors and need governed deployment across two regions…"
          className={cn(fieldClass, "resize-y")}
        />
      </label>

      {state.status === "error" && state.message ? (
        <p data-tone="ember" className="text-sm text-[var(--tone)]" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 w-full py-3.5">
        {pending ? (
          <>
            <Icon name="Spinner" className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Talk to an AI Architect"
        )}
      </Button>

      <p className="text-center text-xs text-ink-3">
        We reply within one business day. No sales sequences.
      </p>
    </form>
  );
}
