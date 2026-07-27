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

  // The substrate is content-managed like any other section, but it is not a
  // block on the page — it is the hero's banner. Pull it out of the flow and
  // hand it to the hero, which draws it or tells the same story as plain text.
  const substrate =
    sections.find((s) => s.kind === "COGNITIVE_SUBSTRATE") ?? null;
  const blocks = sections.filter((s) => s.kind !== "COGNITIVE_SUBSTRATE");

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

      <main id="main">
        {blocks.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            substrate={substrate}
          />
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
