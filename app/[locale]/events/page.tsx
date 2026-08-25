/**
 * Events index — /bg/events, /en/events.
 *
 * The full archive, in exactly the layout the home page's five-row list
 * teaches: date · name · type, hairline rows, the same component
 * (ActivitiesList) rendering both so they cannot drift apart. The home list's
 * "see all" link lands here; here every row shows and there is nothing left
 * to unfold.
 *
 * Rows link with next/link, as on the home page, so the @modal/(.)events
 * interceptor opens the event as an overlay on top of the list — the same
 * browsing rhythm the home page has — while a hard visit to the URL still
 * gets the full document.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { ActivitiesList } from "@/components/sections/ActivitiesList";
import { EventCta } from "@/components/ui/EventOverlayContent";
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
          <div className="flex flex-col gap-12">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-band)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.eyebrow}</span>
            </div>

            <h1 className="t-h01 max-w-[732px]">{copy.title}</h1>

            <p className="t-h05 max-w-[540px]">{copy.lead}</p>
          </div>

          {/* The archive, in the home page's own list layout. */}
          <div className="bdc-grid">
            <ActivitiesList events={events} locale={locale} />
          </div>

          {/* The index is a landing page too — it closes with the same next
              step every event page carries, not with a bare end of list. */}
          <EventCta cta={c.eventCta} locale={locale} className="mt-4" />
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
