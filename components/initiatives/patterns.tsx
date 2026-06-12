/**
 * INITIATIVE THUMBNAIL PATTERNS — the four "pattern-cover" tiles, ported from
 * Figma SVGs into recolorable, tiling <pattern>s.
 *
 * Like the pattern rail, fills point at recolor slots (--p1, --p2) so a card's
 * colors are just two CSS variables. Each tile is exactly 240px tall (the image
 * height), so it tiles horizontally across the card and once vertically.
 *
 *   --p1  contrasting "ink" (always reads against the card background)
 *   --p2  secondary tone (set ≈ the card background, so it blends)
 *
 * Pattern→card mapping (set per card in home-content): 1·diamonds, 2·triangles,
 * 3·sails, 4·split-squares. Card 4 reuses pattern 2, recolored for its bg.
 */
"use client";

import { useId, type JSX } from "react";

const P1 = "var(--p1)";
const P2 = "var(--p2)";

type Tile = { width: number; body: (id: string) => JSX.Element };

/** pattern-01 — two-tone diamond grid (period 154×96.25). */
const tile01: Tile = {
  width: 154,
  body: (id) => (
    <>
      <g clipPath={`url(#${id}-a)`}>
        <polygon points="77,48.125 38.5,96.25 0,48.125 38.5,0" fill={P1} />
        <polygon points="154,48.125 115.5,96.25 77,48.125 115.5,0" fill={P1} />
        <polygon points="115.5,0 77,48.125 38.5,0 77,-48.125" fill={P2} />
        <polygon points="115.5,96.25 77,144.375 38.5,96.25 77,48.125" fill={P2} />
      </g>
      <g clipPath={`url(#${id}-b)`}>
        <polygon points="77,144.375 38.5,192.5 0,144.375 38.5,96.25" fill={P1} />
        <polygon points="154,144.375 115.5,192.5 77,144.375 115.5,96.25" fill={P1} />
        <polygon points="115.5,96.25 77,144.375 38.5,96.25 77,48.125" fill={P2} />
        <polygon points="115.5,192.5 77,240.625 38.5,192.5 77,144.375" fill={P2} />
      </g>
      <g clipPath={`url(#${id}-c)`}>
        <polygon points="77,240.625 38.5,288.75 0,240.625 38.5,192.5" fill={P1} />
        <polygon points="154,240.625 115.5,288.75 77,240.625 115.5,192.5" fill={P1} />
        <polygon points="115.5,192.5 77,240.625 38.5,192.5 77,144.375" fill={P2} />
      </g>
      <defs>
        <clipPath id={`${id}-a`}><rect width="154" height="96.25" /></clipPath>
        <clipPath id={`${id}-b`}><rect y="96.25" width="154" height="96.25" /></clipPath>
        <clipPath id={`${id}-c`}><rect y="192.5" width="154" height="96.25" /></clipPath>
      </defs>
    </>
  ),
};

/** pattern-02 — diagonal split squares (period 77×80). */
const tile02: Tile = {
  width: 154,
  body: () => (
    <>
      <polygon points="0,0 77,80 0,80" fill={P2} />
      <polygon points="77,80 0,0 77,0" fill={P1} />
      <polygon points="0,80 77,160 0,160" fill={P2} />
      <polygon points="77,160 0,80 77,80" fill={P1} />
      <polygon points="0,160 77,240 0,240" fill={P2} />
      <polygon points="77,240 0,160 77,160" fill={P1} />
      <polygon points="77,0 154,80 77,80" fill={P2} />
      <polygon points="154,80 77,0 154,0" fill={P1} />
      <polygon points="77,80 154,160 77,160" fill={P2} />
      <polygon points="154,160 77,80 154,80" fill={P1} />
      <polygon points="77,160 154,240 77,240" fill={P2} />
      <polygon points="154,240 77,160 154,160" fill={P1} />
    </>
  ),
};

/** pattern-03 — sparse single-tone sails (period 124×155). */
const tile03: Tile = {
  width: 124,
  body: (id) => (
    <>
      <g clipPath={`url(#${id}-a)`}>
        <polygon points="42.6069,-17.6484 42.6069,102.861 -17.6478,42.6063" fill={P1} />
      </g>
      <g clipPath={`url(#${id}-b)`}>
        <polygon points="104.607,59.3516 104.607,179.861 44.3522,119.606" fill={P1} />
      </g>
      <g clipPath={`url(#${id}-c)`}>
        <polygon points="42.6069,137.352 42.6069,257.861 -17.6478,197.606" fill={P1} />
      </g>
      <defs>
        <clipPath id={`${id}-a`}><rect width="42.5" height="85" /></clipPath>
        <clipPath id={`${id}-b`}><rect x="62" y="77" width="42.5" height="85" /></clipPath>
        <clipPath id={`${id}-c`}><rect y="155" width="42.5" height="85" /></clipPath>
      </defs>
    </>
  ),
};

/** pattern-04 — two-tone split squares / petals (period 154×240). */
const tile04: Tile = {
  width: 154,
  body: (id) => (
    <>
      <g clipPath={`url(#${id}-a)`}>
        <polygon points="78,-24.853 78,144.853 -6.85281,59.9998" fill={P2} />
        <polygon points="78,144.853 78,-24.8526 162.853,60.0002" fill={P1} />
      </g>
      <g clipPath={`url(#${id}-b)`}>
        <polygon points="0,-24.853 0,144.853 -84.8528,59.9998" fill={P2} />
        <polygon points="0,144.853 0,-24.8526 84.8528,60.0002" fill={P1} />
      </g>
      <g clipPath={`url(#${id}-c)`}>
        <polygon points="94,95.147 94,264.853 9.14719,180" fill={P2} />
        <polygon points="94,264.853 94,95.1474 178.853,180" fill={P1} />
      </g>
      <g clipPath={`url(#${id}-d)`}>
        <polygon points="19,95.147 19,264.853 -65.8528,180" fill={P2} />
        <polygon points="19,264.853 19,95.1474 103.853,180" fill={P1} />
      </g>
      <defs>
        <clipPath id={`${id}-a`}><rect x="18" width="120" height="120" /></clipPath>
        <clipPath id={`${id}-b`}><rect x="-60" width="120" height="120" /></clipPath>
        <clipPath id={`${id}-c`}><rect x="34" y="120" width="120" height="120" /></clipPath>
        <clipPath id={`${id}-d`}><rect x="-41" y="120" width="120" height="120" /></clipPath>
      </defs>
    </>
  ),
};

const TILES: Record<1 | 2 | 3 | 4, Tile> = { 1: tile01, 2: tile02, 3: tile03, 4: tile04 };

/** Full-bleed tiling thumbnail. Reads --p1/--p2 from the card. */
export function PatternTile({ n }: { n: 1 | 2 | 3 | 4 }) {
  const uid = useId().replace(/:/g, "");
  const tile = TILES[n];
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={uid} width={tile.width} height={240} patternUnits="userSpaceOnUse">
          {tile.body(uid)}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${uid})`} />
    </svg>
  );
}
