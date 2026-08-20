/**
 * Volunteer landing — /bg/volunteer, /en/volunteer (Figma 358:3646).
 *
 * The page that has to persuade. The application itself is the form hosted in
 * Notion, which the button links out to.
 *
 * Same shell as the other standalone pages: fixed pattern rail, padded content
 * column, full-bleed footer.
 */
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getContent, hasLocale } from "@/lib/home-content";
import { LANDING_COPY, VOLUNTEER_FORM_URL } from "@/lib/volunteer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = LANDING_COPY[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/volunteer"),
    openGraph: openGraphBase(
      locale,
      "/volunteer",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

export default async function VolunteerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = LANDING_COPY[locale];

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
          path="/volunteer"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[72px] md:pt-[120px]">
          {/* The frame's text container is 1056px inside a 1512px page. Our
              shell is fluid and wider than that at desktop, so without this cap
              every fixed width below — the 732px heading, the 540px lead, the
              two 516px columns — would sit at the wrong proportion and the rule
              would run a third of the way past where the design ends it. The
              photo below is deliberately outside the cap: in the frame it spans
              the full padded area, wider than the text. */}
          <div className="flex max-w-[1056px] flex-col gap-12">
            {/* Eyebrow: the same 16×8 accent mark the mission and initiatives
                sections use, so the page reads as part of the set. */}
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

            {/* Equal halves with a 32px gutter, stacked below md. The frame
                divides its 1056px container into 508 + 32 + 516 — a 50/50 split
                in all but rounding, so it is written as one rather than pinning
                the right column to 516px, which would leave the left column
                half as wide again on a large screen. */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-5">
                {copy.bodyLeft.map((p) => (
                  <p key={p} className="t-body">
                    {p}
                  </p>
                ))}
              </div>
              <p className="t-body">{copy.bodyRight}</p>
            </div>
          </div>

          <div className="mt-20 flex max-w-[516px] flex-col items-start gap-8">
            <h2 className="t-h02">{copy.ctaTitle}</h2>
            <p className="t-body">
              {/* <mark>, not a positioned rectangle: the highlight follows the
                  text when it rewraps, and the emphasis survives being read
                  aloud or copied out. The UA's default yellow-on-black is
                  replaced with the brand amber. */}
              <mark
                className="text-text"
                style={{ background: "var(--bdc-amber)", boxDecorationBreak: "clone" }}
              >
                {copy.ctaHighlight}
              </mark>{" "}
              {copy.ctaBody}
            </p>
            {/* The application is the Notion-hosted form. Button renders it as
                an external link, so it opens in a new tab and this page is
                still there when they come back. */}
            <Button href={VOLUNTEER_FORM_URL} variant="primary">
              {copy.ctaLabel}
            </Button>
          </div>

          <div className="relative mt-20 aspect-square w-full overflow-hidden md:mt-24 md:aspect-[1092/522]">
            <Image
              src="/figma/volunteer-cover.jpg"
              alt={copy.imageAlt}
              fill
              sizes="(max-width: 1023px) 90vw, 80vw"
              className="object-cover object-top"
            />
          </div>
        </main>
      </div>

      {/* Three-block strip between the content and the footer (358:3753).
          Widths are the frame's, as percentages so they hold at any width:
          129 / 556 / 827 of 1512. The colours are the pattern-rail recolour
          slots, so clicking the rail restyles this too. */}
      <div className="relative z-30 flex h-3" aria-hidden>
        <span className="w-[8.55%]" style={{ background: "var(--tri-accent)" }} />
        <span className="w-[36.75%]" style={{ background: "var(--tri-band)" }} />
        <span className="flex-1" style={{ background: "var(--tri-ground)" }} />
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
