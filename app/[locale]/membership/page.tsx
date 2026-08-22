/**
 * Membership — /bg/membership, /en/membership.
 *
 * The one place the application lives. The header's Членувай button and the
 * contact page's Членство card both land here; the Tally form is embedded
 * inline (lib/tally.ts), so applying never leaves the site — which is also
 * what lets this page be an ad landing page and a measurable conversion,
 * neither of which a popup can be.
 *
 * Same shell and rhythm as /volunteer, the site's standalone-page grammar:
 * eyebrow, display title, rule, lead, two balanced columns — then the
 * application under its own rule. The pattern rail renders after the
 * content, as on /contact: fixed-positioned so it paints where it always
 * does, but its recolour button stays out of the way of the form's tab
 * order.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
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
          path="/membership"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[72px] md:pt-[120px]">
          {/* Same 1056px cap as the other standalone pages: the fluid shell
              is wider than the frame's text container at desktop. */}
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

            <p className="t-h05 max-w-[620px]">{copy.lead}</p>

            {/* ↓, not →: the application is on this page, right below. */}
            <a
              href="#application"
              className="t-caption group inline-flex items-center gap-3 self-start font-medium"
            >
              {copy.startLabel}
              <span aria-hidden className="transition-transform group-hover:translate-y-1">
                ↓
              </span>
            </a>
          </div>

          {/* The application. No heading and no rule of its own — the page's
              title is its title, the form opens with its own introduction,
              and its progress bar already marks where it begins. scroll-mt
              keeps it clear of the sticky header on arrival. */}
          <div
            id="application"
            className="mt-12 max-w-[732px] scroll-mt-32 md:mt-16"
          >
            <TallyEmbed formId={MEMBERSHIP_FORM_ID} title={copy.formTitle} />
          </div>
        </main>
      </div>

      {/* After the content on purpose — see /contact. */}
      <PatternRail locale={locale} />

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
