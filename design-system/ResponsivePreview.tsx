import { useEffect, useMemo, useRef, useState } from 'react';
import { BANDS, DESIGN_WIDTH, globalsCss, REFERENCE_WIDTHS, typeStyles } from './tokens';

/**
 * A real viewport you can drag.
 *
 * Why an iframe and not a resizable `div`: the whole scale is expressed in `vw`
 * and `@media`, and both of those resolve against a *viewport*, never against a
 * parent element. Narrowing a div changes nothing — the text would keep the
 * desktop size inside a narrow box, which is exactly the misleading picture a
 * design system must not paint. An iframe has its own viewport, so `6vw` and
 * `@media (max-width: 767px)` behave inside it precisely as they do on a phone.
 *
 * The frame is fed the project's own `globals.css`, so what you are looking at
 * is the real cascade — including the mobile override block that beats
 * `@layer base` — rather than a reconstruction of it.
 */

const SAMPLE = 'Дизайнът е стратегическа сила';

/** @font-face rules from the parent, so the frame renders in the brand face. */
function collectFontFaces(): string {
  let out = '';
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet; nothing to take from it
    }
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) out += `${rule.cssText}\n`;
    }
  }
  return out;
}

function buildDocument(fontStack: string): string {
  // `@import "tailwindcss"` cannot resolve inside the frame and would 404. The
  // specimens do not need it: every .t-* rule and every token is hand-written
  // CSS in this file. Unknown at-rules like `@theme` are skipped by the parser.
  const css = globalsCss.replace(/@import\s+["'][^"']+["'];?/g, '');

  const specimens = typeStyles
    .map(
      (style) =>
        `<section><span class="meta">.${style.name}</span><p class="${style.name}">${SAMPLE}</p></section>`,
    )
    .join('');

  return `<!doctype html>
<html lang="bg"><head>
<base href="${location.origin}/">
<style>
${collectFontFaces()}
${css}
:root { --font-about-beige: ${fontStack}; }
/* Defensive, not a fix for anything observed. The frame is taller than it is
   tall on screen, so it scrolls, and where the OS draws CLASSIC scrollbars
   rather than overlay ones the bar is taken out of the layout viewport — which
   is what both @media and vw measure against. A frame set to 390px would then
   report about 375px to the stylesheet, (min-width: 390px) would not match, and
   the 390 preset would paint the ≤389 floor of 40px instead of 44.
   Headless Chromium uses overlay scrollbars and shows 44px at 390 with or
   without this, so the problem could not be reproduced here — but macOS with
   "Always show scrollbars" set does use classic ones, and the cost of ruling it
   out is two lines. */
html { scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }
body { margin: 0; padding: 20px 16px 40px; }
section { border-top: 1px solid rgba(0,0,0,.1); padding: 14px 0; }
section:first-child { border-top: 0; }
.meta { font: 500 11px/1.4 ui-monospace, monospace; letter-spacing: .08em; text-transform: uppercase; opacity: .45; }
p { margin: 6px 0 0; }
</style></head>
<body>${specimens}</body></html>`;
}

/**
 * The five widths the scale is anchored at, and nothing else.
 *
 * This control has been through two worse versions. It started as device names
 * — iPhone SE, iPad landscape — widths that appear nowhere in the stylesheet
 * and go stale every autumn. Then it became bands plus the pixel either side of
 * every boundary, which was accurate and unusable: thirteen buttons over two
 * rows to express five decisions.
 *
 * These are the anchors: the widths where a value was actually chosen. Every
 * other width is a point on a line between two of them, and the slider reaches
 * those — including 389 and 1023, one drag away, for anyone checking a handover.
 */
const PRESETS: { width: number; label: string }[] = REFERENCE_WIDTHS.map((entry) => ({
  width: entry.width,
  label: `${entry.width}px`,
}));

export function ResponsivePreview() {
  // Opens at the width the designs were drawn at, so the first thing anyone sees
  // is the intended state rather than an arbitrary phone.
  const [width, setWidth] = useState(DESIGN_WIDTH);
  const [painted, setPainted] = useState<Record<string, number>>({});
  const [reference, setReference] = useState<Record<string, number>>({});
  const frame = useRef<HTMLIFrameElement>(null);
  const probe = useRef<HTMLParagraphElement>(null);

  // The resolved brand stack, taken from a real element in the parent — the
  // font variable is set on the preview decorator, not on :root, so it cannot
  // be read from documentElement.
  const [fontStack, setFontStack] = useState('system-ui, sans-serif');
  useEffect(() => {
    const el = probe.current;
    if (!el) return;
    const id = window.setTimeout(() => setFontStack(getComputedStyle(el).fontFamily), 0);
    return () => window.clearTimeout(id);
  }, []);

  const srcDoc = useMemo(() => buildDocument(fontStack), [fontStack]);

  // Measure inside the frame whenever it reloads or is resized. Reading from
  // the frame's own document is what makes these numbers trustworthy: they are
  // what that viewport actually painted, not a formula re-evaluated by hand.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;

    const measure = () => {
      const doc = el.contentDocument;
      if (!doc) return;
      const next: Record<string, number> = {};
      for (const style of typeStyles) {
        const node = doc.querySelector(`.${style.name}`);
        if (node) next[style.name] = parseFloat(getComputedStyle(node).fontSize);
      }
      setPainted(next);
    };

    el.addEventListener('load', measure);
    const id = window.setTimeout(measure, 80);
    return () => {
      el.removeEventListener('load', measure);
      window.clearTimeout(id);
    };
  }, [width, srcDoc]);

  // Desktop sizes, measured once at 1512 in a throwaway frame, so the "% of
  // desktop" column compares against something measured rather than assumed.
  useEffect(() => {
    const hidden = document.createElement('iframe');
    hidden.style.cssText =
      'position:absolute;visibility:hidden;pointer-events:none;width:1512px;height:400px;border:0';
    hidden.srcdoc = srcDoc;
    hidden.addEventListener('load', () => {
      const doc = hidden.contentDocument;
      if (doc) {
        const next: Record<string, number> = {};
        for (const style of typeStyles) {
          const node = doc.querySelector(`.${style.name}`);
          if (node) next[style.name] = parseFloat(getComputedStyle(node).fontSize);
        }
        setReference(next);
      }
      hidden.remove();
    });
    document.body.appendChild(hidden);
    return () => hidden.remove();
  }, [srcDoc]);

  // The context the button labels used to carry, moved to one line under the
  // slider so it stays true while dragging rather than only on an exact match.
  const current = BANDS.find(
    (entry) => width >= entry.from && (entry.to === null || width <= entry.to),
  );

  return (
    <div>
      <p ref={probe} className="t-body sr-only" aria-hidden>
        {SAMPLE}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {PRESETS.map((preset) => {
          // Exactly one can be selected, and only on an exact match.
          const selected = width === preset.width;
          return (
            <button
              key={preset.width}
              type="button"
              onClick={() => setWidth(preset.width)}
              aria-pressed={selected}
              className={`t-caption rounded-full border-2 px-4 py-1.5 transition-colors ${
                selected
                  ? 'border-brand bg-brand'
                  : 'border-border hover:bg-brand-hover hover:text-text-invert'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <label className="mt-6 flex items-center gap-4">
        <span className="t-caption uppercase tracking-[0.08em] ds-muted">Width</span>
        <input
          type="range"
          min={320}
          max={1920}
          step={1}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
          className="h-2 flex-1 accent-[var(--bdc-burgundy)]"
        />
        <output className="t-label w-28 text-right font-mono">{width}px</output>
      </label>

      <p className="t-caption mt-2 ds-muted">
        {current ? `${current.range} · ${current.cols} columns` : ''}
        {current?.to === null ? ' · every style at its full size' : ''}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div
          className="overflow-x-auto"
          role="region"
          aria-label="Type scale preview frame"
          tabIndex={0}
        >
          <iframe
            ref={frame}
            title={`Type scale at ${width} pixels`}
            srcDoc={srcDoc}
            style={{ width: `${width}px` }}
            className="h-[720px] shrink-0 border border-black/15 bg-white"
          />
        </div>

        <table className="h-fit w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-black/20">
              <th className="t-caption pb-2 uppercase tracking-[0.08em] ds-muted">
                Style
              </th>
              <th className="t-caption pb-2 text-right uppercase tracking-[0.08em] ds-muted">
                Painted
              </th>
              <th className="t-caption pb-2 text-right uppercase tracking-[0.08em] ds-muted">
                Of desktop
              </th>
            </tr>
          </thead>
          <tbody>
            {typeStyles.map((style) => {
              const now = painted[style.name];
              const full = reference[style.name];
              const share = now && full ? Math.round((now / full) * 100) : null;
              // Below 55% of the desktop size a heading stops reading as the
              // same rank — it is the thing that makes a phone layout feel like
              // a different, flatter design.
              const shrunk = share !== null && share < 55;
              return (
                <tr key={style.name} className="border-b border-black/10">
                  <td className="t-caption py-2 font-bold">.{style.name}</td>
                  <td className="t-caption py-2 text-right font-mono">
                    {now ? `${Math.round(now * 10) / 10}px` : '…'}
                  </td>
                  <td
                    className={`t-caption py-2 text-right font-mono ${
                      shrunk ? 'font-bold' : 'ds-muted'
                    }`}
                  >
                    {share === null ? '…' : `${share}%`}
                    {shrunk && ' ⚠'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
