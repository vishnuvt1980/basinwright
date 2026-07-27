import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="grain flex min-h-screen items-center justify-center px-6 py-16">
      <div className="topo pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="relative w-full max-w-sm">
        <div className="mb-9 flex flex-col items-center gap-3 text-center">
          <svg viewBox="0 0 32 32" className="size-9 text-accent" aria-hidden>
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="16" cy="16" r="8.5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.6" />
            <path d="M16 3.5 L18.6 13.4 L16 16 L13.4 13.4 Z M16 28.5 L13.4 18.6 L16 16 L18.6 18.6 Z" className="fill-accent-strong" />
            <path d="M3.5 16 L13.4 13.4 L16 16 L13.4 18.6 Z M28.5 16 L18.6 18.6 L16 16 L18.6 13.4 Z" className="fill-accent" />
          </svg>
          <h1 className="font-display text-2xl text-ink">BasinWright CMS</h1>
          <p className="text-sm text-ink-3">Sign in to manage site content.</p>
        </div>

        <LoginForm next={next} />
      </div>
    </main>
  );
}
