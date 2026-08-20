import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import "../globals.css";
import { getContent, hasLocale, locales } from "@/lib/home-content";
import { aboutBeige } from "@/lib/fonts";
import { GOOGLE_SITE_VERIFICATION, IS_PRODUCTION_SITE, SITE_ORIGIN } from "@/lib/site";
import { AnalyticsConsent } from "@/components/ui/AnalyticsConsent";
import { GA4_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * The Shift+R redlines overlay and the Shift+E copy editor. Staging only.
 *
 * Dynamic so the chunk is separate from the page's own JavaScript — but note
 * that `dynamic()` is NOT what keeps them off the apex. Both specifiers are
 * aliased to components/dev/DevToolsStub.tsx by next.config.ts when SITE_ORIGIN
 * is the production origin, so on a production build these resolve to
 * `() => null` and the real modules are not in the graph at all. Keep the
 * specifiers written exactly as the alias keys in next.config.ts spell them; a
 * rename here silently un-aliases them, which is what
 * scripts/assert-no-dev-tools.mjs catches.
 */
const Redlines = dynamic(() =>
  import("@/components/dev/Redlines").then((mod) => mod.Redlines),
);

const EditMode = dynamic(() =>
  import("@/components/dev/EditMode").then((mod) => mod.EditMode),
);


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
            this gate is what makes it unreachable, and the build-time alias
            described above is what keeps it out of the bytes a visitor
            downloads. A design tool no visitor asked for should be neither. */}
        {!IS_PRODUCTION_SITE && <Redlines />}
        {/* Shift+E edits an event's copy and its images' alt text in place,
            writing to Notion and to the staging draft store. Gated identically
            — and the endpoint it talks to is itself a 404 on the apex, so the
            gate failing open would still not give anyone a way in. */}
        {!IS_PRODUCTION_SITE && <EditMode />}
        {/* GA4 behind an explicit opt-in — see the component. Staging gets the
            same consent UI for review, but `collect` keeps every Google request
            disabled there. Renders nothing until lib/analytics.ts carries the
            measurement id. */}
        <AnalyticsConsent
          consent={getContent(locale).ui.consent}
          collect={IS_PRODUCTION_SITE}
          locale={locale}
          measurementId={GA4_MEASUREMENT_ID}
        />
      </body>
    </html>
  );
}
