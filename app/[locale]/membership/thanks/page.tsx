/**
 * /[locale]/membership/thanks — where a submitted application lands.
 *
 * The council's own success screen, in place of Tally's generic one: the
 * apply page navigates here the moment the form fires FormSubmitted (see
 * TallyRedirect), so the journey ends on the site, with somewhere to go
 * next. Like /partner/thanks, this URL is the Ad Grants conversion: the
 * Google Ads goal counts arrivals here, which is why it is noindexed and
 * kept out of the sitemap — a visitor who reaches it from a search result
 * would count as a conversion that never happened.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getContent, hasLocale, locales } from "@/lib/home-content";
import { MEMBERSHIP_COPY } from "@/lib/membership";

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
    title: MEMBERSHIP_COPY[locale].thanks.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function MembershipThanksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = MEMBERSHIP_COPY[locale].thanks;

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
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="/membership" initiatives={c.initiatives} />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[160px] md:pt-[120px]">
          <div className="flex max-w-[1056px] flex-col items-start gap-12">
            <h1 className="t-h01 max-w-[732px]">{copy.title}</h1>
            {/* The two halves side by side, per the site's two-column grammar:
                what happens next on the left, how to reach us on the right. */}
            <div className="grid gap-8 md:grid-cols-2">
              <p className="t-body">{copy.body}</p>
              <p className="t-body">
                {copy.help}{" "}
                <a href={`mailto:${c.footer.email}`} className="group [overflow-wrap:anywhere]">
                  <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                    {c.footer.email}
                  </span>
                </a>
              </p>
            </div>
            <Button href={`/${locale}/initiatives`}>{copy.backLabel}</Button>
          </div>
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
