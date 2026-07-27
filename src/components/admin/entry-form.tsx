"use client";

import { useActionState, useState } from "react";
import type { Entry } from "@prisma/client";
import { ChevronDown, MoveDown, MoveUp, Trash2 } from "lucide-react";

import {
  deleteEntry,
  moveEntry,
  updateEntry,
  type ActionState,
} from "@/app/admin/actions";
import {
  AccentField,
  IconField,
  StatusMessage,
  SubmitButton,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/fields";
import { Icon } from "@/components/icon";
import { cn } from "@/components/ui/primitives";

const initialState: ActionState = { status: "idle" };

export function EntryForm({
  entry,
  index,
  total,
}: {
  entry: Entry;
  index: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(updateEntry, initialState);

  return (
    <li className="rounded-xl border border-basin-700/70 bg-basin-900/60">
      <div className="flex items-center gap-3 p-3 pl-4">
        <Icon name={entry.icon} className="size-4 shrink-0 text-brass-500" />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
        >
          <p className="truncate text-sm text-parchment-100">{entry.title}</p>
          {entry.subtitle ? (
            <p className="truncate text-xs text-basin-500">{entry.subtitle}</p>
          ) : null}
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {!entry.visible ? (
            <span className="mr-1 text-[0.65rem] uppercase tracking-wider text-basin-600">
              hidden
            </span>
          ) : null}

          <form action={moveEntry}>
            <input type="hidden" name="id" value={entry.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={index === 0}
              aria-label="Move up"
              className="inline-flex size-8 items-center justify-center rounded-lg text-basin-400 hover:bg-basin-800 hover:text-parchment-100 disabled:opacity-25"
            >
              <MoveUp className="size-3.5" />
            </button>
          </form>

          <form action={moveEntry}>
            <input type="hidden" name="id" value={entry.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={index === total - 1}
              aria-label="Move down"
              className="inline-flex size-8 items-center justify-center rounded-lg text-basin-400 hover:bg-basin-800 hover:text-parchment-100 disabled:opacity-25"
            >
              <MoveDown className="size-3.5" />
            </button>
          </form>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse" : "Expand"}
            className="inline-flex size-8 items-center justify-center rounded-lg text-basin-400 hover:bg-basin-800 hover:text-parchment-100"
          >
            <ChevronDown
              className={cn("size-4 transition-transform", open && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-basin-800 p-4">
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={entry.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Title" name="title" required defaultValue={entry.title} />
              <TextField
                label="Subtitle"
                name="subtitle"
                defaultValue={entry.subtitle ?? ""}
              />
            </div>

            <TextArea label="Body" name="body" rows={2} defaultValue={entry.body ?? ""} />

            <TextArea
              label="Bullets"
              hint="one per line"
              name="bullets"
              rows={4}
              defaultValue={entry.bullets.join("\n")}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <IconField defaultValue={entry.icon} />
              <AccentField defaultValue={entry.accent} />
              <TextField label="Badge" name="badge" defaultValue={entry.badge ?? ""} />
              <TextField label="Link" name="href" defaultValue={entry.href ?? ""} />
            </div>

            <Toggle label="Visible" name="visible" defaultChecked={entry.visible} />

            <StatusMessage state={state} />

            <div className="flex items-center justify-between gap-3">
              <SubmitButton>Save item</SubmitButton>
            </div>
          </form>

          {/* Kept outside the edit form — nested forms are invalid HTML. */}
          <form action={deleteEntry} className="mt-3 border-t border-basin-800 pt-3">
            <input type="hidden" name="id" value={entry.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-ember-500/30 px-4 py-2 text-xs text-ember-300 transition-colors hover:bg-ember-500/10"
            >
              <Trash2 className="size-3.5" />
              Delete item
            </button>
          </form>
        </div>
      ) : null}
    </li>
  );
}
