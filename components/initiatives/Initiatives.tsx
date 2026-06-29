"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./Initiatives.module.css";
import { PatternTile } from "./patterns";
import { initiatives, type Initiative } from "@/lib/home-content";

/** Arrow-scroll animation: 120ms ease-out. */
const SCROLL_MS = 120;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/* Colors are driven by the pattern rail: it writes the active triad to
   --tri-accent / --tri-band / --tri-ground on :root (and on click). Each card
   takes one slot by position (accent → band → ground, i.e. rose → tomato →
   burgundy) and inks its pattern in a triad color that isn't its background. */
const SLOTS = [
  { bg: "var(--tri-accent)", ink: "var(--tri-ground)", invert: false },
  { bg: "var(--tri-band)", ink: "var(--tri-ground)", invert: false },
  { bg: "var(--tri-ground)", ink: "var(--tri-accent)", invert: true },
] as const;

/** Small corner triangle that prefixes each card label (Figma "highlight-detail"). */
function LabelMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <polygon points="1,3 15,3 1,17" fill="currentColor" />
    </svg>
  );
}

function Card({ item, index }: { item: Initiative; index: number }) {
  const slot = SLOTS[index % SLOTS.length];

  const style = {
    background: slot.bg,
    color: slot.invert ? "var(--bdc-white)" : "var(--bdc-dark)",
    "--p1": slot.ink,
    "--p2": slot.bg,
  } as CSSProperties;

  return (
    <article className={`${styles.card} flex flex-col gap-12 p-6`} style={style}>
      <div className="relative hidden h-[240px] w-full overflow-hidden md:block">
        <PatternTile n={item.pattern} />
      </div>

      <div className="flex items-center gap-5">
        <LabelMark />
        <span className="text-[1.2rem] font-bold leading-[1.5] md:text-[24px]">{item.label}</span>
      </div>

      <div className="flex flex-1 flex-col gap-8">
        <h3 className="t-h03">{item.title}</h3>
        <p className="t-body">{item.text}</p>
        {item.cta && (
          <a
            href={item.cta.href}
            className="t-label mt-auto inline-flex items-center justify-center self-start rounded-full border-2 border-current px-8 py-4 transition-colors hover:bg-text hover:text-text-invert"
          >
            {item.cta.label}
          </a>
        )}
      </div>
    </article>
  );
}

const N = initiatives.items.length;
// Render the list 3× so the sequence always continues in both directions;
// the scroll is silently recentered onto the middle copy (see effect below).
const LOOP = [0, 1, 2].flatMap(() => initiatives.items);

// Width of one full copy = offset of the first card of the 2nd copy.
const copyWidth = (track: HTMLDivElement) => {
  const second = track.children[N] as HTMLElement | undefined;
  return second ? second.offsetLeft : 0;
};

// Instantly snap scroll back onto the middle copy when it drifts off either
// end. Each copy is identical, so the jump lands on the same card invisibly.
const recenter = (track: HTMLDivElement) => {
  const w = copyWidth(track);
  if (w <= 0) return;
  let target = track.scrollLeft;
  if (target >= 2 * w - 1) target -= w;
  else if (target < w) target += w;
  if (target !== track.scrollLeft) track.scrollLeft = target;
};

export function Initiatives() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  // Start on the middle copy; recenter once scrolling settles (clicks & swipe).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const start = () => {
      const w = copyWidth(track);
      if (w > 0) track.scrollLeft = w;
    };
    start();
    let settle: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(settle);
      settle = setTimeout(() => recenter(track), 120);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", start);
    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(rafRef.current);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", start);
    };
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    recenter(track); // keep within the middle copy before stepping (mash-proof)
    const card = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 24;
    const step = card ? card.offsetWidth + gap : track.clientWidth * 0.6;
    const from = track.scrollLeft;
    const to = from + dir * step;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.scrollLeft = to;
      return;
    }

    // 120ms ease-out tween; snap is paused so it can't fight the animation.
    cancelAnimationFrame(rafRef.current);
    track.style.scrollSnapType = "none";
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / SCROLL_MS);
      track.scrollLeft = from + (to - from) * easeOut(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        track.style.scrollSnapType = "";
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <section id="initiatives" className="py-20 md:py-28">
      <h2 className="t-h02">{initiatives.heading}</h2>

      <div ref={trackRef} className={`${styles.track} mt-12`}>
        {LOOP.map((item, i) => (
          <Card key={i} item={item} index={i % N} />
        ))}
      </div>

      <div className="mt-12 flex justify-end gap-4">
        <Arrow dir={-1} onClick={() => scrollByCard(-1)} label="Назад" glyph="←" />
        <Arrow dir={1} onClick={() => scrollByCard(1)} label="Напред" glyph="→" />
      </div>
    </section>
  );
}

function Arrow({
  onClick,
  label,
  glyph,
}: {
  dir: 1 | -1;
  onClick: () => void;
  label: string;
  glyph: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="t-label flex h-[60px] w-[86px] items-center justify-center rounded-full border-2 border-border transition-colors hover:bg-brand-hover hover:text-text-invert hover:border-brand-hover"
    >
      {glyph}
    </button>
  );
}
