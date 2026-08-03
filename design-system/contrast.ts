/**
 * WCAG contrast, computed from whatever the browser actually resolved.
 *
 * Both Apple's HIG and Material state contrast beside a colour rather than
 * leaving it to be discovered later, and it is the single most useful number a
 * palette page can carry: a swatch tells you what a colour looks like, the ratio
 * tells you what you are allowed to do with it. globals.css already reasons this
 * way — the focus ring is burgundy because it is "10.9:1 on the page white".
 * This is that figure, computed rather than remembered.
 */

/** Parse `#rgb`, `#rrggbb`, `rgb(…)` or `rgba(…)` into 0–255 channels. */
export function toRgb(colour: string): [number, number, number] | null {
  const value = colour.trim();

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }

  const parts = value.match(/^rgba?\(([^)]+)\)$/i)?.[1];
  if (parts) {
    const nums = parts.split(/[,\s/]+/).filter(Boolean).map(Number);
    if (nums.length >= 3 && nums.slice(0, 3).every((n) => Number.isFinite(n))) {
      return [nums[0], nums[1], nums[2]];
    }
  }

  return null;
}

/** Relative luminance, per WCAG 2.x. */
function luminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colours, 1–21, or null if either is unparseable. */
export function contrastRatio(a: string, b: string): number | null {
  const first = toRgb(a);
  const second = toRgb(b);
  if (!first || !second) return null;

  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
}

export type ContrastVerdict = {
  ratio: number;
  /** Passes 4.5:1 — body text. */
  normalText: boolean;
  /** Passes 3:1 — text at 24px, or 18.66px bold. */
  largeText: boolean;
  /** Passes 3:1 — borders, focus rings, icons. */
  nonText: boolean;
};

export function judge(ratio: number): ContrastVerdict {
  return {
    ratio,
    normalText: ratio >= 4.5,
    largeText: ratio >= 3,
    nonText: ratio >= 3,
  };
}

/** "10.94:1" — two decimals, as the WCAG tooling conventionally reports it. */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
