"use client";

/**
 * PhotoCarousel — the strip of photographs inside an "event with photo
 * carousel" (Figma 449:1632, "project-card-carousel").
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
import styles from "./PhotoCarousel.module.css";
import type { EventImage } from "@/lib/events";
import type { Locale } from "@/lib/home-content";

/**
 * Pixels per second, at rest and under the pointer.
 *
 * Hovering slows the strip rather than freezing it. Stopping dead reads as the
 * page having broken — the eye is tracking motion and it vanishes — whereas
 * easing down reads as the carousel noticing you. Coming off the picture it
 * lifts back to full speed, which is what makes the two states feel like one
 * behaviour rather than an on/off switch.
 */
const SPEED = 18;
const SPEED_HOVER = 9;
/** How sharply it eases between the two. Higher settles faster. */
const EASE_PER_SECOND = 3;

export function PhotoCarousel({
  images,
  label,
  alt,
  labels,
  locale,
}: {
  images: EventImage[];
  /** Names the group for screen readers — the event title. */
  label: string;
  alt: string;
  /** Localized control labels — the site is bilingual and these are read out. */
  labels: { prev: string; next: string; pause: string; play: string };
  /** Picks which half of each picture's bilingual caption to read out. */
  locale: Locale;
}) {
  const track = useRef<HTMLUListElement>(null);
  /**
   * Pointer over the track, or focus inside it: either slows the glide.
   *
   * A ref, not state, and deliberately so. As state it would be a dependency of
   * the animation effect, so every enter and leave would tear the loop down and
   * start a new one — which resets the eased speed to its target and produces
   * exactly the hard switch the easing exists to avoid.
   */
  const held = useRef(false);
  const [reduced, setReduced] = useState(false);
  /**
   * Switched off by the visitor, and it stays off.
   *
   * WCAG 2.2.2 (Pause, Stop, Hide, level A) requires a way to stop anything
   * that moves by itself for more than five seconds. Pausing on hover does not
   * satisfy it: someone driving the page from the keyboard, or reading it with
   * a screen magnifier, never hovers anything. This is that mechanism, and it
   * is a real button in the tab order rather than an inferred gesture.
   */
  const [paused, setPaused] = useState(false);

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
    if (!el || paused || reduced || images.length < 2) return;

    let raf = 0;
    let last = performance.now();
    // Eased rather than switched, so neither entering nor leaving the strip
    // produces a jump. Starts wherever the target is so the first frame after
    // a pause does not ramp up from nothing.
    let speed = held.current ? SPEED_HOVER : SPEED;
    /**
     * The position is kept here, as a float, and only written out.
     *
     * Reading scrollLeft back each frame and adding to it does not work: the
     * browser stores it rounded to the device pixel, so on a 1x display a
     * 0.67px step is written, read back as 0, and added to again — the strip
     * never moves at all. On a 2x display it rounds to the nearest half pixel
     * and creeps along at the wrong speed. Neither is visible in a DOM
     * measurement; it just looks like the animation is not running.
     */
    let pos = el.scrollLeft;

    const step = (now: number) => {
      // Clamp the delta: a tab that has been in the background comes back with
      // a huge one, which would fling the strip across in a single frame.
      const dt = Math.min(now - last, 100) / 1000;
      last = now;

      // If the visitor has scrolled, swiped or pressed an arrow, scrollLeft has
      // moved somewhere this loop did not put it. Take their position as the
      // new truth rather than yanking the strip back.
      if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;

      // Ease the speed towards whichever state we are in. Frame-rate
      // independent: the same fraction of the remaining gap per second,
      // however often frames happen to arrive.
      const target = held.current ? SPEED_HOVER : SPEED;
      speed += (target - speed) * Math.min(1, EASE_PER_SECOND * dt);

      // Half the content is the duplicate copy, so wrapping there puts an
      // identical frame under the viewport and the seam cannot be seen.
      const lap = el.scrollWidth / 2;
      pos += speed * dt;
      if (lap > 0 && pos >= lap) pos -= lap;
      el.scrollLeft = pos;

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, reduced, images.length]);

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
      onMouseEnter={() => (held.current = true)}
      onMouseLeave={() => (held.current = false)}
      onFocusCapture={() => (held.current = true)}
      onBlurCapture={() => (held.current = false)}
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
              // Each picture describes itself when an editor has written a
              // caption for it in Notion — those are different photographs of
              // different things, and a gallery where only the first is
              // described is a gallery a screen-reader user cannot navigate.
              //
              // Without a caption it falls back to the old behaviour: the
              // event title on the first slide, empty on the rest. Repeating
              // one title on every photograph would have a screen reader
              // announce the same sentence six times, which is worse than
              // silence. The duplicated slides of the loop are aria-hidden
              // above, so nothing here is announced twice.
              alt={img.alt?.[locale] ?? (i === 0 ? alt : "")}
              sizes="(max-width: 767px) 60vw, (max-width: 1023px) 75vw, 1160px"
              quality={90}
            />
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <div className={styles.controls}>
          {/* Left of the arrows because it governs the whole strip rather than
              a direction. Hidden when the visitor has asked for reduced motion:
              nothing is moving, so a pause button would be a control for
              something that is not happening. */}
          {!reduced && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? labels.play : labels.pause}
              className={styles.wide}
            >
              <span aria-hidden>{paused ? "▶" : "❙❙"}</span>
            </button>
          )}
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
