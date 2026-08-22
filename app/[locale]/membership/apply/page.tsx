/**
 * The membership application — /bg/membership/apply, /en/membership/apply.
 *
 * The form as the page, in Tally's full-page mode: the header on top, the
 * form filling everything under it, and the page itself never scrolls —
 * the form owns all movement, one screen at a time, which is what ended
 * the scroll fighting the inline embeds had (see TallyEmbed). The landing
 * at /membership introduces this page and is where ads and the sitemap
 * point; this one is the flow itself.
 *
 * noindex, like /partner/thanks: a viewport-locked iframe page has no
 * content of its own to rank, and the landing above it is the address the
 * council wants found.
 *
 * No footer — a viewport-locked page has nowhere to scroll to one, and an
 * application flow closing over the form is how checkout pages behave
 * everywhere.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    title: copy.formTitle,
    robots: { index: false, follow: false },
  };
}

export default async function MembershipApplyPage({
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

      {/* One viewport: header, then the form filling the rest.
          overflow-hidden locks the page — all scrolling belongs to the
          form. dvh, not vh, so mobile browser chrome retracting does not
          leave a dead band at the bottom. */}
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
          path="/membership/apply"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="min-h-0 flex-1">
          <h1 className="sr-only">{copy.formTitle}</h1>
          <TallyEmbed formId={MEMBERSHIP_FORM_ID} title={copy.formTitle} />
        </main>
      </div>

      <PatternRail locale={locale} />
    </>
  );
}
