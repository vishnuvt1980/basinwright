import type { Metadata } from "next";
import { Check, Circle } from "lucide-react";

import { toggleLeadHandled } from "@/app/admin/actions";
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
        <h1 className="font-display text-3xl text-parchment-50">Leads</h1>
        <p className="mt-2 text-sm text-basin-400">
          Submissions from the &ldquo;Talk to an AI Architect&rdquo; form.
        </p>
      </header>

      {leads.length === 0 ? (
        <p className="mt-9 rounded-xl border border-dashed border-basin-700 px-5 py-14 text-center text-sm text-basin-500">
          No enquiries yet.
        </p>
      ) : (
        <ul className="mt-9 flex flex-col gap-3">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="rounded-xl border border-basin-700/70 bg-basin-900/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-parchment-100">
                    {lead.name}
                    {lead.company ? (
                      <span className="text-basin-400"> · {lead.company}</span>
                    ) : null}
                  </p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-sm text-brass-400 hover:text-brass-200"
                  >
                    {lead.email}
                  </a>
                  {lead.role ? (
                    <p className="mt-0.5 text-xs text-basin-500">{lead.role}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  <time
                    dateTime={lead.createdAt.toISOString()}
                    className="text-xs text-basin-500"
                  >
                    {formatter.format(lead.createdAt)}
                  </time>
                  <form action={toggleLeadHandled}>
                    <input type="hidden" name="id" value={lead.id} />
                    <button
                      type="submit"
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        lead.handled
                          ? "border-verdigris-500/50 text-verdigris-300"
                          : "border-basin-600 text-basin-400 hover:border-basin-400"
                      }`}
                    >
                      {lead.handled ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Circle className="size-3.5" />
                      )}
                      {lead.handled ? "Handled" : "Mark handled"}
                    </button>
                  </form>
                </div>
              </div>

              {lead.message ? (
                <p className="mt-4 border-t border-basin-800 pt-4 text-sm leading-relaxed whitespace-pre-wrap text-basin-300">
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
