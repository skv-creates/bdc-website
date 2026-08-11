/**
 * Events index — /bg/events, /en/events.
 *
 * This route previously had only a `[slug]` child, so the index 404'd and the
 * eight event pages were reachable from one place: a section of the home page.
 *
 * The list is derived from getEvents(), newest first — the same source the
 * home-page section and the sitemap use, so a Notion sync adds a row here with
 * no edit. Links are plain <a>, not next/link: a soft navigation to
 * /[locale]/events/[slug] is caught by the @modal/(.)events interceptor and
 * opens the overlay, and from an index the reader has asked for the page.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { getContent, hasLocale } from "@/lib/home-content";
import { getEvents } from "@/lib/events";
import { LISTING_COPY } from "@/lib/listings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = LISTING_COPY[locale].events;
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/events"),
    openGraph: openGraphBase(
      locale,
      "/events",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

export default async function EventsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = LISTING_COPY[locale].events;
  const events = await getEvents(locale);

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
          path="/events"
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

          <section className="mt-16 max-w-[1056px] md:mt-20">
            {events.length === 0 ? (
              <p className="t-body">{copy.empty}</p>
            ) : (
              <ul className="flex flex-col">
                {/* Column heads, hidden below md where the row stacks. */}
                <li
                  className="hidden border-b border-border pb-3 md:grid md:grid-cols-[8rem_1fr_10rem] md:gap-8"
                  aria-hidden
                >
                  <span className="t-caption">{copy.colDate}</span>
                  <span className="t-caption">{copy.colName}</span>
                </li>

                {events.map((e) => (
                  <li
                    key={e.slug}
                    className="group border-b border-border transition-colors duration-[120ms] ease-out hover:bg-brand"
                  >
                    <a
                      href={`/${locale}/events/${e.slug}`}
                      className="grid gap-2 py-5 md:grid-cols-[8rem_1fr_10rem] md:items-baseline md:gap-8"
                    >
                      <span className="t-caption tabular-nums">{e.dateLong}</span>
                      <span className="t-h05">{e.name}</span>
                      {/* The type label carries its own brand accent, as it does
                          in the home-page list. */}
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-4 shrink-0"
                          style={{ background: e.type.accent }}
                          aria-hidden
                        />
                        <span className="t-caption">{e.type.label}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
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
