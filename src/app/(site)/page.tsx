import { SectionRenderer } from "@/components/sections/section-renderer";
import { getSections } from "@/lib/content";

// The site chrome — header, footer, chat widget — lives in the group layout.
// This page is only the homepage's own blocks.
export default async function HomePage() {
  const sections = await getSections("home");

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
