/**
 * Events index — /bg/events, /en/events.
 *
 * Every synced event, newest first, with its full date (year included — the
 * home page's list can afford "25.04", an archive cannot), its format, where
 * it happened, and the opening of its description. Each row links to the
 * event's own page.
 *
 * Plain <a> links, same rule as the mega menu: a soft navigation would be
 * caught by the @modal/(.)events interceptor and open the overlay on top of
 * this page, and the destination here is the event's own document.
 *
 * The "upcoming" chip is client-rendered — see components/events/UpcomingBadge.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { UpcomingBadge } from "@/components/events/UpcomingBadge";
import { getContent, hasLocale } from "@/lib/home-content";
import { getEvents } from "@/lib/events";
import { EVENTS_INDEX_COPY } from "@/lib/events-index";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = EVENTS_INDEX_COPY[locale];
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

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = EVENTS_INDEX_COPY[locale];
  const events = await getEvents(locale);

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

            <ul className="flex flex-col">
              {events.map((e) => (
                <li key={e.slug} className="border-t border-border">
                  {/* The whole row is the link — a block anchor, so the date,
                      the title and the excerpt all take a visitor to the page. */}
                  <a
                    href={`/${locale}/events/${e.slug}`}
                    className="group grid gap-x-8 gap-y-3 py-8 md:grid-cols-[10rem_1fr]"
                  >
                    <div className="flex flex-col items-start gap-2">
                      {/* The full date, year included: an archive is read long
                          after "25.04" stops being obvious. */}
                      <time dateTime={e.date} className="t-body font-bold">
                        {e.dateLong}
                      </time>
                      <UpcomingBadge date={e.date} label={copy.upcoming} />
                    </div>
                    <div className="flex max-w-[640px] flex-col gap-3">
                      <h2 className="t-h05">
                        <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                          {e.name}
                        </span>
                      </h2>
                      <p className="t-caption flex items-center gap-2">
                        <span
                          aria-hidden
                          className="size-2 shrink-0"
                          style={{ background: e.type.accent }}
                        />
                        {e.type.label}
                        {e.location && <span> · {e.location}</span>}
                      </p>
                      {/* The description's opening paragraph, clamped: enough
                          to say what the council did there, short enough that
                          the archive stays a list. The full text is one click
                          away. */}
                      {e.description && (
                        <p className="t-body line-clamp-3">
                          {e.description.split("\n\n")[0]}
                        </p>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
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
