import { ContactForm } from "@/components/sections/contact-form";
import { Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

export function Cta({ section }: { section: SectionWithEntries }) {
  return (
    <section
      id="contact"
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

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-3">
              {["Deployed in 38 regions", "99.99% uptime SLA", "SOC 2 · ISO 27001"].map(
                (proof) => (
                  <span key={proof} className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-accent" aria-hidden />
                    {proof}
                  </span>
                ),
              )}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
