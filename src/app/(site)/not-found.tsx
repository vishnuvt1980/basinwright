import { ButtonLink } from "@/components/ui/primitives";
import { COLLECTIONS } from "@/lib/library";
import Link from "next/link";

/// Handles every `notFound()` thrown inside the site group — an unknown page
/// slug, an unknown collection, a document that has been unpublished. It keeps
/// the site chrome, because a 404 is still a page of the site.
export default function SiteNotFound() {
  return (
    <section className="border-b border-line pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="container-bw">
        <span className="text-[0.9375rem] font-semibold text-accent">404</span>

        <h1 className="mt-4 max-w-2xl font-display text-[2.25rem] leading-[1.1] text-balance text-ink sm:text-[3rem]">
          That page is not here
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
          The link may be out of date, or the piece may have been unpublished. The
          library is below, and the homepage has everything else.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/" withArrow>
            Back to the homepage
          </ButtonLink>
          <ButtonLink href="/resources" variant="secondary">
            Browse the library
          </ButtonLink>
        </div>

        <nav className="mt-14 border-t border-line pt-8" aria-label="Library collections">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {COLLECTIONS.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/${collection.slug}`}
                  className="text-sm text-ink-2 transition-colors hover:text-accent"
                >
                  {collection.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
