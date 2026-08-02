"use client";

/**
 * ExternalLink — a reference to another site that never takes you off this one
 * by accident.
 *
 * Clicking the text opens a small panel in place naming the destination. Only
 * the "open" control inside that panel actually navigates. So a stray click on
 * a reference mid-sentence leaves you exactly where you were reading, and
 * leaving is always a second, deliberate act.
 *
 * The reason it works this way is a browser rule, not a preference: a page
 * cannot open a tab and keep focus. `window.open` focuses the new tab, and
 * calling `blur()` on it and `focus()` on the opener has been blocked in
 * Chrome, Safari and Firefox for years — that is the anti-popunder rule, and
 * anything that appears to defeat it is one browser update from stopping. So
 * the choice is not "new tab with or without focus"; it is "does a click leave
 * at all". This makes the answer no.
 *
 * A lightbox was the other candidate and cannot be built for these links:
 * studiokomplekt.com and theicod.org both send X-Frame-Options: SAMEORIGIN and
 * LinkedIn blocks framing in practice, so an embedded panel would come up
 * blank for some references and work for others.
 */
import { useEffect, useRef, useState } from "react";

export function ExternalLink({
  href,
  children,
  newTabLabel,
  openLabel,
}: {
  href: string;
  children: React.ReactNode;
  /** Localized "opens in a new tab". */
  newTabLabel: string;
  /** Localized label on the control that actually leaves. */
  openLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);

  // Bare hostname: "www." carries no meaning for a reader and costs width in a
  // panel that has to sit inside the column.
  let host = href;
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    /* Not parseable — show the raw href rather than nothing. */
  }

  // Close on Escape or on a click elsewhere. Without this the panel is a thing
  // you can open and not obviously get rid of, which is worse than the link.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <span ref={wrap} className="group/ext relative inline">
      {/* A button, not an anchor: it does not navigate, and dressing a control
          that opens a panel as a link would promise something it does not do —
          to a screen reader most of all. It keeps the link's appearance
          because in the middle of a sentence that is what it is. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="cursor-pointer underline underline-offset-2 transition-opacity hover:opacity-70"
      >
        {children}
        <span aria-hidden className="ms-1 inline-block align-baseline text-[0.85em]">
          ↗
        </span>
      </button>

      {/* Hover shows the destination; a click pins it and adds the way out.
          Both states are the same card, so it does not appear to change into
          something else under the cursor. */}
      <span
        className={`absolute bottom-full left-0 z-30 w-max max-w-[min(22rem,80vw)] pb-2 transition-opacity duration-[120ms] ease-out md:block ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none hidden opacity-0 group-hover/ext:opacity-100 group-focus-within/ext:opacity-100"
        }`}
      >
        <span className="flex flex-col gap-2 rounded-2xl bg-dark px-4 py-3 text-text-invert">
          <span className="t-caption font-bold">{host}</span>
          {open ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="t-caption inline-flex items-center gap-2 underline underline-offset-2 opacity-90 transition-opacity hover:opacity-100"
            >
              {openLabel}
              <span aria-hidden>↗</span>
              <span className="sr-only"> ({newTabLabel})</span>
            </a>
          ) : (
            <span className="t-caption opacity-80">{newTabLabel}</span>
          )}
        </span>
      </span>
    </span>
  );
}
