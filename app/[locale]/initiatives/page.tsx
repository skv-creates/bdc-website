/**
 * /[locale]/initiatives — the index the navigation never had.
 *
 * The nav's «Инициативи» is a mega-menu *button*, which works for a pointer
 * and gives a crawler nothing: there was no URL that collects and explains
 * the council's activities. This page is that URL — the Ad Grants policy
 * asks for exactly such a place ("describe its activities or services").
 *
 * Everything is reused: the section's own eyebrow + standfirst grammar for
 * the head, and the events page's ruled-row list for the four initiatives —
 * title, category and the hover →, with each card's blurb underneath.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import Image from "next/image";
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

          {/* The four initiatives as the events page's own ruled rows —
              each initiative's cover photograph leading the row, then title,
              category and the → that answers hover, with the card blurb
              carried underneath so the page still describes each activity. */}
          <section className="bdc-stop-11 bdc-grid pb-20 lg:pb-[120px]">
            <ul className="col-span-full border-b border-border lg:col-start-2 lg:col-span-10">
              {c.initiatives.items.map((it) => (
                <li key={it.slug} className="border-t border-border">
                  {/* A plain <a>, not <Link>, on purpose: client-side
                      navigation to /initiatives/[slug] is intercepted by
                      @modal/(.)initiatives/[slug] and opens the overlay. From
                      an index whose whole job is to lead into the initiative
                      pages, the full page is the right destination, and only
                      a full navigation reaches it. */}
                  <a
                    href={`/${locale}/initiatives/${it.slug}`}
                    className="group grid grid-cols-4 gap-x-6 py-6 transition-colors hover:bg-brand md:grid-cols-10"
                  >
                    {it.cover && (
                      <span className="relative col-span-4 row-start-1 mb-4 block aspect-square overflow-hidden md:col-span-2 md:row-span-2 md:mb-0">
                        <Image
                          src={it.cover.src}
                          alt={it.cover.alt}
                          fill
                          sizes="(max-width: 767px) 90vw, 20vw"
                          className="object-cover"
                          style={{ objectPosition: it.cover.focal ?? "center" }}
                        />
                      </span>
                    )}
                    <span className="t-body-lg col-span-3 row-start-2 font-bold md:col-start-3 md:col-span-5 md:row-start-1">
                      {it.title}
                    </span>
                    <span className="t-body col-span-4 row-start-3 mt-2 md:col-start-3 md:col-span-5 md:row-start-2 md:mt-3">
                      {it.text}
                    </span>
                    <span className="t-caption col-start-4 row-start-2 md:col-span-2 md:col-start-8 md:row-start-1 md:mt-1">
                      {it.label}
                    </span>
                    <span
                      className="col-start-4 row-start-1 hidden opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:col-start-10 md:block"
                      aria-hidden
                    >
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
