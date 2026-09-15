"use client";
/**
 * LumaEmbed — Luma's own signup form in the slot the cover image would take.
 *
 * Measured on the live page, the form's Register button appeared some 2.5s
 * after the page itself was ready: the browser only learns about luma.com
 * when it parses the iframe, then makes ten requests to it and one to the
 * image CDN, and until Luma paints the slot is a blank rectangle. Three
 * things here shorten that, none of which touch Luma's side:
 *
 * - `preconnect` to both hosts is emitted in <head> during server render, so
 *   DNS, TCP and TLS are done before the iframe tag is reached.
 * - The iframe is eager. It was lazy for a while, which is right for the
 *   below-the-fold stack on phones but defers the desktop form, where it is
 *   the first thing in view on the right.
 * - A placeholder in Luma's own card colour, with the event name and a
 *   Register link to the same page, is server-rendered underneath. It is there
 *   at first paint and stays interactive until the frame's load event, so a
 *   reader who has already decided has something to click at 0ms rather than
 *   at 2.5s. It also stands in when a content blocker refuses the frame.
 *
 * The address comes from the row's Регистрация column via `lumaEmbedUrl`; no
 * event is named here. 760px is the height at which the "simple" embed shows
 * the ticket form without its own inner scrollbar; the width is the column's.
 */
import { useState } from "react";
import { preconnect } from "react-dom";
import { Button } from "@/components/ui/Button";

const HEIGHT = 760;
/** Luma's card background, sampled from the embed, so the swap does not flash. */
const LUMA_CARD = "rgb(255 236 244)";

export function LumaEmbed({
  src,
  href,
  name,
  registerLabel,
}: {
  /** The embed route, from `lumaEmbedUrl`. */
  src: string;
  /** The public event page, for the placeholder's link. */
  href: string;
  /** The event title, shown on the placeholder. */
  name: string;
  /** "Регистрирай се" / "Register", from content.ui. */
  registerLabel: string;
}) {
  preconnect("https://luma.com");
  preconnect("https://images.lumacdn.com");
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full" style={{ height: HEIGHT, background: LUMA_CARD }}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col gap-8 p-8">
          <p className="t-h04">{name}</p>
          <Button href={href}>{registerLabel}</Button>
        </div>
      )}
      <iframe
        src={src}
        height={HEIGHT}
        onLoad={() => setLoaded(true)}
        // Until the frame has loaded it is transparent and would swallow the
        // clicks meant for the placeholder's link beneath it.
        className={`relative block w-full border-0 transition-opacity duration-200 ${
          loaded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        allow="fullscreen; payment"
        title={`${registerLabel} — ${name}`}
      />
    </div>
  );
}
