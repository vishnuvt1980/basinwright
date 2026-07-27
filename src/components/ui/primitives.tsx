import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/* Section chrome                                                             */
/* -------------------------------------------------------------------------- */

/// Microsoft labels a section with plain semibold text in the link blue — no
/// wide-tracked uppercase, no leading hairline. Both of those read as template.
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center text-[0.9375rem] font-semibold text-accent">
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {/* microsoft.com sets its section headings at 40px/48px — nowhere near
          the 3.4rem the old display serif ran at. */}
      {title ? (
        <h2 className="max-w-3xl font-display text-[2rem] leading-[1.2] text-balance text-ink sm:text-[2.5rem]">
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className="max-w-2xl text-base leading-6 text-pretty text-ink-2 sm:text-lg sm:leading-7">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

// Fluent buttons: a flat fill, 8px corner, semibold 15px label, and nothing
// else — no gradient, no inset highlight, no coloured glow.
const buttonBase =
  "group relative inline-flex items-center justify-center gap-2 rounded-lg text-[0.9375rem] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary:
    "bg-accent px-4 py-2.5 text-on-accent hover:bg-accent-strong",
  secondary:
    "border border-ink bg-transparent px-4 py-2.5 text-ink hover:bg-raised",
  ghost: "px-3 py-2 text-accent hover:underline",
} as const;

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return (
    <button className={cn(buttonBase, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  withArrow = false,
  href,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  withArrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(buttonBase, variants[variant], className)}
      {...props}
    >
      {children}
      {withArrow ? (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover:translate-x-1"
        >
          <path d="M13.47 4.22a.75.75 0 0 0 0 1.06l5.97 5.97H3.75a.75.75 0 0 0 0 1.5h15.69l-5.97 5.97a.75.75 0 1 0 1.06 1.06l7.25-7.25a.75.75 0 0 0 0-1.06l-7.25-7.25a.75.75 0 0 0-1.06 0Z" />
        </svg>
      ) : null}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Accents                                                                    */
/* -------------------------------------------------------------------------- */

/// Accent classes used by cards that carry a CMS `accent` value. Colours come
/// from the tone variables so they flip with the theme.
export const ACCENTS = {
  brass: { tone: "brass", text: "text-accent" },
  verdigris: { tone: "teal", text: "text-[var(--tone)]" },
  ember: { tone: "amber", text: "text-[var(--tone)]" },
  slate: { tone: "azure", text: "text-[var(--tone)]" },
} as const;

export type AccentName = keyof typeof ACCENTS;

export function accent(name?: string | null) {
  return ACCENTS[(name as AccentName) ?? "brass"] ?? ACCENTS.brass;
}

/* -------------------------------------------------------------------------- */
/* Decorative                                                                  */
/* -------------------------------------------------------------------------- */

export function HairRule({ className }: { className?: string }) {
  return <div className={cn("rule-fade h-px w-full", className)} aria-hidden />;
}

export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-line bg-raised px-3 py-1 text-xs text-ink-2 transition-colors",
        className,
      )}
    >
      {children}
    </span>
  );
}
