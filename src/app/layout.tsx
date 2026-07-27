import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";

import { getSettings } from "@/lib/content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        {/*
          Motion serialises its `initial` state into the SSR markup, so ~90
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
