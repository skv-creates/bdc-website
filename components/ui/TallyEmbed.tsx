"use client";

/**
 * A Tally form in full-page mode, filling whatever box it is given.
 *
 * The embed layout (the /embed/ URL) inside a viewport-locked page — see
 * /membership/apply, which sizes this to everything below the header and
 * locks the page. Embed mode is top-aligned and tight; the /r/ full-page
 * layout was tried and centered every question in the frame, opening a
 * void between the progress bar and the fields, with the form's title
 * floating in it. Scrolling inside the frame is safe here precisely
 * because the page cannot scroll: earlier shapes failed when two scroll
 * contexts existed (dynamic height reflowed the page on every step; a
 * fixed frame on a scrollable page handed the wheel to the page the
 * moment its inner scrollbar ran out). A locked page leaves one context —
 * the form's.
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
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title={title}
      className="h-full w-full"
    />
  );
}
