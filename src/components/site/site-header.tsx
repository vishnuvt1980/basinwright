"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";

import { Icon } from "@/components/icon";
import {
  useHashScroll,
  useScrollSpy,
  useSectionIds,
} from "@/components/site/hash-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink, cn } from "@/components/ui/primitives";
import { GraphicsToggle } from "@/components/webgl/graphics-toggle";

type NavLink = { id: string; label: string; href: string };

/// Where the mark's three lit dots sit on Fluent's Grid Dots lattice. Read in
/// order they trace a check mark — the "Wright" in the name — and in colour they
/// run the substrate's own sequence: governed, proven, yours.
const LIT = [
  { x: 5, y: 12, className: "mark-compute", label: "Compute" },
  { x: 12, y: 19, className: "mark-data", label: "Data" },
  { x: 19, y: 5, className: "mark-intelligence", label: "Intelligence" },
];

/// The other six. Fluent's regular weight against the lit dots' filled weight,
/// so the three lead the lattice without being made outsized.
const UNLIT = [
  [5, 5],
  [12, 5],
  [12, 12],
  [19, 12],
  [5, 19],
  [19, 19],
];

function Wordmark({ name }: { name: string }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${name} home`}>
      {/* Fluent's Grid Dots with three of the nine lit. The estate is the
          lattice; what we resolve out of it is the check drawn through it.
          See the mark block in globals.css for the full reading. */}
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
        <g className="mark-grid opacity-70 transition-opacity duration-500 group-hover:opacity-100">
          {UNLIT.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />
          ))}
        </g>
        {LIT.map((dot) => (
          <circle
            key={dot.label}
            cx={dot.x}
            cy={dot.y}
            r="2"
            className={dot.className}
          />
        ))}
      </svg>
      <span className="font-display text-lg tracking-tight text-ink">{name}</span>
    </Link>
  );
}

export function SiteHeader({ name, links }: { name: string; links: NavLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const onHashClick = useHashScroll();

  // Which section the reader is in, for the nav to mark and the address bar to
  // follow. Only the links that point at somewhere on this page are watched,
  // so on /resources the spy sits out and nothing is marked.
  const active = useScrollSpy(useSectionIds(links.map((link) => link.href)));
  const isActive = (href: string) =>
    Boolean(active) && href.split("#")[1] === active;

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-line bg-canvas/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="container-bw flex h-[4.5rem] items-center justify-between gap-6">
        <Wordmark name={name} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => {
            const current = isActive(link.href);

            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={(event) => onHashClick(event, link.href)}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "group relative rounded-full px-4 py-2 text-sm transition-colors duration-300 hover:text-ink",
                  current ? "text-ink" : "text-ink-2",
                )}
              >
                {link.label}
                {/* The hover underline, held open for the section you are in. */}
                <span
                  className={cn(
                    "absolute inset-x-4 bottom-1 h-px bg-accent transition-transform duration-300 group-hover:scale-x-100",
                    current ? "scale-x-100" : "scale-x-0",
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* Below `lg` the sheet carries the theme control and both calls to
              action, so the bar keeps only the mark and the menu. `max-*:hidden`
              rather than `hidden lg:inline-flex`: a plain `hidden` loses the
              cascade to the `inline-flex` in the button base, which is what put
              two wrapped buttons and a squashed menu in a 375px bar. */}
          <GraphicsToggle variant="compact" className="max-lg:hidden" />
          <ThemeToggle className="max-lg:hidden" />

          <ButtonLink
            href="/industries"
            variant="secondary"
            className="px-5 py-2.5 text-sm max-lg:hidden"
          >
            Industry solutions
          </ButtonLink>
          {/* "Start Building" was aimed at a developer signing up for an API.
              The reader this site is now written for is deciding whether to
              take a meeting, so the primary action is the meeting. */}
          <ButtonLink
            href="#contact"
            onClick={(event) => onHashClick(event, "#contact")}
            className="px-5 py-2.5 text-sm max-lg:hidden"
          >
            Book a session
          </ButtonLink>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong text-ink lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <Icon name={open ? "Dismiss" : "Menu"} className="size-5" />
          </button>
        </div>
      </div>

      {/* Scroll progress rail */}
      <motion.div
        className="h-px origin-left bg-linear-to-r from-accent/40 via-accent to-accent/40"
        style={{ scaleX: progress }}
        aria-hidden
      />

      <AnimatePresence>
        {open ? (
          <motion.nav
            key="mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="border-b border-line bg-canvas/97 backdrop-blur-xl lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-bw flex flex-col gap-1 py-6">
              {links.map((link) => {
                const current = isActive(link.href);

                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={(event) => {
                      setOpen(false);
                      onHashClick(event, link.href);
                    }}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-3 text-base transition-colors hover:bg-raised hover:text-ink",
                      current ? "bg-raised text-accent" : "text-ink-2",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-4 flex flex-col gap-2.5">
                <ButtonLink
                  href="#contact"
                  onClick={(event) => {
                    setOpen(false);
                    onHashClick(event, "#contact");
                  }}
                >
                  Book a session
                </ButtonLink>
                <ButtonLink
                  href="#contact"
                  variant="secondary"
                  onClick={(event) => {
                    setOpen(false);
                    onHashClick(event, "#contact");
                  }}
                >
                  Talk to an architect
                </ButtonLink>
              </div>

              <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-3">Theme</span>
                  <ThemeToggle />
                </div>

                {/* Labelled by its own text, so it takes the row on its own. */}
                <GraphicsToggle className="self-start" />
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
