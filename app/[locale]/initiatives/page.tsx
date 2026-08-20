/**
 * /[locale]/initiatives — the index the navigation never had.
 *
 * The nav's «Инициативи» is a mega-menu *button*, which works for a pointer
 * and gives a crawler nothing: there was no URL that collects and explains
 * the council's activities. This page is that URL — the Ad Grants policy
 * asks for exactly such a place ("describe its activities or services").
 *
 * Everything is reused: the section's own eyebrow + standfirst grammar for
 * the head, and the initiative Card — the same component the home carousel
 * and the inside-pages track render — laid two-up as a static grid.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Card } from "@/components/initiatives/Initiatives";
import { getContent, hasLocale, locales } from "@/lib/home-content";

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
  const c = getContent(locale);
  return {
    title: c.initiatives.heading,
    description: c.initiatives.lede,
    alternates: localeAlternates(locale, "/initiatives"),
    openGraph: openGraphBase(
      locale,
      "/initiatives",
      { title: c.initiatives.heading, description: c.initiatives.lede },
      c.meta.title,
    ),
  };
}

export default async function InitiativesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);

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
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="/initiatives" initiatives={c.initiatives} />

        <main id="main" tabIndex={-1} className="pt-16 lg:pt-[120px]">
          {/* The section's own grammar, page-sized: eyebrow naming the
              section, the standfirst as the display heading — exactly how
              the home section and the About page open. */}
          <section className="bdc-stop-11 bdc-grid gap-y-12 pb-12 lg:pb-20">
            <div className="col-span-full flex items-center gap-3">
              <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
              <span className="t-caption">{c.initiatives.heading}</span>
            </div>
            <h1 className="t-h01 col-span-full lg:col-span-9">{c.initiatives.lede}</h1>
          </section>

          {/* The four initiatives as the site's own cards, two to a row. */}
          <section className="bdc-stop-11 grid grid-cols-1 gap-[var(--grid-gap)] pb-20 md:grid-cols-2 lg:pb-[120px]">
            {c.initiatives.items.map((it, i) => (
              <Card key={it.slug} item={it} index={i} locale={locale} seeMore={c.ui.seeMore} fluid />
            ))}
          </section>
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
