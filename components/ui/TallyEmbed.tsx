"use client";

/**
 * The Tally form, filling whatever box it is given — used by the
 * full-screen application page (/membership/apply), which sizes it to
 * everything below the header and locks the page. The embed layout
 * (/embed/, not /r/) is top-aligned and tight; scrolling inside the frame
 * is safe there precisely because the page cannot scroll — one scroll
 * context, the form's. The parameters strip the chrome the page already
 * provides (no Tally title, transparent background, left alignment), and
 * formEventsForwarding surfaces the submit event for conversion tracking
 * later.
 *
 * The script loads after hydration via lib/tally.ts, so the page itself
 * stays prerendered and an ordinary page view ships no third-party
 * JavaScript. If the script never arrives (blocked, offline), the iframe
 * stays empty and nothing else on the page depends on it.
 */
import { useEffect } from "react";
import { withTally } from "@/lib/tally";

export function TallyEmbed({ formId, title }: { formId: string; title: string }) {
  useEffect(() => {
    withTally(() => window.Tally?.loadEmbeds());
  }, []);

  return (
    <iframe
      data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&formEventsForwarding=1`}
      loading="lazy"
      width="100%"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title={title}
      className="h-full w-full"
    />
  );
}
