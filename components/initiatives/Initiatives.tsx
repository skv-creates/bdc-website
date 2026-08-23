"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Initiatives.module.css";
import { slotStyle } from "./patterns";
import type { Initiative, Locale, SiteContent } from "@/lib/home-content";

/** Arrow-scroll animation: 120ms ease-out. */
const SCROLL_MS = 120;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

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
 * How far a thumb has to travel before it counts as a swipe rather than a tap
 * that wandered. 40px is the usual floor — below it, tapping the cover to open
 * the initiative starts changing it instead.
 */
const SWIPE_MIN = 40;

/**
 * Hydration signal without an effect-driven state update. React uses the
 * server snapshot for the prerender and the first hydration pass, then reads
 * the client snapshot and schedules the one post-hydration render we need.
 */
const subscribeToHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

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
  /**
   * The four clone copies exist only after hydration. Server HTML used to
   * carry all five — every initiative's card five times per page, which is
   * what a crawler reads. The first client render matches the server (one
   * copy, at rest), then `mounted` flips and the clones join; the transform
   * below compensates so the flip is pixel-identical.
   */
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    clientHydrated,
    serverHydrated,
  );
  const LOOP = useMemo(
    () => (mounted ? Array.from({ length: COPIES }, () => items).flat() : items),
    [items, mounted],
  );

  /** The real, keyboard-reachable titles — one copy of the list, at rest. */
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const [pos, setPos] = useState(N);
  /** Set once the visitor picks a title; the strip never auto-advances again. */
  const [picked, setPicked] = useState(false);
  /**
   * Autoplay only runs while the section is actually on screen. Advancing
   * off-screen walked the strip through covers nobody had seen, so whichever
   * slide was "active" when the visitor scrolled back was one whose image had
   * mounted hidden — an empty colour plate until its fetch caught up.
   */
  const root = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
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
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (picked || reduced || !inView) return;
    const t = setTimeout(() => {
      const next = pos + 1;
      setSeen((prev) => (prev.has(next % N) ? prev : new Set(prev).add(next % N)));
      setPos(next);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [pos, picked, reduced, inView, N]);

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
   * Swipe to change initiative, on the whole block rather than just the picture.
   *
   * On a phone the strip of titles is the only control there is, and it is a
   * row of 220px cards clipped at the screen edge — you can reach the next one,
   * but the gesture anyone actually tries on a full-width photograph is a
   * swipe. Reading `touches` on start and `changedTouches` on end keeps this to
   * two passive listeners, so it never fights the page's own scrolling.
   *
   * The horizontal distance has to clear SWIPE_MIN *and* beat the vertical, or
   * a thumb dragging diagonally down the page would step the carousel on its
   * way past. Left travels forward, matching the direction the strip moves.
   */
  const touch = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) return;
    step(dx < 0 ? 1 : -1);
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
    <section id="initiatives" ref={root} className="bdc-stop-11 py-20 md:py-28">
      <Header initiatives={initiatives} />

      {/* Swipe is bound here rather than on the picture so the gesture works
          anywhere in the block — including over the copy, which is most of what
          fills a phone screen once the cover has scrolled past. */}
      <div
        className="mt-12 grid gap-x-6 gap-y-8 lg:mt-20 lg:grid-cols-11 lg:gap-y-12"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* initiative-info (398:3185) — columns 1–5. All four are rendered and
            stacked so the block holds the height of the longest; see
            .infoStack. */}
        <div className={`${styles.infoStack} lg:col-span-5`}>
          {items.map((it, i) => (
            <div
              key={it.slug}
              className={`${i === active ? styles.infoLayerActive : styles.infoLayer} flex flex-col gap-8`}
            >
              <h3 className="t-h03">
                <a href={href(it)} className="hover:underline">
                  {it.title}
                </a>
              </h3>
              <p className="t-body">{it.text}</p>
              {/* button-terciary (398:3188). The arrow is part of the label
                  rather than an icon, exactly as in the frame. */}
              <a
                href={href(it)}
                className="t-caption group inline-flex items-center gap-3 font-medium"
              >
                {ui.readMore}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          ))}
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
          // order-first below lg: the cover is third in the DOM because on
          // desktop it sits to the right of the copy, but stacked that put the
          // title, the blurb and the link above the photograph — so a phone
          // opened on a wall of text with the picture buried under it. Reading
          // order on a narrow screen is picture, title, blurb, link, strip.
          // Source order is left alone so the heading still precedes the image
          // for a screen reader, which is why this is `order` and not a move.
          className="relative order-first block aspect-[4/3] overflow-hidden lg:order-none lg:col-span-6 lg:col-start-6"
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
                quality={80}
                // Not priority: this section sits 2.5–3 viewports below the
                // fold on every form factor (measured live), and the preload
                // was competing with the fonts for the critical window — the
                // H1's swap repaint is the page's LCP.
                //
                // But eager, not the default lazy: `seen` is already the lazy
                // gate — a cover only mounts once the strip shows it. Native
                // lazy on top of that never fires for a cover mounted while
                // the section is off-viewport, so the slide got opacity 1
                // with zero pixels behind it and the plate showed through.
                loading="eager"
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
              // Before the clones mount there is one copy and the resting
              // offset is zero; afterwards the same titles sit one copy in.
              transform: `translate3d(calc(${-(mounted ? pos : pos - N)} * (var(--nav-item) + var(--grid-gap, 24px))), 0, 0)`,
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
              const real = mounted ? i >= N && i < 2 * N : true;
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

export function Card({
  item,
  index,
  locale,
  seeMore,
  /**
   * The /initiatives index lays the same cards in a static grid: `fluid`
   * drops the track's fixed width and scroll-snap so the grid cell owns the
   * size. Everything else — grounds, label mark, stretched link — is shared.
   */
  fluid = false,
}: {
  item: Initiative;
  index: number;
  locale: Locale;
  seeMore: string;
  fluid?: boolean;
}) {
  /**
   * The track's cards are one colour, not the three-colour rotation: grey at
   * rest, brand rose while fully in view — the track's IntersectionObserver
   * drives that through data-focus (see .card in the module CSS). The fluid
   * grid variant keeps the rotation; slotStyle also carries --p1/--p2/--p3,
   * which the pattern tile needs.
   */
  const style = fluid ? slotStyle(index) : undefined;
  const href = `/${locale}/initiatives/${item.slug}`;

  return (
    <article
      // .card carries the flex/scroll-snap behaviour; .cardInside only overrides
      // the width, and is declared after it so it wins.
      // py only: with the card on the page's own ground, side padding was a
      // phantom inset — the rule, label and button sat 32px off the grid
      // column the section heading starts on.
      className={`${fluid ? "h-full" : `${styles.card} ${styles.cardInside}`} relative flex cursor-pointer flex-col gap-12 py-8`}
      style={style}
    >
      {/* The ruled label (500:1990): the 4px brand line across the card's
          top — every card, no resting variant — with the category in bold
          caption under it. bg-brand follows the pattern rail's recolour. */}
      <div className="w-full">
        <div className="mb-[7px] h-1 bg-brand" />
        <span className="t-caption font-bold">{item.label}</span>
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
            className="t-label relative z-10 inline-flex items-center justify-center gap-2 rounded-full border-2 border-current px-8 py-4 transition-colors hover:bg-text hover:text-text-invert"
          >
            {seeMore} <span aria-hidden>→</span>
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
    // A card is "in focus" while it sits fully inside the track's viewport —
    // those are rose; the ones clipped at either edge are grey. 0.95 rather
    // than 1 so a sub-pixel of scroll position can't flicker the state.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          (e.target as HTMLElement).dataset.focus =
            e.intersectionRatio >= 0.95 ? "in" : "out";
        }
      },
      { root: track, threshold: [0.95] },
    );
    for (const card of Array.from(track.children)) io.observe(card);
    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(rafRef.current);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", start);
      io.disconnect();
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
