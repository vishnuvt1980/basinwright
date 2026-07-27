import { Agents } from "@/components/sections/agents";
import { Cta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { Industries } from "@/components/sections/industries";
import { Infrastructure } from "@/components/sections/infrastructure";
import { LogoWall } from "@/components/sections/logo-wall";
import { Models } from "@/components/sections/models";
import { PlatformGrid } from "@/components/sections/platform-grid";
import { Pricing } from "@/components/sections/pricing";
import { Products } from "@/components/sections/products";
import { Solutions } from "@/components/sections/solutions";
import { WhyPillars } from "@/components/sections/why-pillars";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";

/// Maps a CMS `SectionKind` to the component that renders it. Adding a kind to
/// the Prisma enum and a row here is all it takes to ship a new block type.
const RENDERERS = {
  HERO: Hero,
  LOGO_WALL: LogoWall,
  PLATFORM_GRID: PlatformGrid,
  WHY_PILLARS: WhyPillars,
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
    <section className="border-t border-basin-800/70 py-24">
      <div className="container-bw">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
          />
          {section.body ? (
            <p className="mt-6 max-w-2xl leading-relaxed text-basin-300">
              {section.body}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function SectionRenderer({ section }: { section: SectionWithEntries }) {
  const Component = RENDERERS[section.kind];
  if (!Component) return null;
  return <Component section={section} />;
}
