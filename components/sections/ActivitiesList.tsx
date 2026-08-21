/**
 * The event rows — the one layout events are listed in, on the home page and
 * on /events alike.
 *
 * On the home page (`seeAll` supplied) the older rows are folded away and the
 * control under the list is a link to the events page, where every row shows.
 * The folded rows are still rendered and present in the HTML — `hidden` only
 * unpaints them — so the list is whole for a crawler and the count in the
 * link's label is honest.
 *
 * No "use client": since the fold stopped being a click and became a page,
 * nothing here needs JavaScript.
 */
import Link from "next/link";
import type { BdcEvent } from "@/lib/events";
import type { Locale } from "@/lib/home-content";

/** How many stay visible before the fold, where a fold is asked for. */
const VISIBLE = 5;

export function ActivitiesList({
  events,
  locale,
  seeAll,
}: {
  events: BdcEvent[];
  locale: Locale;
  /**
   * Fold the list after five rows and close it with a link to the full
   * archive. `label` is localized, with {count} where the number of folded
   * rows goes. Omit on the events page itself, which shows everything.
   */
  seeAll?: { label: string; href: string };
}) {
  const hidden = seeAll ? Math.max(0, events.length - VISIBLE) : 0;

  return (
    <div className="col-span-full mt-12 md:mt-16 lg:col-start-2 lg:col-span-10">
      <ul className="border-b border-border">
        {events.map((e, i) => (
          <li
            key={e.slug}
            className="border-t border-border"
            hidden={hidden > 0 && i >= VISIBLE}
          >
            <Link
              href={`/${locale}/events/${e.slug}`}
              className="group grid grid-cols-4 items-baseline gap-x-6 py-3 transition-colors hover:bg-brand md:grid-cols-11 lg:grid-cols-10"
            >
              <span className="t-caption col-span-1">{e.dateShort}</span>
              <span className="t-body-lg col-span-3 font-bold md:col-span-4 md:col-start-3 lg:col-start-2">
                {e.name}
              </span>
              <span className="t-body col-span-4 mt-1 md:col-span-3 md:col-start-8 md:mt-0 lg:col-start-7">
                {e.type.label}
              </span>
              <span
                // Left-aligned in the last column, not justify-self-end. Pushed
                // to the row's end it sat hard against the edge of the hover
                // band with nothing after it, which reads as clipped. Starting
                // the column leaves the rest of that column as the gap — the
                // same thing the mega menu's initiative rows do, and the reason
                // theirs sit comfortably.
                className="col-start-4 row-start-1 hidden opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:col-start-11 md:block lg:col-start-10"
                aria-hidden
              >
                {/* → and not ↗, and the same glyph the mega menu's initiative
                    rows use rather than an icon that only resembles it. The
                    up-right arrow reads as "leaves the site" — it is what the
                    footer's external links carry — and every row here goes to
                    an event page on this site. Two arrows for two meanings; a
                    row that stays put gets the one that points along. */}
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Right-aligned, under the end of the rows, so it reads as belonging to
          the list rather than starting a new block beneath it. A link now, not
          a reveal: the rows it used to unfold live on the events page, which
          also holds the full dates and the older years the home page's five
          rows cannot. Plain <a> — the destination is the index, which no
          @modal route intercepts, but the archive is a document, not an
          overlay. */}
      {hidden > 0 && seeAll && (
        <div className="mt-6 flex justify-end">
          <a
            href={seeAll.href}
            className="t-caption group inline-flex min-h-11 items-center gap-3 font-medium"
          >
            {seeAll.label.replace("{count}", String(hidden))}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
