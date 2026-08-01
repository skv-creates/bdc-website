"use client";

/**
 * EventGallery — the image carousel in the two-image event overlay
 * (Figma 449:1632, "project-card-carousel").
 *
 * Two things here are deliberate, and both have been got wrong once already:
 *
 * 1. The geometry lives in the markup — Tailwind for the height, an inline
 *    aspect-ratio for the width — not in the CSS module. Putting it in the
 *    module made every slide's box depend on that stylesheet having arrived;
 *    when it hadn't, each image fell back to its own intrinsic size and the
 *    row came out ragged. The module now only styles what can fail harmlessly:
 *    the scrollbar and the arrows.
 *
 * 2. The motion is a continuous glide, not a timer that jumps one slide and
 *    stops. It scrolls at a constant slow speed and pauses under the pointer.
 *    The list is rendered twice and the scroll position wraps at the end of
 *    the first copy, which is what makes the loop seamless instead of
 *    rewinding across the screen.
 *
 * Native horizontal scrolling still works throughout — trackpad, swipe, drag —
 * because all of this does is move scrollLeft.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./EventGallery.module.css";
import type { EventImage } from "@/lib/events";

/** Pixels per second. Slow enough to read as drift rather than as motion. */
const SPEED = 22;

export function EventGallery({
  images,
  label,
  alt,
  labels,
}: {
  images: EventImage[];
  /** Names the group for screen readers — the event title. */
  label: string;
  alt: string;
  /** Localized arrow labels — the site is bilingual and these are read out. */
  labels: { prev: string; next: string };
}) {
  const track = useRef<HTMLUListElement>(null);
  /** Pointer over the track, or focus inside it: either pauses the glide. */
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /**
   * The continuous scroll.
   *
   * Driven from the frame clock rather than a CSS animation because the same
   * scrollLeft has to stay under the visitor's control — a transform would
   * fight every swipe and every arrow press.
   */
  useEffect(() => {
    const el = track.current;
    if (!el || held || reduced || images.length < 2) return;

    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      // Clamp the delta: a tab that has been in the background comes back with
      // a huge one, which would fling the strip across in a single frame.
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      // Half the content is the duplicate copy, so wrapping there puts an
      // identical frame under the viewport and the seam cannot be seen.
      const lap = el.scrollWidth / 2;
      let next = el.scrollLeft + SPEED * dt;
      if (lap > 0 && next >= lap) next -= lap;
      el.scrollLeft = next;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [held, reduced, images.length]);

  /** Nudge one slide along, for the arrows and the arrow keys. */
  const nudge = useCallback(
    (dir: 1 | -1) => {
      const el = track.current;
      if (!el) return;
      const slide = el.children[0] as HTMLElement | undefined;
      const step = (slide?.offsetWidth ?? 400) + 24;
      el.scrollBy({ left: dir * step, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") nudge(1);
    else if (e.key === "ArrowLeft") nudge(-1);
    else return;
    e.preventDefault();
  };

  // Rendered twice so the glide can wrap without rewinding. The second copy is
  // hidden from assistive tech — it is the same pictures over again.
  const loop = images.length > 1 ? [...images, ...images] : images;

  return (
    <div
      className="flex flex-col gap-6"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <ul
        ref={track}
        className={`${styles.track} flex gap-[var(--grid-gap,24px)] overflow-x-auto`}
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {loop.map((img, i) => (
          <li
            key={`${img.src}-${i}`}
            aria-hidden={i >= images.length || undefined}
            // Height in utilities, width from the ratio: the box is settled by
            // the markup, so it cannot come out ragged if a stylesheet is slow.
            // 540 is the cap the design sets; shorter below it, since a phone
            // should not be handed a 540px band.
            className="relative h-[260px] shrink-0 md:h-[420px] lg:h-[540px]"
            style={{ aspectRatio: `${img.width} / ${img.height}` }}
          >
            <Image
              src={img.src}
              fill
              // The box already matches the picture, so cover crops nothing.
              // It is here for the case where a recorded dimension is wrong:
              // cover keeps every slide the same height and loses a few pixels,
              // where contain would letterbox and break the row.
              className="object-cover"
              // Only the first carries the description. The rest are further
              // pictures of the same thing, and repeating it makes a screen
              // reader announce the event title once per photograph.
              alt={i === 0 ? alt : ""}
              sizes="(max-width: 767px) 60vw, (max-width: 1023px) 75vw, 1160px"
              quality={90}
            />
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <div className={styles.controls}>
          <button type="button" onClick={() => nudge(-1)} aria-label={labels.prev}>
            <span aria-hidden>←</span>
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label={labels.next}>
            <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
