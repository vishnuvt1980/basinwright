"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { login, type LoginState } from "@/app/admin/auth-actions";
import { Button } from "@/components/ui/primitives";

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="panel flex flex-col gap-5 p-8">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-basin-400">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className="rounded-xl border border-basin-600/70 bg-basin-900/70 px-4 py-3 text-sm text-parchment-100 focus:border-brass-500/70 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-basin-400">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-xl border border-basin-600/70 bg-basin-900/70 px-4 py-3 text-sm text-parchment-100 focus:border-brass-500/70 focus:outline-none"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-ember-300" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 w-full py-3">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
