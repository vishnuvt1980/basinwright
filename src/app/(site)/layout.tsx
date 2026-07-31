import { ChatWidget } from "@/components/chat/chat-widget";
import { CookieConsent } from "@/components/site/cookie-consent";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getNav, getSettings } from "@/lib/content";

// Everything on the public site is content-managed, so pages render per
// request and are revalidated on save rather than frozen at build time. Set on
// the layout so it covers the homepage, the CMS pages and the library alike.
export const dynamic = "force-dynamic";

/// The public site's chrome. `/admin` sits outside this group and gets none of it.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, headerNav] = await Promise.all([getSettings(), getNav("header")]);

  const suggestions = (settings["chat.suggestions"] ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-sm focus:text-[var(--bw-on-accent)]"
      >
        Skip to content
      </a>

      <SiteHeader
        name={settings["site.name"] ?? "BasinWright"}
        links={headerNav.map(({ id, label, href }) => ({ id, label, href }))}
      />

      <main id="main" className="flex-1">
        {children}
      </main>

      <SiteFooter />

      <ChatWidget
        title={settings["chat.title"] ?? "BasinWright Architect"}
        greeting={settings["chat.greeting"] ?? "How can I help?"}
        suggestions={suggestions}
      />

      {/* Last in the tree and above the chat launcher: on a first visit it is
          the one thing on the page that has to be answered. */}
      <CookieConsent />
    </>
  );
}
