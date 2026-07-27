"use client";

import { useActionState } from "react";

import { updateSection, type ActionState } from "@/app/admin/actions";
import {
  Label,
  StatusMessage,
  SubmitButton,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/fields";
import type { SectionWithEntries } from "@/lib/content";

const initialState: ActionState = { status: "idle" };

const control =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 transition-colors focus:border-accent focus:outline-none";

/// Collection slugs a DOC_LIST block can pull from. Duplicated from
/// lib/library rather than imported: that module is server-only and this is a
/// client component. The slugs are the contract between them.
const COLLECTION_SLUGS = [
  "case-studies",
  "whitepapers",
  "blog",
  "learn",
  "research",
  "news",
  "release-notes",
];

function metaValue(meta: SectionWithEntries["meta"], key: string) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return undefined;
  return (meta as Record<string, unknown>)[key];
}

export function SectionForm({ section }: { section: SectionWithEntries }) {
  const [state, formAction] = useActionState(updateSection, initialState);

  const isHero = section.kind === "HERO";
  // PROSE carries the long-form copy — legal pages, positioning essays — and
  // wants an editor rather than a two-line box.
  const isProse = section.kind === "PROSE";
  const isDocList = section.kind === "DOC_LIST";

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

      <TextArea
        label={isProse ? "Body (Markdown)" : "Body"}
        hint={isProse ? "## headings, lists, > quotes, | tables |, [links](/x)" : undefined}
        name="body"
        rows={isProse ? 24 : 2}
        defaultValue={section.body ?? ""}
        className={isProse ? "font-mono" : undefined}
      />

      {isDocList ? (
        <div className="grid gap-5 rounded-xl border border-line bg-raised/50 p-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <Label hint="which index to pull from">Collection</Label>
            <select
              name="metaCollection"
              defaultValue={String(metaValue(section.meta, "collection") ?? "")}
              className={control}
            >
              <option value="">— none —</option>
              {COLLECTION_SLUGS.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </label>

          <TextField
            label="How many"
            name="metaLimit"
            type="number"
            min={1}
            max={12}
            defaultValue={Number(metaValue(section.meta, "limit") ?? 3)}
          />
        </div>
      ) : null}

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
          placeholder="/start or /#contact"
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
