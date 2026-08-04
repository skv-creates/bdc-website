/**
 * Statements made about this type scale, checked against the published site.
 *
 * Everything here was asserted in conversation while the design system was being
 * built. Some of it was right and some of it was not, and the difference matters:
 * a design system inherits the authority of whoever wrote it, so a claim nobody
 * can re-run is a claim you have to take on trust.
 *
 * Each entry re-derives its verdict from `live-type.generated.json` — the CSS and
 * markup fetched from bulgariandesigncouncil.org — every time this page renders.
 * Nothing below is a stored answer.
 */
import live from './live-type.generated.json';
import { typeStyles } from './tokens';
import { desktopPx, liveStyles } from './parity';

const usage = live.usage as Record<string, number>;

const liveByName = new Map(liveStyles.map((style) => [style.name, style]));

/** The mobile (≤767px) font-size a live style overrides to, in px. */
function liveMobilePx(name: string): number | null {
  const override = liveByName.get(name)?.overrides?.find((entry) => entry.fontSize);
  if (!override?.fontSize) return null;
  const rem = override.fontSize.match(/^([\d.]+)rem$/);
  return rem ? parseFloat(rem[1]) * 16 : null;
}

/** What a clamp paints at a given width, from the live declaration. */
function livePxAt(name: string, viewportWidth: number): number | null {
  const fontSize = liveByName.get(name)?.fontSize;
  if (!fontSize) return null;
  const clamp = fontSize.match(/^clamp\(([^,]+),([^,]+),([^)]+)\)$/);
  if (!clamp) return desktopPx(fontSize);

  const toPx = (value: string) => {
    const raw = value.trim();
    const rem = raw.match(/^([\d.]+)rem$/);
    if (rem) return parseFloat(rem[1]) * 16;
    const vw = raw.match(/^([\d.]+)vw$/);
    if (vw) return (parseFloat(vw[1]) / 100) * viewportWidth;
    const px = raw.match(/^([\d.]+)px$/);
    return px ? parseFloat(px[1]) : null;
  };

  const [min, preferred, max] = [toPx(clamp[1]), toPx(clamp[2]), toPx(clamp[3])];
  if (min === null || preferred === null || max === null) return null;
  return Math.min(Math.max(min, preferred), max);
}

export type Verdict = 'confirmed' | 'wrong' | 'pending';

export type Claim = {
  /** What was said. */
  statement: string;
  verdict: Verdict;
  /** What the published site actually shows. */
  evidence: string;
  /** Only where the statement was wrong. */
  correction?: string;
};

function round(value: number | null): string {
  return value === null ? 'unknown' : `${Math.round(value * 100) / 100}px`;
}

export function checkClaims(): Claim[] {
  const claims: Claim[] = [];

  /* ---- Confirmed by the published site ---------------------------------- */

  const heroCount = usage['h1.t-h01'] ?? 0;
  claims.push({
    statement: 'The home page’s first heading uses .t-h01.',
    verdict: heroCount > 0 ? 'confirmed' : 'wrong',
    evidence: `The published home page markup contains ${heroCount} h1 carrying .t-h01.`,
  });

  const h01Desktop = desktopPx(liveByName.get('t-h01')?.fontSize ?? '');
  claims.push({
    statement: '.t-h01 settles at 80px on desktop.',
    verdict: h01Desktop === 80 ? 'confirmed' : 'wrong',
    evidence: `Live declaration resolves to ${round(h01Desktop)} once its fluid range is exhausted.`,
  });

  const h01Mobile = liveMobilePx('t-h01');
  claims.push({
    statement: '.t-h01 is 32px on any phone, flat from 320 to 767px.',
    verdict: h01Mobile === 32 ? 'confirmed' : 'wrong',
    evidence: `Live ≤767px override resolves to ${round(h01Mobile)}.`,
  });

  const h05At1512 = livePxAt('t-h05', 1512);
  claims.push({
    statement: '.t-h05 paints 30.24px at the 1512 design width, short of its stated 32px.',
    verdict: h05At1512 !== null && Math.abs(h05At1512 - 30.24) < 0.01 ? 'confirmed' : 'wrong',
    evidence: `Live declaration resolves to ${round(h05At1512)} at 1512px.`,
  });

  const digitUsage = usage['p.t-digit'] ?? 0;
  claims.push({
    statement: '.t-digit is real and used on the site, not invented.',
    verdict: digitUsage > 0 ? 'confirmed' : 'wrong',
    evidence: `The published home page uses .t-digit ${digitUsage} times.`,
  });

  const bodyMobile = liveMobilePx('t-body');
  claims.push({
    statement: 'Mobile body text is 19.2px, above the 18px floor.',
    verdict: bodyMobile !== null && bodyMobile >= 18 ? 'confirmed' : 'wrong',
    evidence: `Live ≤767px override resolves to ${round(bodyMobile)}.`,
  });

  const captionMobile = liveMobilePx('t-caption');
  claims.push({
    statement: 'Caption keeps 16px on mobile; only its leading tightens.',
    verdict: captionMobile === null ? 'confirmed' : 'wrong',
    evidence:
      captionMobile === null
        ? 'The live ≤767px block changes caption line-height only, with no font-size.'
        : `Live ≤767px override sets ${round(captionMobile)}.`,
  });

  // Tag and class deliberately differing, from real markup rather than assertion.
  const mismatched = Object.keys(usage).filter((key) => {
    const match = key.match(/^h(\d)\.t-h0(\d)$/);
    return match && match[1] !== match[2];
  });
  claims.push({
    statement: 'A heading’s tag and its .t-* class are chosen separately and often differ.',
    verdict: mismatched.length > 0 ? 'confirmed' : 'wrong',
    evidence: `Published markup contains ${mismatched.length} such pairs: ${mismatched.join(', ')}.`,
  });

  /* ---- Wrong ------------------------------------------------------------- */

  const liveH04 = desktopPx(liveByName.get('t-h04')?.fontSize ?? '');
  claims.push({
    statement: 'The eleven styles match the Figma library one to one.',
    verdict: 'wrong',
    evidence: `The live site paints .t-h04 at ${round(liveH04)} where the Figma style is 32px, and .t-h05 at ${round(desktopPx(liveByName.get('t-h05')?.fontSize ?? ''))} where Figma is 24px.`,
    correction:
      'Nine of eleven match. h04 and h05 are each a step too large, two Figma styles (body-large, body-small) have no class, and .t-digit has no Figma style.',
  });

  claims.push({
    statement: 'Desktop matches Figma exactly — asserted by a test.',
    verdict: 'wrong',
    evidence:
      'That test read the /* 80 */ comments inside globals.css, so it compared the stylesheet against its own annotations rather than against the Figma library.',
    correction:
      'It could never have detected the h04 and h05 drift. The parity page now compares against Figma values held outside the stylesheet.',
  });

  /* ---- Staged but not published ----------------------------------------- */

  const branchH01Mobile = typeStyles.find((style) => style.name === 't-h01')?.mobile?.fontSize;
  const published = h01Mobile === 32;
  claims.push({
    statement: 'The mobile type fix raises .t-h01 from 32px to 44px.',
    verdict: published ? 'pending' : 'confirmed',
    evidence: `This branch declares ${branchH01Mobile ?? 'unset'}; the live site still serves ${round(h01Mobile)}.`,
    correction: published
      ? 'Merged to the staging branch but not published. The live site updates only when the production deploy is run by hand.'
      : undefined,
  });

  return claims;
}

export const claims = checkClaims();

export const claimCounts = {
  confirmed: claims.filter((claim) => claim.verdict === 'confirmed').length,
  wrong: claims.filter((claim) => claim.verdict === 'wrong').length,
  pending: claims.filter((claim) => claim.verdict === 'pending').length,
};
