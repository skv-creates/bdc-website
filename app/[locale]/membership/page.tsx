/**
 * Membership — /bg/membership, /en/membership.
 *
 * The application as the page, in Tally's full-page mode: the header on
 * top, the form filling everything under it, and the page itself never
 * scrolls — the form owns all movement, one screen at a time, which is
 * what ended the scroll fighting the inline embeds had (see TallyEmbed).
 *
 * The title and lead stay in the document for search engines and screen
 * readers, visually hidden: the form's own opening screen says the same
 * things to sighted visitors, and saying them twice on one viewport made
 * the page start with an echo. No footer — a viewport-locked page has
 * nowhere to scroll to one, and an application flow closing over the form
 * is how checkout pages behave everywhere.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { TallyEmbed } from "@/components/ui/TallyEmbed";
import { getContent, hasLocale } from "@/lib/home-content";
import { MEMBERSHIP_FORM_ID } from "@/lib/tally";
import { MEMBERSHIP_COPY } from "@/lib/membership";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = MEMBERSHIP_COPY[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/membership"),
    openGraph: openGraphBase(
      locale,
      "/membership",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = MEMBERSHIP_COPY[locale];

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>

      {/* The whole page is one viewport: header, then the form filling the
          rest. overflow-hidden is what locks the page — all scrolling
          belongs to the form. dvh, not vh, so mobile browser chrome
          retracting does not leave a dead band at the bottom. */}
      <div
        className="flex h-[100dvh] flex-col overflow-hidden"
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        <SiteNav
          nav={c.nav}
          ui={c.ui}
          locale={locale}
          path="/membership"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="min-h-0 flex-1">
          <h1 className="sr-only">{copy.title}</h1>
          <p className="sr-only">{copy.lead}</p>
          <TallyEmbed formId={MEMBERSHIP_FORM_ID} title={copy.formTitle} />
        </main>
      </div>

      <PatternRail locale={locale} />
    </>
  );
}
