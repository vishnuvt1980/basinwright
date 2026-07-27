"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";

import { submitLead, type LeadState } from "@/app/actions/leads";
import { Button, cn } from "@/components/ui/primitives";

const initialState: LeadState = { status: "idle" };

const fieldClass =
  "w-full rounded-xl border border-basin-600/70 bg-basin-900/70 px-4 py-3 text-sm text-parchment-100 placeholder:text-basin-500 transition-colors focus:border-brass-500/70 focus:outline-none";

function Field({
  label,
  name,
  error,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.14em] text-basin-400">
        {label}
      </span>
      <input
        name={name}
        className={cn(fieldClass, error && "border-ember-400/70")}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="text-xs text-ember-300">{error}</span> : null}
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
        <span className="inline-flex size-14 items-center justify-center rounded-full border border-verdigris-500/50 bg-verdigris-500/10">
          <Check className="size-7 text-verdigris-300" strokeWidth={2} aria-hidden />
        </span>
        <h3 className="font-display text-2xl text-parchment-50">Request received</h3>
        <p className="max-w-sm text-sm leading-relaxed text-basin-300">
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
        <span className="text-xs uppercase tracking-[0.14em] text-basin-400">
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
        <p className="text-sm text-ember-300" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 w-full py-3.5">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          "Talk to an AI Architect"
        )}
      </Button>

      <p className="text-center text-xs text-basin-500">
        We reply within one business day. No sales sequences.
      </p>
    </form>
  );
}
