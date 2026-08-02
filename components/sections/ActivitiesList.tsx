"use client";

/**
 * The event rows, with the older ones folded away behind a "show more" button.
 *
 * Every row is rendered on the server and present in the HTML — the button
 * only unhides them. Fetching the rest on click would be the obvious reading
 * of "load all other" and is the wrong one here: the whole list is a few
 * kilobytes of text, it is already in the page, and making it a request would
 * cost a round trip, hide the events from anyone without JavaScript, and keep
 * them out of the page a search engine indexes.
 */
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import type { BdcEvent } from "@/lib/events";
import type { Locale } from "@/lib/home-content";

/** How many stay visible before the fold. */
const VISIBLE = 5;

export function ActivitiesList({
  events,
  locale,
  showMoreLabel,
}: {
  events: BdcEvent[];
  locale: Locale;
  /** Localized, with {count} where the number goes. */
  showMoreLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(0, events.length - VISIBLE);

  return (
    <div className="col-span-full mt-12 md:mt-16 lg:col-start-2 lg:col-span-10">
      <ul className="border-b border-border">
        {events.map((e, i) => (
          <li
            key={e.slug}
            className="border-t border-border"
            // Kept in the DOM rather than sliced out of it, so the list is
            // whole for a crawler and for anyone with JavaScript off — for
            // whom `hidden` simply never gets removed, and who get five
            // events rather than a broken button.
            hidden={!expanded && i >= VISIBLE}
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
                className="col-start-4 row-start-1 hidden justify-self-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:col-start-11 md:block lg:col-start-10"
                aria-hidden
              >
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Disappears once used. There is no "show less": the rows are a short
          list, not a long article, and a control that folds them back up is
          one more thing to reason about for no gain. */}
      {hidden > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="t-caption mt-6 inline-flex min-h-11 items-center gap-3 rounded-full border-2 border-border px-6 font-medium transition-colors hover:bg-text hover:text-page"
        >
          {showMoreLabel.replace("{count}", String(hidden))}
          <span aria-hidden>↓</span>
        </button>
      )}
    </div>
  );
}
