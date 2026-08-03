/**
 * Accessibility statement — /bg/accessibility, /en/accessibility.
 *
 * Deliberately the privacy page's shell, layout and components verbatim: the
 * two are the same kind of document, and a reader who has seen one should not
 * have to learn a second set of conventions to read the other. The only
 * difference is which content module it reads.
 *
 * The content is in lib/accessibility-content.ts, and every claim in it is a
 * factual statement about this site that was verified when written. Read the
 * warning at the top of that file before editing it.
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
import { getAccessibilityContent } from "@/lib/accessibility-content";
import { localeAlternates, openGraphBase } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const { meta } = getAccessibilityContent(locale);
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeAlternates(locale, "/accessibility"),
    openGraph: openGraphBase(
      locale,
      "/accessibility",
      { title: meta.title, description: meta.description },
      getContent(locale).meta.title,
    ),
  };
}

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const legal = getAccessibilityContent(locale);

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
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="/accessibility" initiatives={c.initiatives} />

        <main id="main" tabIndex={-1} className="py-20 md:py-28">
          <header className="max-w-[632px]">
            <h1 className="t-h02">{legal.title}</h1>
            <p className="t-body-lg mt-4">{legal.lead}</p>
            <p className="t-caption mt-6 opacity-70">{legal.updated}</p>
          </header>

          {/* Body sits in cols 5–10 on desktop, matching the FAQ measure. The
              index takes cols 1–3, which were empty, so nothing moves. */}
          <div className="bdc-grid mt-16 md:mt-20">
            <div className="hidden lg:col-start-1 lg:col-span-3 lg:block">
              <PageToc
                label={legal.onThisPage}
                items={legal.sections.map((section, i) => ({
                  id: legalSectionId(section, i),
                  label: section.title,
                }))}
              />
            </div>

            <div className="col-span-4 md:col-span-8 lg:col-start-5 lg:col-span-6">
              {legal.sections.map((section, i) => (
                <section
                  key={section.title}
                  id={legalSectionId(section, i)}
                  // Focusable only as a scroll target, so jumping from the
                  // index also moves the reading position. Being in `[tabindex]`
                  // picks up the global scroll-margin-top that keeps a heading
                  // out from under the fixed header.
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
                  {legal.backLabel}
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
