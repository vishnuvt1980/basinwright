import Link from "next/link";

import { HairRule } from "@/components/ui/primitives";
import { getNav, getSettings, groupFooterNav } from "@/lib/content";

export async function SiteFooter() {
  const [settings, nav] = await Promise.all([getSettings(), getNav("footer")]);
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
            {columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h3 className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-3">
                  {column.heading}
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-2 transition-colors duration-300 hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <HairRule className="mt-16" />

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-ink-3 sm:flex-row">
          <p>{settings["footer.legal"]}</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-ink-2">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-ink-2">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-ink-2">
              Trust Centre
            </Link>
            <Link href="/admin" className="transition-colors hover:text-accent">
              CMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
