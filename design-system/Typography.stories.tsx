import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import {
  BANDS,
  DESIGN_WIDTH,
  boundaryJump,
  deadMinimum,
  fontSizeAt,
  REFERENCE_WIDTHS,
  typeStyles,
  type TypeStyle,
} from './tokens';
import { Note, Page, Section } from './Page';
import { ResponsivePreview } from './ResponsivePreview';
import { TextSizeMatrix } from './TextSizeMatrix';

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
          <span className="t-caption ds-muted">Figma {style.figmaPx}px</span>
        )}
        <span className="t-caption ms-auto font-mono ds-muted">
          {metrics.size || '…'} / {metrics.leading || '…'} · {metrics.weight}
        </span>
      </div>

      <p ref={ref} className={`${style.name} mt-6`}>
        {SAMPLE}
      </p>

      <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] ds-muted">Size</dt>
          <dd className="t-caption font-mono">{style.fontSize}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] ds-muted">Leading</dt>
          <dd className="t-caption font-mono">{style.lineHeight}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] ds-muted">Weight</dt>
          <dd className="t-caption font-mono">{style.fontWeight}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] ds-muted">Tracking</dt>
          <dd className="t-caption font-mono">{style.letterSpacing}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="t-caption uppercase tracking-[0.08em] ds-muted">Behaviour</dt>
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
      <p ref={ref} className="t-digit leading-none">
        Аа
      </p>
      <div className="pb-2">
        <p className="t-h05">About Beige Standard</p>
        <p className="t-body mt-1 ds-muted">Regular 400 · Medium 500 · Bold 700</p>
        <p className="t-caption mt-3 font-mono ds-muted">
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
    <div
      className="overflow-x-auto"
      role="region"
      aria-label="Every style resolved to pixels at each breakpoint"
      tabIndex={0}
    >
      <table className="w-full min-w-[44rem] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-black/20">
            <th className="t-caption pb-3 pe-6 uppercase tracking-[0.08em] ds-muted">
              Style
            </th>
            {REFERENCE_WIDTHS.map(({ width, note }) => (
              <th key={width} className="pb-3 pe-6">
                <span className="t-caption block font-mono">{width}px</span>
                <span className="t-caption block uppercase tracking-[0.08em] ds-muted">
                  {note}
                </span>
              </th>
            ))}
            <th className="t-caption pb-3 uppercase tracking-[0.08em] ds-muted">
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
                {REFERENCE_WIDTHS.map(({ width }) => {
                  const px = fontSizeAt(style, width);
                  const overridden = width <= 767 && Boolean(style.mobile?.fontSize);
                  return (
                    <td key={width} className="t-caption py-3 pe-6 font-mono">
                      {px === null ? '—' : `${Math.round(px * 10) / 10}px`}
                      {overridden && (
                        <span className="t-caption ms-2 ds-muted">fixed</span>
                      )}
                    </td>
                  );
                })}
                <td className="t-caption py-3 font-mono ds-muted">
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
    <div
      className="overflow-x-auto"
      role="region"
      aria-label="Full specifications for every text style"
      tabIndex={0}
    >
      <table className="w-full min-w-[54rem] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-black/20">
            {['Style', 'Figma', 'Size', '≤767px', 'Leading', 'Weight', 'Tracking'].map(
              (head) => (
                <th
                  key={head}
                  className="t-caption pb-3 pe-6 uppercase tracking-[0.08em] ds-muted"
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
              <td className="t-caption py-3 pe-6 font-mono ds-muted">
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
              <td className="t-caption py-3 pe-6 font-mono ds-muted">
                {style.lineHeight}
              </td>
              <td className="t-caption py-3 pe-6 font-mono ds-muted">
                {style.fontWeight.replace(/var\(--weight-(\w+)\)/, '$1')}
              </td>
              <td className="t-caption py-3 font-mono ds-muted">
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
          One typeface, three weights, eleven styles matching the Figma library.
          Values are read from <code>app/globals.css</code>, and each specimen
          reports the size it&rsquo;s painting at the current width.
        </>
      }
    >
      <Hero />

      <Section title="Working with the scale">
        <ul className="t-body flex max-w-[68ch] flex-col gap-6">
          <li>
            <strong>Use a named style.</strong> The eleven <code>.t-*</code>{' '}
            classes are the full set. A one-off size like{' '}
            <code>text-[22px]</code> sits outside the system, so it won&rsquo;t
            follow the breakpoint behaviour the styles around it have.
          </li>
          <li>
            <strong>Choose by role, not by size.</strong> <code>.t-label</code>{' '}
            and <code>.t-body</code> are both 20px and differ in weight and
            tracking. They also behave differently on phones, so the right one
            matters even where they look alike.
          </li>
          <li>
            <strong>Three weights are available.</strong> Regular, Medium and
            Bold are loaded as real files. Other values are synthesised by the
            browser, which distorts the letterforms — Cyrillic especially. Adding
            a fourth weight adds roughly 70KB to first load.
          </li>
          <li>
            <strong>Proof in Cyrillic.</strong> The site is Bulgarian first, and
            Latin samples won&rsquo;t show accent clearance or the height
            relationships between в, б and д.
          </li>
        </ul>
      </Section>

      <Note title="Sizes work two ways">
        <p>
          Above 768px, nine of the eleven styles scale fluidly with the viewport
          using <code>clamp()</code>. There&rsquo;s no step at a breakpoint, so
          there isn&rsquo;t a single number to quote — the tables below resolve it
          at specific widths.
        </p>
        <p className="mt-3">
          Below 768px, a separate block sets fixed sizes for several styles.
          That&rsquo;s what phones use. To change how a heading looks on mobile,
          edit that block — adjusting the fluid values won&rsquo;t reach it. The{' '}
          <strong>≤767px</strong> column shows which styles are affected.
        </p>
      </Note>

      <Section
        title="Across breakpoints"
        intro="The same eleven styles, resolved to real pixels at the three widths the site is designed against."
      >
        <AcrossBreakpoints />
      </Section>

      <Section
        title="Reader text size"
        intro={
          <>
            Readers can set a default text size in their browser. Every size in
            this scale is in <code>rem</code>, so it follows that setting. Below
            is each style at Chrome&rsquo;s five presets — switch the viewport to
            see how width and text size interact.
          </>
        }
      >
        <TextSizeMatrix />

        <div className="t-body mt-10 max-w-[68ch] ds-muted">
          <p>
            The <strong>Responds</strong> column is the one to watch. Fluid sizes
            are set in <code>vw</code>, which measures against the viewport rather
            than the reader&rsquo;s text size — so on wide screens, increasing the
            setting can stop having an effect partway up the range.
          </p>
          <p className="mt-4">
            At Desktop, most headings read <strong>flat from Large</strong>: a
            reader who chooses Very large sees no further change. On phones every
            style responds across the full range, since the mobile sizes are plain{' '}
            <code>rem</code>.
          </p>
          <p className="mt-4">
            Worth noting when comparing with Apple&rsquo;s Dynamic Type tables:
            those values are chosen per style, so each one can have its own ramp.
            These are calculated from the declared size, so the declared size is
            the only place to adjust them.
          </p>
        </div>
      </Section>

      <Section
        title="Naming"
        intro={
          <>
            Styles are named by rank — <code>t-h01</code> to <code>t-h05</code>,
            with <code>t-quote</code> and <code>t-digit</code> for display, and{' '}
            <code>t-body-lg</code>, <code>t-body</code>, <code>t-label</code>,{' '}
            <code>t-caption</code> for text. These match the Figma library, so
            &ldquo;h02&rdquo; means the same thing in a design file and in code.
          </>
        }
      >
        <div className="t-body max-w-[68ch]">
          <p>
            <strong>The class sets the appearance; the HTML tag sets the
            document structure.</strong> They&rsquo;re chosen separately, and
            they often differ.
          </p>
          <p className="mt-4">
            On this site an <code>h1</code> carries <code>.t-h02</code> in three
            places and <code>.t-h03</code> in two more, where a page needs a
            top-level heading that isn&rsquo;t set at 80px. A <code>p</code>{' '}
            carries <code>.t-h05</code> where something should read as a heading
            without taking a place in the outline. The <code>„</code> in a pull
            quote is a <code>span</code> at <code>.t-h01</code>.
          </p>
          <p className="mt-4">
            Pick the tag for structure — one <code>h1</code> per page, levels in
            order — then pick the <code>.t-*</code> class for how it should look.
          </p>
        </div>
      </Section>

      <Section
        title="Specimens"
        intro="Shown at true size. Change the viewport in the toolbar to see the values update."
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

    // Sizes are declared as tokens on :root and overridden per band, so the
    // rule holds a var() and the phone value comes from the narrowest band.
    const h01 = typeStyles.find((s) => s.name === 't-h01');
    await expect(h01?.fontSize).toBe('var(--fs-h01)');
    await expect(h01?.mobile?.fontSize).toBe('40px');

    // body-default is 20px at every width, with no band declaring otherwise.
    const body = typeStyles.find((s) => s.name === 't-body');
    await expect(body?.fontSize).toBe('var(--fs-body)');
    await expect(body?.mobile?.fontSize).toBeUndefined();

    await expect(canvas.getByText('About Beige Standard')).toBeVisible();
  },
};

/**
 * The rules the scale is not allowed to break.
 *
 * These are not observations about the current values — they are constraints
 * the council has set, and the reason they live in a test rather than in a
 * comment is that a comment cannot stop the next edit. Lower the mobile body
 * text and this fails by name.
 */
export const Constraints: Story = {
  tags: ['ai-generated', '!dev'],
  render: () => (
    <Page
      title="Constraints"
      lede="Rules the type scale has to meet. These run as tests, so a change that breaks one will fail the build rather than ship."
    >
      <Section title="What&rsquo;s checked">
        <ul className="t-body flex max-w-[68ch] flex-col gap-4">
          <li>
            Body and label text stay at or above <strong>18px</strong> on mobile,
            at the default browser text size. Currently 19.2px.
          </li>
          <li>
            Caption stays at <strong>16px</strong> on mobile. Its leading tightens;
            its size doesn&rsquo;t change.
          </li>
          <li>
            Every style reaches its Figma size on desktop, and none exceeds it.
          </li>
          <li>
            No heading drops below half its desktop size on a phone.
          </li>
        </ul>
        <p className="t-body mt-8 max-w-[68ch] ds-muted">
          Sizes are in <code>rem</code> rather than pixels, so a reader who sets
          smaller text in their browser still gets smaller text. The floors above
          apply at the default setting.
        </p>
      </Section>
    </Page>
  ),
  play: async () => {
    const byName = (name: string) => typeStyles.find((style) => style.name === name);
    const PHONE = 390;

    // The council's floors, at the default root size. Deliberately not clamped
    // in CSS: a reader who sets smaller text in their browser should get smaller
    // text, and a px floor would override that preference rather than protect it.
    const body = byName('t-body');
    const label = byName('t-label');
    const caption = byName('t-caption');

    await expect(fontSizeAt(body!, PHONE)).toBeGreaterThanOrEqual(18);
    await expect(fontSizeAt(label!, PHONE)).toBeGreaterThanOrEqual(18);
    await expect(fontSizeAt(caption!, PHONE)).toBe(16);

    // body-default is 20px, at every width. It used to drop to 19.2px on
    // phones under a comment claiming the phone got larger text, which it
    // never did.
    for (const { width } of REFERENCE_WIDTHS) {
      await expect(fontSizeAt(body!, width)).toBe(20);
    }

    // Ordering: a style named larger must never paint smaller than the one
    // below it. .t-body-lg broke this at every width under 1250px, because its
    // floor was 18px — Figma's body-small — against .t-body's 20px.
    const bodyLg = byName('t-body-lg')!;
    for (const { width } of REFERENCE_WIDTHS) {
      const large = fontSizeAt(bodyLg, width)!;
      const normal = fontSizeAt(body!, width)!;
      await expect(large).toBeGreaterThan(normal);
    }

    // At the design width every style is at the size its Figma style is drawn
    // at. Asserted to 0.01px rather than exactly: each fluid size is the
    // solution to two fixed points, so its coefficients are irrational and the
    // residue is around a hundred-thousandth of a pixel.
    for (const style of typeStyles) {
      if (!style.figmaPx) continue;
      await expect(fontSizeAt(style, DESIGN_WIDTH)).toBeCloseTo(Number(style.figmaPx), 2);
    }

    // The council's anchors, at every width they were set for. These are the
    // whole specification of the scale — if one moves, this fails by name.
    const ANCHORS: Record<string, [number, number, number, number, number]> = {
      't-h01': [40, 44, 64, 72, 80],
      't-h02': [36, 36, 47, 52, 56],
      't-h03': [32, 32, 36, 38, 40],
      't-h04': [28, 28, 30, 31, 32],
      't-h05': [24, 24, 24, 24, 24],
      't-quote': [44, 44, 55, 60, 64],
      't-digit': [88, 88, 106, 113, 120],
      't-body-lg': [24, 24, 24, 24, 24],
      't-body': [20, 20, 20, 20, 20],
      't-label': [20, 20, 20, 20, 20],
      't-caption': [16, 16, 16, 16, 16],
    };
    const EDGES = [388, 390, 768, 1024, 1512];
    for (const [name, sizes] of Object.entries(ANCHORS)) {
      const style = byName(name)!;
      for (const [index, width] of EDGES.entries()) {
        await expect(fontSizeAt(style, width)).toBeCloseTo(sizes[index], 2);
      }
    }

    // The widest sample must still be a width where the styles have finished
    // growing. Guard for a regression that already happened: derived from
    // breakpoints alone the widest was 1024px, where .t-h01 paints 64px — so
    // the tables showed no style at its desktop size and the 80px vanished.
    const widest = REFERENCE_WIDTHS[REFERENCE_WIDTHS.length - 1].width;
    await expect(fontSizeAt(byName('t-h01')!, widest)).toBeCloseTo(80, 2);

    // h05 is 24px at every width now — 100 percent of its Figma size on a
    // phone as well as a desktop. It used to be declared at 32px against
    // Figma's 24, and its 2vw term only reached 32px by 1600, so the design
    // width painted 30.24 — short of a size that was itself wrong.
    const h05 = byName('t-h05')!;
    for (const width of [388, 390, 768, 1024, DESIGN_WIDTH]) {
      await expect(fontSizeAt(h05, width)).toBeCloseTo(24, 2);
    }

    // The hero is no longer the outlier it was: every heading now sits in the
    // same band as the rest of the scale rather than collapsing on a phone.
    for (const name of ['t-h01', 't-h02', 't-h03', 't-quote', 't-digit']) {
      const style = byName(name)!;
      const ratio = fontSizeAt(style, PHONE)! / Number(style.figmaPx);
      await expect(ratio).toBeGreaterThanOrEqual(0.5);
    }
  },
};

/** Styles that change size abruptly as the viewport crosses 768px. */
const JUMPS = typeStyles
  .map((style) => ({ style, jump: boundaryJump(style) }))
  .filter((entry): entry is { style: TypeStyle; jump: NonNullable<ReturnType<typeof boundaryJump>> } =>
    Boolean(entry.jump && entry.jump.ratio > 1.15),
  )
  .sort((a, b) => b.jump.ratio - a.jump.ratio);

/** Clamps whose minimum can never bind, because an override owns those widths. */
const DEAD = typeStyles
  .map((style) => ({ style, dead: deadMinimum(style) }))
  .filter((entry): entry is { style: TypeStyle; dead: NonNullable<ReturnType<typeof deadMinimum>> } =>
    Boolean(entry.dead),
  );

export const Interactive: Story = {
  name: 'Interactive width',
  render: () => (
    <Page
      title="Interactive width"
      lede={
        <>
          Drag the handle to resize the frame. It&rsquo;s a real viewport running
          the site&rsquo;s own <code>globals.css</code>, so sizes respond exactly
          as they do on a device — mobile overrides included.
        </>
      }
    >
      <div className="mt-14">
        <ResponsivePreview />
      </div>

      <Section
        title="Open questions"
        intro="Calculated from the stylesheet. Both come from mobile sizes handing over to fluid ones at 768px."
      >
        <div className="max-w-[68ch]">
          <h3 className="t-h05">Size changes at the 768px boundary</h3>
          <p className="t-body mt-3 ds-muted">
            At 767px a style uses its fixed mobile size; at 768px it switches to
            the fluid one. Where the two don&rsquo;t meet, the size changes
            abruptly across a single pixel of width:
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {JUMPS.map(({ style, jump }) => (
              <li key={style.name} className="t-caption font-mono">
                <strong>.{style.name}</strong> {Math.round(jump.from * 10) / 10}px →{' '}
                {Math.round(jump.to * 10) / 10}px
                <span className="ds-muted">
                  {' '}
                  ({Math.round((jump.ratio - 1) * 100)}% larger, in one pixel)
                </span>
              </li>
            ))}
          </ul>
          <p className="t-body mt-4 ds-muted">
            It shows when a tablet is rotated or a window dragged across the
            boundary, and not otherwise. Closing it means raising the mobile size
            until it meets the fluid one — the headings were adjusted this way;{' '}
            <code>.t-digit</code> is still open, since matching it would mean a
            92px number on a phone.
          </p>

          {DEAD.length > 0 && (
            <>
              <h3 className="t-h05 mt-12">Some minimum sizes never apply</h3>
              <p className="t-body mt-3 ds-muted">
                A <code>clamp()</code> minimum only takes effect below a certain
                width. Where the mobile block already covers those widths, the
                minimum never comes into play:
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {DEAD.map(({ style, dead }) => (
                  <li key={style.name} className="t-caption font-mono">
                    <strong>.{style.name}</strong> floor {Math.round(dead.min)}px
                    <span className="ds-muted">
                      {' '}
                      would only bind below {Math.round(dead.bindsBelow)}px, where
                      the {style.mobile?.fontSize} override already wins
                    </span>
                  </li>
                ))}
              </ul>
              <p className="t-body mt-4 ds-muted">
                Nothing renders incorrectly — but to change a heading on phones,
                edit the mobile block. Raising the minimum here has no effect.
              </p>
            </>
          )}
        </div>
      </Section>
    </Page>
  ),
  play: async ({ canvas, userEvent }) => {
    // Opens at the width the designs were drawn at, so the first thing a
    // reviewer sees is the intended state rather than an arbitrary phone.
    const slider = canvas.getByRole('slider');
    await expect(slider).toHaveValue(String(DESIGN_WIDTH));

    // The preset buttons are the interaction: pressing one moves the viewport.
    // Bands come from the media queries, so this asserts against the derived
    // list rather than a label someone typed.
    const widestBand = BANDS[BANDS.length - 1];
    const preset = canvas.getByRole('button', {
      name: `${widestBand.range} · ${widestBand.cols} col`,
    });
    await userEvent.click(preset);
    await expect(slider).toHaveValue(String(widestBand.sample));
    await expect(preset).toHaveAttribute('aria-pressed', 'true');

    // Every band is offered as a range rather than as a single pixel.
    for (const band of BANDS) {
      await expect(
        canvas.getByRole('button', { name: `${band.range} · ${band.cols} col` }),
      ).toBeVisible();
    }

    // The frame is a real viewport, and its width follows the control.
    const frame = canvas.getByTitle(`Type scale at ${widestBand.sample} pixels`);
    await expect(frame).toBeVisible();

    // No style changes size across the 768px boundary any more. The 768–1023
    // band starts at each style's phone size and ramps to its 1024 value, so
    // the three bands join continuously — where the hero once changed by 44%
    // across a single pixel, and .t-digit by 44% after that.
    await expect(JUMPS).toEqual([]);
    for (const style of typeStyles) {
      const jump = boundaryJump(style);
      if (!jump) continue;
      await expect(jump.ratio).toBeCloseTo(1, 2);
    }
  },
};
