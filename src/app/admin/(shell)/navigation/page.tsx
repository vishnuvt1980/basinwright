import type { Metadata } from "next";

import { createNavItem, deleteNavItem, updateNavItem } from "@/app/admin/actions";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";
import { groupFooterNav } from "@/lib/content";

export const metadata: Metadata = { title: "Navigation" };
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors focus:border-accent focus:outline-none";

const addButtonClass =
  "inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-ink-2 transition-colors hover:border-accent/60 hover:text-accent";

const sectionClass = "rounded-2xl border border-line bg-surface/50 p-6";

const groupHeadingClass =
  "text-sm font-medium tracking-wide text-ink-2 uppercase";

type NavRow = { id: string; label: string; href: string };

function NavRowForm({ item }: { item: NavRow }) {
  return (
    <li className="flex items-center gap-2">
      <form action={updateNavItem} className="flex flex-1 items-center gap-2">
        <input type="hidden" name="id" value={item.id} />
        <input
          name="label"
          defaultValue={item.label}
          aria-label="Label"
          className={inputClass}
        />
        <input
          name="href"
          defaultValue={item.href}
          aria-label="Link"
          className={`${inputClass} font-mono text-xs`}
        />
        <button
          type="submit"
          className="shrink-0 rounded-full border border-line-strong px-4 py-2 text-xs text-ink-2 transition-colors hover:border-accent/60 hover:text-accent"
        >
          Save
        </button>
      </form>

      <form action={deleteNavItem}>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          aria-label={`Delete ${item.label}`}
          data-tone="ember"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-[color-mix(in_oklab,var(--tone)_12%,transparent)] hover:text-[var(--tone)]"
        >
          <Icon name="Trash" className="size-4" />
        </button>
      </form>
    </li>
  );
}

export default async function NavigationPage() {
  const [header, footer, legal] = await Promise.all([
    db.navItem.findMany({ where: { location: "header" }, orderBy: { order: "asc" } }),
    db.navItem.findMany({ where: { location: "footer" }, orderBy: { order: "asc" } }),
    db.navItem.findMany({ where: { location: "legal" }, orderBy: { order: "asc" } }),
  ]);

  const footerColumns = groupFooterNav(footer);

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-ink">Navigation</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-3">
          Header links, footer columns and the legal row. Edit a row and press Save. A
          link starting <span className="font-mono text-xs">https://</span> opens in a
          new tab and is marked as leaving the site — that is how the developer column
          points at the product.
        </p>
      </header>

      <section className={`mt-9 ${sectionClass}`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className={groupHeadingClass}>Header</h2>
          <form action={createNavItem}>
            <input type="hidden" name="location" value="header" />
            <button type="submit" className={addButtonClass}>
              <Icon name="Plus" className="size-4" />
              Add link
            </button>
          </form>
        </div>

        <ul className="flex flex-col gap-2">
          {header.map((item) => (
            <NavRowForm key={item.id} item={item} />
          ))}
        </ul>
      </section>

      {footerColumns.map((column) => (
        <section
          key={column.heading}
          className={`mt-6 ${sectionClass}`}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className={groupHeadingClass}>Footer · {column.heading}</h2>
            <form action={createNavItem}>
              <input type="hidden" name="location" value="footer" />
              <input type="hidden" name="group" value={column.heading} />
              <button type="submit" className={addButtonClass}>
                <Icon name="Plus" className="size-4" />
                Add link
              </button>
            </form>
          </div>

          <ul className="flex flex-col gap-2">
            {column.links.map((item) => (
              <NavRowForm key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ))}

      <section className={`mt-6 ${sectionClass}`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className={groupHeadingClass}>Legal row</h2>
          <form action={createNavItem}>
            <input type="hidden" name="location" value="legal" />
            <button type="submit" className={addButtonClass}>
              <Icon name="Plus" className="size-4" />
              Add link
            </button>
          </form>
        </div>

        <ul className="flex flex-col gap-2">
          {legal.map((item) => (
            <NavRowForm key={item.id} item={item} />
          ))}
        </ul>
      </section>
    </>
  );
}
