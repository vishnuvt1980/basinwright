import Link from "next/link";
import type { ReactNode } from "react";

/* ---------------------------------------------------------------------------
   A small markdown subset, rendered to React elements.

   Deliberately not a full CommonMark implementation. The input is CMS copy
   written by editors we employ, and the output is a fixed set of typographic
   components — so the grammar covers exactly what the prose needs and nothing
   else. Everything renders as React elements rather than injected HTML, which
   is what keeps a stray angle bracket in an editor's paragraph harmless.

   Block level : ## / ### / #### headings, paragraphs, - and 1. lists,
                 > blockquotes, --- rules, and pipe tables.
   Inline      : **bold**, *italic*, `code`, [text](href).

   Anything unrecognised falls through as a paragraph, which is the failure
   mode an editor can see and fix.
--------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Inline                                                                     */
/* -------------------------------------------------------------------------- */

const INLINE =
  /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={key}
          className="rounded-md bg-raised px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      const className =
        "text-accent underline decoration-accent/35 underline-offset-4 transition-colors hover:decoration-accent";

      return isExternal(href) ? (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={className}
        >
          {label}
        </a>
      ) : (
        <Link key={key} href={href} className={className}>
          {label}
        </Link>
      );
    }

    return part;
  });
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

/// Stable, readable anchor for a heading, so a table of contents can link to it.
export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const isTableRow = (line: string) => line.startsWith("|") && line.endsWith("|");
const cells = (line: string) =>
  line
    .slice(1, -1)
    .split("|")
    .map((c) => c.trim());

/**
 * Renders a markdown string. Headings, lists, quotes, rules and tables are
 * styled here rather than through a prose plugin so they inherit the same
 * tokens as the rest of the site and flip with the theme.
 */
export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let i = 0;
  let key = 0;

  const push = (node: ReactNode) => blocks.push(<div key={key++}>{node}</div>);

  while (i < lines.length) {
    const line = lines[i];

    // Blank
    if (!line.trim()) {
      i++;
      continue;
    }

    // Rule
    if (/^-{3,}$/.test(line.trim())) {
      push(<hr className="my-12 border-0 border-t border-line" />);
      i++;
      continue;
    }

    // Heading
    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      const [, hashes, text] = heading;
      const id = headingId(text);
      const content = inline(text, `h-${key}`);

      if (hashes.length === 2) {
        push(
          <h2
            id={id}
            className="mt-14 mb-5 scroll-mt-28 font-display text-[1.75rem] leading-tight text-ink first:mt-0 sm:text-[2rem]"
          >
            {content}
          </h2>,
        );
      } else if (hashes.length === 3) {
        push(
          <h3
            id={id}
            className="mt-10 mb-4 scroll-mt-28 font-display text-xl leading-snug text-ink sm:text-[1.35rem]"
          >
            {content}
          </h3>,
        );
      } else {
        push(
          <h4 id={id} className="mt-8 mb-3 scroll-mt-28 font-display text-base text-ink">
            {content}
          </h4>,
        );
      }

      i++;
      continue;
    }

    // Table
    if (isTableRow(line) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1])) {
      const header = cells(line);
      i += 2;

      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(cells(lines[i]));
        i++;
      }

      push(
        // Wide tables scroll inside their own container rather than pushing
        // the article's measure out on a phone.
        <div className="my-8 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                {header.map((cell, c) => (
                  <th
                    key={c}
                    className="border-b border-line-strong px-3 py-2.5 text-[0.7rem] font-semibold tracking-[0.1em] text-ink-3 uppercase"
                  >
                    {inline(cell, `th-${key}-${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} className="border-b border-line last:border-0">
                  {row.map((cell, c) => (
                    <td key={c} className="px-3 py-2.5 align-top text-ink-2">
                      {inline(cell, `td-${key}-${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoted: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoted.push(lines[i].slice(2));
        i++;
      }

      push(
        <blockquote className="my-8 border-l-2 border-accent pl-5 text-lg leading-relaxed text-pretty text-ink italic sm:pl-6 sm:text-xl">
          {inline(quoted.join(" "), `q-${key}`)}
        </blockquote>,
      );
      continue;
    }

    // Lists
    const ordered = /^\d+\.\s/.test(line);
    const unordered = /^[-*]\s/.test(line);

    if (ordered || unordered) {
      const items: string[] = [];
      const matches = (l: string) => (ordered ? /^\d+\.\s/.test(l) : /^[-*]\s/.test(l));

      while (i < lines.length && matches(lines[i])) {
        items.push(lines[i].replace(ordered ? /^\d+\.\s/ : /^[-*]\s/, ""));
        i++;
      }

      const rendered = items.map((item, n) => (
        <li key={n} className="pl-1.5 leading-relaxed text-pretty marker:text-ink-3">
          {inline(item, `li-${key}-${n}`)}
        </li>
      ));

      push(
        ordered ? (
          <ol className="my-6 flex list-decimal flex-col gap-2.5 pl-6 text-ink-2">
            {rendered}
          </ol>
        ) : (
          <ul className="my-6 flex list-disc flex-col gap-2.5 pl-6 text-ink-2">
            {rendered}
          </ul>
        ),
      );
      continue;
    }

    // Paragraph — everything up to the next blank line.
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|>\s|[-*]\s|\d+\.\s|\|)/.test(lines[i]) && !/^-{3,}$/.test(lines[i].trim())) {
      paragraph.push(lines[i]);
      i++;
    }

    // A line that opened no block and matched no paragraph guard would loop
    // forever; consume it as its own paragraph instead.
    if (!paragraph.length) {
      paragraph.push(lines[i]);
      i++;
    }

    push(
      <p className="my-5 leading-relaxed text-pretty text-ink-2">
        {inline(paragraph.join(" "), `p-${key}`)}
      </p>,
    );
  }

  return <>{blocks}</>;
}

/// The h2s in a body, for an article's table of contents.
export function outline(content: string) {
  return content
    .split("\n")
    .flatMap((line) => {
      const match = /^##\s+(.*)$/.exec(line);
      if (!match) return [];
      const text = match[1].replace(/\*\*/g, "").trim();
      return [{ id: headingId(text), text }];
    });
}
