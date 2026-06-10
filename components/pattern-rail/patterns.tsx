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

/** pattern-02 — interlocking parallelogram mesh on a WHITE ground (this tile is
 *  light, unlike pattern-01). Shape fills mapped to the same recolor slots:
 *  rose→c2 (accent), tomato→c1 (band), burgundy→c3 (ground). */
function Pattern02({ id }: { id: string }): JSX.Element {
  return (
    <pattern id={id} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
      <rect width={TILE} height={TILE} fill="#ffffff" />
      <polygon points="83.6,-46 -31.6,-46 -2.8,26 112.4,26" fill="var(--pattern-c3)" />
      <polygon points="198.8,-46 83.6,-46 112.4,26 227.6,26" fill="var(--pattern-c1)" />
      <polygon points="-2.8,26 112.4,26 83.6,98 -31.6,98" fill="var(--pattern-c2)" />
      <polygon points="112.4,26 227.6,26 198.8,98 83.6,98" fill="var(--pattern-c3)" />
      <polygon points="83.6,98 -31.6,98 -2.8,170 112.4,170" fill="var(--pattern-c1)" />
      <polygon points="198.8,98 83.6,98 112.4,170 227.6,170" fill="var(--pattern-c3)" />
      <polygon points="-2.8,170 112.4,170 83.6,242 -31.6,242" fill="var(--pattern-c3)" />
      <polygon points="112.4,170 227.6,170 198.8,242 83.6,242" fill="var(--pattern-c2)" />
    </pattern>
  );
}

/** pattern-03 — three vertical bars on a burgundy ground, each bar segmented
 *  into rose/tomato/burgundy blocks. Same slot mapping (rose→c2, tomato→c1,
 *  burgundy→c3). Burgundy segments blend into the ground, as in the source. */
function Pattern03({ id }: { id: string }): JSX.Element {
  return (
    <pattern id={id} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
      <rect width={TILE} height={TILE} fill="var(--pattern-c3)" />
      {/* left bar (x ≈ 0–56) */}
      <rect x={-0.32} y={-81.996} width={56.63} height={120} fill="var(--pattern-c2)" />
      <rect x={-0.32} y={38.004} width={56.63} height={60} fill="var(--pattern-c1)" />
      <rect x={-0.32} y={98.004} width={56.63} height={20} fill="var(--pattern-c3)" />
      <rect x={-0.32} y={118.004} width={56.63} height={120} fill="var(--pattern-c2)" />
      {/* middle bar (x ≈ 70–126) */}
      <rect x={69.68} y={-3.996} width={56.63} height={20} fill="var(--pattern-c3)" />
      <rect x={69.68} y={16.004} width={56.63} height={120} fill="var(--pattern-c2)" />
      <rect x={69.68} y={136.004} width={56.63} height={60} fill="var(--pattern-c1)" />
      {/* right bar (x ≈ 140–196) */}
      <rect x={139.68} y={-81.996} width={56.63} height={120} fill="var(--pattern-c2)" />
      <rect x={139.68} y={38.004} width={56.63} height={60} fill="var(--pattern-c1)" />
      <rect x={139.68} y={98.004} width={56.63} height={20} fill="var(--pattern-c3)" />
      <rect x={139.68} y={118.004} width={56.63} height={120} fill="var(--pattern-c2)" />
    </pattern>
  );
}

/** Mobile tile — simple stacked horizontal bands for the thin (<768px) rail.
 *  rose→c2 (top), tomato→c1 (mid), burgundy→c3 (bottom): matches the source. */
export function PatternMobile({ id }: { id: string }): JSX.Element {
  return (
    <pattern id={id} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
      <rect width={TILE} height={TILE} fill="#ffffff" />
      <rect width={TILE} height={100} fill="var(--pattern-c2)" />
      <rect y={100} width={TILE} height={64} fill="var(--pattern-c1)" />
      <rect y={164} width={TILE} height={32} fill="var(--pattern-c3)" />
    </pattern>
  );
}

/** Desktop/tablet tiles — the rail picks one at random per load. */
export const PATTERNS: ReadonlyArray<(props: { id: string }) => JSX.Element> = [
  Pattern01,
  Pattern02,
  Pattern03,
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
