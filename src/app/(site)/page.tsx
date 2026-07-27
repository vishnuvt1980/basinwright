import { SectionRenderer } from "@/components/sections/section-renderer";
import { getSections } from "@/lib/content";

// The site chrome — header, footer, chat widget — lives in the group layout.
// This page is only the homepage's own blocks.
export default async function HomePage() {
  const sections = await getSections("home");

  // The substrate is content-managed like any other section, but it is not a
  // block on the page — it is the hero's banner. Pull it out of the flow and
  // hand it to the hero, which draws it or tells the same story as plain text.
  const substrate =
    sections.find((s) => s.kind === "COGNITIVE_SUBSTRATE") ?? null;
  const blocks = sections.filter((s) => s.kind !== "COGNITIVE_SUBSTRATE");

  return (
    <>
      {blocks.map((section) => (
        <SectionRenderer key={section.id} section={section} substrate={substrate} />
      ))}
    </>
  );
}
