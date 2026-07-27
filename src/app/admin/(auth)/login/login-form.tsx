"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/admin/auth-actions";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/primitives";

const control =
  "rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink transition-colors focus:border-accent focus:outline-none";

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="panel flex flex-col gap-5 p-8">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-ink-3">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className={control}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-ink-3">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={control}
        />
      </label>

      {state.error ? (
        <p data-tone="ember" className="text-sm text-[var(--tone)]" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 w-full py-3">
        {pending ? (
          <>
            <Icon name="Spinner" className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
