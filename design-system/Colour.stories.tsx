import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { colourGroups, resolvedValue, type Token } from './tokens';
import { contrastRatio, formatRatio, judge } from './contrast';
import { Note, Page, Section } from './Page';

/**
 * Titles are explicit on the Foundations pages, unlike the component stories,
 * which take theirs from their path. These are not components; what matters is
 * that they sort above the things built out of them.
 */
const meta = {
  title: 'Foundations/Colour',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const PAGE = '#ffffff';
const INK = '#151515';

function ContrastLine({ swatch }: { swatch: string }) {
  const onPage = contrastRatio(swatch, PAGE);
  const onInk = contrastRatio(swatch, INK);
  if (!onPage || !onInk) return null;

  const best = onPage >= onInk ? onPage : onInk;
  const against = onPage >= onInk ? 'white' : 'dark';
  const verdict = judge(best);

  return (
    <p className="t-caption mt-1 opacity-60">
      {formatRatio(best)} on {against}
      {' · '}
      {verdict.normalText
        ? 'text ✓'
        : verdict.largeText
          ? 'large text only'
          : 'non-text only'}
    </p>
  );
}

/**
 * A colour, shown the way both Apple and Material show one: a field big enough
 * to actually judge, with the value underneath rather than inside it.
 */
function Swatch({ token }: { token: Token }) {
  const resolved = resolvedValue(token.name);
  const pointsAt = token.value.startsWith('var(') ? token.value : null;

  return (
    <li className="flex flex-col">
      <span
        className="block h-32 w-full rounded-lg border border-black/[0.08]"
        style={{ background: `var(${token.name})` }}
        aria-hidden
      />
      <code className="t-caption mt-3 font-bold">{token.name}</code>
      <span className="t-caption font-mono uppercase opacity-70">
        {resolved || token.value}
      </span>
      {pointsAt && (
        <span className="t-caption font-mono opacity-40">{pointsAt}</span>
      )}
      {token.note && <span className="t-caption mt-1 opacity-60">{token.note}</span>}
      <ContrastLine swatch={resolved || token.value} />
    </li>
  );
}

export const Palette: Story = {
  render: () => (
    <Page
      title="Colour"
      lede={
        <>
          Nine brand primitives, and a small set of semantic names that point at
          them. Nothing on this page is written down here — it is parsed from{' '}
          <code>app/globals.css</code>, so a swatch cannot disagree with the
          token it claims to show.
        </>
      }
    >
      {colourGroups.map((group) => (
        <Section key={group.title} title={group.title}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {group.tokens.map((token) => (
              <Swatch key={token.name} token={token} />
            ))}
          </ul>
        </Section>
      ))}

      <Note title="Contrast is stated, not assumed">
        <p>
          Each swatch carries its best ratio against the page white or the ink,
          and what that ratio permits: <strong>text</strong> at 4.5:1,{' '}
          <strong>large text</strong> and non-text at 3:1. Rose is a background
          colour — it fails as text on white and always will. That is not a
          defect, it is what the semantic split is for.
        </p>
        <p className="mt-3">
          Burgundy is the focus ring for the same reason, at better than 10:1 on
          white: it reads against every brand ground on the site.
        </p>
      </Note>
    </Page>
  ),
  play: async ({ canvas }) => {
    // Proves the page reads the real stylesheet rather than a copy. If someone
    // edits --bdc-rose, this fails and says so — which is the point.
    await expect(resolvedValue('--bdc-rose')).toBe('#f3a3ca');
    await expect(canvas.getByText('--bdc-rose')).toBeVisible();
    // Semantics must resolve through to a real colour, not sit unresolved.
    await expect(resolvedValue('--color-brand')).toMatch(/^#|^rgb/);

    // The contrast maths, checked against a value globals.css already states in
    // prose: burgundy is "10.9:1 on the page white".
    const burgundy = contrastRatio('#770f42', '#ffffff');
    await expect(burgundy).toBeGreaterThan(10.5);
    await expect(burgundy).toBeLessThan(11.5);
  },
};
