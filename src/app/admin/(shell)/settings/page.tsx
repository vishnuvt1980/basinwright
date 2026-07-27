import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings-form";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Site settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await db.siteSetting.findMany({
    orderBy: [{ group: "asc" }, { order: "asc" }],
  });

  const groups = new Map<string, typeof settings>();
  for (const setting of settings) {
    if (!groups.has(setting.group)) groups.set(setting.group, []);
    groups.get(setting.group)!.push(setting);
  }

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-ink">Site settings</h1>
        <p className="mt-2 text-sm text-ink-3">
          Brand strings, footer copy, contact details and the chat assistant&rsquo;s
          persona.
        </p>
      </header>

      <SettingsForm groups={[...groups.entries()]} />
    </>
  );
}
