import type { Metadata } from "next";

import { toggleLeadHandled } from "@/app/admin/actions";
import { Icon } from "@/components/icon";
import { db } from "@/lib/db";
import {
  describeDemoConfig,
  parseDemoConfig,
  summariseDemoConfig,
} from "@/lib/demo-config";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function LeadsPage() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  // Validated on the way back out as well as on the way in: a row written by an
  // older catalogue should render as an enquiry without a console attached,
  // never as a half-resolved list of ids nobody can read.
  const rows = leads.map((lead) => ({
    lead,
    config: parseDemoConfig(lead.demoConfig),
  }));

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-ink">Leads</h1>
        <p className="mt-2 text-sm text-ink-3">
          Submissions from the &ldquo;Talk to an AI Architect&rdquo; form. Where
          the visitor configured the substrate console, what they asked it to be
          is attached below their message.
        </p>
      </header>

      {leads.length === 0 ? (
        <p className="mt-9 rounded-xl border border-dashed border-line px-5 py-14 text-center text-sm text-ink-3">
          No enquiries yet.
        </p>
      ) : (
        <ul className="mt-9 flex flex-col gap-3">
          {rows.map(({ lead, config }) => (
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
                  {config ? (
                    <p className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-accent/40 px-2 py-0.5 text-[0.7rem] text-accent">
                      <Icon name="SlidersHorizontal" className="size-3" />
                      {describeDemoConfig(config)}
                    </p>
                  ) : null}
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

              {config ? (
                <section className="mt-4 rounded-lg border border-line bg-raised/50 p-4">
                  <h2 className="font-mono text-[0.65rem] tracking-[0.12em] text-ink-3 uppercase">
                    Console they configured
                  </h2>
                  <dl className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    {summariseDemoConfig(config).map((row) => (
                      <div key={row.label} className="contents">
                        <dt className="text-xs text-ink-3">{row.label}</dt>
                        <dd className="mb-2 text-xs leading-relaxed text-ink-2 sm:mb-0">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
