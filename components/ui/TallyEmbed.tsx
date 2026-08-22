"use client";

/**
 * A Tally form in full-page mode, filling whatever box it is given.
 *
 * This is Tally's own full-page embed (the /r/ URL, not /embed/): the form
 * behaves as an application — it owns all scrolling internally, one screen
 * at a time. The page hosting it must not scroll; see /membership, which
 * sizes this to everything below the header and locks the page. That is
 * what finally ended the scroll fighting: two earlier shapes each failed —
 * dynamic height reflowed the page on every step, a fixed frame's inner
 * scrollbar handed the wheel to the page the moment it ran out — and the
 * root cause both times was two scroll contexts. Full-page mode leaves one.
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
      data-tally-src={`https://tally.so/r/${formId}?transparentBackground=1&formEventsForwarding=1`}
      loading="lazy"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title={title}
      className="h-full w-full"
    />
  );
}
