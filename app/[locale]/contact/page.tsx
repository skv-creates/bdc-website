/**
 * Contact — /bg/contact, /en/contact.
 *
 * Calm and direct, in three movements: the invitation — «Контакти», "Идеите
 * започват с разговор.", the answering promise and the mailbox itself; the
 * three pathways as selectable destinations — whole cards, hover band, each
 * leading to the door that is staffed for it; and the official details lower
 * down, where they reassure (a grants reviewer still needs to find them)
 * without being the page's opening experience.
 *
 * There is no form here on purpose: /partner already carries the one form
 * this codebase owns. And the pattern rail is rendered after the content —
 * it is position:fixed, so the page looks identical, but its recolour button
 * stops being the first thing the keyboard lands on.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { getContent, hasLocale } from "@/lib/home-content";
import { CONTACT_COPY } from "@/lib/contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = CONTACT_COPY[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/contact"),
    openGraph: openGraphBase(
      locale,
      "/contact",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = CONTACT_COPY[locale];

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
          path="/contact"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[72px] md:pt-[120px]">
          {/* The invitation: eyebrow, the line, the promise, the mailbox. */}
          <div className="flex max-w-[1056px] flex-col gap-8">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-band)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.eyebrow}</span>
            </div>

            <h1 className="t-h01 max-w-[732px]">{copy.title}</h1>

            <p className="t-body max-w-[540px]">{copy.lead}</p>

            {/* The address comes from `footer`, so it changes in one place. */}
            <a
              href={`mailto:${c.footer.email}`}
              className="t-body group self-start font-bold [overflow-wrap:anywhere]"
            >
              <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                {c.footer.email}
              </span>
            </a>
          </div>

          {/* The three pathways, immediately underneath — whole cards are the
              links, with the hover band the site's rows use, so they read as
              destinations rather than paragraphs. ↗ for the application that
              leaves the site, → for the pages that stay. */}
          <div className="mt-20 flex max-w-[1056px] flex-col gap-8">
            <h2 className="t-h02">{copy.routesHeading}</h2>
            <div className="grid border-t border-border md:grid-cols-3 md:border-t-0">
              {copy.routes.map((r) => {
                const external = r.href.startsWith("http");
                return (
                  <a
                    key={r.title}
                    href={external ? r.href : `/${locale}${r.href}`}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="group flex flex-col gap-3 border-b border-border py-6 transition-colors hover:bg-brand md:border-b-0 md:border-t md:px-5 md:py-8 md:first:pl-0 md:last:pr-0"
                  >
                    <h3 className="t-h05">{r.title}</h3>
                    <p className="t-body">{r.body}</p>
                    <span className="t-caption mt-auto inline-flex items-center gap-2 pt-3 font-medium">
                      {r.label}
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-1"
                      >
                        {external ? "↗" : "→"}
                      </span>
                      {external && <span className="sr-only"> {c.footer.newWindow}</span>}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* The official details — reassurance, not the main event. */}
          <div className="mt-24 flex max-w-[516px] flex-col gap-6">
            <h2 className="t-caption font-bold">{copy.legalHeading}</h2>
            <div className="flex flex-col gap-1">
              <p className="t-body font-bold">{copy.orgName}</p>
              <p className="t-body">
                {copy.orgStatus} · {copy.orgUic}
              </p>
            </div>
            <p className="t-body">
              <span className="t-caption block">{copy.addressLabel}</span>
              {copy.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="t-caption">
              {copy.privacyNote}{" "}
              <a href={`/${locale}/privacy`} className="group">
                <span className="border-b border-current transition-colors group-hover:border-transparent">
                  {copy.privacyLabel}
                </span>
              </a>
              .
            </p>
          </div>
        </main>
      </div>

      {/* After the content on purpose: fixed-positioned, so it paints exactly
          where it always does, but its recolour button is no longer an early
          keyboard tab stop on a page whose job is the mailbox. */}
      <PatternRail locale={locale} />

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
