import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { fontSizeAt, REFERENCE_WIDTHS, typeStyles, type TypeStyle } from './tokens';
import { Note, Page, Section } from './Page';

const meta = {
  title: 'Foundations/Typography',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Bulgarian, because the site is Bulgarian first and Cyrillic is what to judge. */
const SAMPLE = 'Дизайнът е стратегическа сила';

/**
 * What a style is actually painting, right now, at this width.
 *
 * This is the one thing a static specification table cannot do, and the reason
 * it matters here: nine of the eleven styles are `clamp()`, so there is no
 * single size to print. Resize the canvas — or step the viewport control — and
 * these numbers move.
 *
 * Measured in the ResizeObserver callback rather than the effect body: a
 * synchronous setState inside an effect causes cascading renders and the repo's
 * lint rules reject it. ResizeObserver also fires once on observe, so the first
 * paint is captured without a separate initial read.
 */
function usePaintedMetrics<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [metrics, setMetrics] = useState({ size: '', leading: '', weight: '' });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const cs = getComputedStyle(el);
      setMetrics({
        size: cs.fontSize,
        leading: cs.lineHeight,
        weight: cs.fontWeight,
      });
    });
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  return { ref, metrics };
}

function Specimen({ style }: { style: TypeStyle }) {
  const { ref, metrics } = usePaintedMetrics<HTMLParagraphElement>();
  const fluid = style.fontSize.startsWith('clamp(');

  return (
    <section className="border-t border-black/10 py-12">
      <div className="flex flex-wrap items-baseline gap-x-4">
        <code className="t-caption font-bold">.{style.name}</code>
        {style.figmaPx && (
          <span className="t-caption opacity-40">Figma {style.figmaPx}px</span>
        )}
        <span className="t-caption ms-auto font-mono opacity-60">
          {metrics.size || '…'} / {metrics.leading || '…'} · {metrics.weight}
        </span>
      </div>

      <p ref={ref} className={`${style.name} mt-6`}>
        {SAMPLE}
      </p>

      <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] opacity-40">Size</dt>
          <dd className="t-caption font-mono">{style.fontSize}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] opacity-40">Leading</dt>
          <dd className="t-caption font-mono">{style.lineHeight}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] opacity-40">Weight</dt>
          <dd className="t-caption font-mono">{style.fontWeight}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] opacity-40">Tracking</dt>
          <dd className="t-caption font-mono">{style.letterSpacing}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] opacity-40">Behaviour</dt>
          <dd className="t-caption font-mono">
            {fluid ? 'fluid' : 'fixed'}
            {style.mobile ? ' · overridden ≤767' : ''}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function Hero() {
  const { ref, metrics } = usePaintedMetrics<HTMLParagraphElement>();
  return (
    <div className="mt-14 flex flex-wrap items-end gap-x-12 gap-y-6 border-y border-black/10 py-12">
      <p ref={ref} className="t-digit leading-none text-brand">
        Аа
      </p>
      <div className="pb-2">
        <p className="t-h05">About Beige Standard</p>
        <p className="t-body mt-1 opacity-70">Regular 400 · Medium 500 · Bold 700</p>
        <p className="t-caption mt-3 font-mono opacity-50">
          .t-digit · painting {metrics.size || '…'}
        </p>
      </div>
    </div>
  );
}

/**
 * The size each style paints at the three widths the site is designed against.
 *
 * The single most-asked question about a fluid scale — "so how big is it on a
 * phone?" — and the one a `clamp()` refuses to answer on its own. Computed from
 * the CSS rather than measured or remembered, so it cannot drift.
 */
function AcrossBreakpoints() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-black/20">
            <th className="t-caption pb-3 pe-6 uppercase tracking-[0.08em] opacity-50">
              Style
            </th>
            {REFERENCE_WIDTHS.map(({ label, width, note }) => (
              <th key={label} className="pb-3 pe-6">
                <span className="t-caption block uppercase tracking-[0.08em] opacity-50">
                  {label}
                </span>
                <span className="t-caption block font-mono opacity-40">
                  {width}px · {note}
                </span>
              </th>
            ))}
            <th className="t-caption pb-3 uppercase tracking-[0.08em] opacity-50">
              Behaviour
            </th>
          </tr>
        </thead>
        <tbody>
          {typeStyles.map((style) => {
            const fluid = style.fontSize.startsWith('clamp(');
            return (
              <tr key={style.name} className="border-b border-black/10">
                <td className="t-caption py-3 pe-6 font-bold">.{style.name}</td>
                {REFERENCE_WIDTHS.map(({ label, width }) => {
                  const px = fontSizeAt(style, width);
                  const overridden = width <= 767 && Boolean(style.mobile?.fontSize);
                  return (
                    <td key={label} className="t-caption py-3 pe-6 font-mono">
                      {px === null ? '—' : `${Math.round(px * 10) / 10}px`}
                      {overridden && (
                        <span className="ms-2 t-caption opacity-50">fixed</span>
                      )}
                    </td>
                  );
                })}
                <td className="t-caption py-3 font-mono opacity-60">
                  {fluid ? 'fluid' : 'fixed'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Every style in one table — the "Specifications" slab at the end of an HIG page. */
function Specifications() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[54rem] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-black/20">
            {['Style', 'Figma', 'Size', '≤767px', 'Leading', 'Weight', 'Tracking'].map(
              (head) => (
                <th
                  key={head}
                  className="t-caption pb-3 pe-6 uppercase tracking-[0.08em] opacity-50"
                >
                  {head}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {typeStyles.map((style) => (
            <tr key={style.name} className="border-b border-black/10">
              <td className="t-caption py-3 pe-6 font-bold">.{style.name}</td>
              <td className="t-caption py-3 pe-6 font-mono opacity-70">
                {style.figmaPx ? `${style.figmaPx}px` : '—'}
              </td>
              <td className="t-caption py-3 pe-6 font-mono">{style.fontSize}</td>
              <td className="t-caption py-3 pe-6 font-mono">
                {style.mobile
                  ? [style.mobile.fontSize, style.mobile.lineHeight]
                      .filter(Boolean)
                      .join(' / ')
                  : '—'}
              </td>
              <td className="t-caption py-3 pe-6 font-mono opacity-70">
                {style.lineHeight}
              </td>
              <td className="t-caption py-3 pe-6 font-mono opacity-70">
                {style.fontWeight.replace(/var\(--weight-(\w+)\)/, '$1')}
              </td>
              <td className="t-caption py-3 font-mono opacity-70">
                {style.letterSpacing.replace(/var\(--ls-([\w-]+)\)/, '$1')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Scale: Story = {
  render: () => (
    <Page
      title="Typography"
      lede={
        <>
          One face, three weights, eleven named styles that mirror Figma one to
          one. Every value on this page is parsed from{' '}
          <code>app/globals.css</code>, and every specimen reports the size it is
          actually painting at this width.
        </>
      }
    >
      <Hero />

      <Section
        title="Best practices"
        intro="Four things this scale asks of you, and why."
      >
        <ul className="t-body flex max-w-[68ch] flex-col gap-6">
          <li>
            <strong>Use a named style, never a raw size.</strong> The eleven{' '}
            <code>.t-*</code> classes are the whole vocabulary. A one-off{' '}
            <code>text-[22px]</code> is a size nobody can change from here, and it
            will not respond at 767px like everything around it.
          </li>
          <li>
            <strong>Pick by role, not by how big it looks.</strong>{' '}
            <code>.t-label</code> and <code>.t-body</code> are the same size and
            differ in weight and tracking; choosing the wrong one reads as
            correct on desktop and wrong on a phone, where only one of them grows.
          </li>
          <li>
            <strong>Do not add a fourth weight.</strong> Regular, Medium and Bold
            are loaded. A fourth costs every visitor roughly 70KB on first load —
            an Extra Bold was shipping for months with nothing referencing it.
          </li>
          <li>
            <strong>Judge it in Cyrillic.</strong> The site is Bulgarian first.
            Latin proofs hide the things that go wrong here — accents crowding the
            line above, and the height difference between в, б and д.
          </li>
        </ul>
      </Section>

      <Note title="The scale is fluid, and then it is not">
        <p>
          Above 768px, nine of the eleven styles are <code>clamp()</code> — the
          size is a continuous function of viewport width, with no step at any
          breakpoint and no single number to quote.
        </p>
        <p className="mt-3">
          Below 768px a second block replaces five of them with fixed sizes. That
          block sits <em>outside</em> <code>@layer base</code>, so it beats the
          layered rule rather than merely following it: a phone gets the fixed
          size and never the clamp. The <strong>≤767px</strong> column below is
          where that happens.
        </p>
      </Note>

      <Section
        title="Across breakpoints"
        intro="The same eleven styles, resolved to real pixels at the three widths the site is designed against."
      >
        <AcrossBreakpoints />
      </Section>

      <Section
        title="Naming, and why it is not h1/h2/h3"
        intro={
          <>
            The scale is named by <em>rank</em> — <code>t-h01</code> through{' '}
            <code>t-h05</code>, plus <code>t-quote</code> and{' '}
            <code>t-digit</code> for display, and{' '}
            <code>t-body-lg</code>/<code>t-body</code>/<code>t-label</code>/
            <code>t-caption</code> for text. Not Material&rsquo;s role naming
            (Display / Headline / Title / Body / Label), because these names
            mirror the named styles in Figma one to one, and a designer and a
            developer saying &ldquo;h02&rdquo; should mean the same thing.
          </>
        }
      >
        <div className="t-body max-w-[68ch]">
          <p>
            <strong>
              The class is the appearance. The tag is the document outline. They
              are chosen separately, and in this codebase they frequently differ.
            </strong>
          </p>
          <p className="mt-4">
            An <code>h1</code> carries <code>.t-h02</code> in three places and{' '}
            <code>.t-h03</code> in two more, because those pages need a first-level
            heading that is not set at 80px. A <code>p</code> carries{' '}
            <code>.t-h05</code> where something should look like a heading without
            claiming a rank in the outline. The <code>„</code> mark in a pull quote
            is a <code>span</code> at <code>.t-h01</code>, since it is a glyph, not
            a heading at all.
          </p>
          <p className="mt-4">
            So: choose the tag for the structure a screen reader will announce —
            one <code>h1</code> per page, no skipped levels — and then choose the{' '}
            <code>.t-*</code> class for how it should look. Never reach for a
            bigger heading tag to get bigger text.
          </p>
        </div>
      </Section>

      <Section
        title="Specimens"
        intro="At real size. Step the viewport control in the toolbar and watch the painted values change."
      >
        <div>
          {typeStyles.map((style) => (
            <Specimen key={style.name} style={style} />
          ))}
        </div>
      </Section>

      <Section title="Specifications">
        <Specifications />
      </Section>
    </Page>
  ),
  play: async ({ canvas }) => {
    // The eleven Figma styles and no phantom twelfth: the mobile override block
    // repeats the same selectors, and parsing those as separate styles is
    // exactly the bug this asserts against.
    await expect(typeStyles).toHaveLength(11);
    await expect(new Set(typeStyles.map((s) => s.name)).size).toBe(11);

    // Overrides merged onto their base style rather than dropped or duplicated.
    const h01 = typeStyles.find((s) => s.name === 't-h01');
    await expect(h01?.fontSize).toMatch(/^clamp\(/);
    await expect(h01?.mobile?.fontSize).toBe('2rem');

    // t-body is one of the two that is not fluid — fixed rem at both ends.
    const body = typeStyles.find((s) => s.name === 't-body');
    await expect(body?.fontSize).toBe('1.25rem');
    await expect(body?.mobile?.fontSize).toBe('1.2rem');

    await expect(canvas.getByText('About Beige Standard')).toBeVisible();
  },
};
