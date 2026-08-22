"use client";

/**
 * Leaves the Tally flow the moment the form is submitted.
 *
 * Tally's own success screen is generic and ends the journey inside an
 * iframe; the council's lives at /membership/thanks, in the site's voice,
 * with somewhere to go next — and, like /partner/thanks, it is the URL a
 * Google Ads conversion can count arrivals on. The embed forwards its
 * events (formEventsForwarding=1); on Tally.FormSubmitted this navigates
 * to the page's own thank-you. A full navigation, not a router push: the
 * apply page is a locked-viewport flow and the thank-you is an ordinary
 * document.
 */
import { useEffect } from "react";

export function TallyRedirect({ formId, href }: { formId: string; href: string }) {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      let data: unknown = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      const msg = data as { event?: string; payload?: { formId?: string } };
      if (msg?.event === "Tally.FormSubmitted" && msg.payload?.formId === formId) {
        window.location.assign(href);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [formId, href]);

  return null;
}
