import Link from "next/link";
import { ExternalLink, Inbox, LayoutList, LogOut, MessageSquare, Settings, SlidersHorizontal } from "lucide-react";

import { logout } from "@/app/admin/auth-actions";
import { requireUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Sections", icon: LayoutList },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
  { href: "/admin/navigation", label: "Navigation", icon: SlidersHorizontal },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/chats", label: "Conversations", icon: MessageSquare },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pages re-verify independently of proxy — see actions.ts for the same reason.
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-basin-800 bg-basin-900/60 lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-basin-800 px-6">
          <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-brass-600" />
            <path d="M16 3.5 L18.6 13.4 L16 16 L13.4 13.4 Z M16 28.5 L13.4 18.6 L16 16 L18.6 18.6 Z" className="fill-brass-400" />
            <path d="M3.5 16 L13.4 13.4 L16 16 L13.4 18.6 Z M28.5 16 L18.6 18.6 L16 16 L18.6 13.4 Z" className="fill-brass-600" />
          </svg>
          <span className="font-display text-base text-parchment-50">CMS</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon: Glyph }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-basin-300 transition-colors hover:bg-basin-800 hover:text-parchment-50"
            >
              <Glyph className="size-4" strokeWidth={1.6} aria-hidden />
              {label}
            </Link>
          ))}

          <Link
            href="/"
            target="_blank"
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-basin-400 transition-colors hover:bg-basin-800 hover:text-brass-300"
          >
            <ExternalLink className="size-4" strokeWidth={1.6} aria-hidden />
            View site
          </Link>
        </nav>

        <div className="border-t border-basin-800 p-3">
          <div className="px-3 py-2">
            <p className="truncate text-sm text-parchment-100">{user.name}</p>
            <p className="truncate text-xs text-basin-500">{user.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-basin-400 transition-colors hover:bg-basin-800 hover:text-ember-300"
            >
              <LogOut className="size-4" strokeWidth={1.6} aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile nav */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-basin-800 bg-basin-900/60 p-2 lg:hidden">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-basin-300 hover:bg-basin-800"
            >
              {label}
            </Link>
          ))}
          <form action={logout} className="shrink-0">
            <button type="submit" className="rounded-lg px-3 py-2 text-sm text-ember-300">
              Sign out
            </button>
          </form>
        </div>

        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
