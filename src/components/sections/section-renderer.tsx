import { Agents } from "@/components/sections/agents";
import { CognitiveSubstrate } from "@/components/sections/cognitive-substrate";
import { Cta } from "@/components/sections/cta";
import { DocList } from "@/components/sections/doc-list";
import {
  Callout,
  Contact,
  Faq,
  FeatureGrid,
  LinkList,
  Prose,
  StatBand,
  Timeline,
} from "@/components/sections/editorial";
import { Flow } from "@/components/sections/flow";
import { Hero } from "@/components/sections/hero";
import { Industries } from "@/components/sections/industries";
import { Infrastructure } from "@/components/sections/infrastructure";
import { LogoWall } from "@/components/sections/logo-wall";
import { Models } from "@/components/sections/models";
import { PlatformGrid } from "@/components/sections/platform-grid";
import { PlatformTopology } from "@/components/sections/platform-topology";
import { Pricing } from "@/components/sections/pricing";
import { ProductConsole } from "@/components/sections/product-console";
import { Products } from "@/components/sections/products";
import { Solutions } from "@/components/sections/solutions";
import { topologyLayers } from "@/components/sections/topology-layers";
import { WhyPillars } from "@/components/sections/why-pillars";
import { PlatformStack } from "@/components/site/platform-stack";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { SectionWithEntries } from "@/lib/content";
import { metaList, metaString } from "@/lib/meta";

/**
 * Maps a CMS `SectionKind` to the component that renders it. Adding a kind to
 * the Prisma enum and a row here is all it takes to ship a new block type.
 *
 * The first group are the homepage's bespoke blocks; the second are the
 * general-purpose ones the editorial pages are built from. Nothing in either
 * group knows which page it is on, so any block works anywhere — including
 * `COGNITIVE_SUBSTRATE`, which used to be the homepage hero's banner and is now
 * an ordinary block sitting on the page at /substrate.
 *
 * `HERO` is the one kind deliberately absent: it is handled below.
 */
const RENDERERS = {
  COGNITIVE_SUBSTRATE: CognitiveSubstrate,
  PRODUCT_CONSOLE: ProductConsole,
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

  PROSE: Prose,
  FEATURE_GRID: FeatureGrid,
  STAT_BAND: StatBand,
  TIMELINE: Timeline,
  FLOW: Flow,
  FAQ: Faq,
  LINK_LIST: LinkList,
  CALLOUT: Callout,
  CONTACT: Contact,
  DOC_LIST: DocList,
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

export function SectionRenderer({ section }: { section: SectionWithEntries }) {
  if (section.kind === "HERO") {
    // The stack is built here and handed down, the same way the topology
    // section hands down its SVG: the hero is a client component for its
    // scroll and entrance motion, and there is no reason for a diagram made
    // entirely of text to cross that boundary and take the icon set with it.
    return (
      <Hero section={section}>
        <PlatformStack
          layers={topologyLayers(section)}
          industries={metaList(section.meta, "industries")}
          governance={metaString(section.meta, "governance")}
        />
      </Hero>
    );
  }

  const Component = RENDERERS[section.kind as keyof typeof RENDERERS];
  if (!Component) return null;
  return <Component section={section} />;
}
