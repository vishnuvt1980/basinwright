/* ---------------------------------------------------------------------------
   Navigation and the site settings that surround it.

   Two notes on hrefs:

   • Homepage anchors are written as "/#products" rather than "#products". A
     bare fragment does nothing from /about — it has to route home first.

   • Developer links are absolute URLs into app.basinwright.com. Documentation
     is part of the product and sits behind the subscription, so the footer
     column carries a note saying so (see `footer.note.Developers` below —
     the footer looks the note up by column heading, so renaming a column in
     /admin renames the key it looks for).
--------------------------------------------------------------------------- */

/// Where the product lives. Kept as a setting so the estate can be pointed at
/// a staging host without a code change; the seeded hrefs below are absolute
/// because nav items are free-text and editable in /admin.
export const APP_URL = "https://app.basinwright.com";

export const headerNav = [
  { label: "Products", href: "/#products" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Industries", href: "/#industries" },
  { label: "Models", href: "/#models" },
  { label: "Resources", href: "/resources" },
  { label: "Pricing", href: "/#pricing" },
];

export const footerNav: {
  group: string;
  items: { label: string; href: string }[];
}[] = [
  {
    group: "Products",
    items: [
      { label: "BasinWright MaaS", href: "/#products" },
      { label: "BasinWright Compute", href: "/#products" },
      { label: "BasinWright Agents", href: "/#products" },
      { label: "BasinWright Studio", href: "/#products" },
      { label: "BasinWright Knowledge", href: "/#products" },
      { label: "BasinWright Marketplace", href: "/#products" },
    ],
  },
  {
    group: "Developers",
    items: [
      { label: "Documentation", href: `${APP_URL}/docs` },
      { label: "API Reference", href: `${APP_URL}/docs/api` },
      { label: "SDKs", href: `${APP_URL}/docs/sdks` },
      { label: "CLI", href: `${APP_URL}/docs/cli` },
      { label: "Terraform Provider", href: `${APP_URL}/docs/terraform` },
      { label: "Code Samples", href: `${APP_URL}/docs/samples` },
      { label: "Platform Status", href: `${APP_URL}/status` },
    ],
  },
  {
    group: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Careers", href: "/careers" },
      { label: "News", href: "/news" },
      { label: "Engineering Notes", href: "/research" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    group: "Resources",
    items: [
      { label: "Reference Deployments", href: "/reference-deployments" },
      { label: "Whitepapers", href: "/whitepapers" },
      { label: "Learning Centre", href: "/learn" },
      { label: "Blog", href: "/blog" },
      { label: "Release Notes", href: "/release-notes" },
      { label: "Support", href: "/support" },
    ],
  },
];

/// The thin row under the footer columns.
export const legalNav = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Trust Centre", href: "/trust" },
];

/// Settings added alongside the ones the homepage already seeds.
export const navSettings = [
  {
    key: "app.url",
    value: APP_URL,
    label: "Product / developer portal URL",
    group: "links",
    type: "url",
    order: 0,
  },
  {
    key: "footer.note.Developers",
    value: "Documentation requires an active subscription.",
    label: "Footer note — Developers column",
    group: "footer",
    type: "text",
    order: 3,
  },
];
