import { Fragment, useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { layoutGroups, responsiveTokens, resolvedValue, usedLength } from './tokens';

const meta = {
  title: 'Foundations/Layout and breakpoints',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const layout = layoutGroups.find((group) => /layout/i.test(group.title));
const WATCHED = ['--grid-cols', '--grid-gap', '--page-gutter', '--rail-w', '--rail-clear'];

/**
 * Live values for the layout tokens, re-read whenever the viewport changes.
 *
 * Measured in the ResizeObserver callback rather than in the effect body: a
 * synchronous setState inside an effect causes cascading renders and the repo's
 * lint rules reject it. ResizeObserver also fires once on observe, so the first
 * paint is captured without a separate initial read.
 */
function useLayoutReadout(names: readonly string[]) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      // usedLength, not resolvedValue: --page-gutter is a clamp(), and a custom
      // property never evaluates one. Asking for its value returns the formula.
      setValues(Object.fromEntries(names.map((name) => [name, usedLength(name)])));
    });
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [names]);

  return values;
}

/** The page grid as it is right now — one block per live column. */
function ColumnGuide() {
  const { '--grid-cols': cols } = useLayoutReadout(WATCHED);

  return (
    <div className="bdc-grid mt-6 h-24">
      {Array.from({ length: Number(cols) || 0 }, (_, i) => (
        <div key={i} className="grid place-items-center bg-brand/40">
          <span className="t-caption opacity-70">{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

function LayoutPage() {
  const values = useLayoutReadout(WATCHED);

  return (
    <div className="p-10">
      <h1 className="t-h03">Layout and breakpoints</h1>
      <p className="t-body mt-4 max-w-[62ch]">
        The page is symmetric: a gutter on the left and a pattern rail of exactly
        the same width on the right, with the content grid centred between them.
        Resize the canvas — every number below is read live from the stylesheet.
      </p>

      <section className="mt-10">
        <h2 className="t-h05">Right now, at this width</h2>
        <dl className="mt-4 grid max-w-[36rem] grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          {WATCHED.map((name) => (
            <Fragment key={name}>
              <dt>
                <code className="t-caption">{name}</code>
              </dt>
              <dd>
                <code className="t-caption font-bold">{values[name] || '…'}</code>
              </dd>
            </Fragment>
          ))}
        </dl>
        <ColumnGuide />
      </section>

      <aside className="mt-10 max-w-[68ch] border-s-4 border-brand ps-6">
        <p className="t-label">Declared is not the same as used</p>
        <p className="t-body mt-2 opacity-80">
          <code>--page-gutter</code> holds <code>clamp(1.25rem, 7.4vw, 7rem)</code>,
          and asking the browser for its value returns exactly that — a custom
          property is only <em>substituted</em>, never evaluated. <code>clamp()</code>,{' '}
          <code>calc()</code> and <code>vw</code> resolve when a real property
          uses them. The numbers above are read back from a probe element that
          uses each token as a width, which is why they are pixels.
        </p>
      </aside>

      <section className="mt-12">
        <h2 className="t-h05">Declared</h2>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          {layout?.tokens.map((token) => (
            <Fragment key={token.name}>
              <dt>
                <code className="t-caption font-bold">{token.name}</code>
              </dt>
              <dd className="t-caption">
                <code>{token.value}</code>
                {token.note && <span className="ms-2 opacity-60">{token.note}</span>}
              </dd>
            </Fragment>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="t-h05">What changes, and where</h2>
        <p className="t-body mt-3 max-w-[62ch]">
          The rail does not step per breakpoint — it tracks{' '}
          <code>--page-gutter</code>, which is already fluid. Only these change:
        </p>
        {responsiveTokens.map(({ query, tokens }) => (
          <div key={query} className="mt-6">
            <code className="t-caption font-bold">@media {query}</code>
            <ul className="t-caption mt-2 flex flex-col gap-1 opacity-80">
              {tokens.map((token) => (
                <li key={token.name}>
                  <code>
                    {token.name}: {token.value}
                  </code>
                  {token.note && <span className="ms-2 opacity-70">{token.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

export const Grid: Story = {
  render: () => <LayoutPage />,
  play: async ({ canvas }) => {
    // The two real breakpoints, both expressed as max-width.
    const queries = responsiveTokens.map((entry) => entry.query);
    await expect(queries.some((q) => q.includes('1023px'))).toBe(true);
    await expect(queries.some((q) => q.includes('767px'))).toBe(true);

    // The column count is a token rather than a hardcoded 12, which is what
    // lets .bdc-grid, .bdc-stop-11 and the overlay share one definition.
    const cols = Number(resolvedValue('--grid-cols'));
    await expect([4, 8, 11, 12]).toContain(cols);

    // The distinction the readout exists to make, asserted directly: the token
    // holds a formula, and only using it yields a width. If usedLength ever
    // regresses to returning the declared value, the page silently starts
    // showing `clamp(…)` where it promises a live number.
    await expect(resolvedValue('--page-gutter')).toMatch(/^clamp\(/);
    await expect(usedLength('--page-gutter')).toMatch(/^[\d.]+px$/);
    // It appears in the live readout and again in the declared list; the prose
    // names it too, so this is deliberately a floor rather than an exact count.
    await expect(canvas.getAllByText('--page-gutter').length).toBeGreaterThanOrEqual(2);
  },
};
