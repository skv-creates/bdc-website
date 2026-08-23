"use client";

/**
 * The partner form as a side drawer — what the initiative action buttons
 * open instead of leaving the page.
 *
 * Built on the native <dialog>, which is what makes the accessibility
 * hold together without re-implementing it: showModal() traps focus and
 * inerts the page behind, Escape closes, and on close the browser returns
 * focus to the button that opened it. On top of that: aria-labelledby
 * names the dialog by its visible heading, the backdrop click closes, the
 * page's scroll locks while it is open, the panel is a right-hand sheet
 * on desktop and the full viewport on a phone, and every motion is
 * wrapped in motion-safe so a reduced-motion visitor gets an instant
 * open. The form inside is the same PartnerFormFields the /partner page
 * renders — labels, honeypot and all — POSTing exactly the same way.
 */
import { useEffect, useId, useRef } from "react";
import { PartnerFormFields } from "@/components/partner/PartnerFormFields";
import { PilotFormFields } from "@/components/partner/PilotFormFields";
import { PARTNER_COPY, type Locale } from "@/lib/partner";
import { PILOT_COPY } from "@/lib/pilot";

export function PartnerDrawer({
  open,
  onClose,
  locale,
  topic,
  intent,
  prompt,
  mode = "partner",
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  topic?: string;
  /** The specific ask — the button's own label; heads the drawer and the
      email's subject so a pilot never reads as a partnership. */
  intent?: string;
  /** The ask spelled out — the drawer's lead when the button carries one. */
  prompt?: string;
  /** "pilot" swaps in the pilot enquiry — its own copy and its own form. */
  mode?: "partner" | "pilot";
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const pilot = mode === "pilot";
  const copy = PARTNER_COPY[locale];
  const pilotCopy = PILOT_COPY[locale];

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // The page behind the drawer must not scroll — same rule as the nav
  // drawer, for the same reason.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      aria-labelledby={headingId}
      onClose={onClose}
      // No backdrop-click close on purpose: a half-filled form is too easy
      // to lose to a stray click. The ways out are the ✕ and Escape.
      className="fixed m-0 h-dvh max-h-none w-full max-w-none bg-page p-0 backdrop:bg-[rgba(21,21,21,0.4)] sm:ml-auto sm:max-w-[600px] motion-safe:transition-transform"
    >
      <div className="flex h-full flex-col gap-10 overflow-y-auto overscroll-contain px-6 pb-8 md:px-10 md:pb-10">
        {/* The bar stays put while the form scrolls under it: the eyebrow
            keeps saying where you are and the close stays reachable without
            scrolling back up. Negative margins let its background run the
            drawer's full width so content slides beneath, not beside. */}
        <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-6 bg-page px-6 py-6 md:-mx-10 md:px-10">
          {/* Stacked, not inline: the drawer is narrow and the pair wrapped
              into two ragged columns. Same voice for both lines; the note
              starts where the label's text does. */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-band)" }}
                aria-hidden
              />
              <span className="t-caption">{pilot ? pilotCopy.eyebrow : copy.eyebrow}</span>
            </div>
            {pilot && <span className="t-caption pl-7">{pilotCopy.timeNote}</span>}
          </div>
          {/* 44px hit area, visible focus, named in the page's language. */}
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === "bg" ? "Затвори" : "Close"}
            className="flex size-11 shrink-0 items-center justify-center transition-colors hover:bg-brand"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <h2 id={headingId} className="t-h03">
          {pilot ? pilotCopy.title : (intent ?? copy.title)}
        </h2>

        <p className="t-body max-w-[52ch]">{pilot ? pilotCopy.lead : (prompt ?? copy.lead)}</p>

        {pilot ? (
          <PilotFormFields locale={locale} defaultInitiative={topic} />
        ) : (
          <PartnerFormFields locale={locale} defaultTopic={topic} intent={intent} />
        )}
      </div>
    </dialog>
  );
}
