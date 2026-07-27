"use client";

import { useActionState } from "react";
import type { Doc } from "@prisma/client";

import { updateDoc, type ActionState } from "@/app/admin/actions";
import {
  AccentField,
  IconField,
  Label,
  StatusMessage,
  SubmitButton,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/fields";

const initialState: ActionState = { status: "idle" };

const control =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 transition-colors focus:border-accent focus:outline-none";

/// Collections, as the form needs them. Duplicated from lib/library rather than
/// imported, because that module is server-only and this form is a client
/// component — the enum values are the contract between them.
const KINDS = [
  { value: "CASE_STUDY", label: "Case study" },
  { value: "WHITEPAPER", label: "Whitepaper" },
  { value: "BLOG", label: "Blog post" },
  { value: "ARTICLE", label: "Learning article" },
  { value: "RESEARCH", label: "Research note" },
  { value: "NEWS", label: "News" },
  { value: "RELEASE_NOTE", label: "Release note" },
];

export function DocForm({ doc }: { doc: Doc }) {
  const [state, formAction] = useActionState(updateDoc, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={doc.id} />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <Label hint="which index it appears on">Collection</Label>
          <select name="kind" defaultValue={doc.kind} className={control}>
            {KINDS.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </label>

        <TextField
          label="Slug"
          hint="unique across the whole library"
          name="slug"
          required
          defaultValue={doc.slug}
        />
      </div>

      <TextField label="Title" name="title" required defaultValue={doc.title} />
      <TextField label="Subtitle" name="subtitle" defaultValue={doc.subtitle ?? ""} />

      <TextArea
        label="Excerpt"
        hint="card copy, and the meta description fallback"
        name="excerpt"
        required
        rows={3}
        defaultValue={doc.excerpt}
      />

      <TextArea
        label="Body"
        hint="Markdown — ## headings, lists, > quotes, | tables |, [links](/x)"
        name="body"
        required
        rows={26}
        defaultValue={doc.body}
        className="font-mono"
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Category"
          hint="filter chip"
          name="category"
          defaultValue={doc.category ?? ""}
        />
        <TextField label="Industry" name="industry" defaultValue={doc.industry ?? ""} />
        <TextField label="Author" name="author" defaultValue={doc.author ?? ""} />
        <TextField
          label="Author role"
          name="authorRole"
          defaultValue={doc.authorRole ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Published on"
          name="publishedAt"
          type="date"
          defaultValue={doc.publishedAt.toISOString().slice(0, 10)}
        />
        <TextField
          label="Read time"
          hint="minutes"
          name="readMinutes"
          type="number"
          min={1}
          defaultValue={doc.readMinutes}
        />
        <TextField
          label="Version"
          hint="release notes"
          name="version"
          defaultValue={doc.version ?? ""}
        />
        <TextField
          label="Tags"
          hint="comma separated"
          name="tags"
          defaultValue={doc.tags.join(", ")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <IconField defaultValue={doc.icon} />
        <AccentField defaultValue={doc.accent} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="SEO title"
          hint="defaults to the title"
          name="seoTitle"
          defaultValue={doc.seoTitle ?? ""}
        />
        <TextField
          label="SEO description"
          hint="defaults to the excerpt"
          name="seoDescription"
          defaultValue={doc.seoDescription ?? ""}
        />
      </div>

      <div className="flex flex-wrap gap-x-8">
        <Toggle label="Published" name="published" defaultChecked={doc.published} />
        <Toggle
          label="Featured (lead slot on the index)"
          name="featured"
          defaultChecked={doc.featured}
        />
        <Toggle
          label="Continues in the developer portal"
          name="gated"
          defaultChecked={doc.gated}
        />
      </div>

      <StatusMessage state={state} />

      <div className="flex justify-end">
        <SubmitButton>Save document</SubmitButton>
      </div>
    </form>
  );
}
