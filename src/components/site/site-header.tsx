"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";

import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink, cn } from "@/components/ui/primitives";

type NavLink = { id: string; label: string; href: string };

function Wordmark({ name }: { name: string }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${name} home`}>
      {/* Compass rose reduced to its essential geometry. */}
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <circle
          cx="16" cy="16" r="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-accent/70 transition-colors duration-500 group-hover:text-accent"
        />
        <circle
          cx="16" cy="16" r="8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          className="text-accent/40"
        />
        <path
          d="M16 3.5 L18.6 13.4 L16 16 L13.4 13.4 Z M16 28.5 L13.4 18.6 L16 16 L18.6 18.6 Z"
          className="fill-accent"
        />
        <path
          d="M3.5 16 L13.4 13.4 L16 16 L13.4 18.6 Z M28.5 16 L18.6 18.6 L16 16 L18.6 13.4 Z"
          className="fill-accent/60"
        />
      </svg>
      <span className="font-display text-lg tracking-tight text-ink">{name}</span>
    </Link>
  );
}

export function SiteHeader({ name, links }: { name: string; links: NavLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="group relative rounded-full px-4 py-2 text-sm text-ink-2 transition-colors duration-300 hover:text-ink"
            >
              {link.label}
              <span
                className="absolute inset-x-4 bottom-1 h-px scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />

          <ButtonLink
            href="#contact"
            variant="secondary"
            className="hidden px-5 py-2.5 text-sm lg:inline-flex"
          >
            Talk to an Architect
          </ButtonLink>
          <ButtonLink href="#contact" className="hidden px-5 py-2.5 text-sm sm:inline-flex">
            Start Building
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
              {links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-ink-2 transition-colors hover:bg-raised hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-4 flex flex-col gap-2.5">
                <ButtonLink href="#contact" onClick={() => setOpen(false)}>
                  Start Building
                </ButtonLink>
                <ButtonLink
                  href="#contact"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Talk to an AI Architect
                </ButtonLink>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                <span className="text-sm text-ink-3">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
