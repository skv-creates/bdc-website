/**
 * Three-way comparison: Figma, this branch, and the live site.
 *
 * They can all disagree, and each disagreement means something different:
 *
 * - **Figma vs branch** — the design library and the code have drifted.
 * - **Branch vs live** — work is merged but not published. The apex only
 *   updates when someone runs the production deploy by hand, so this gap is
 *   normal and expected; it just should not be a surprise.
 * - **Figma vs live** — what a visitor sees is not what was designed.
 */
import live from './live-type.generated.json';
import { FIGMA_TEXT_STYLES, CSS_ONLY_CLASSES, type FigmaTextStyle } from './figma-library';
import { DESIGN_WIDTH, fontSizeAt, typeStyles, type TypeStyle } from './tokens';

const ROOT_PX = 16;

type LiveStyle = {
  name: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
  overrides?: { query: string; fontSize?: string; lineHeight?: string; letterSpacing?: string }[];
};

export const liveMeta = {
  fetchedFrom: live.fetchedFrom,
  fetchedOn: live.fetchedOn,
};

export const liveStyles = live.styles as LiveStyle[];

/**
 * The desktop size a declaration settles at, in pixels.
 *
 * For a `clamp(min, vw, max)` that is the third argument: above the width where
 * the `vw` term passes it, the maximum is what paints. For a plain length it is
 * the length itself.
 */
export function desktopPx(fontSize: string): number | null {
  const clamp = fontSize.match(/^clamp\(([^,]+),([^,]+),([^)]+)\)$/);
  const value = (clamp ? clamp[3] : fontSize).trim();

  const rem = value.match(/^([\d.]+)rem$/);
  if (rem) return parseFloat(rem[1]) * ROOT_PX;
  const px = value.match(/^([\d.]+)px$/);
  if (px) return parseFloat(px[1]);
  return null;
}

/** Line height as a percentage, so it can be set beside Figma's own figure. */
export function lineHeightPct(lineHeight: string): number | null {
  const unitless = parseFloat(lineHeight);
  return Number.isFinite(unitless) ? Math.round(unitless * 100) : null;
}

export type Severity = 'ok' | 'warn' | 'error';

export type ParityRow = {
  figma?: FigmaTextStyle;
  branch?: TypeStyle;
  live?: LiveStyle;
  /** Class name, or the Figma name where no class exists. */
  key: string;
  issues: { severity: Severity; label: string; detail: string }[];
};

export function buildParity(): ParityRow[] {
  const rows: ParityRow[] = [];
  const branchByName = new Map(typeStyles.map((style) => [style.name, style]));
  const liveByName = new Map(liveStyles.map((style) => [style.name, style]));
  const claimed = new Set<string>();

  for (const figma of FIGMA_TEXT_STYLES) {
    const branch = figma.cssClass ? branchByName.get(figma.cssClass) : undefined;
    const liveStyle = figma.cssClass ? liveByName.get(figma.cssClass) : undefined;
    if (figma.cssClass) claimed.add(figma.cssClass);

    const issues: ParityRow['issues'] = [];

    if (!figma.cssClass) {
      issues.push({
        severity: 'error',
        label: 'Not implemented',
        detail: `${figma.name} (${figma.sizePx}/${figma.lineHeightPct}) has no CSS class.`,
      });
    } else {
      // Naming: does the class say what the Figma style is called?
      const expected = `t-${figma.name}`;
      if (figma.cssClass !== expected) {
        issues.push({
          severity: 'warn',
          label: 'Name differs',
          detail: `Figma calls this ${figma.name}; the class is .${figma.cssClass}.`,
        });
      }

      if (branch) {
        // Evaluated at the design width rather than read off the declaration:
        // sizes are now `var(--fs-*)` resolved per band, so there is no literal
        // maximum to read out of the rule.
        const raw = fontSizeAt(branch, DESIGN_WIDTH);
        const size = raw === null ? null : Math.round(raw * 100) / 100;
        if (size !== null && Math.abs(size - figma.sizePx) > 0.01) {
          issues.push({
            severity: 'error',
            label: 'Size differs from Figma',
            detail: `Figma ${figma.sizePx}px, this branch ${size}px.`,
          });
        }
        const pct = lineHeightPct(branch.lineHeight);
        if (pct !== null && pct !== figma.lineHeightPct) {
          issues.push({
            severity: 'error',
            label: 'Line height differs from Figma',
            detail: `Figma ${figma.lineHeightPct}%, this branch ${pct}%.`,
          });
        }
      }

      // Branch against live: publishing lag rather than a defect.
      if (branch && liveStyle) {
        const branchMobile = branch.mobile?.fontSize;
        const liveMobile = liveStyle.overrides?.find((o) => o.fontSize)?.fontSize;
        if ((branchMobile ?? null) !== (liveMobile ?? null)) {
          issues.push({
            severity: 'warn',
            label: 'Not yet published',
            detail: `Mobile size is ${branchMobile ?? 'unset'} here and ${liveMobile ?? 'unset'} on the live site.`,
          });
        }
      }
    }

    rows.push({
      figma,
      branch,
      live: liveStyle,
      key: figma.cssClass ?? figma.name,
      issues,
    });
  }

  // Classes with no Figma style behind them.
  for (const name of CSS_ONLY_CLASSES) {
    rows.push({
      branch: branchByName.get(name),
      live: liveByName.get(name),
      key: name,
      issues: [
        {
          severity: 'warn',
          label: 'No Figma style',
          detail: `.${name} exists in the stylesheet and is used on the site, but is not in the Figma text styles.`,
        },
      ],
    });
  }

  return rows;
}

export const parityRows = buildParity();

export const parityCounts = {
  errors: parityRows.filter((row) => row.issues.some((i) => i.severity === 'error')).length,
  warnings: parityRows.filter(
    (row) =>
      !row.issues.some((i) => i.severity === 'error') &&
      row.issues.some((i) => i.severity === 'warn'),
  ).length,
  clean: parityRows.filter((row) => row.issues.length === 0).length,
};
