import { Fragment, useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { layoutGroups, responsiveTokens, resolvedValue, usedLength } from './tokens';
import { Note, Page, Section } from './Page';

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
          <span className="t-caption ds-muted">{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

function LayoutPage() {
  const values = useLayoutReadout(WATCHED);

  return (
    <Page
      title="Layout and breakpoints"
      lede={
        <>
          The page is symmetric: a gutter on the left and a pattern rail of the
          same width on the right, with the content grid centred between them.
          Resize the canvas — the values below update live.
        </>
      }
    >
      <Section title="At the current width">
        <dl className="grid max-w-[36rem] grid-cols-[auto_1fr] gap-x-6 gap-y-2">
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

        <Note title="Declared vs. used values">
          <p>
            <code>--page-gutter</code> is declared as{' '}
            <code>clamp(1.25rem, 7.4vw, 7rem)</code>. Custom properties hold that
            expression as written — it resolves to a pixel value only when a
            property uses it. The figures above are measured from an element using
            each token, which is why they show pixels rather than the formula.
          </p>
        </Note>
      </Section>

      <Section title="Declared values">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          {layout?.tokens.map((token) => (
            <Fragment key={token.name}>
              <dt>
                <code className="t-caption font-bold">{token.name}</code>
              </dt>
              <dd className="t-caption">
                <code>{token.value}</code>
                {token.note && <span className="ms-2 ds-muted">{token.note}</span>}
              </dd>
            </Fragment>
          ))}
        </dl>
      </Section>

      <Section
        title="What changes at each breakpoint"
        intro={
          <>
            The rail doesn&rsquo;t step — it tracks <code>--page-gutter</code>,
            which is already fluid. These are the values that change:
          </>
        }
      >
        {responsiveTokens.map(({ query, tokens }) => (
          <div key={query} className="mt-6 first:mt-0">
            <code className="t-caption font-bold">@media {query}</code>
            <ul className="t-caption mt-2 flex flex-col gap-1 ds-muted">
              {tokens.map((token) => (
                <li key={token.name}>
                  <code>
                    {token.name}: {token.value}
                  </code>
                  {token.note && <span className="ms-2 ds-muted">{token.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>
    </Page>
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
