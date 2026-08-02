/**
 * Full event page — the target of a hard navigation (shared link, refresh, or
 * no-JS). Soft navigation from the home list is intercepted by the sibling
 * @modal/(.)events/[slug] route and shown as an overlay instead. Both reuse the
 * same <OverlayPanel/> + <EventOverlayContent/>; here the ✕ routes home rather
 * than calling history.back().
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OverlayPanel } from "@/components/ui/OverlayPanel";
import { EventOverlayContent } from "@/components/ui/EventOverlayContent";
import { getEvent, getEventSlugs } from "@/lib/events";
import { localeAlternates, openGraphBase } from "@/lib/seo";
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
  return {
    title: event.name,
    description: event.description,
    alternates: localeAlternates(locale, path),
    openGraph: {
      ...openGraphBase(
        locale,
        path,
        { title: event.name, description: event.description, type: "article" },
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

  return (
    <>
      <JsonLd data={eventNode(event, locale, getContent(locale).meta.title)} />
    <OverlayPanel homeHref={`/${locale}`}>
      <EventOverlayContent event={event} ui={getContent(locale).ui} />
    </OverlayPanel>
    </>
  );
}
