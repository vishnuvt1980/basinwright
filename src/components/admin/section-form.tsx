"use client";

import { useActionState } from "react";

import { updateSection, type ActionState } from "@/app/admin/actions";
import {
  StatusMessage,
  SubmitButton,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/fields";
import type { SectionWithEntries } from "@/lib/content";

const initialState: ActionState = { status: "idle" };

export function SectionForm({ section }: { section: SectionWithEntries }) {
  const [state, formAction] = useActionState(updateSection, initialState);
  const isHero = section.kind === "HERO";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={section.id} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Eyebrow"
          name="eyebrow"
          defaultValue={section.eyebrow ?? ""}
          placeholder="Small label above the heading"
        />
        <TextField
          label="Title"
          name="title"
          defaultValue={section.title ?? ""}
          placeholder="Section heading"
        />
      </div>

      {isHero ? (
        <TextArea
          label="Headline lines"
          hint="one line per row — the last is gradient-filled"
          name="headlineLines"
          rows={3}
          defaultValue={section.headlineLines.join("\n")}
        />
      ) : null}

      <TextArea
        label="Subtitle"
        name="subtitle"
        rows={2}
        defaultValue={section.subtitle ?? ""}
      />
      <TextArea label="Body" name="body" rows={2} defaultValue={section.body ?? ""} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Primary button"
          name="ctaLabel"
          defaultValue={section.ctaLabel ?? ""}
        />
        <TextField
          label="Primary link"
          name="ctaHref"
          defaultValue={section.ctaHref ?? ""}
          placeholder="/start or #contact"
        />
        <TextField
          label="Secondary button"
          name="ctaLabel2"
          defaultValue={section.ctaLabel2 ?? ""}
        />
        <TextField
          label="Secondary link"
          name="ctaHref2"
          defaultValue={section.ctaHref2 ?? ""}
        />
      </div>

      <Toggle label="Visible on the site" name="visible" defaultChecked={section.visible} />

      <StatusMessage state={state} />

      <div className="flex justify-end">
        <SubmitButton>Save section</SubmitButton>
      </div>
    </form>
  );
}
