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

/**
 * The stylesheet itself.
 *
 * The interactive width preview renders inside an iframe and needs the real
 * rules — `vw` and `@media` both resolve against a viewport, so the only honest
 * way to show what a phone gets is to give something a phone-sized viewport.
 */
export const globalsCss = raw;

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
  // The trailing comment states the Figma style as `size/leadingPercent`, and
  // sometimes names it too — `/* 24/150 · Figma body-medium */`. Only the size
  // is captured; the rest is for a reader.
  const rule = /\.(t-[\w-]+)\s*\{([^}]*)\}(?:[^\S\n]*\/\*\s*(\d+)(?:\/\d+)?[^*]*\*\/)?/g;
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

  /*
   * Sizes are declared as `var(--fs-*)` on `:root` and overridden per band, so
   * a style's phone size is not written on the `.t-*` rule any more. Pick it up
   * from the token instead, and only record it where the narrowest band really
   * declares something different — otherwise every style would claim an
   * override it does not have.
   */
  for (const style of styles) {
    const variable = style.fontSize.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    if (!variable) continue;

    const narrowest = mediaBlocks(css)
      .filter(({ query }) => /max-width:\s*767px/.test(query))
      .flatMap(({ body }) => declarations(body.match(/:root\s*\{([^}]*)\}/)?.[1] ?? ""))
      .find((token) => token.name === variable[1]);

    if (narrowest) {
      style.mobile = { ...(style.mobile ?? {}), fontSize: narrowest.value };
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

/** The browser default when the reader has changed nothing. */
export const ROOT_PX = 16;

/**
 * The browser's text-size setting, which is this platform's Dynamic Type.
 *
 * Apple varies a style by the reader's content size category — Title 1 is 34pt
 * at Large and 31pt at xSmall — and the web has exactly the same axis in the
 * browser's default font size. Every `rem` in the stylesheet is measured against
 * it, so a reader who sets Large is asking for the whole scale to grow.
 *
 * These are Chrome's five presets; Safari and Firefox expose the same thing with
 * different labels. Nothing in globals.css pins `html { font-size }`, which is
 * what makes the setting work at all — pinning it to 16px is the single most
 * common way a site silently overrides an accessibility preference.
 */
export const TEXT_SIZE_STEPS = [
  { label: 'Very small', rootPx: 9 },
  { label: 'Small', rootPx: 12 },
  { label: 'Medium (default)', rootPx: 16 },
  { label: 'Large', rootPx: 20 },
  { label: 'Very large', rootPx: 24 },
] as const;

/** A bare CSS length in pixels. Negative values occur inside calc(). */
function lengthToPx(value: string, viewportWidth: number, rootPx = ROOT_PX): number | null {
  const raw = value.trim();
  const rem = raw.match(/^(-?[\d.]+)rem$/);
  if (rem) return parseFloat(rem[1]) * rootPx;
  const px = raw.match(/^(-?[\d.]+)px$/);
  if (px) return parseFloat(px[1]);
  const vw = raw.match(/^(-?[\d.]+)vw$/);
  if (vw) return (parseFloat(vw[1]) / 100) * viewportWidth;
  return null;
}

/* -------------------------------------------------------------------------- */
/* Resolving a token to a real length at a real width                         */
/* -------------------------------------------------------------------------- */

// Parsed once. The evaluator walks these thousands of times when finding cap
// widths, and re-parsing the stylesheet each call made that visibly slow.
const BASE_TOKENS: Token[] = parseTokenGroups().flatMap((group) => group.tokens);
const RESPONSIVE: ResponsiveTokens[] = parseResponsiveTokens();

/** Whether a media query applies at a given viewport width. */
export function queryMatches(query: string, width: number): boolean {
  const max = query.match(/\(max-width:\s*(\d+)px\)/);
  const min = query.match(/\(min-width:\s*(\d+)px\)/);
  if (max && width > Number(max[1])) return false;
  if (min && width < Number(min[1])) return false;
  return true;
}

/**
 * A token's declaration at a given width, after the media queries have had
 * their say. Later declarations win, which is the cascade for equal specificity.
 */
export function declarationAt(name: string, width: number): string | null {
  let value = BASE_TOKENS.find((token) => token.name === name)?.value ?? null;
  for (const band of RESPONSIVE) {
    if (!queryMatches(band.query, width)) continue;
    const declared = band.tokens.find((token) => token.name === name);
    if (declared) value = declared.value;
  }
  return value;
}

/** Split on commas that are not inside parentheses. */
function splitArgs(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of input) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

/**
 * Evaluate a CSS length expression at a width.
 *
 * Handles the four forms this stylesheet uses: a bare length, `var()`,
 * `clamp(a, b, c)` and `calc(A ± B)`. Everything the type scale is expressed in
 * is one of those, and anything else returns null rather than guessing — a
 * wrong number here would be worse than a blank cell, because it would look
 * like an answer.
 */
export function evaluateLength(
  expression: string,
  width: number,
  rootPx: number = ROOT_PX,
  depth = 0,
): number | null {
  if (depth > 8) return null;
  const expr = expression.trim();

  const variable = expr.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (variable) {
    const declared = declarationAt(variable[1], width);
    return declared === null ? null : evaluateLength(declared, width, rootPx, depth + 1);
  }

  const clamp = expr.match(/^clamp\(([\s\S]*)\)$/);
  if (clamp) {
    const args = splitArgs(clamp[1]).map((arg) =>
      evaluateLength(arg, width, rootPx, depth + 1),
    );
    if (args.length !== 3 || args.some((value) => value === null)) return null;
    const [min, preferred, max] = args as number[];
    return Math.min(Math.max(min, preferred), max);
  }

  const calc = expr.match(/^calc\(([\s\S]*)\)$/);
  if (calc) {
    const parts = calc[1].split(/\s+([+-])\s+/);
    let total = evaluateLength(parts[0], width, rootPx, depth + 1);
    if (total === null) return null;
    for (let i = 1; i < parts.length; i += 2) {
      const value = evaluateLength(parts[i + 1], width, rootPx, depth + 1);
      if (value === null) return null;
      total = parts[i] === '+' ? total + value : total - value;
    }
    return total;
  }

  return lengthToPx(expr, width, rootPx);
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
export function fontSizeAt(
  style: TypeStyle,
  viewportWidth: number,
  rootPx: number = ROOT_PX,
): number | null {
  return evaluateLength(style.fontSize, viewportWidth, rootPx);
}

/**
 * Whether a style actually responds to the reader's text-size setting.
 *
 * The catch that makes this worth computing rather than assuming: a `vw` term
 * is measured against the viewport, not the root font size. So while the
 * clamp's floor and ceiling move with the reader's preference, the preferred
 * term does not — and wherever the `vw` value sits between the two, turning the
 * setting up changes nothing at all. That is a real accessibility gap and it is
 * invisible unless you check for it.
 */
export type TextSizeBehaviour = {
  /** One size per step in TEXT_SIZE_STEPS. */
  values: number[];
  /** `full` — every step grows. `partial` — it stops growing. `none` — flat. */
  verdict: 'full' | 'partial' | 'none';
  /** Label of the first step that produced no increase, when partial. */
  flatFrom?: string;
};

export function respondsToTextSize(
  style: TypeStyle,
  viewportWidth: number,
): TextSizeBehaviour | null {
  const values = TEXT_SIZE_STEPS.map((step) =>
    fontSizeAt(style, viewportWidth, step.rootPx),
  );
  if (values.some((value) => value === null)) return null;
  const sizes = values as number[];

  // Where does turning the setting up stop having an effect? Half a pixel is
  // the threshold because sub-pixel growth is not growth a reader can see.
  let flatIndex = -1;
  for (let i = 1; i < sizes.length; i += 1) {
    if (sizes[i] <= sizes[i - 1] + 0.5) {
      flatIndex = i;
      break;
    }
  }

  if (flatIndex === -1) return { values: sizes, verdict: 'full' };
  if (flatIndex === 1) return { values: sizes, verdict: 'none' };
  return {
    values: sizes,
    verdict: 'partial',
    flatFrom: TEXT_SIZE_STEPS[flatIndex].label.replace(' (default)', ''),
  };
}

/**
 * The breakpoints, read out of the media queries in globals.css.
 *
 * Not device names. "iPhone 15" is a width someone chose to care about; a
 * breakpoint is a width the stylesheet actually behaves differently either side
 * of, and only the second kind belongs in a design system. Add a media query to
 * globals.css and it appears here on its own.
 */
export function parseBreakpointEdges(css: string = raw): { kind: 'min' | 'max'; px: number }[] {
  const edges = new Map<string, { kind: 'min' | 'max'; px: number }>();
  for (const { query } of mediaBlocks(css)) {
    for (const match of query.matchAll(/\((min|max)-width:\s*(\d+)px\)/g)) {
      const kind = match[1] as 'min' | 'max';
      const px = Number(match[2]);
      edges.set(`${kind}-${px}`, { kind, px });
    }
  }
  return [...edges.values()].sort((a, b) => a.px - b.px);
}

/** How many grid columns are active at a given width, per the stylesheet. */
export function gridColsAt(width: number, css: string = raw): number {
  let cols = Number(parseTokenGroups(css).flatMap((g) => g.tokens).find((t) => t.name === '--grid-cols')?.value ?? 12);

  for (const { query, tokens } of parseResponsiveTokens(css)) {
    const max = query.match(/\(max-width:\s*(\d+)px\)/);
    const min = query.match(/\(min-width:\s*(\d+)px\)/);
    if (max && width > Number(max[1])) continue;
    if (min && width < Number(min[1])) continue;
    const declared = tokens.find((token) => token.name === '--grid-cols');
    if (declared) cols = Number(declared.value);
  }
  return cols;
}

/**
 * The width at which a fluid style stops growing.
 *
 * `clamp(min, Nvw, max)` reaches `max` when `Nvw` passes it, and above that the
 * size is constant. That width is where the style's desktop value — the size the
 * design was drawn at — actually appears.
 */
export function capWidth(style: TypeStyle): number | null {
  const SCAN_TO = 2560;
  const ceiling = evaluateLength(style.fontSize, SCAN_TO);
  if (ceiling === null) return null;

  // Scanned rather than solved: the declaration is a var() that resolves to a
  // different expression in each band, so there is no single formula to invert.
  for (let width = MIN_WIDTH; width <= SCAN_TO; width += 1) {
    const value = evaluateLength(style.fontSize, width);
    if (value !== null && value >= ceiling - 0.01) return width;
  }
  return null;
}

/** The narrowest width the design system claims to support. */
export const MIN_WIDTH = 320;

/**
 * The width the designs are drawn at.
 *
 * A design fact rather than a CSS one — no media query mentions 1512, so it
 * cannot be derived from the stylesheet the way the bands are. It is the default
 * the previews open at, because it is the width every design decision on this
 * site was made against, and the one a reviewer should see first.
 */
export const DESIGN_WIDTH = 1512;

export type BreakpointBand = {
  /** Inclusive lower bound. */
  from: number;
  /** Inclusive upper bound; null means open-ended. */
  to: number | null;
  cols: number;
  /** "≤767px", "768–1023px", "1024px and up". */
  range: string;
  /** A width inside the band to preview and tabulate at. */
  sample: number;
};

/**
 * The breakpoints as bands, which is what a breakpoint actually is.
 *
 * The stylesheet declares edges — `max-width: 767px`, `max-width: 1023px` — but
 * an edge on its own is not a breakpoint any more than a fence post is a field.
 * What the design has is three bands, each with its own column count, and the
 * useful question is which band a width falls in.
 *
 * Bands are cut from the `max-width` values in source order: everything up to
 * the first, then between each pair, then everything above the last.
 */
export function breakpointBands(css: string = raw): BreakpointBand[] {
  const maxEdges = parseBreakpointEdges(css)
    .filter((edge) => edge.kind === 'max')
    .map((edge) => edge.px)
    .sort((a, b) => a - b);

  const bands: BreakpointBand[] = [];
  let from = MIN_WIDTH;

  for (const edge of maxEdges) {
    bands.push({
      from,
      to: edge,
      cols: gridColsAt(edge, css),
      range: from === MIN_WIDTH ? `≤${edge}px` : `${from}–${edge}px`,
      // The widest width in the band: where a fluid style in it is largest, and
      // where it is about to hand over to the next band.
      sample: edge,
    });
    from = edge + 1;
  }

  bands.push({
    from,
    to: null,
    cols: gridColsAt(from, css),
    range: `${from}px and up`,
    sample: from,
  });

  return bands;
}

/**
 * The width at which every fluid style has stopped growing.
 *
 * Not a breakpoint — no media query mentions it — but the first width at which
 * each style is at the size it was drawn at, so a table without it never shows a
 * desktop value. Every breakpoint here is at or below 1024px while `.t-h01` does
 * not reach its 80px until 1334px, and leaving this out once made the widest
 * column read 61.44px for the hero as though that were the answer.
 */
export function capAllWidth(css: string = raw): number | null {
  const caps = parseTypeStyles(css)
    .map((style) => capWidth(style))
    .filter((width): width is number => width !== null);
  return caps.length > 0 ? Math.max(...caps) : null;
}

export const BANDS: BreakpointBand[] = breakpointBands();

/**
 * Columns for the size tables: one per band, plus the width where every style
 * has reached its maximum.
 */
export const REFERENCE_WIDTHS: { label: string; width: number; note: string }[] = [
  ...BANDS.map((band) => ({
    label: band.range,
    width: band.sample,
    note: `${band.cols} col`,
  })),
  { label: `${DESIGN_WIDTH}px`, width: DESIGN_WIDTH, note: 'design width' },
  ...(capAllWidth()
    ? [{ label: `${capAllWidth()}px`, width: capAllWidth()!, note: 'all at max' }]
    : []),
];

/**
 * The size jump, if any, across the 767 → 768 boundary.
 *
 * Positive means the text gets bigger the instant the viewport crosses into
 * tablet. A few pixels is invisible; a third of the size is a different design.
 */
export function boundaryJump(style: TypeStyle): { from: number; to: number; ratio: number } | null {
  const from = fontSizeAt(style, 767);
  const to = fontSizeAt(style, 768);
  if (from === null || to === null || from === 0) return null;
  return { from, to, ratio: to / from };
}

/**
 * Whether a clamp's minimum can ever bind.
 *
 * `clamp(min, Nvw, max)` only uses `min` below the width where `Nvw` falls under
 * it. If a fixed override already owns every width below that point, the minimum
 * is unreachable — it reads like a floor and enforces nothing.
 */
export function deadMinimum(style: TypeStyle): { min: number; bindsBelow: number } | null {
  const clamp = style.fontSize.match(/^clamp\(([^,]+),\s*([\d.]+)vw\s*,([^)]+)\)$/);
  if (!clamp || !style.mobile?.fontSize) return null;

  const min = lengthToPx(clamp[1], 0);
  const vw = parseFloat(clamp[2]);
  if (min === null || !vw) return null;

  // Width at which the preferred term drops below the minimum.
  const bindsBelow = (min / vw) * 100;
  return bindsBelow < 768 ? { min, bindsBelow } : null;
}

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
