/**
 * PATTERN TILES + PALETTES for the right-hand rail.
 *
 * Each tile is an SVG <pattern> whose fills point at the recolor slots
 * (--pattern-c1..c4). Because the rail inlines the SVG into the DOM, those
 * CSS variables resolve live — so recoloring is just reassigning the slots.
 *
 * `patternUnits="userSpaceOnUse"` keeps the tile a FIXED pixel size; the
 * pattern viewport clips each cell to TILE×TILE (so the oversized diagonal
 * paths below render exactly like the source SVG's clipPath) and repeats.
 *
 * Add more designs (pattern-02, -03…) as extra entries in PATTERNS — nothing
 * else needs to change; the rail picks one at random per load.
 */
import type { JSX } from "react";

export const TILE = 196; // px — one repeat unit (parallax wraps on this)

/** pattern-01 — 45° diagonal bands, normalized to the 0–TILE tile (same look
 *  as the source SVG, but with small precise coords so tiling stays crisp).
 *  Bands run along x+y: rose [0,115], tomato [115,196], burgundy elsewhere.
 *  Fills mapped to recolor slots so the default (c3=burgundy, c2=rose,
 *  c1=tomato) reproduces the source exactly. */
function Pattern01({ id }: { id: string }): JSX.Element {
  return (
    <pattern id={id} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
      <rect width={TILE} height={TILE} fill="var(--pattern-c3)" />
      <polygon points="0,0 115,0 0,115" fill="var(--pattern-c2)" />
      <polygon points="115,0 196,0 0,196 0,115" fill="var(--pattern-c1)" />
    </pattern>
  );
}

/** All available tiles. Add the real designs to this array. */
export const PATTERNS: ReadonlyArray<(props: { id: string }) => JSX.Element> = [
  Pattern01,
];

/**
 * Recolor combos cycled on click. Each combo is read as [accent, band, ground]:
 *   - c2 = accent  (bright corner triangle) — also the global brand color
 *   - c1 = band    (mid diagonal band)
 *   - c3 = ground  (dominant background); c4 mirrors it (unused by pattern-01)
 *   - brand = the accent, applied to --color-brand site-wide on click
 */
export type Palette = {
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  brand: string;
};

const combo = (accent: string, band: string, ground: string): Palette => ({
  c2: accent,
  c1: band,
  c3: ground,
  c4: ground,
  brand: accent,
});

export const PALETTES: ReadonlyArray<Palette> = [
  combo("var(--bdc-rose)", "var(--bdc-tomato)", "var(--bdc-burgundy)"),
  combo("var(--bdc-rose)", "var(--bdc-lavender)", "var(--bdc-indigo)"),
  combo("var(--bdc-amber)", "var(--bdc-tomato)", "var(--bdc-burgundy)"),
  combo("var(--bdc-amber)", "var(--bdc-orange)", "var(--bdc-indigo)"),
];
