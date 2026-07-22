/**
 * Intercepted event route → renders the event inside <OverlayPanel/> as a modal
 * over the home page (soft navigation). The matching full page lives at
 * app/[locale]/events/[slug]/page.tsx for hard nav / shareable URLs.
 *
 * `(.)events` intercepts the sibling `events` segment; `@modal` is a slot, not a
 * segment, so it doesn't count toward the interception level.
 */
import { notFound } from "next/navigation";
import { OverlayPanel } from "@/components/ui/OverlayPanel";
import { EventOverlayContent } from "@/components/ui/EventOverlayContent";
import { getEvent, getEventSlugs } from "@/lib/events";
import { hasLocale } from "@/lib/home-content";

export async function generateStaticParams() {
  return getEventSlugs();
}

export default async function InterceptedEventModal({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const event = await getEvent(locale, slug);
  if (!event) notFound();

  return (
    <OverlayPanel homeHref={`/${locale}`} intercepted>
      <EventOverlayContent event={event} />
    </OverlayPanel>
  );
}
