import Link from "next/link";

import { logout } from "@/app/admin/auth-actions";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { requireUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Homepage", icon: "LayoutList" },
  { href: "/admin/pages", label: "Pages", icon: "FileText" },
  { href: "/admin/library", label: "Library", icon: "Library" },
  { href: "/admin/settings", label: "Site settings", icon: "Settings" },
  { href: "/admin/navigation", label: "Navigation", icon: "SlidersHorizontal" },
  { href: "/admin/leads", label: "Leads", icon: "Inbox" },
  { href: "/admin/chats", label: "Conversations", icon: "MessageSquare" },
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
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface/60 lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-6">
          <svg viewBox="0 0 32 32" className="size-6 text-accent" aria-hidden>
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M16 3.5 L18.6 13.4 L16 16 L13.4 13.4 Z M16 28.5 L13.4 18.6 L16 16 L18.6 18.6 Z" className="fill-accent-strong" />
            <path d="M3.5 16 L13.4 13.4 L16 16 L13.4 18.6 Z M28.5 16 L18.6 18.6 L16 16 L18.6 13.4 Z" className="fill-accent" />
          </svg>
          <span className="font-display text-base text-ink">CMS</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-2 transition-colors hover:bg-raised hover:text-ink"
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          ))}

          <Link
            href="/"
            target="_blank"
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-3 transition-colors hover:bg-raised hover:text-accent"
          >
            <Icon name="ExternalLink" className="size-4" />
            View site
          </Link>
        </nav>

        <div className="border-t border-line p-3">
          <div className="px-3 py-2">
            <p className="truncate text-sm text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>

          <div className="px-3 pb-2">
            <ThemeToggle />
          </div>

          <form action={logout}>
            <button
              type="submit"
              data-tone="ember"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-3 transition-colors hover:bg-raised hover:text-[var(--tone)]"
            >
              <Icon name="LogOut" className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile nav */}
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-line bg-surface/60 p-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-raised hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <form action={logout} className="shrink-0">
            <button
              type="submit"
              data-tone="ember"
              className="rounded-lg px-3 py-2 text-sm text-[var(--tone)]"
            >
              Sign out
            </button>
          </form>
          <ThemeToggle className="ml-auto shrink-0" />
        </div>

        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
