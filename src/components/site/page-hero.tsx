import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/icon";
import { Reveal } from "@/components/ui/reveal";

/// One step above the current page. Deeper trails are not worth the row.
export type Crumb = { label: string; href: string };

/**
 * The banner every page below the homepage opens with.
 *
 * Deliberately quiet — no canvas, no gradient. The homepage hero carries the
 * simulation; everything else is a document and should look like one.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  crumb,
  children,
}: {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  crumb?: Crumb;
  /// Filters, metadata rows — anything that belongs under the subtitle.
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line pt-32 pb-14 sm:pt-40 sm:pb-16">
      <div className="container-bw">
        <Reveal>
          {crumb ? (
            <Link
              href={crumb.href}
              className="group inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-accent"
            >
              <Icon
                name="ArrowLeft"
                className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
              />
              {crumb.label}
            </Link>
          ) : eyebrow ? (
            <span className="text-[0.9375rem] font-semibold text-accent">{eyebrow}</span>
          ) : null}

          <h1 className="mt-4 max-w-4xl font-display text-[2.25rem] leading-[1.1] text-balance text-ink sm:text-[3rem]">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-ink-2">
              {subtitle}
            </p>
          ) : null}

          {children}
        </Reveal>
      </div>
    </section>
  );
}
