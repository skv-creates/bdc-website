/**
 * /[locale]/partner/thanks — where /api/partner lands a successful submission.
 *
 * This URL is the Ad Grants conversion: the Google Ads goal counts arrivals
 * here, which is why it is noindexed and kept out of the sitemap — a visitor
 * who reaches it from a search result would count as a conversion that never
 * happened.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getContent, hasLocale, locales } from "@/lib/home-content";
import { PARTNER_COPY } from "@/lib/partner";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return {
    title: PARTNER_COPY[locale].thanks.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function PartnerThanksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = PARTNER_COPY[locale];

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>
      <PatternRail />

      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="/partner" initiatives={c.initiatives} />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[160px] md:pt-[120px]">
          <div className="flex max-w-[732px] flex-col items-start gap-12">
            <h1 className="t-h01">{copy.thanks.title}</h1>
            <p className="t-body max-w-[540px]">{copy.thanks.body}</p>
            <Button href={`/${locale}/initiatives`}>{copy.thanks.backLabel}</Button>
          </div>
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
