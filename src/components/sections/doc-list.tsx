import Link from "next/link";

import { DocGrid, DocRows } from "@/components/library/doc-card";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import {
  metaNumber,
  metaString,
  sectionAnchor,
  type SectionWithEntries,
} from "@/lib/content";
import { findCollection, getRecentDocs } from "@/lib/library";

/**
 * Pulls documents out of the library and renders them inside a CMS page.
 *
 * Configured entirely from the section's `meta`:
 *
 *     { "collection": "case-studies", "limit": 3 }
 *
 * A missing or unknown collection renders nothing rather than throwing — an
 * editor mistyping a slug should leave a gap on the page, not a 500.
 *
 * `meta.anchor` gives the block a DOM id, the same as every other section kind:
 * the homepage's proof block is linked to as `/#proof`.
 */
export async function DocList({ section }: { section: SectionWithEntries }) {
  const collection = findCollection(metaString(section.meta, "collection") ?? undefined);
  if (!collection) return null;

  const limit = metaNumber(section.meta, "limit") ?? 3;
  const docs = await getRecentDocs(collection.kind, limit);
  if (!docs.length) return null;

  return (
    <section
      id={sectionAnchor(section.meta)}
      className="border-t border-line py-20 sm:py-24"
    >
      <div className="container-bw">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeading
              eyebrow={section.eyebrow}
              title={section.title}
              subtitle={section.subtitle}
            />
          </Reveal>

          {section.ctaLabel ? (
            <Link
              href={section.ctaHref ?? `/${collection.slug}`}
              className="group inline-flex shrink-0 items-center gap-1.5 text-[0.9375rem] font-semibold text-accent hover:underline"
            >
              {section.ctaLabel}
              <Icon
                name="ArrowRight"
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          ) : null}
        </div>

        {collection.layout === "list" ? (
          <DocRows docs={docs} className="mt-10" />
        ) : (
          <DocGrid docs={docs} className="mt-12" />
        )}
      </div>
    </section>
  );
}
