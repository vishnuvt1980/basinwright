import { blog } from "./blog";
import { referenceDeployments } from "./reference-deployments";
import { learning } from "./learning";
import { news } from "./news";
import { releaseNotes } from "./release-notes";
import { research } from "./research";
import { whitepapers } from "./whitepapers";
import type { DocSeed } from "./types";

export { pages } from "./pages";
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
