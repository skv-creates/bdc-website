import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import { getContent, hasLocale, locales } from "@/lib/home-content";

/** Brand face — "About Beige Standard", self-hosted via next/font/local. */
const aboutBeige = localFont({
  src: [
    { path: "../fonts/AboutBeigeStandard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/AboutBeigeStandard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/AboutBeigeStandard-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/AboutBeigeStandard-Heavy.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-about-beige",
  display: "swap",
});

/** Cyrillic-capable fallback (loads during swap / covers any missing glyph). */
const fallback = Inter({
  variable: "--font-fallback",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

/* Opt into the full screen so env(safe-area-inset-*) returns the real notch /
   status-bar insets — used by the sticky nav to paint white under the iOS
   status bar (otherwise content peeks above the header). */
export const viewport: Viewport = {
  viewportFit: "cover",
};

/** Pre-render both locales at build time (/bg and /en). */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const { meta } = getContent(locale);
  return { title: meta.title, description: meta.description };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${aboutBeige.variable} ${fallback.variable}`}>
      <body>{children}</body>
    </html>
  );
}
