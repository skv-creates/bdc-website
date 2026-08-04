import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import { getContent, hasLocale, locales } from "@/lib/home-content";
import { GOOGLE_SITE_VERIFICATION, IS_PRODUCTION_SITE, SITE_ORIGIN } from "@/lib/site";

/**
 * The Shift+R redlines overlay. Dynamic on purpose: a static import would put it
 * in the client bundle on every environment, and this exists only on staging.
 */
const Redlines = dynamic(() =>
  import("@/components/dev/Redlines").then((mod) => mod.Redlines),
);

/**
 * Brand face — "About Beige Standard", self-hosted via next/font/local.
 *
 * Three weights, matching the three the type scale actually uses:
 * --weight-regular 400, --weight-medium 500, --weight-bold 700 in globals.css.
 * Heavy (800) was declared here and shipped on every page while nothing
 * referenced it — no --weight-heavy token, no font-weight: 800, no
 * font-extrabold anywhere. Adding a fourth weight costs ~70KB on first load,
 * so only add one when a type class needs it.
 */
const aboutBeige = localFont({
  src: [
    { path: "../fonts/AboutBeigeStandard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/AboutBeigeStandard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/AboutBeigeStandard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-about-beige",
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

/**
 * The metadata every page inherits.
 *
 * Note what is NOT here: `alternates`. Metadata is inherited wholesale, so a
 * canonical set on the layout would point all fifteen pages of a locale at its
 * home page. Canonicals and hreflang are set per page, in each page's own
 * generateMetadata — see lib/seo.ts.
 */
export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const { meta } = getContent(locale);

  return {
    // Lets every relative URL below — canonicals, hreflang, OG images —
    // resolve against the right host without any of them knowing which host
    // this build is for.
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      // `default`, not `absolute`: the home page keeps the plain brand name,
      // while children get "Page — Bulgarian Design Council" rather than a
      // bare title that says nothing in a search result.
      default: meta.title,
      template: meta.titleTemplate,
    },
    description: meta.description,
    // summary_large_image everywhere; the card image itself comes from the
    // opengraph-image file convention, or from a page's own photograph.
    // No `site`/`creator` until there is a real handle — an empty @ is worse
    // than an absent one.
    twitter: { card: "summary_large_image" },
    // Search Console and Bing Webmaster both verify by meta tag. Set the env
    // var and the tag appears; unset, the key is omitted entirely rather than
    // shipping an empty content="" that fails verification confusingly.
    verification: {
      google: GOOGLE_SITE_VERIFICATION,
      ...(process.env.BING_SITE_VERIFICATION
        ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
        : {}),
    },
    // Rights reserved for text and data mining, on every page. The council's
    // position is that the site may be read, indexed and cited but not used to
    // train a model; see app/.well-known/tdmrep.json for the reasoning and the
    // machine-readable form a crawler is more likely to look for. This is the
    // per-document half of the same protocol, and it is the half that survives
    // being quoted, mirrored or archived away from the origin that served it.
    other: { "tdm-reservation": "1" },
    // Staging serves the same content as the public site. Keeping it out of
    // the index is belt-and-braces with robots.ts, and it is the half that
    // survives whatever Cloudflare does to robots.txt.
    ...(IS_PRODUCTION_SITE ? {} : { robots: { index: false, follow: false } }),
  };
}

export default async function RootLayout({
  children,
  modal,
  params,
}: {
  // `modal` is the @modal parallel-route slot (intercepted event overlays);
  // renders null (its default.js) whenever no event route is active.
  children: ReactNode;
  modal: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return (
    <html lang={locale} className={aboutBeige.variable}>
      <body>
        {children}
        {modal}
        {/* Shift+R draws the grid, type and spacing over the page. Staging only:
            the flag is read per request from SITE_ORIGIN, and the component is a
            dynamic import, so on the apex its chunk is never requested. A design
            tool no visitor asked for should not be in the bytes they download. */}
        {!IS_PRODUCTION_SITE && <Redlines />}
      </body>
    </html>
  );
}
