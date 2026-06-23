"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import styles from "./PatternRail.module.css";
import { PALETTES, PATTERNS, PatternMobile, TILE } from "./patterns";

/** Pattern drifts at a quarter of the user's scroll speed, same direction. */
const PARALLAX_FACTOR = 0.25;

/**
 * The right-hand decorative rail.
 *
 *  - Picks a RANDOM pattern on each load. Selection happens AFTER mount to
 *    avoid an SSR/client hydration mismatch (server always renders index 0,
 *    then the client swaps to a random tile).
 *  - Parallax: a passive rAF scroll handler translates the tile by
 *    scrollY * PARALLAX_FACTOR, wrapped at the tile period so motion is exact,
 *    seamless, and bounded regardless of page length. Honors reduced-motion.
 *  - Clicking the rail cycles the recolor palette by reassigning the
 *    --pattern-c1..c4 slots; the inline SVG inherits them.
 */
export function PatternRail() {
  const patternId = useId().replace(/:/g, "");
  const [patternIndex, setPatternIndex] = useState(0);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const tileRef = useRef<HTMLSpanElement>(null);

  // Randomize the pattern once, on the client, after hydration.
  useEffect(() => {
    setPatternIndex(Math.floor(Math.random() * PATTERNS.length));
  }, []);

  // Parallax: half-speed, same direction, seamless via tile-period wrap.
  useEffect(() => {
    const el = tileRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Round to whole px so the SVG pattern never tiles on a fractional
      // offset (the source of the sub-pixel "jumping").
      const y = Math.round(window.scrollY * PARALLAX_FACTOR) % TILE;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const Tile = PATTERNS[patternIndex];
  const palette = PALETTES[paletteIndex];

  const colorVars = {
    "--pattern-c1": palette.c1,
    "--pattern-c2": palette.c2,
    "--pattern-c3": palette.c3,
    "--pattern-c4": palette.c4,
  } as CSSProperties;

  // Cycle the combo and recolor the site-wide brand accent + the initiative-card
  // triad to match (the cards read --tri-accent/--tri-band/--tri-ground).
  const cyclePalette = () =>
    setPaletteIndex((i) => {
      const next = (i + 1) % PALETTES.length;
      const p = PALETTES[next];
      const root = document.documentElement.style;
      root.setProperty("--color-brand", p.brand);
      root.setProperty("--tri-accent", p.c2); // accent
      root.setProperty("--tri-band", p.c1); // band
      root.setProperty("--tri-ground", p.c3); // ground
      return next;
    });

  return (
    <button
      type="button"
      className={styles.rail}
      style={colorVars}
      onClick={cyclePalette}
      aria-label="Смени цвета на шарката"
      title="Смени цвета на шарката"
    >
      <span ref={tileRef} className={styles.tile} aria-hidden="true">
        {/* tablet / desktop (≥768px): random diagonal-or-mesh tile */}
        <svg className={`${styles.svg} hidden md:block`} preserveAspectRatio="xMidYMid slice">
          <defs>
            <Tile id={patternId} />
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
        {/* mobile (<768px): simple banded strip */}
        <svg className={`${styles.svg} block md:hidden`} preserveAspectRatio="xMidYMid slice">
          <defs>
            <PatternMobile id={`${patternId}m`} />
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId}m)`} />
        </svg>
      </span>
    </button>
  );
}
