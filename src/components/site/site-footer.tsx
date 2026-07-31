import Link from "next/link";

import { Icon } from "@/components/icon";
import { CookiePreferencesLink } from "@/components/site/cookie-consent";
import { AnchorLink } from "@/components/site/hash-nav";
import { HairRule, cn } from "@/components/ui/primitives";
import { getNav, getSettings, groupFooterNav, isExternalHref } from "@/lib/content";

/// How many tracks the link columns run in. The column count is content-managed
/// — adding a footer group in /admin is a content edit — so the grid follows it
/// rather than staying pinned at the four the footer happened to ship with.
const TRACKS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-6",
};

/// A footer link. Anything absolute — the developer portal, the status page —
/// opens in a new tab and says so, rather than being routed by `next/link`,
/// which would try to prefetch it.
function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "group inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors duration-300 hover:text-accent";

  if (!isExternalHref(href)) {
    return (
      <AnchorLink href={href} className={className}>
        {label}
      </AnchorLink>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
      {label}
      <Icon
        name="ExternalLink"
        className="size-3 text-ink-3 transition-colors group-hover:text-accent"
      />
    </a>
  );
}

export async function SiteFooter() {
  const [settings, nav, legal] = await Promise.all([
    getSettings(),
    getNav("footer"),
    getNav("legal"),
  ]);
  const columns = groupFooterNav(nav);

  return (
    <footer className="grain relative border-t border-line bg-canvas pt-20 pb-10">
      <div className="topo pointer-events-none absolute inset-0 opacity-20" aria-hidden />

      <div className="container-bw relative">
        <div className="grid gap-14 lg:grid-cols-[1fr_2.6fr] lg:gap-20">
          <div>
            <h2 className="max-w-sm text-balance font-display text-3xl leading-tight text-ink">
              {settings["footer.tagline"]}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-2">
              {settings["footer.subline"]}
            </p>
            {settings["contact.email"] ? (
              <a
                href={`mailto:${settings["contact.email"]}`}
                className="mt-7 inline-block text-sm text-accent transition-colors hover:text-accent-strong"
              >
                {settings["contact.email"]}
              </a>
            ) : null}
          </div>

          <div
            className={cn(
              "grid grid-cols-2 gap-8",
              TRACKS[columns.length] ?? "sm:grid-cols-3 lg:grid-cols-4",
            )}
          >
            {columns.map((column) => {
              // A column may carry a note — the Developers column says that
              // documentation needs a subscription. Looked up by heading, so
              // renaming a column in /admin renames the setting it reads.
              const note = settings[`footer.note.${column.heading}`];

              return (
                <nav key={column.heading} aria-label={column.heading}>
                  <h3 className="text-[0.7rem] tracking-[0.18em] text-ink-3 uppercase">
                    {column.heading}
                  </h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {column.links.map((link) => (
                      <li key={link.id}>
                        <FooterLink href={link.href} label={link.label} />
                      </li>
                    ))}
                  </ul>
                  {note ? (
                    <p className="mt-5 max-w-[16rem] text-xs leading-relaxed text-ink-3">
                      {note}
                    </p>
                  ) : null}
                </nav>
              );
            })}
          </div>
        </div>

        <HairRule className="mt-16" />

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-ink-3 sm:flex-row">
          <p>{settings["footer.legal"]}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {legal.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="transition-colors hover:text-ink-2"
              >
                {item.label}
              </Link>
            ))}
            {/* A stored consent decision has to be changeable, or it was never
                a decision. This is the way back into the banner. */}
            <CookiePreferencesLink className="cursor-pointer transition-colors hover:text-ink-2" />
            <Link href="/admin" className="transition-colors hover:text-accent">
              CMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
