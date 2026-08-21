/**
 * Membership landing — /bg/join, /en/join.
 *
 * The page the header's "Членувай" CTA lands on. The application itself is the
 * Tally form the button links out to; this page explains before it asks — who
 * membership is for, what it involves, what happens after the form is sent —
 * so the site's primary call to action starts on the site rather than on a
 * third-party domain.
 *
 * Same shell as /volunteer: fixed pattern rail, padded content column,
 * full-bleed footer.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getContent, hasLocale } from "@/lib/home-content";
import { JOIN_COPY, MEMBERSHIP_FORM_URL } from "@/lib/join";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = JOIN_COPY[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/join"),
    openGraph: openGraphBase(
      locale,
      "/join",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = JOIN_COPY[locale];

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>
      <PatternRail locale={locale} />

      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        <SiteNav
          nav={c.nav}
          ui={c.ui}
          locale={locale}
          path="/join"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[72px] md:pt-[120px]">
          {/* Same 1056px cap as /volunteer, for the same reason: the fluid
              shell is wider than the frame's text container at desktop. */}
          <div className="flex max-w-[1056px] flex-col gap-12">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-band)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.eyebrow}</span>
            </div>

            <h1 className="t-h01 max-w-[732px]">{copy.title}</h1>

            <hr className="border-0 border-t border-border" />

            <p className="t-h05 max-w-[540px]">{copy.lead}</p>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-5">
                {copy.bodyLeft.map((p) => (
                  <p key={p} className="t-body">
                    {p}
                  </p>
                ))}
              </div>
              <div className="flex flex-col gap-5">
                <p className="t-body">{copy.bodyRight}</p>
                <a href={`/${locale}/statute`} className="t-body group self-start">
                  <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                    {copy.statuteLabel}
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20 flex max-w-[516px] flex-col items-start gap-8">
            <h2 className="t-h02">{copy.ctaTitle}</h2>
            <p className="t-body">
              <mark
                className="text-text"
                style={{ background: "var(--bdc-amber)", boxDecorationBreak: "clone" }}
              >
                {copy.ctaHighlight}
              </mark>{" "}
              {copy.ctaBody}
            </p>
            {/* The application is the Tally-hosted form. Button renders it as
                an external link, so it opens in a new tab and this page is
                still there when they come back. */}
            <Button href={MEMBERSHIP_FORM_URL} variant="primary">
              {copy.ctaLabel}
            </Button>
          </div>
        </main>
      </div>

      {/* Three-block strip between the content and the footer, as on the other
          standalone pages. */}
      <div className="relative z-30 flex h-3" aria-hidden>
        <span className="w-[8.55%]" style={{ background: "var(--tri-accent)" }} />
        <span className="w-[36.75%]" style={{ background: "var(--tri-band)" }} />
        <span className="flex-1" style={{ background: "var(--tri-ground)" }} />
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
