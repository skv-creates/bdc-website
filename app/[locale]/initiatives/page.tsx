/**
 * /[locale]/initiatives — the initiatives index (Figma 604:4917).
 *
 * Three movements, per the frame: the head — eyebrow «Инициативи», the
 * display line "Дизайнът в действие." and its standfirst; the archive — one
 * tall cover on the left that follows the pointer, the four initiatives as
 * ruled rows on the right (InitiativeArchive); and the partnerships close —
 * the section's own lede as the heading, a short invitation, and the two
 * doors: the partner form and the volunteer page.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { InitiativeArchive } from "@/components/initiatives/InitiativeArchive";
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
    description: c.initiatives.index.lede,
    alternates: localeAlternates(locale, "/initiatives"),
    openGraph: openGraphBase(
      locale,
      "/initiatives",
      { title: c.initiatives.heading, description: c.initiatives.index.lede },
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
  const index = c.initiatives.index;

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
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="/initiatives" initiatives={c.initiatives} />

        <main id="main" tabIndex={-1} className="pt-16 lg:pt-[120px]">
          {/* The head (604:4923): eyebrow naming the section, the display
              line, the standfirst under it. */}
          {/* Tighter than the other page heads on purpose: the archive is the
              page, and the first cover should be in view without a scroll.
              The display line gets the full grid so it sets on one line. */}
          <section className="bdc-stop-11 bdc-grid gap-y-8 pb-8 lg:pb-10">
            <div className="col-span-full flex items-center gap-3">
              <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
              <span className="t-caption">{c.initiatives.heading}</span>
            </div>
            <h1 className="t-h01 col-span-full">{index.title}</h1>
            <p className="t-body col-span-full lg:col-span-7">{index.lede}</p>
          </section>

          {/* The archive (604:4931): cover left, ruled rows right. */}
          <section className="bdc-stop-11 pb-12">
            <InitiativeArchive
              initiatives={c.initiatives}
              readMore={index.readMore}
              locale={locale}
            />
          </section>

          {/* The partnerships close (611:2630): the section's lede promoted
              to the heading, the invitation, and the two doors. */}
          <section className="bdc-stop-11 py-20 lg:py-[120px]">
            <div className="flex max-w-[1056px] flex-col gap-12">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2 w-4 shrink-0"
                    style={{ background: "var(--bdc-tomato)" }}
                    aria-hidden
                  />
                  <span className="t-caption">{index.partners.eyebrow}</span>
                </div>
                <h2 className="t-h02 max-w-[684px]">{c.initiatives.lede}</h2>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                <p className="t-body max-w-[516px]">{index.partners.body}</p>
                <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:gap-6">
                  <Button href={`/${locale}/partner`} variant="primary">
                    {index.partners.partnerLabel}
                  </Button>
                  <Button href={`/${locale}/volunteer`} variant="secondary">
                    {index.partners.volunteerLabel}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
