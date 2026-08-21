"use client";

import { useSyncExternalStore } from "react";

/** Never fires — the value below changes only with a new page load. */
const subscribeToNothing = () => () => {};

/**
 * The "Предстоящо" chip on the events index — client-side on purpose.
 *
 * The index is prerendered, so any past/upcoming decision taken at build time
 * freezes: the morning after an event, a build-time "upcoming" is simply
 * wrong, and the page only rebuilds when somebody deploys. Deciding in the
 * browser keeps the label honest at the moment it is read. On the server
 * (and without JavaScript) nothing renders — the full date printed beside
 * the title already carries the information; the chip is emphasis, not data.
 */
export function UpcomingBadge({ date, label }: { date: string; label: string }) {
  // Today's date as the client sees it; null during SSR. A string snapshot is
  // stable for the whole day, which is exactly as often as it should change.
  const today = useSyncExternalStore(
    subscribeToNothing,
    () => new Date().toISOString().slice(0, 10),
    () => null,
  );

  // A calendar day, not an instant: the event stays "upcoming" through its
  // own day and becomes past at the following midnight.
  if (!today || date < today) return null;
  return (
    <span
      className="t-caption inline-block px-2 py-0.5"
      style={{ background: "var(--bdc-amber)" }}
    >
      {label}
    </span>
  );
}
