/**
 * Initiatives index — /bg/initiatives, /en/initiatives.
 *
 * Like the events index, this route had only a `[slug]` child, so the four
 * initiative pages were reachable from a mega-menu and a home-page section and
 * nowhere else — and /bg/initiatives, which is the URL a person types, 404'd.
 *
 * The list needs no filtering of its own: applyCms() in lib/home-content.ts
 * drops `published: false` initiatives once, for every call site, which is why
 * the two unpublished ones are absent from the sitemap and 404 on their slugs.
 */
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { PatternTile } from "@/components/initiatives/patterns";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { getContent, hasLocale } from "@/lib/home-content";
import { LISTING_COPY } from "@/lib/listings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = LISTING_COPY[locale].initiatives;
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/initiatives"),
    openGraph: openGraphBase(
      locale,
      "/initiatives",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

export default async function InitiativesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = LISTING_COPY[locale].initiatives;
  const items = c.initiatives.items;

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
        <SiteNav
          nav={c.nav}
          ui={c.ui}
          locale={locale}
          path="/initiatives"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[72px] md:pt-[120px]">
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
          </div>

          {/* Two per row from md. Each photograph carries its own alt text in
              the content file, so nothing here invents one — and an initiative
              with no picture yet falls back to its pattern tile, exactly as the
              mega menu does, rather than leaving a hole in the grid.
              `cardCover ?? cover` is the same precedence the carousel card and
              the mega-menu preview use: the small photograph where one exists. */}
          <section className="mt-16 grid max-w-[1056px] gap-12 md:mt-20 md:grid-cols-2">
            {items.map((item) => {
              const art = item.cardCover ?? item.cover;
              return (
              <article key={item.slug} className="flex flex-col gap-5">
                <a href={`/${locale}/initiatives/${item.slug}`} className="group flex flex-col gap-5">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {art ? (
                      <Image
                        src={art.src}
                        alt={art.alt}
                        fill
                        sizes="(max-width: 767px) 90vw, 45vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <PatternTile n={item.pattern} />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2 w-4 shrink-0"
                      style={{ background: "var(--tri-accent)" }}
                      aria-hidden
                    />
                    <span className="t-caption">{item.label}</span>
                  </div>
                  <h2 className="t-h03 border-b-2 border-transparent transition-colors group-hover:border-current">
                    {item.title}
                  </h2>
                  <p className="t-body">{item.text}</p>
                </a>
              </article>
              );
            })}
          </section>
        </main>
      </div>

      <div className="relative z-30 flex h-3" aria-hidden>
        <span className="w-[8.55%]" style={{ background: "var(--tri-accent)" }} />
        <span className="w-[36.75%]" style={{ background: "var(--tri-band)" }} />
        <span className="flex-1" style={{ background: "var(--tri-ground)" }} />
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
