/**
 * /[locale]/initiatives — the index the navigation never had.
 *
 * The nav's «Инициативи» is a mega-menu *button*, which works for a pointer
 * and gives a crawler nothing: there was no URL that collects and explains
 * the council's activities. This page is that URL — the Ad Grants policy
 * asks for exactly such a place ("describe its activities or services").
 *
 * Everything on it is reused from the home content: the section heading and
 * lede, and each initiative's own card copy. No new prose to keep in sync.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
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
          <section className="bdc-stop-11 bdc-grid gap-y-12 pb-12 lg:pb-20">
            <h1 className="t-h01 col-span-full lg:col-span-8">{c.initiatives.heading}</h1>
            <p className="t-h05 col-span-full lg:col-span-6">{c.initiatives.lede}</p>
          </section>

          {/* One row per initiative: photograph, category, title, card copy,
              and the link — the initiative card's grammar, laid flat. */}
          <section className="bdc-stop-11 flex flex-col pb-20 lg:pb-[120px]">
            {c.initiatives.items.map((it) => (
              <Link
                key={it.slug}
                href={`/${locale}/initiatives/${it.slug}`}
                className="group border-t border-border py-10 lg:py-12"
              >
                <div className="bdc-grid gap-y-6">
                  {it.cover && (
                    <div className="relative col-span-full aspect-[3/2] overflow-hidden bg-brand md:col-span-3">
                      <Image
                        src={it.cover.src}
                        alt={it.cover.alt}
                        fill
                        sizes="(max-width: 767px) 92vw, 300px"
                        quality={80}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="col-span-full flex flex-col items-start gap-4 md:col-start-5 md:col-span-7">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
                      <span className="t-caption">{it.label}</span>
                    </div>
                    <h2 className="t-h03">{it.title}</h2>
                    <p className="t-body">{it.text}</p>
                    <span className="t-caption inline-flex items-center gap-6 border-b-2 border-transparent pb-0.5 transition-colors group-hover:border-current">
                      {c.ui.readMore} <span aria-hidden>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            <div className="border-t border-border" aria-hidden />
          </section>
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
