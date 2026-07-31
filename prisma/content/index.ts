import { blog } from "./blog";
import { industryPages } from "./industries";
import { pages as editorialPages } from "./pages";
import { platformPages } from "./platform";
import { substratePage } from "./substrate";
import type { PageSeed } from "./types";
import { referenceDeployments } from "./reference-deployments";
import { learning } from "./learning";
import { news } from "./news";
import { releaseNotes } from "./release-notes";
import { research } from "./research";
import { whitepapers } from "./whitepapers";
import type { DocSeed } from "./types";

export { homeSections } from "./home";

/// Every CMS page, in one list. Split across modules by tier — the editorial
/// pages, the industry tier at /industries, the product tier at /platform, and
/// the substrate simulation on its own — because they are written by different
/// people for different readers, not because the seeder cares.
export const pages: PageSeed[] = [
  ...editorialPages,
  ...industryPages,
  ...platformPages,
  substratePage,
];
export { APP_URL, footerNav, headerNav, legalNav, navSettings } from "./nav";
export type { DocSeed, EntrySeed, PageSeed, SectionSeed } from "./types";

/// Everything in the library, in one list. Ordering here is irrelevant — every
/// index sorts by `publishedAt` descending.
export const allDocs: DocSeed[] = [
  ...referenceDeployments,
  ...whitepapers,
  ...blog,
  ...learning,
  ...research,
  ...news,
  ...releaseNotes,
];
