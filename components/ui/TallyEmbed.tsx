"use client";

/**
 * A Tally form, inline.
 *
 * Tally's own embed recipe: an iframe holding the form URL in
 * `data-tally-src`, and their widget script, which finds such iframes and
 * copies the URL into `src`. The parameters strip the chrome that would
 * double what the page already says — no Tally title, transparent
 * background, left alignment — and formEventsForwarding surfaces the
 * submit event to the page for conversion tracking later.
 *
 * The height: dynamic, but only ever growing, and the form sits LAST on
 * its page by design. Both halves matter. Every step of the multi-step
 * form is a different height, so plain dynamicHeight reflowed the page on
 * every Напред; a fixed frame scrolled internally and handed the wheel to
 * the page the moment its inner scrollbar ran out. Dynamic height keeps
 * one scroll context; the ratchet turns every height the widget sets into
 * a floor so the frame never bounces back; and being the final section,
 * its growth extends the page below the visitor's hands rather than
 * moving anything they can see.
 *
 * The script loads after hydration via lib/tally.ts, so the page itself
 * stays prerendered and an ordinary page view ships no third-party
 * JavaScript. If the script never arrives (blocked, offline), the iframe
 * stays empty and nothing else on the page depends on it.
 */
import { useEffect, useRef } from "react";
import { withTally } from "@/lib/tally";

export function TallyEmbed({ formId, title }: { formId: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    withTally(() => window.Tally?.loadEmbeds());
  }, []);

  // The ratchet: whatever height the widget sets becomes the minimum, so
  // steps can only grow the frame, never bounce it back up.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ratchet = () => {
      const height = el.getBoundingClientRect().height;
      const floor = parseFloat(el.style.minHeight || "0");
      if (height > floor) el.style.minHeight = `${height}px`;
    };
    ratchet();
    const ro = new ResizeObserver(ratchet);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <iframe
      ref={frame}
      data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&formEventsForwarding=1`}
      loading="lazy"
      width="100%"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title={title}
      className="min-h-[560px] w-full"
    />
  );
}
