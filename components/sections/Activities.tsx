/**
 * Activities / "Активности" — the events list on the home page.
 *
 * Async server component: pulls localized events (Notion at build time, mock
 * until wired — see lib/events.ts) and renders one row each: date · name · type,
 * with a → that fades in on hover. Each row links to /[locale]/events/[slug];
 * on the home page that navigation is intercepted by the @modal parallel route
 * and shown as an <OverlayPanel/> overlay instead of a full page.
 */
import { ActivitiesList } from "@/components/sections/ActivitiesList";
import { getEvents } from "@/lib/events";
import type { Locale } from "@/lib/home-content";

export async function Activities({
  locale,
  heading,
  showMoreLabel,
}: {
  locale: Locale;
  heading: string;
  /** Localized "Show more ({count})". */
  showMoreLabel: string;
}) {
  const events = await getEvents(locale);
  if (events.length === 0) return null;

  return (
    <section id="activities" className="bdc-stop-11 py-20 md:py-28">
      <div className="bdc-grid">
        <h2 className="t-h02 col-span-full lg:col-span-8">{heading}</h2>

        {/* Indented to start at column 2 on desktop (per design); the list
            then runs to the grid's right edge. Full width on tablet/mobile.
            The rows are a client component only because the fold needs a
            click — they are still rendered here, on the server. */}
        <ActivitiesList events={events} locale={locale} showMoreLabel={showMoreLabel} />
      </div>
    </section>
  );
}
