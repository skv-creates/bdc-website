"use client";

/**
 * The Tally form, inline on the contact page.
 *
 * Tally's own embed recipe: an iframe holding the form URL in
 * `data-tally-src`, and their widget script, which finds such iframes,
 * copies the URL into `src` and keeps the height in step with the form's
 * own (dynamicHeight=1) — so conditional questions grow the page instead
 * of a scrollbar inside a box. The other parameters strip the chrome that
 * would double what the page already says: no Tally title (the section
 * heading above is the title), transparent background, left alignment.
 *
 * The script loads once per page view, on the client, after hydration —
 * the page itself stays prerendered. If it never arrives (blocked,
 * offline), the iframe stays empty and the email link above the section
 * remains the way in; nothing else on the page depends on it.
 */
import { useEffect } from "react";
import { withTally } from "@/lib/tally";

export function ContactFormEmbed({ formId, title }: { formId: string; title: string }) {
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
