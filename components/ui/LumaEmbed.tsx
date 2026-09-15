/**
 * LumaEmbed — Luma's own signup form in the slot the cover image would take.
 *
 * Measured on the live page, the form's Register button appeared some 2.5s
 * after the page itself was ready: the browser only learns about luma.com
 * when it parses the iframe, then makes a dozen requests to it and one to
 * the image CDN, and until Luma paints the slot is a blank rectangle. Two
 * things here shorten that, neither of which touches Luma's side:
 *
 * - `preconnect` to both hosts is emitted in <head> during server render, so
 *   DNS, TCP and TLS are done before the iframe tag is reached.
 * - A placeholder in Luma's own card colour, with the event name and a
 *   loading line, sits underneath the frame. An iframe is transparent until
 *   its document paints, so the card shows through from first paint and Luma
 *   covers it at the exact moment its form is on screen.
 *
 * Not done: hiding the frame until its `load` event. Luma's page keeps
 * fetching route chunks, Sentry and a bot-check script for six seconds after
 * the form is painted, so `load` fires long after the form is usable, and a
 * timer would be a guess in either direction. Nor is the frame lazy: that is
 * right for the below-the-fold stack on phones but defers the desktop form,
 * where it is the first thing in view on the right.
 *
 * The frame is interactive from the start, which is why the placeholder has
 * no link of its own — a button under a transparent frame cannot be clicked,
 * and a button that does nothing is worse than none. It is decoration, and
 * marked as such.
 *
 * The address comes from the row's Регистрация column via `lumaEmbedUrl`; no
 * event is named here. 760px is the height at which the "simple" embed shows
 * the ticket form without its own inner scrollbar; the width is the column's.
 */
import { preconnect } from "react-dom";

const HEIGHT = 760;
/** Luma's card background, sampled from the embed, so the handover does not flash. */
const LUMA_CARD = "rgb(255 236 244)";

export function LumaEmbed({
  src,
  name,
  registerLabel,
  loadingLabel,
}: {
  /** The embed route, from `lumaEmbedUrl`. */
  src: string;
  /** The event title, shown on the placeholder. */
  name: string;
  /** "Регистрирай се" / "Register", from content.ui — the frame's title. */
  registerLabel: string;
  /** "Зарежда се…" / "Loading…", from content.ui. */
  loadingLabel: string;
}) {
  preconnect("https://luma.com");
  preconnect("https://images.lumacdn.com");

  return (
    <div className="relative w-full" style={{ height: HEIGHT, background: LUMA_CARD }}>
      <div aria-hidden className="absolute inset-0 flex flex-col gap-6 p-8">
        <p className="t-h04">{name}</p>
        <p className="t-caption opacity-60">{loadingLabel}</p>
      </div>
      <iframe
        src={src}
        height={HEIGHT}
        className="relative block w-full border-0"
        allow="fullscreen; payment"
        title={`${registerLabel} — ${name}`}
      />
    </div>
  );
}
