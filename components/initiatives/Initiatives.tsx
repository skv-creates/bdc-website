"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Initiatives.module.css";
import { PatternTile, slotStyle } from "./patterns";
import type { Initiative, Locale, SiteContent } from "@/lib/home-content";

/** Arrow-scroll animation: 120ms ease-out. */
const SCROLL_MS = 120;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/** Small corner triangle that prefixes each card label (Figma "highlight-detail"). */
function LabelMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <polygon points="1,3 15,3 1,17" fill="currentColor" />
    </svg>
  );
}

/** The peeking card's ground (354:2325). */
const DIMMED = "#f3f3f3";

function Card({
  item,
  index,
  locale,
  inside = false,
  dimmed = false,
  seeMore,
}: {
  item: Initiative;
  index: number;
  locale: Locale;
  /** The inside-pages form (Figma 327:1543) — see the note on <Initiatives/>. */
  inside?: boolean;
  /** Scrolled only partly into the track — see the note on <Initiatives/>. */
  dimmed?: boolean;
  seeMore: string;
}) {
  /**
   * The landing carousel is rose throughout (354:2325) and greys the card that
   * is only peeking in. Inside pages keep the three-colour rotation.
   *
   * slotStyle still runs in both cases: it carries --p1/--p2/--p3, which the
   * pattern tile needs when an initiative has no cover photograph. Only the
   * ground and ink are overridden after it.
   */
  const slot = slotStyle(index);
  const style = inside
    ? slot
    : { ...slot, background: dimmed ? DIMMED : "var(--color-brand)", color: "var(--color-text)" };
  const href = `/${locale}/initiatives/${item.slug}`;

  return (
    <article
      // .card carries the flex/scroll-snap behaviour for both forms; .cardInside
      // only overrides the width, and is declared after it so it wins.
      className={`${styles.card} ${
        inside ? `${styles.cardInside} p-8` : "p-6 md:p-10"
      } relative flex cursor-pointer flex-col gap-12 transition-colors duration-200`}
      style={style}
    >
      {/* The inside-pages card drops the image — those pages already carry a
          cover and a team panel, so a second one reads as noise. */}
      {!inside && (
        <div className="relative hidden h-[240px] w-full overflow-hidden md:block">
          {/* The initiative's own cover, so the card previews the page it opens.
              Initiatives without a long-form page have no cover yet and fall
              back to their pattern tile, which is what the whole carousel used
              to show. alt="" because the title beside it is the accessible name
              — a description here would be read out twice. */}
          {item.cover ? (
            <Image
              src={item.cover.src}
              alt=""
              fill
              sizes="(max-width: 1023px) 90vw, 516px"
              className="object-cover"
            />
          ) : (
            <PatternTile n={item.pattern} />
          )}
        </div>
      )}

      <div className="flex items-center gap-5">
        <LabelMark />
        <span className="text-[1.2rem] font-bold leading-[1.5] md:text-[24px]">{item.label}</span>
      </div>

      {/* info-wrapper (391:4836): the title block, then 48px to the button.
          flex-1 + mt-auto keeps the buttons on one line across a row of cards
          that the flex track has stretched to a common height; the gap-12 is
          what guarantees the frame's 48px when a card is the tallest one. */}
      <div className="flex flex-1 flex-col gap-12">
        {/* title-wrapper: 24px between title and blurb, and the blurb held to
            the frame's three-line box so the buttons don't wander. */}
        <div className="flex flex-col gap-6">
          {/* Natural height, so the 24px under it is the 24px in the redline.
              Reserving two lines here padded that gap out to 68 on every card
              whose title fits one line. The inside-pages card keeps its
              reservation — see the note on <Initiatives inside/>. */}
          <h3 className={`t-h03 ${inside ? "min-h-[2.2em]" : ""}`}>
            {/* Stretched link: the ::after covers the whole card, so a click
                anywhere navigates, while in the DOM this stays a sibling of the
                CTA anchor below — never an <a> inside an <a>. The title is the
                accessible name, and Enter works natively, so the old
                role="button" + keydown handler is gone.
                NB: anything interactive added to this card later needs
                `relative z-10` to sit above the ::after. */}
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {item.title}
            </Link>
          </h3>
          <p className="t-body line-clamp-3 min-h-[4.2em]">{item.text}</p>
        </div>

        {/* One button on every card, in both forms (391:4836 and 327:1543).
            The per-initiative "Към проекта" CTA it replaced appeared on only
            some cards, which left the row ragged; `item.cta` still serves the
            overlay for initiatives with no long-form page.

            aria-hidden + tabIndex -1: the title link above already exposes this
            destination, and without it every card is announced and tabbed
            through twice. */}
        <span className="mt-auto">
          <Link
            href={href}
            aria-hidden
            tabIndex={-1}
            className="t-label relative z-10 inline-flex items-center justify-center rounded-full border-2 border-current px-8 py-4 transition-colors hover:bg-text hover:text-text-invert"
          >
            {seeMore}
          </Link>
        </span>
      </div>
    </article>
  );
}

// Width of one full copy = offset of the first card of the 2nd copy (n = the
// number of cards in one copy).
const copyWidth = (track: HTMLDivElement, n: number) => {
  const second = track.children[n] as HTMLElement | undefined;
  return second ? second.offsetLeft : 0;
};

// Instantly snap scroll back onto the middle copy when it drifts off either
// end. Each copy is identical, so the jump lands on the same card invisibly.
const recenter = (track: HTMLDivElement, n: number) => {
  const w = copyWidth(track, n);
  if (w <= 0) return;
  let target = track.scrollLeft;
  if (target >= 2 * w - 1) target -= w;
  else if (target < w) target += w;
  if (target !== track.scrollLeft) track.scrollLeft = target;
};

export function Initiatives({
  initiatives,
  ui,
  locale,
  inside = false,
}: {
  initiatives: SiteContent["initiatives"];
  ui: SiteContent["ui"];
  locale: Locale;
  /**
   * "section-initiatives-inside-pages" (Figma 327:1543) rather than the landing
   * page's. Heading only — no standfirst — and the card loses its pattern tile,
   * gains a "Виж повече" button, and fixes its title and blurb at two and three
   * lines so every card is the same height and the buttons line up.
   */
  inside?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  /**
   * Track positions that are only partly scrolled into view. The landing
   * carousel greys those and keeps the rest rose (354:2325), so the card
   * peeking past the right edge reads as "there is more this way" rather than
   * as a card you failed to click.
   *
   * Held as the dimmed set rather than the visible one so the server render and
   * first paint are all-rose, before any measurement has happened.
   */
  const [dimmed, setDimmed] = useState<ReadonlySet<number>>(new Set());

  const items = initiatives.items;
  const N = items.length;
  // Render the list 3× so the sequence always continues in both directions;
  // the scroll is silently recentered onto the middle copy (see effect below).
  const LOOP = useMemo(() => [0, 1, 2].flatMap(() => items), [items]);

  // Start on the middle copy; recenter once scrolling settles (clicks & swipe).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const start = () => {
      const w = copyWidth(track, N);
      if (w > 0) track.scrollLeft = w;
    };
    start();
    let settle: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(settle);
      settle = setTimeout(() => recenter(track, N), 120);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", start);
    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(rafRef.current);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", start);
    };
  }, [N]);

  /**
   * Which track positions are only partly scrolled in.
   *
   * Measured from the rects on scroll rather than with an IntersectionObserver:
   * the observer is the obvious tool, but it reports against a root asynchronously
   * and there is no way to ask it for the current state, so the first paint and
   * any resize depend on it having fired. Comparing rects is synchronous, gives
   * the same answer, and can be re-run whenever we like.
   *
   * The 1px slack matters: a card flush with the track edge measures a hair
   * narrower than its own width, and without it would never count as fully in.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || inside) return;

    const measure = () => {
      const tr = track.getBoundingClientRect();
      const next = new Set<number>();
      [...track.children].forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const shown = Math.max(0, Math.min(r.right, tr.right) - Math.max(r.left, tr.left));
        if (shown < r.width - 1) next.add(i);
      });
      setDimmed((prev) =>
        prev.size === next.size && [...next].every((i) => prev.has(i)) ? prev : next,
      );
    };

    measure();
    track.addEventListener("scroll", measure, { passive: true });
    // The mount-time reading can be taken before the layout has settled — the
    // cover images have not loaded and the recentre has not run — so re-measure
    // whenever the track's box changes rather than waiting for a first scroll.
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => {
      track.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [inside, LOOP.length]);

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    recenter(track, N); // keep within the middle copy before stepping (mash-proof)
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
    <section id="initiatives" className="bdc-stop-11 py-20 md:py-28">
      {/* One header for both placements (332:3339 on the landing page, 354:2459
          inside): the section name as a small accented label, the standfirst as
          the heading under it. The heading is the sentence, not the one-word
          title — three lines at 56px is not "Инициативи". The landing page used
          to run these the other way round, with "Инициативи" set large and the
          sentence beside it as a standfirst. */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          {/* Same 16×8 mark as the mission label, recoloured with the rail. */}
          <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
          <span className="t-caption">{initiatives.heading}</span>
        </div>
        <h2 className="t-h02 max-w-[800px]">{initiatives.lede ?? initiatives.heading}</h2>
      </div>

      <div className={`${styles.track} ${inside ? "mt-12 lg:mt-20" : "mt-12"}`} ref={trackRef}>
        {LOOP.map((item, i) => (
          <Card
            key={i}
            item={item}
            index={i % N}
            locale={locale}
            inside={inside}
            dimmed={dimmed.has(i)}
            seeMore={ui.seeMore}
          />
        ))}
      </div>

      <div
        className={`flex justify-end gap-4 ${inside ? "mt-12 lg:mt-20" : "mt-12"}`}
      >
        <Arrow dir={-1} onClick={() => scrollByCard(-1)} label={ui.prev} glyph="←" />
        <Arrow dir={1} onClick={() => scrollByCard(1)} label={ui.next} glyph="→" />
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
