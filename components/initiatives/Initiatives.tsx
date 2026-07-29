"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Initiatives.module.css";
import { slotStyle } from "./patterns";
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

/**
 * The section header, shared by both placements (332:3339 on the landing page,
 * 354:2459 inside): the section name as a small accented label, the standfirst
 * as the heading under it. The heading is the sentence, not the one-word title
 * — three lines at 56px is not "Инициативи".
 */
function Header({ initiatives }: { initiatives: SiteContent["initiatives"] }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        {/* Same 16×8 mark as the mission label, recoloured with the rail. */}
        <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
        <span className="t-caption">{initiatives.heading}</span>
      </div>
      <h2 className="t-h02 max-w-[800px]">{initiatives.lede ?? initiatives.heading}</h2>
    </div>
  );
}

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
   * page's — the card carousel at the foot of an initiative page. The landing
   * page runs the showcase below instead.
   */
  inside?: boolean;
}) {
  return inside ? (
    <InitiativesTrack initiatives={initiatives} ui={ui} locale={locale} />
  ) : (
    <InitiativesShowcase initiatives={initiatives} ui={ui} locale={locale} />
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   LANDING SHOWCASE (Figma 398:3175)
   ══════════════════════════════════════════════════════════════════════════ */

/** Annotation on 398:3178 — dwell before advancing to the next initiative. */
const AUTOPLAY_MS = 4000;
/** How long the strip takes to slide one title along. */
const SLIDE_MS = 500;

/**
 * Copies of the list laid end to end. `pos` indexes into the whole run, and at
 * rest sits in copy 1 — the band [N, 2N) — so there is a copy either side to
 * travel into. Sliding one step off the end of the band lands on the identical
 * title in the neighbouring copy, and only then is `pos` snapped back into the
 * band with the transition switched off; that is what makes the wrap invisible.
 * Stepping the index straight from last to first would rewind the whole strip
 * across the screen.
 *
 * Five rather than three because a click can throw `pos` up to N−1 past the top
 * of the band before the snap catches it, and the titles to the right of that
 * still have to exist.
 */
const COPIES = 5;

/**
 * One initiative shown large, with the strip of titles underneath acting as the
 * carousel (398:3178). It advances on its own every 4s and loops, and stops the
 * moment the visitor picks a title for themselves (398:3180).
 */
function InitiativesShowcase({
  initiatives,
  ui,
  locale,
}: {
  initiatives: SiteContent["initiatives"];
  ui: SiteContent["ui"];
  locale: Locale;
}) {
  const items = initiatives.items;
  const N = items.length;
  const LOOP = useMemo(
    () => Array.from({ length: COPIES }, () => items).flat(),
    [items],
  );

  /** The real, keyboard-reachable titles — one copy of the list, at rest. */
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const [pos, setPos] = useState(N);
  /** Set once the visitor picks a title; the strip never auto-advances again. */
  const [picked, setPicked] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [reduced, setReduced] = useState(false);

  const active = pos % N;
  const item = items[active];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /**
   * Mount a cover only once it has been shown. All six are full-width
   * photographs, and the strip walks through the whole set inside half a
   * minute, so mounting them up front would spend megabytes on images the
   * visitor may never scroll far enough to see. Once mounted they stay, which
   * is what lets the cross-fade have something to fade from.
   */
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const reveal = (k: number) =>
    setSeen((prev) => (prev.has(k) ? prev : new Set(prev).add(k)));

  // Autoplay. Keyed on `pos`, so every advance — including one the visitor
  // triggers — restarts the dwell rather than firing partway through it.
  useEffect(() => {
    if (picked || reduced) return;
    const t = setTimeout(() => {
      const next = pos + 1;
      setSeen((prev) => (prev.has(next % N) ? prev : new Set(prev).add(next % N)));
      setPos(next);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [pos, picked, reduced, N]);

  // Once a slide out of the resting band has finished, drop back to the
  // matching title inside it — whichever side it left by. Same picture, so the
  // jump cannot be seen.
  useEffect(() => {
    if (pos >= N && pos < 2 * N) return;
    const t = setTimeout(
      () => {
        setAnimate(false);
        setPos((p) => N + ((((p - N) % N) + N) % N));
      },
      reduced ? 0 : SLIDE_MS,
    );
    return () => clearTimeout(t);
  }, [pos, N, reduced]);

  // Re-arm the transition only after the un-animated jump has actually painted
  // — one frame is not enough, the style change and the paint land together.
  useEffect(() => {
    if (animate) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(r);
  }, [animate]);

  /**
   * Show initiative `k`, always by moving forwards. A clicked title is always
   * at or ahead of the current one — the selected title sits at the head of the
   * strip — so picking the third along steps forward three, never back N−3.
   */
  const pick = (k: number) => {
    setPicked(true);
    reveal(k);
    setPos((p) => p + ((((k - (p % N)) % N) + N) % N));
  };

  /** Move one title in `dir`, which is what the arrow keys want: left really
      does travel left, rather than the long way round to the same place. */
  const step = (dir: 1 | -1) => {
    setPicked(true);
    reveal((((active + dir) % N) + N) % N);
    setPos((p) => p + dir);
  };

  /**
   * Arrow keys walk the strip; Home and End jump to its ends. Focus follows, so
   * the title being read out is the one on screen. The strip is a single tab
   * stop — tabbing in lands on the selected title and tabbing again leaves —
   * which is the roving-tabindex convention for a set of choices like this.
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    let target: number;
    if (e.key === "ArrowRight") {
      step(1);
      target = (active + 1) % N;
    } else if (e.key === "ArrowLeft") {
      step(-1);
      target = (active - 1 + N) % N;
    } else if (e.key === "Home") {
      pick(0);
      target = 0;
    } else if (e.key === "End") {
      pick(N - 1);
      target = N - 1;
    } else {
      return;
    }
    e.preventDefault();
    tabs.current[target]?.focus();
  };

  /**
   * Plain <a>, not next/link, throughout the showcase — the same rule the mega
   * menu follows. A soft navigation from here would be caught by the
   * @modal/(.)initiatives interceptor and open the overlay on top of the home
   * page; from the landing section the destination is the initiative's own
   * page, so it has to be a document navigation.
   */
  const href = (it: Initiative) => `/${locale}/initiatives/${it.slug}`;

  return (
    <section id="initiatives" className="bdc-stop-11 py-20 md:py-28">
      <Header initiatives={initiatives} />

      <div className="mt-12 grid gap-x-6 gap-y-12 lg:mt-20 lg:grid-cols-11">
        {/* initiative-info (398:3185) — columns 1–5. */}
        <div key={active} className={`${styles.fadeIn} flex flex-col gap-8 lg:col-span-5`}>
          <h3 className="t-h03">
            <a href={href(item)} className="hover:underline">
              {item.title}
            </a>
          </h3>
          <p className="t-body">{item.text}</p>
          {/* button-terciary (398:3188). The arrow is part of the label rather
              than an icon, exactly as in the frame. */}
          <a
            href={href(item)}
            className="t-caption group inline-flex items-center gap-3 font-medium"
          >
            {ui.readMore}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        {/* initiative-cover (398:3184) — six columns at 4:3, per the annotation.
            The covers are stacked and cross-faded rather than swapped so the
            box never empties between two initiatives. alt="" throughout: the
            title beside it is the accessible name, and describing the picture
            here would have it read out twice. */}
        {/* The whole cover opens the initiative. aria-hidden + tabIndex -1
            because the title above is already a link to the same place: without
            it every initiative is announced and tabbed through twice. */}
        <a
          href={href(item)}
          aria-hidden
          tabIndex={-1}
          className="relative block aspect-[4/3] overflow-hidden lg:col-span-6 lg:col-start-6"
        >
          <div className={styles.coverPlate} aria-hidden />
          {items.map((it, i) => {
            // cardCover where an initiative has one — a photograph that works
            // small is not always the one that works as a page-wide hero.
            const shown = it.cardCover ?? it.cover;
            return shown && seen.has(i) ? (
              <Image
                key={it.slug}
                src={shown.src}
                alt=""
                fill
                sizes="(max-width: 1023px) 100vw, 624px"
                quality={90}
                priority={i === 0}
                className="object-cover transition-opacity duration-300"
                style={{ opacity: i === active ? 1 : 0 }}
              />
            ) : null;
          })}
        </a>

        {/* initiatives-carousel-nav (398:3178) — the full width of the section,
            clipped at its right edge so the coming titles peek in. */}
        <div
          className={`${styles.nav} lg:col-span-11`}
          role="group"
          aria-label={initiatives.heading}
          onKeyDown={onKeyDown}
        >
          <ul
            className={styles.navTrack}
            style={{
              // Inline rather than an arbitrary Tailwind class: Safari drops
              // `translate-x-[var(--x)]`-style utilities silently.
              transform: `translate3d(calc(${-pos} * (var(--nav-item) + var(--grid-gap, 24px))), 0, 0)`,
              transition: animate && !reduced ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none",
            }}
          >
            {LOOP.map((it, i) => {
              const k = i % N;
              const isActive = k === active;
              // Only the resting copy is real. The others exist so the strip
              // has somewhere to slide, and stay clickable — they are the ones
              // on screen for part of the cycle — but out of the accessibility
              // tree and out of the tab order, so each initiative is announced
              // once rather than five times.
              const real = i >= N && i < 2 * N;
              return (
                <li key={i} className={styles.navItem}>
                  <button
                    type="button"
                    ref={real ? (el) => void (tabs.current[k] = el) : undefined}
                    onClick={() => pick(k)}
                    // A duplicate must not take focus: it is aria-hidden, and
                    // focus inside a hidden subtree is what traps screen
                    // readers. Clicks still work, they just don't focus.
                    onMouseDown={real ? undefined : (e) => e.preventDefault()}
                    aria-hidden={real ? undefined : true}
                    // Roving tabindex — one stop for the whole strip.
                    tabIndex={real && isActive ? 0 : -1}
                    aria-current={real && isActive ? "true" : undefined}
                    className={`${styles.navButton} ${isActive ? styles.navButtonActive : ""}`}
                  >
                    <span className={styles.navRule} />
                    <span className="t-caption mt-[3px] block font-bold">{it.label}</span>
                    <span className="t-body mt-[6px] block font-bold">{it.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   INSIDE-PAGES TRACK (Figma 327:1543)
   ══════════════════════════════════════════════════════════════════════════ */

function Card({
  item,
  index,
  locale,
  seeMore,
}: {
  item: Initiative;
  index: number;
  locale: Locale;
  seeMore: string;
}) {
  /**
   * Inside pages keep the three-colour rotation. slotStyle also carries
   * --p1/--p2/--p3, which the pattern tile needs.
   */
  const style = slotStyle(index);
  const href = `/${locale}/initiatives/${item.slug}`;

  return (
    <article
      // .card carries the flex/scroll-snap behaviour; .cardInside only overrides
      // the width, and is declared after it so it wins.
      className={`${styles.card} ${styles.cardInside} relative flex cursor-pointer flex-col gap-12 p-8`}
      style={style}
    >
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
            the frame's three-line box so the buttons don't wander. The title
            keeps its two-line reservation so every card is the same height. */}
        <div className="flex flex-col gap-6">
          <h3 className="t-h03 min-h-[2.2em]">
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

        {/* aria-hidden + tabIndex -1: the title link above already exposes this
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

function InitiativesTrack({
  initiatives,
  ui,
  locale,
}: {
  initiatives: SiteContent["initiatives"];
  ui: SiteContent["ui"];
  locale: Locale;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

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
      <Header initiatives={initiatives} />

      <div className={`${styles.track} mt-12 lg:mt-20`} ref={trackRef}>
        {LOOP.map((item, i) => (
          <Card key={i} item={item} index={i % N} locale={locale} seeMore={ui.seeMore} />
        ))}
      </div>

      <div className="mt-12 flex justify-end gap-4 lg:mt-20">
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
