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
import { hasLocale } from "@/lib/home-content";

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
  return event ? { title: event.name, description: event.description } : {};
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
    <OverlayPanel homeHref={`/${locale}`}>
      <EventOverlayContent event={event} />
    </OverlayPanel>
  );
}
