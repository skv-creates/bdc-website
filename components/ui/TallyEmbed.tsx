"use client";

/**
 * A Tally form, inline.
 *
 * Tally's own embed recipe: an iframe holding the form URL in
 * `data-tally-src`, and their widget script, which finds such iframes and
 * copies the URL into `src`. The parameters strip the chrome that would
 * double what the page already says: no Tally title (the page's own heading
 * is the title), transparent background, left alignment.
 *
 * Deliberately NOT dynamicHeight: on a multi-step form every step has a
 * different height, so the iframe resized on every Напред and the page
 * reflowed under the visitor's hands — filling the form meant chasing it up
 * and down the page. A fixed frame holds still; a step taller than the
 * frame scrolls inside it, which is how every steady form on the web works.
 * The height is viewport-capped so the frame also fits a laptop screen
 * whole, controls included.
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
      data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1`}
      loading="lazy"
      width="100%"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title={title}
      className="h-[700px] max-h-[80svh] w-full"
    />
  );
}
