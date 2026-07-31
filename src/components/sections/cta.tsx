import { ContactForm } from "@/components/sections/contact-form";
import { Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";
import { sectionAnchor } from "@/lib/meta";

export function Cta({ section }: { section: SectionWithEntries }) {
  return (
    <section
      id={sectionAnchor(section.meta, "contact")}
      className="grain relative overflow-hidden border-t border-line py-28 sm:py-36"
    >
      <div className="topo pointer-events-none absolute inset-0 opacity-45" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_50%,transparent,var(--bw-canvas)_75%)]"
        aria-hidden
      />

      <div className="container-bw relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
          <Reveal>
            <Eyebrow>{section.eyebrow}</Eyebrow>
            <h2 className="mt-7 max-w-xl text-balance font-display text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-[3.6rem]">
              {section.title}
            </h2>
            <p className="mt-6 max-w-lg text-pretty leading-relaxed text-ink-2">
              {section.subtitle}
            </p>

            {/* These were hardcoded traction claims — region count, uptime SLA,
                certifications — none of which we hold yet. They come from the
                section's own bullets now, so what stands here is editable in
                /admin and answerable by whoever put it there. */}
            {section.entries.length ? (
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-3">
                {section.entries.map((entry) => (
                  <span key={entry.id} className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-accent" aria-hidden />
                    {entry.title}
                  </span>
                ))}
              </div>
            ) : null}
          </Reveal>

          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
