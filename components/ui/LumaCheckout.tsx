"use client";
/**
 * LumaCheckoutButton — a Register button that opens Luma's checkout as a
 * modal over this page, via Luma's own checkout-button script.
 *
 * The script (4KB, from embed.lu.ma) looks for elements carrying
 * `data-luma-action="checkout"`, and on click opens an overlay with the
 * event's embed route in an iframe — the same route the slug from `lumaEventId` goes into,
 * so the public slug is enough. It binds on load; `initCheckout` is exposed
 * so a button mounted later, by a client-side navigation into the events
 * overlay, gets bound too — that is what `onReady` is for, it runs on every
 * mount, not only the first load.
 *
 * The data attributes sit on a wrapper rather than the anchor because
 * `Button` owns the anchor. The script's handler calls preventDefault on the
 * bubbled click, which is enough to stop the navigation. Before the script
 * has loaded, or without JavaScript, the click follows the anchor to the
 * event page on Luma in a new tab — the same destination, one hop further.
 */
import Script from "next/script";
import { Button } from "@/components/ui/Button";

declare global {
  interface Window {
    luma?: { initCheckout?: () => void };
  }
}

const bind = () => window.luma?.initCheckout?.();

export function LumaCheckoutButton({
  eventId,
  href,
  children,
}: {
  /** The slug or `evt-…` id from the registration URL. */
  eventId: string;
  /** The public event page, for the no-script fallback. */
  href: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <span data-luma-action="checkout" data-luma-event-id={eventId} className="contents">
        <Button href={href}>{children}</Button>
      </span>
      <Script
        id="luma-checkout"
        src="https://embed.lu.ma/checkout-button.js"
        strategy="afterInteractive"
        onReady={bind}
      />
    </>
  );
}
