import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

export function LogoWall({ section }: { section: SectionWithEntries }) {
  const logos = section.entries;
  if (!logos.length) return null;

  // Duplicated once so the -50% marquee translate loops seamlessly.
  const track = [...logos, ...logos];

  return (
    <section className="relative border-y border-basin-800/80 bg-basin-900/40 py-14">
      <div className="container-bw">
        <Reveal className="flex flex-col items-center gap-2 text-center">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-basin-400">
            {section.eyebrow}
          </p>
          {section.title ? (
            <p className="text-sm text-basin-300">{section.title}</p>
          ) : null}
        </Reveal>
      </div>

      <div
        className="relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
        aria-label="Customer logos"
      >
        <div className="flex w-max animate-marquee gap-14 hover:[animation-play-state:paused]">
          {track.map((logo, i) => (
            <span
              key={`${logo.id}-${i}`}
              // The duplicate half is decorative; hide it from assistive tech.
              aria-hidden={i >= logos.length}
              className="shrink-0 whitespace-nowrap font-display text-xl text-basin-400 transition-colors duration-500 hover:text-brass-300"
            >
              {logo.title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
