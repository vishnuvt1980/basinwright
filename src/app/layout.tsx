import type { Metadata } from "next";

import { ThemeScript } from "@/components/theme/theme-script";
import { getSettingsForMetadata } from "@/lib/content";
import {
  SITE_URL,
  TWITTER_HANDLE,
  clampDescription,
  jsonLd,
  organisationLd,
  webSiteLd,
} from "@/lib/seo";
import "./globals.css";

// Every face — body and display alike — comes from the Segoe UI Variable stack
// defined in globals.css. Segoe ships with Windows and cannot be self-hosted, so
// we ask for it where it exists and fall back to each platform's native UI face.
// No webfont is loaded: Microsoft's own site does exactly this.

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsForMetadata();
  const name = settings["site.name"] ?? "BasinWright";
  const tagline =
    settings["site.tagline"] ?? "Model-as-a-Service, delivered as an outcome";
  const description = clampDescription(
    settings["site.description"] ??
      "Purpose-built AI models built, deployed and monitored on your data, for regulated industries — bought as a business outcome rather than as infrastructure.",
  );

  return {
    // Every relative image path in a child's metadata resolves against this.
    // Without it Next emits relative og:image URLs, which no social crawler
    // follows — the single highest-consequence line in this file.
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${name} — ${tagline}`,
      template: `%s · ${name}`,
    },
    description,
    applicationName: name,
    alternates: { canonical: "/" },
    openGraph: {
      siteName: name,
      title: `${name} — ${tagline}`,
      description,
      type: "website",
      url: "/",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: `${name} — ${tagline}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        // Lets Google show the generated card and a full snippet, which is
        // also what its AI overviews quote from.
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    formatDetection: { telephone: false, address: false, email: false },
  };
}

/// Organization and WebSite, emitted once for the whole site. Articles point at
/// these by `@id` rather than repeating the publisher on every page.
async function SiteJsonLd() {
  const settings = await getSettingsForMetadata();
  const name = settings["site.name"] ?? "BasinWright";
  const description =
    settings["site.description"] ??
    "Enterprise AI infrastructure, models, agents and governance.";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organisationLd(name, description)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(webSiteLd(name, description)) }}
      />
    </>
  );
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1726" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
      // The inline script stamps data-theme before paint; React must not warn
      // about the attribute it did not render.
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        {/*
          Motion serialises its `initial` state into the SSR markup, so many
          elements arrive with inline `opacity:0`. Without JS those never
          animate in and the page reads as blank — force the resolved state.
        */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <SiteJsonLd />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
