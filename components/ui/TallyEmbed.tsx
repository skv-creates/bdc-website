"use client";

/**
 * A Tally form, inline.
 *
 * Tally's own embed recipe: an iframe holding the form URL in
 * `data-tally-src`, and their widget script, which finds such iframes,
 * copies the URL into `src` and keeps the height in step with the form's
 * own (dynamicHeight=1) — so multi-step forms grow the page instead of a
 * scrollbar inside a box. The other parameters strip the chrome that would
 * double what the page already says: no Tally title (the page's own heading
 * is the title), transparent background, left alignment.
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
      data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
      loading="lazy"
      width="100%"
      height="290"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title={title}
    />
  );
}
