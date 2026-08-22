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
 * The height: dynamic, but only ever growing. Two failure modes taught
 * this shape. Pure dynamicHeight resized the frame on every Напред — every
 * step is a different height — and the page reflowed under the visitor's
 * hands. A fixed frame held still but scrolled internally, and the moment
 * the inner scrollbar ran out the wheel escaped to the page and carried
 * the visitor away from the form. So: dynamicHeight for a single scroll
 * context (no inner scrollbar to fall out of), with a ratchet that turns
 * every height Tally sets into a floor — the frame grows below the
 * visitor's hands when a step needs room, and never shrinks back.
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
      data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
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
