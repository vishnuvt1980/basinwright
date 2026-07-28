import { Icon } from "@/components/icon";
import { cn } from "@/components/ui/primitives";

/**
 * A collection's standing disclosure.
 *
 * Rendered above the index and above every document in the collection, from
 * one value on the collection itself — so it cannot be edited away a document
 * at a time, which is the only way a disclosure of this kind stays true.
 *
 * Styled as information rather than as a warning. It is a statement of what
 * the reader is looking at, not an apology for it.
 */
export function CollectionNotice({
  notice,
  className,
}: {
  notice?: string;
  className?: string;
}) {
  if (!notice) return null;

  return (
    <aside
      className={cn(
        "flex max-w-3xl items-start gap-3 rounded-lg border border-line bg-raised p-4 sm:p-5",
        className,
      )}
    >
      <Icon name="Circle" className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="text-sm leading-relaxed text-pretty text-ink-2">{notice}</p>
    </aside>
  );
}
