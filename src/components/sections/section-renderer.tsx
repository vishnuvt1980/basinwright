import { Agents } from "@/components/sections/agents";
import { Cta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { Industries } from "@/components/sections/industries";
import { Infrastructure } from "@/components/sections/infrastructure";
import { LogoWall } from "@/components/sections/logo-wall";
import { Models } from "@/components/sections/models";
import { PlatformGrid } from "@/components/sections/platform-grid";
import { PlatformTopology } from "@/components/sections/platform-topology";
import { Pricing } from "@/components/sections/pricing";
import { Products } from "@/components/sections/products";
import { Solutions } from "@/components/sections/solutions";
import { WhyPillars } from "@/components/sections/why-pillars";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

/**
 * Maps a CMS `SectionKind` to the component that renders it. Adding a kind to
 * the Prisma enum and a row here is all it takes to ship a new block type.
 *
 * Two kinds are deliberately absent. `HERO` takes an extra prop and is handled
 * below; `COGNITIVE_SUBSTRATE` is not a block on the page at all — it is the
 * hero's banner, and `page.tsx` routes it there.
 */
const RENDERERS = {
  LOGO_WALL: LogoWall,
  PLATFORM_GRID: PlatformGrid,
  WHY_PILLARS: WhyPillars,
  PLATFORM_TOPOLOGY: PlatformTopology,
  AGENTS: Agents,
  MODELS: Models,
  PRODUCTS: Products,
  INDUSTRIES: Industries,
  SOLUTIONS: Solutions,
  INFRASTRUCTURE: Infrastructure,
  PRICING: Pricing,
  CTA: Cta,
  STATS: RichText,
  RICH_TEXT: RichText,
} as const;

function RichText({ section }: { section: SectionWithEntries }) {
  return (
    <section className="border-t border-line py-24">
      <div className="container-bw">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
          {section.body ? (
            <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
              {section.body}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function SectionRenderer({
  section,
  substrate = null,
}: {
  section: SectionWithEntries;
  /// The substrate section, passed through to the hero that draws it.
  substrate?: SectionWithEntries | null;
}) {
  if (section.kind === "HERO") {
    return <Hero section={section} substrate={substrate} />;
  }

  const Component = RENDERERS[section.kind as keyof typeof RENDERERS];
  if (!Component) return null;
  return <Component section={section} />;
}
