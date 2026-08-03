/**
 * The design system, read out of the design system.
 *
 * Every value on the Foundations pages is parsed from `app/globals.css` at build
 * time — names, values, trailing comments, section headings, and the media-query
 * overrides. Nothing here is transcribed.
 *
 * That is the whole point, and it is worth defending. `globals.css` opens with
 * "Single source of truth. Swap nothing downstream." A Storybook page that
 * hand-wrote `#f3a3ca` beside a swatch would be a second source of truth: it
 * looks authoritative, it renders convincingly, and it is wrong from the moment
 * someone edits the CSS — silently, because a hardcoded hex cannot fail a test.
 * Parsing means the only way to change a swatch is to change the token.
 *
 * If a page here looks empty or wrong, the parser has lost the shape of the file
 * rather than the file having lost its tokens. Fix the scanner below; do not
 * paste values in.
 */
import raw from "../app/globals.css?raw";

export type Token = {
  /** Custom property name, e.g. `--bdc-rose`. */
  name: string;
  /** Value exactly as written, e.g. `#f3a3ca` or `var(--bdc-dark)`. */
  value: string;
  /** The trailing same-line comment, where there is one. */
  note?: string;
};

export type TokenGroup = {
  /** Taken from the `/* ---- Heading ---- *​/` banner above the run. */
  title: string;
  tokens: Token[];
};

/** A `.t-*` text style, mirroring a named style in Figma. */
export type TypeStyle = {
  /** Class name without the dot, e.g. `t-h01`. */
  name: string;
  /** As authored — a `clamp()` for most, which is why the scale is fluid. */
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
  /** Desktop pixel size from Figma, from the trailing comment. */
  figmaPx?: string;
  /**
   * What ≤767px replaces, where anything does.
   *
   * These live outside `@layer base` on purpose, so they beat the layered rule
   * above rather than merely being later in the file. A phone therefore does
   * NOT get the clamp — it gets a fixed size. Both halves matter, so both are
   * carried here.
   */
  mobile?: { fontSize?: string; lineHeight?: string };
};

/** A `:root` override that only applies inside a media query. */
export type ResponsiveTokens = { query: string; tokens: Token[] };

/* -------------------------------------------------------------------------- */

const ROOT_BLOCK = /:root\s*\{([\s\S]*?)\n\}/;
const GROUP_HEADING = /^\s*\/\*\s*-{2,}\s*(.+?)\s*-{2,}/;
const DECLARATION = /^\s*(--[\w-]+)\s*:\s*([^;]+);(?:\s*\/\*\s*(.*?)\s*\*\/)?/;

/**
 * Every `@media` block with its body, brace-matched.
 *
 * A regex cannot do this: these blocks contain nested rules, so `[^}]*` stops at
 * the first inner `}` and silently truncates. Scanning for the balanced close is
 * the only correct way, and getting it wrong is how the mobile type overrides
 * went unnoticed in the first place.
 */
function mediaBlocks(css: string): { query: string; body: string }[] {
  const out: { query: string; body: string }[] = [];
  const opener = /@media\s*([^{]+?)\s*\{/g;

  for (const match of css.matchAll(opener)) {
    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") depth -= 1;
      i += 1;
    }
    out.push({ query: match[1], body: css.slice(start, i - 1) });
  }
  return out;
}

/** The stylesheet with every `@media` block removed, so base rules parse alone. */
function withoutMedia(css: string): string {
  let result = css;
  for (const { body } of mediaBlocks(css)) result = result.replace(body, "");
  return result;
}

/** Declarations in a chunk of CSS, in source order. */
function declarations(block: string): Token[] {
  const tokens: Token[] = [];
  for (const line of block.split("\n")) {
    const decl = line.match(DECLARATION);
    if (!decl) continue;
    tokens.push({
      name: decl[1],
      value: decl[2].trim(),
      ...(decl[3] ? { note: decl[3] } : {}),
    });
  }
  return tokens;
}

/** Custom properties on `:root`, grouped by the file's own comment banners. */
export function parseTokenGroups(css: string = raw): TokenGroup[] {
  const block = css.match(ROOT_BLOCK)?.[1];
  if (!block) return [];

  const groups: TokenGroup[] = [];
  let current: TokenGroup | null = null;

  for (const line of block.split("\n")) {
    const heading = line.match(GROUP_HEADING);
    if (heading) {
      current = { title: heading[1], tokens: [] };
      groups.push(current);
      continue;
    }
    const decl = line.match(DECLARATION);
    if (!decl) continue;

    if (!current) {
      current = { title: "Ungrouped", tokens: [] };
      groups.push(current);
    }
    current.tokens.push({
      name: decl[1],
      value: decl[2].trim(),
      ...(decl[3] ? { note: decl[3] } : {}),
    });
  }

  return groups.filter((group) => group.tokens.length > 0);
}

/** `:root` overrides that only apply at a breakpoint, narrowest query last. */
export function parseResponsiveTokens(css: string = raw): ResponsiveTokens[] {
  return mediaBlocks(css)
    .filter(({ body }) => /:root\s*\{/.test(body))
    .map(({ query, body }) => ({
      query,
      tokens: declarations(body.match(/:root\s*\{([^}]*)\}/)?.[1] ?? ""),
    }))
    .filter((entry) => entry.tokens.length > 0);
}

/**
 * The `.t-*` text styles, base values merged with their ≤767px overrides.
 *
 * Base rules are read from the stylesheet with media blocks stripped out —
 * otherwise the overrides parse as a second, sizeless copy of every style.
 */
export function parseTypeStyles(css: string = raw): TypeStyle[] {
  const rule = /\.(t-[\w-]+)\s*\{([^}]*)\}(?:[^\S\n]*\/\*\s*(\d+)\s*\*\/)?/g;
  const decl = (body: string, prop: string) =>
    body.match(new RegExp(`${prop}\\s*:\\s*([^;]+);`))?.[1].trim() ?? "";

  const styles: TypeStyle[] = [];
  for (const match of withoutMedia(css).matchAll(rule)) {
    const [, name, body, figmaPx] = match;
    // The same selectors reappear in a `text-wrap: balance` rule, which is a
    // behaviour rather than a style. A font-size is what makes it a style.
    if (!/font-size/.test(body)) continue;

    styles.push({
      name,
      fontSize: decl(body, "font-size"),
      lineHeight: decl(body, "line-height"),
      letterSpacing: decl(body, "letter-spacing"),
      fontWeight: decl(body, "font-weight"),
      ...(figmaPx ? { figmaPx } : {}),
    });
  }

  for (const { body } of mediaBlocks(css)) {
    for (const match of body.matchAll(rule)) {
      const [, name, overrideBody] = match;
      const style = styles.find((s) => s.name === name);
      if (!style) continue;
      const fontSize = decl(overrideBody, "font-size");
      const lineHeight = decl(overrideBody, "line-height");
      if (!fontSize && !lineHeight) continue;
      style.mobile = {
        ...(fontSize ? { fontSize } : {}),
        ...(lineHeight ? { lineHeight } : {}),
      };
    }
  }

  return styles;
}

export const tokenGroups: TokenGroup[] = parseTokenGroups();
export const responsiveTokens: ResponsiveTokens[] = parseResponsiveTokens();
export const typeStyles: TypeStyle[] = parseTypeStyles();

/** Groups whose values are colours, in file order. */
export const colourGroups: TokenGroup[] = tokenGroups.filter((group) =>
  /colou?r|pattern|triad/i.test(group.title),
);

/** Groups describing space, radius and the page grid. */
export const layoutGroups: TokenGroup[] = tokenGroups.filter((group) =>
  /spacing|radius|layout/i.test(group.title),
);

/** Root font size, so rem values can be stated in pixels. */
const ROOT_PX = 16;

/** A CSS length in pixels, resolved against a viewport width. */
function lengthToPx(value: string, viewportWidth: number): number | null {
  const raw = value.trim();
  const rem = raw.match(/^([\d.]+)rem$/);
  if (rem) return parseFloat(rem[1]) * ROOT_PX;
  const px = raw.match(/^([\d.]+)px$/);
  if (px) return parseFloat(px[1]);
  const vw = raw.match(/^([\d.]+)vw$/);
  if (vw) return (parseFloat(vw[1]) / 100) * viewportWidth;
  return null;
}

/**
 * The font size a style paints at a given viewport width, in pixels.
 *
 * This is what makes "desktop vs tablet vs mobile" answerable at all. Nine of
 * the eleven styles are `clamp(min, Nvw, max)`, which has no single value — it
 * is a function of width. Evaluating it is the only way to state a number, and
 * doing it here rather than by hand means the numbers cannot drift from the CSS.
 *
 * Below 768px the mobile override wins, because it is declared outside
 * `@layer base` and so beats the layered rule. Applying it first is not a
 * shortcut — it is the cascade this stylesheet actually has.
 */
export function fontSizeAt(style: TypeStyle, viewportWidth: number): number | null {
  if (viewportWidth <= 767 && style.mobile?.fontSize) {
    return lengthToPx(style.mobile.fontSize, viewportWidth);
  }

  const clamp = style.fontSize.match(/^clamp\(([^,]+),([^,]+),([^)]+)\)$/);
  if (clamp) {
    const min = lengthToPx(clamp[1], viewportWidth);
    const preferred = lengthToPx(clamp[2], viewportWidth);
    const max = lengthToPx(clamp[3], viewportWidth);
    if (min === null || preferred === null || max === null) return null;
    return Math.min(Math.max(min, preferred), max);
  }

  return lengthToPx(style.fontSize, viewportWidth);
}

/** The widths the site is actually designed against. */
export const REFERENCE_WIDTHS = [
  { label: 'Mobile', width: 390, note: '4 columns' },
  { label: 'Tablet', width: 768, note: '8 columns' },
  { label: 'Desktop', width: 1512, note: '12 columns · Figma width' },
] as const;

/**
 * What the browser actually resolved a custom property to.
 *
 * The parsed value is what was *written* — often `var(--bdc-rose)`, which says
 * where a semantic points but not what colour it is. This gives the far end of
 * the chain, so a page can show both.
 */
export function resolvedValue(name: string, el?: Element): string {
  const target = el ?? document.documentElement;
  return getComputedStyle(target).getPropertyValue(name).trim();
}

/**
 * The length a token actually *uses* at this moment, in pixels.
 *
 * `resolvedValue('--page-gutter')` hands back `clamp(1.25rem, 7.4vw, 7rem)`, not
 * a width — and that is correct, not a bug. A custom property's computed value
 * is its token sequence with `var()` substituted; `clamp()`, `calc()` and `vw`
 * are only evaluated when the property is *used* by a real CSS property. So
 * there is no way to ask a custom property what it currently equals.
 *
 * The way round it is to use it. This applies the token as a `width` on an
 * absolutely-positioned probe and reads the computed width back, which is a real
 * used value. Tokens that are already plain lengths skip the probe, so an
 * unevaluatable value (`--grid-cols` is a bare number, invalid as a width) is
 * never silently reported as the probe's layout width.
 */
export function usedLength(name: string): string {
  const declared = resolvedValue(name);
  if (!/clamp\(|calc\(|var\(/.test(declared)) return declared;

  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.width = `var(${name})`;
  document.body.appendChild(probe);
  const used = getComputedStyle(probe).width;
  probe.remove();

  return /^[\d.]+px$/.test(used) ? used : declared;
}
