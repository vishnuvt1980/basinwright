import { ChatWidget } from "@/components/chat/chat-widget";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getNav, getSections, getSettings } from "@/lib/content";

// Content is edited through /admin, so the page renders per request and is
// revalidated on save rather than frozen at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sections, settings, headerNav] = await Promise.all([
    getSections(),
    getSettings(),
    getNav("header"),
  ]);

  const suggestions = (settings["chat.suggestions"] ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-brass-400 focus:px-5 focus:py-2.5 focus:text-sm focus:text-basin-950"
      >
        Skip to content
      </a>

      <SiteHeader
        name={settings["site.name"] ?? "BasinWright"}
        links={headerNav.map(({ id, label, href }) => ({ id, label, href }))}
      />

      <main id="main">
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>

      <SiteFooter />

      <ChatWidget
        title={settings["chat.title"] ?? "BasinWright Architect"}
        greeting={settings["chat.greeting"] ?? "How can I help?"}
        suggestions={suggestions}
      />
    </>
  );
}
