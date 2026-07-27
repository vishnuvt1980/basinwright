import type { Metadata } from "next";
import { Plus, Trash2 } from "lucide-react";

import { createNavItem, deleteNavItem, updateNavItem } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { groupFooterNav } from "@/lib/content";

export const metadata: Metadata = { title: "Navigation" };
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-lg border border-basin-600/70 bg-basin-900/70 px-3 py-2 text-sm text-parchment-100 focus:border-brass-500/70 focus:outline-none";

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
          className="shrink-0 rounded-full border border-basin-600 px-4 py-2 text-xs text-basin-200 transition-colors hover:border-brass-600/60 hover:text-brass-200"
        >
          Save
        </button>
      </form>

      <form action={deleteNavItem}>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          aria-label={`Delete ${item.label}`}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-basin-500 transition-colors hover:bg-ember-500/10 hover:text-ember-300"
        >
          <Trash2 className="size-4" />
        </button>
      </form>
    </li>
  );
}

export default async function NavigationPage() {
  const [header, footer] = await Promise.all([
    db.navItem.findMany({ where: { location: "header" }, orderBy: { order: "asc" } }),
    db.navItem.findMany({ where: { location: "footer" }, orderBy: { order: "asc" } }),
  ]);

  const footerColumns = groupFooterNav(footer);

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-parchment-50">Navigation</h1>
        <p className="mt-2 text-sm text-basin-400">
          Header links and footer columns. Edit a row and press Save.
        </p>
      </header>

      <section className="mt-9 rounded-2xl border border-basin-700/70 bg-basin-900/50 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium tracking-wide text-basin-300 uppercase">
            Header
          </h2>
          <form action={createNavItem}>
            <input type="hidden" name="location" value="header" />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-basin-600 px-4 py-2 text-sm text-basin-200 transition-colors hover:border-brass-600/60"
            >
              <Plus className="size-4" />
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
          className="mt-6 rounded-2xl border border-basin-700/70 bg-basin-900/50 p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium tracking-wide text-basin-300 uppercase">
              Footer · {column.heading}
            </h2>
            <form action={createNavItem}>
              <input type="hidden" name="location" value="footer" />
              <input type="hidden" name="group" value={column.heading} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-basin-600 px-4 py-2 text-sm text-basin-200 transition-colors hover:border-brass-600/60"
              >
                <Plus className="size-4" />
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
    </>
  );
}
