import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { ArrowRight } from "lucide-react";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/* Section chrome                                                             */
/* -------------------------------------------------------------------------- */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-brass-400">
      <span className="h-px w-7 bg-brass-500/70" />
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
      {title ? (
        <h2 className="max-w-3xl text-balance font-display text-4xl leading-[1.1] text-parchment-50 sm:text-5xl lg:text-[3.4rem]">
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-basin-300 sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

const buttonBase =
  "group relative inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary:
    "bg-linear-to-b from-brass-300 to-brass-500 px-6 py-3 text-basin-950 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_10px_30px_-12px_rgba(201,162,39,0.8)] hover:from-brass-200 hover:to-brass-400 hover:shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_16px_40px_-12px_rgba(201,162,39,0.95)]",
  secondary:
    "border border-basin-600 bg-basin-850/60 px-6 py-3 text-parchment-100 backdrop-blur-sm hover:border-brass-600/70 hover:bg-basin-800/80 hover:text-brass-200",
  ghost:
    "px-4 py-2 text-basin-300 hover:text-brass-300",
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
        <ArrowRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Accents                                                                    */
/* -------------------------------------------------------------------------- */

export const ACCENTS = {
  brass: {
    text: "text-brass-400",
    ring: "group-hover:border-brass-500/50",
    glow: "group-hover:shadow-[0_24px_70px_-40px_rgba(201,162,39,0.9)]",
    chip: "bg-brass-500/12 text-brass-300 border-brass-600/40",
    bar: "from-brass-400/80",
  },
  verdigris: {
    text: "text-verdigris-300",
    ring: "group-hover:border-verdigris-500/50",
    glow: "group-hover:shadow-[0_24px_70px_-40px_rgba(63,125,114,0.95)]",
    chip: "bg-verdigris-500/12 text-verdigris-300 border-verdigris-500/40",
    bar: "from-verdigris-400/80",
  },
  ember: {
    text: "text-ember-300",
    ring: "group-hover:border-ember-500/50",
    glow: "group-hover:shadow-[0_24px_70px_-40px_rgba(184,115,51,0.95)]",
    chip: "bg-ember-500/12 text-ember-300 border-ember-500/40",
    bar: "from-ember-400/80",
  },
  slate: {
    text: "text-basin-300",
    ring: "group-hover:border-basin-400/60",
    glow: "group-hover:shadow-[0_24px_70px_-40px_rgba(148,156,168,0.6)]",
    chip: "bg-basin-500/15 text-basin-300 border-basin-500/50",
    bar: "from-basin-300/70",
  },
} as const;

export type AccentName = keyof typeof ACCENTS;

export function accent(name?: string | null): (typeof ACCENTS)[AccentName] {
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
        "inline-flex items-center rounded-full border border-basin-600/70 bg-basin-800/60 px-3 py-1 text-xs text-basin-300 transition-colors",
        className,
      )}
    >
      {children}
    </span>
  );
}
