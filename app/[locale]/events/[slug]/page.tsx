/**
 * Full event page — the target of a hard navigation (shared link, refresh, a
 * search result, or no-JS). Soft navigation from the home list is intercepted
 * by the sibling @modal/(.)events/[slug] route and shown as an overlay instead.
 *
 * This route used to render <OverlayPanel/> and nothing else, which meant the
 * page a visitor landed on from Google had no site navigation at all: no nav,
 * no footer, no skip link, and not a single link out except the ✕, which goes
 * to the home page. Every other page on the site carries the rail + nav +
 * footer shell; the event page was alone in not doing so, and the note in
 * app/[locale]/initiatives/[slug]/page.tsx has flagged the divergence as
 * unreconciled since that page was written.
 *
 * It is reconciled now, and this file follows that one. An event link is the
 * most-shared URL on the site — it is what goes into a newsletter or a post —
 * so it is the page most likely to be somebody's first, and it was the one
 * page with no way onward and no language toggle.
 *
 * The intercepted modal still uses the panel — over the home page it is a
 * dialog, and the navigation it needs is the page underneath.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventOverlayContent } from "@/components/ui/EventOverlayContent";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { getEvent, getEventSlugs } from "@/lib/events";
import { localeAlternates, plainText, openGraphBase } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { eventNode } from "@/lib/structured-data";
import { getContent, hasLocale } from "@/lib/home-content";

export async function generateStaticParams() {
  return getEventSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};
  const event = await getEvent(locale, slug);
  // A missing event falls through to notFound(); emitting a canonical for a
  // page that is about to 404 would invite crawlers to keep asking for it.
  if (!event) return {};
  const path = `/events/${slug}`;
  // The Notion body verbatim is not a description: it carries the sync's
  // `[label](url)` runs and its blank lines straight into the tag. Stripped
  // once and used for both, so the search snippet and the share card cannot
  // drift apart. Not shortened — see plainText in lib/seo.ts.
  const description = plainText(event.description);
  return {
    title: event.name,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: {
      ...openGraphBase(
        locale,
        path,
        { title: event.name, description, type: "article" },
        getContent(locale).meta.title,
      ),
      // The event's own photographs, with the dimensions already recorded for
      // the gallery — so a share card is the actual event, not a generic one.
      // Events without any fall through to the site card.
      ...(event.covers.length
        ? {
            images: event.covers.slice(0, 1).map((c) => ({
              url: c.src,
              width: c.width,
              height: c.height,
              alt: event.name,
            })),
          }
        : {}),
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const event = await getEvent(locale, slug);
  if (!event) notFound();
  const c = getContent(locale);

  return (
    <>
      <JsonLd data={eventNode(event, locale, c.meta.title)} />
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>
      <PatternRail locale={locale} />

      {/* Same symmetric shell as every other page: gutter left, rail right. */}
      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        {/* `path` keeps the nav's "#..." links pointing back at the home route
            and holds the language toggle on this event — which only works
            because slugs are locale-neutral. */}
        <SiteNav
          nav={c.nav}
          ui={c.ui}
          locale={locale}
          path={`/events/${slug}`}
          initiatives={c.initiatives}
        />

        {/* No .bdc-stop-11 here — EventOverlayContent applies it itself in its
            page variant, and nesting it inside another one narrows the column
            twice. */}
        <main id="main" tabIndex={-1} className="pb-20 md:pb-[72px]">
          <EventOverlayContent
            event={event}
            ui={c.ui}
            locale={locale}
            variant="page"
            cta={c.eventCta}
          />
        </main>
      </div>


      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
