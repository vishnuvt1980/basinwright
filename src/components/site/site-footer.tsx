import Link from "next/link";

import { Icon } from "@/components/icon";
import { HairRule } from "@/components/ui/primitives";
import { getNav, getSettings, groupFooterNav, isExternalHref } from "@/lib/content";

/// A footer link. Anything absolute — the developer portal, the status page —
/// opens in a new tab and says so, rather than being routed by `next/link`,
/// which would try to prefetch it.
function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "group inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors duration-300 hover:text-accent";

  if (!isExternalHref(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
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
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr] lg:gap-20">
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

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
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
            <Link href="/admin" className="transition-colors hover:text-accent">
              CMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
