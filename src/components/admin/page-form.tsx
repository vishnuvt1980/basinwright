"use client";

import { useActionState } from "react";
import type { Page } from "@prisma/client";

import { updatePage, type ActionState } from "@/app/admin/actions";
import {
  StatusMessage,
  SubmitButton,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/fields";

const initialState: ActionState = { status: "idle" };

export function PageForm({ page }: { page: Page }) {
  const [state, formAction] = useActionState(updatePage, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={page.id} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Slug"
          hint="the URL — renaming moves the blocks with it"
          name="slug"
          required
          defaultValue={page.slug}
          placeholder="about"
        />
        <TextField
          label="Eyebrow"
          name="eyebrow"
          defaultValue={page.eyebrow ?? ""}
          placeholder="Small label above the heading"
        />
      </div>

      <TextField
        label="Title"
        name="title"
        required
        defaultValue={page.title}
        placeholder="The page heading"
      />

      <TextArea
        label="Subtitle"
        name="subtitle"
        rows={3}
        defaultValue={page.subtitle ?? ""}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="SEO title"
          hint="defaults to the title"
          name="seoTitle"
          defaultValue={page.seoTitle ?? ""}
        />
        <TextField
          label="SEO description"
          hint="defaults to the subtitle"
          name="seoDescription"
          defaultValue={page.seoDescription ?? ""}
        />
      </div>

      <Toggle label="Published" name="published" defaultChecked={page.published} />

      <StatusMessage state={state} />

      <div className="flex justify-end">
        <SubmitButton>Save page</SubmitButton>
      </div>
    </form>
  );
}
