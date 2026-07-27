import type { Metadata } from "next";

import { ThemeScript } from "@/components/theme/theme-script";
import { getSettingsForMetadata } from "@/lib/content";
import "./globals.css";

// Every face — body and display alike — comes from the Segoe UI Variable stack
// defined in globals.css. Segoe ships with Windows and cannot be self-hosted, so
// we ask for it where it exists and fall back to each platform's native UI face.
// No webfont is loaded: Microsoft's own site does exactly this.

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsForMetadata();
  const name = settings["site.name"] ?? "BasinWright";
  const tagline = settings["site.tagline"] ?? "Enterprise Intelligence as a Service";

  return {
    title: {
      default: `${name} — ${tagline}`,
      template: `%s · ${name}`,
    },
    description: settings["site.description"] ?? "",
    openGraph: {
      title: `${name} — ${tagline}`,
      description: settings["site.description"] ?? "",
      type: "website",
    },
  };
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
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
