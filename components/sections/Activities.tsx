/**
 * Activities / "Активности" — the events list on the home page.
 *
 * Async server component: pulls localized events (Notion at build time, mock
 * until wired — see lib/events.ts) and renders one row each: date · name · type,
 * with an ↗ that fades in on hover. Each row links to /[locale]/events/[slug];
 * on the home page that navigation is intercepted by the @modal parallel route
 * and shown as an <OverlayPanel/> overlay instead of a full page.
 */
import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { getEvents } from "@/lib/events";
import type { Locale } from "@/lib/home-content";

export async function Activities({
  locale,
  heading,
}: {
  locale: Locale;
  heading: string;
}) {
  const events = await getEvents(locale);
  if (events.length === 0) return null;

  return (
    <section id="activities" className="py-20 md:py-28">
      <div className="bdc-grid">
        <h2 className="t-h02 col-span-full lg:col-span-8 lg:col-start-2">{heading}</h2>

        {/* Rows align to the heading: full width until lg, then indented to
            start at column 2 (cols 2–11), so the rules begin under it. */}
        <ul className="col-span-full mt-12 border-b border-border md:mt-16 lg:col-span-10 lg:col-start-2">
          {events.map((e) => (
            <li key={e.slug} className="border-t border-border">
              <Link
                href={`/${locale}/events/${e.slug}`}
                className="group grid grid-cols-4 items-baseline gap-x-6 py-3 transition-colors hover:bg-brand md:grid-cols-11 lg:grid-cols-10"
              >
                {/* date — col 1 of the row (page col 2 at lg) */}
                <span className="t-caption col-span-1">{e.dateShort}</span>
                {/* name */}
                <span className="t-body-lg col-span-3 font-bold md:col-span-4 md:col-start-3 lg:col-start-2">
                  {e.name}
                </span>
                {/* type — hidden on the narrowest layout to keep the row readable */}
                <span className="t-body col-span-4 mt-1 md:col-span-3 md:col-start-8 md:mt-0 lg:col-start-7">
                  {e.type.label}
                </span>
                {/* affordance — fades in on hover/focus */}
                <span
                  className="col-start-4 row-start-1 hidden justify-self-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:col-start-11 md:block lg:col-start-10"
                  aria-hidden
                >
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
