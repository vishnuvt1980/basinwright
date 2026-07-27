"use client";

import { useActionState } from "react";
import type { SiteSetting } from "@prisma/client";

import { updateSettings, type ActionState } from "@/app/admin/actions";
import {
  StatusMessage,
  SubmitButton,
  TextArea,
  TextField,
} from "@/components/admin/fields";

const initialState: ActionState = { status: "idle" };

export function SettingsForm({
  groups,
}: {
  groups: [string, SiteSetting[]][];
}) {
  const [state, formAction] = useActionState(updateSettings, initialState);

  return (
    <form action={formAction} className="mt-9 flex flex-col gap-6">
      {groups.map(([group, settings]) => (
        <section
          key={group}
          className="rounded-2xl border border-line bg-surface/50 p-6"
        >
          <h2 className="mb-6 text-sm font-medium tracking-wide text-ink-2 uppercase">
            {group}
          </h2>

          <div className="flex flex-col gap-5">
            {settings.map((setting) =>
              setting.type === "textarea" ? (
                <TextArea
                  key={setting.id}
                  label={setting.label}
                  hint={setting.key}
                  name={`setting:${setting.key}`}
                  rows={3}
                  defaultValue={setting.value}
                />
              ) : (
                <TextField
                  key={setting.id}
                  label={setting.label}
                  hint={setting.key}
                  name={`setting:${setting.key}`}
                  type={setting.type === "email" ? "email" : "text"}
                  defaultValue={setting.value}
                />
              ),
            )}
          </div>
        </section>
      ))}

      <StatusMessage state={state} />

      <div className="flex justify-end">
        <SubmitButton>Save all settings</SubmitButton>
      </div>
    </form>
  );
}
