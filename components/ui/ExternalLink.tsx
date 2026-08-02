/**
 * ExternalLink — a link out of the site, which says where it goes before you
 * follow it.
 *
 * On hover or focus it shows the destination in the same dark card the team
 * avatars use, so a reader can see they are about to leave and where to,
 * rather than finding out once a tab has already opened.
 *
 * Two things this deliberately does NOT do, both because they cannot be made
 * to work rather than because they were not considered:
 *
 * - It does not load the page in a lightbox. Several of the sites linked from
 *   the event copy refuse to be framed at all — studiokomplekt.com and
 *   theicod.org both send X-Frame-Options: SAMEORIGIN, and LinkedIn blocks it
 *   in practice — so a modal would open blank for some links and work for
 *   others. One predictable behaviour beats a coin flip.
 * - It does not open the tab in the background. A page cannot ask for that:
 *   browsers focus any tab a script opens, and only the reader's own
 *   ⌘/Ctrl-click opens one behind. Anything claiming otherwise is a popup
 *   blocker away from breaking.
 *
 * What it does give is target="_blank", so this page stays exactly where it is
 * in its own tab, plus fair warning about the destination.
 */
export function ExternalLink({
  href,
  children,
  newTabLabel,
}: {
  href: string;
  children: React.ReactNode;
  /** Localized "opens in a new tab" — the site is bilingual. */
  newTabLabel: string;
}) {
  // Bare hostname: "www." carries no meaning for a reader and costs width in a
  // tooltip that has to sit inside the column.
  let host = href;
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    /* Not parseable — show the raw href rather than nothing. */
  }

  return (
    // The wrapper is inline so the link still flows inside its sentence; the
    // tooltip is positioned against it.
    <span className="group/ext relative inline">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 transition-opacity hover:opacity-70"
      >
        {children}
        {/* Marks the link as leaving the site. aria-hidden because the
            accessible name below already says so in words — read out, "↗" is
            either silence or "north east arrow". */}
        <span aria-hidden className="ms-1 inline-block text-[0.85em] align-baseline">
          ↗
        </span>
        <span className="sr-only"> ({newTabLabel})</span>
      </a>

      {/* Same card as the avatar tooltips. pointer-events-none so it can never
          sit between the cursor and the link it belongs to. Hidden below md:
          there is no hover on a phone, and it would only ever cover the text. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-30 hidden w-max max-w-[min(20rem,80vw)] pb-2 opacity-0 transition-opacity duration-[120ms] ease-out group-hover/ext:opacity-100 group-focus-within/ext:opacity-100 md:block"
      >
        <span className="flex flex-col rounded-2xl bg-dark px-4 py-3 text-text-invert">
          <span className="t-caption font-bold">{host}</span>
          <span className="t-caption opacity-80">{newTabLabel}</span>
        </span>
      </span>
    </span>
  );
}
