import type { Metadata } from "next";

import { toggleLeadHandled } from "@/app/admin/actions";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function LeadsPage() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-ink">Leads</h1>
        <p className="mt-2 text-sm text-ink-3">
          Submissions from the &ldquo;Talk to an AI Architect&rdquo; form.
        </p>
      </header>

      {leads.length === 0 ? (
        <p className="mt-9 rounded-xl border border-dashed border-line px-5 py-14 text-center text-sm text-ink-3">
          No enquiries yet.
        </p>
      ) : (
        <ul className="mt-9 flex flex-col gap-3">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="rounded-xl border border-line bg-surface/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {lead.name}
                    {lead.company ? (
                      <span className="text-ink-3"> · {lead.company}</span>
                    ) : null}
                  </p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-sm text-accent transition-colors hover:text-accent-strong"
                  >
                    {lead.email}
                  </a>
                  {lead.role ? (
                    <p className="mt-0.5 text-xs text-ink-3">{lead.role}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  <time
                    dateTime={lead.createdAt.toISOString()}
                    className="text-xs text-ink-3"
                  >
                    {formatter.format(lead.createdAt)}
                  </time>
                  <form action={toggleLeadHandled}>
                    <input type="hidden" name="id" value={lead.id} />
                    <button
                      type="submit"
                      data-tone="green"
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        lead.handled
                          ? "border-[color-mix(in_oklab,var(--tone)_50%,transparent)] text-[var(--tone)]"
                          : "border-line-strong text-ink-3 hover:border-accent/60 hover:text-ink"
                      }`}
                    >
                      {lead.handled ? (
                        <Icon name="Check" className="size-3.5" />
                      ) : (
                        <Icon name="Circle" className="size-3.5" />
                      )}
                      {lead.handled ? "Handled" : "Mark handled"}
                    </button>
                  </form>
                </div>
              </div>

              {lead.message ? (
                <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
                  {lead.message}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
