/**
 * The statute — /bg/statute, /en/statute.
 *
 * Deliberately the privacy and accessibility page verbatim: same shell, same
 * <PageToc/> + <LegalProse/>, same measure. All three are the same kind of
 * document, and a reader who has read one should not have to learn a second
 * set of conventions for the next. Only the content module differs.
 *
 * Why it is a page at all: the statute is what a funder, a partner or an Ad
 * Grants reviewer opens to check the organisation is real, and until now it
 * lived on a Notion share link — off-site, unindexable, styled as somebody's
 * notes, and one sharing-setting change away from being unreachable. On the
 * site it is crawlable, it carries the council's own typography, and it cannot
 * silently disappear.
 *
 * The Bulgarian is the binding text in both locales; see the language note in
 * lib/statute-content.ts for why /en does not carry a translation.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { LegalProse } from "@/components/ui/LegalProse";
import { PageToc } from "@/components/ui/PageToc";
import { getContent, hasLocale } from "@/lib/home-content";
import { legalSectionId } from "@/lib/legal-content";
import { getStatuteContent } from "@/lib/statute-content";
import { localeAlternates, openGraphBase } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const { meta } = getStatuteContent(locale);
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeAlternates(locale, "/statute"),
    openGraph: openGraphBase(
      locale,
      "/statute",
      { title: meta.title, description: meta.description },
      getContent(locale).meta.title,
    ),
  };
}

export default async function StatutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const statute = getStatuteContent(locale);

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
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="/statute" initiatives={c.initiatives} />

        <main id="main" tabIndex={-1} className="py-20 md:py-28">
          <header className="max-w-[632px]">
            <h1 className="t-h02">{statute.title}</h1>
            <p className="t-body-lg mt-4">{statute.lead}</p>
            <p className="t-caption mt-6 opacity-70">{statute.updated}</p>
          </header>

          {/* Body sits in cols 5–10 on desktop; the index takes cols 1–3, which
              were empty. Identical to the privacy and accessibility pages. */}
          <div className="bdc-grid mt-16 md:mt-20">
            <div className="hidden lg:col-start-1 lg:col-span-3 lg:block">
              <PageToc
                label={statute.onThisPage}
                items={statute.sections.map((section, i) => ({
                  id: legalSectionId(section, i),
                  label: section.title,
                }))}
              />
            </div>

            <div className="col-span-4 md:col-span-8 lg:col-start-5 lg:col-span-6">
              {/* /en only. Sits above the articles rather than under them: a
                  reader who does not read Bulgarian needs to know what they
                  are looking at before they start, not after. */}
              {statute.languageNote && (
                <p className="t-body mb-12 border-l-2 border-brand pl-5 opacity-80">
                  {statute.languageNote}
                </p>
              )}

              {statute.sections.map((section, i) => (
                <section
                  key={section.title}
                  id={legalSectionId(section, i)}
                  // Focusable only as a scroll target, so jumping from the
                  // index moves the reading position too.
                  tabIndex={-1}
                  className={`border-t-2 border-border pt-8 ${i > 0 ? "mt-14" : ""}`}
                >
                  <h2 className="t-h05">{section.title}</h2>
                  <div className="mt-6">
                    <LegalProse blocks={section.blocks} />
                  </div>
                </section>
              ))}

              <p className="mt-16">
                <a
                  href={`/${locale}`}
                  className="t-caption border-b-2 border-current transition-opacity hover:opacity-70"
                >
                  {statute.backLabel}
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
