"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type ComponentProps,
  type MouseEvent,
} from "react";

/**
 * Fragment navigation for the one-page homepage: the click handler the nav
 * links use, and the scroll spy that keeps the URL and the active link honest
 * as you scroll past the sections by hand.
 *
 * The two have to talk to each other, which is why they share a module. A
 * click starts a long smooth scroll that crosses every section in between; the
 * spy has to hold its tongue until that scroll lands, or the address bar
 * flickers through four hashes on the way to the one you asked for.
 */

/// The hash a click is scrolling towards, and the point at which we stop
/// waiting for it. Module scope rather than context: there is one document,
/// and both the header and the footer put links into it.
let pending: { hash: string; expires: number } | null = null;

/// Roughly where the fixed header ends — a section counts as the one you are
/// reading once its top passes this line.
const HEADER_LINE = 96;

/// A smooth scroll the length of this page takes a while. If it never arrives
/// — the reader grabbed the scrollbar mid-flight, say — the spy takes over.
const SETTLE_MS = 2000;

/**
 * `next/link` treats a click on the URL you are already at as a no-op, so once
 * "/#products" is in the address bar the Products link stops working: scroll
 * down to Solutions, click Products again, and nothing moves. The hash has not
 * changed, so neither the router nor the browser fires a scroll.
 *
 * This hands back a click handler that does the scroll itself whenever the link
 * points at the page we are already on. `scrollIntoView()` is called bare —
 * behaviour is left to `scroll-behavior` on `html`, which globals.css already
 * turns off for readers who ask for reduced motion.
 */
export function useHashScroll() {
  const pathname = usePathname();

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      // Leave modified clicks — new tab, new window — to the browser.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const [path, hash] = href.split("#");
      if (!hash) return;
      // A bare "#contact" means this page; "/#products" only means this page
      // when we are on the homepage. Anywhere else, let the router route.
      if ((path || pathname) !== pathname) return;

      const target = document.getElementById(hash);
      if (!target) return;

      event.preventDefault();
      pending = { hash, expires: Date.now() + SETTLE_MS };
      if (window.location.hash !== `#${hash}`) {
        window.history.pushState(null, "", `#${hash}`);
      }
      // The mobile sheet locks body scroll while it is open, so let the close
      // land before scrolling — otherwise the scroll goes nowhere.
      requestAnimationFrame(() => target.scrollIntoView());
    },
    [pathname],
  );
}

/// `next/link` with the same-page fragment click handled. `href` has to be a
/// string for the hash to be read off it, which every link on the site is.
export function AnchorLink({
  href,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const onHashClick = useHashScroll();

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        onHashClick(event, href);
      }}
      {...props}
    />
  );
}

/// The section whose top has most recently passed the header line — the one
/// filling the screen you are reading. Order-independent, so the nav can be
/// reordered in /admin without having to match the order of the page.
function readActive(ids: string[]) {
  let active: string | null = null;
  let closest = -Infinity;
  let last: string | null = null;
  let lowest = -Infinity;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const { top } = el.getBoundingClientRect();

    if (top > lowest) {
      lowest = top;
      last = id;
    }
    if (top <= HEADER_LINE && top > closest) {
      closest = top;
      active = id;
    }
  }

  // The last section can be shorter than the run-out below it — the footer
  // alone is most of a screen — so its top never reaches the line and it would
  // never light up. Once the page has bottomed out, it is what you are reading.
  const bottomed =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;

  return bottomed && last ? last : active;
}

/**
 * Tracks which of `ids` is on screen and writes it to the address bar, so the
 * URL says where you are rather than where you last clicked. Returns the active
 * id for the nav to mark.
 *
 * `replaceState` rather than `pushState`: scrolling down the page should not
 * fill the back button with every section passed on the way.
 */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  // The array is rebuilt on every render — the nav arrives from the CMS as a
  // new list each time — so the effect keys off its contents, not its identity.
  const key = ids.join("|");

  useEffect(() => {
    const list = key.split("|").filter(Boolean);
    if (!list.length) return;

    let frame = 0;

    const read = () => {
      frame = 0;
      const current = readActive(list);
      setActive(current);

      // Hold the URL still until the scroll we are in flight towards lands.
      if (pending) {
        if (pending.hash !== current && Date.now() <= pending.expires) return;
        pending = null;
      }

      const hash = current ? `#${current}` : "";
      if (window.location.hash === hash) return;
      // An empty third argument would keep the current URL, hash and all, so
      // the way back up to the hero has to name the path it returns to.
      window.history.replaceState(
        null,
        "",
        hash || window.location.pathname + window.location.search,
      );
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(read);
    };

    // Someone arriving on /#pricing is mid-flight too: the browser's own jump
    // to the fragment can land after hydration, and a spy that read the page
    // first would see the top of it and strip the hash out from under them.
    const arriving = window.location.hash.slice(1);
    if (arriving && document.getElementById(arriving)) {
      pending = { hash: arriving, expires: Date.now() + SETTLE_MS };
    }

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return active;
}

/// The ids a spy should watch, given the nav it is marking: the fragment of
/// every link that points at somewhere on the page we are already on.
export function useSectionIds(hrefs: string[]) {
  const pathname = usePathname();

  return hrefs
    .filter((href) => {
      const [path, hash] = href.split("#");
      return Boolean(hash) && (path || pathname) === pathname;
    })
    .map((href) => href.split("#")[1]);
}
