import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

/** Brand face — "About Beige Standard", self-hosted via next/font/local. */
const aboutBeige = localFont({
  src: [
    { path: "./fonts/AboutBeigeStandard-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/AboutBeigeStandard-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/AboutBeigeStandard-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/AboutBeigeStandard-Heavy.woff2", weight: "800", style: "normal" },
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

export const metadata: Metadata = {
  title: "Български Дизайн Съвет",
  description:
    "Българският Дизайн Съвет обединява професионалисти, експерти и организации с обща мисия — да развиваме българския дизайн.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg" className={`${aboutBeige.variable} ${fallback.variable}`}>
      <body>{children}</body>
    </html>
  );
}
