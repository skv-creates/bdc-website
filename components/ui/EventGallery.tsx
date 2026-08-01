"use client";

/**
 * EventGallery — the image carousel in the two-image event overlay
 * (Figma 449:1632, "project-card-carousel").
 *
 * Every slide is the same height with the grid gutter between them, and the
 * track is clipped by the section's right edge so the next image peeks in as
 * it does in the frame.
 *
 * Height is what is held constant; width follows each photograph. A fixed box
 * with object-cover would look tidier in the markup and is wrong — the two
 * PechaKucha images are 1.78 and 2.14 wide, so a 732px frame trims about
 * 115px off each side of the first and far more off the second. Nobody asked
 * for a crop; they asked for a row that lines up, and equal heights already
 * give that.
 *
 * It advances on its own, slowly, and stops the moment the pointer arrives —
 * a carousel that keeps moving under the cursor is the thing people complain
 * about. The arrows only appear on hover, but they are always in the layout and
 * always reachable by keyboard; hiding them with `hidden` would take them out
 * of the tab order, which is why this uses opacity plus focus-within.
 *
 * Scrolling is native (scroll-snap), so a trackpad swipe or a drag works
 * without any of this JS, and the component only nudges scrollLeft.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./EventGallery.module.css";
import type { EventImage } from "@/lib/events";

/** Dwell before advancing. Deliberately slow — this is a gallery, not a hero. */
const AUTOPLAY_MS = 5000;

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
  const [index, setIndex] = useState(0);
  /** Pointer over the track, or focus inside it: either pauses the autoplay. */
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /** Scroll slide `i` to the start of the track. */
  const go = useCallback(
    (i: number, smooth = true) => {
      const el = track.current;
      if (!el) return;
      const next = ((i % images.length) + images.length) % images.length;
      const slide = el.children[next] as HTMLElement | undefined;
      if (slide) {
        el.scrollTo({
          left: slide.offsetLeft - el.offsetLeft,
          behavior: smooth && !reduced ? "smooth" : "auto",
        });
      }
      setIndex(next);
    },
    [images.length, reduced],
  );

  /**
   * Whether the strip has enough hidden width to be worth moving.
   *
   * At desktop width two 732px slides very nearly fit — the overflow is about
   * 110px — so advancing would shunt the row a few centimetres and shunt it
   * back, which reads as a twitch rather than a carousel. Below the desktop
   * frame, and with three or more pictures, there is real travel and it
   * behaves as one. Measured rather than assumed from a breakpoint, because it
   * depends on how many images the event actually has.
   */
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      // A fixed threshold rather than a fraction of a slide: what matters is
      // whether the movement is big enough to read as movement, and that is an
      // absolute distance on screen, not a proportion of the picture.
      setScrollable(el.scrollWidth - el.clientWidth > 96);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [images.length]);

  // Autoplay. Keyed on `index` so every advance — including one the visitor
  // triggers — restarts the dwell rather than firing partway through it.
  useEffect(() => {
    if (held || reduced || !scrollable || images.length < 2) return;
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, held, reduced, scrollable, images.length, go]);

  // Keep `index` honest when the visitor scrolls or swipes the track directly,
  // so the next auto-advance continues from where they left it rather than
  // jumping back to wherever the timer thought it was.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slides = [...el.children] as HTMLElement[];
        const x = el.scrollLeft + el.offsetLeft;
        let nearest = 0;
        let best = Infinity;
        slides.forEach((s, i) => {
          const d = Math.abs(s.offsetLeft - x);
          if (d < best) {
            best = d;
            nearest = i;
          }
        });
        setIndex(nearest);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      {/* group rather than a list role: the images are one gallery, and the
          arrows below belong to it. aria-roledescription is deliberately not
          set — "carousel" is jargon, and the label already says what this is. */}
      <ul
        ref={track}
        className={styles.track}
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {images.map((img, i) => (
          <li key={img.src} className={styles.slide}>
            {/* Real intrinsic dimensions, so the browser reserves the right
                box before the bytes arrive and the row does not reflow. The
                height is pinned by CSS and the width follows from these. */}
            <Image
              src={img.src}
              width={img.width}
              height={img.height}
              // Only the first carries the description. The rest are further
              // pictures of the same thing, and repeating it makes a screen
              // reader announce the event title once per photograph.
              alt={i === 0 ? alt : ""}
              sizes="(max-width: 767px) 90vw, (max-width: 1023px) 70vw, 1160px"
              quality={90}
              className={styles.img}
            />
          </li>
        ))}
      </ul>

      {/* Sits under the track, right-aligned, matching the arrows on the
          initiatives carousel. Dropped entirely when everything already fits:
          an arrow that cannot move anything is worse than no arrow, and it
          would sit in the tab order promising something it can't do. */}
      {scrollable && (
        <div className={styles.controls}>
          <button type="button" onClick={() => go(index - 1)} aria-label={labels.prev}>
            <span aria-hidden>←</span>
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label={labels.next}>
            <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
