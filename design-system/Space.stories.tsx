import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { layoutGroups, resolvedValue, type Token } from './tokens';
import { Note, Page, Section } from './Page';

const meta = {
  title: 'Foundations/Space and radius',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const spacing = layoutGroups.find((group) => /spacing|radius/i.test(group.title));

function Step({ token }: { token: Token }) {
  const isRadius = token.name.includes('radius');

  return (
    <li className="border-t border-black/10 py-6">
      <div className="flex flex-wrap items-baseline gap-x-4">
        <code className="t-caption font-bold">{token.name}</code>
        <span className="t-caption ms-auto font-mono ds-muted">{token.value}</span>
      </div>
      <div className="mt-4">
        {isRadius ? (
          <span
            className="block h-16 w-40 bg-brand"
            style={{ borderRadius: `var(${token.name})` }}
            aria-hidden
          />
        ) : (
          <span
            className="block h-8 bg-brand"
            style={{ width: `var(${token.name})` }}
            aria-hidden
          />
        )}
      </div>
    </li>
  );
}

export const Scale: Story = {
  render: () => (
    <Page
      title="Space and radius"
      lede={
        <>
          Four spacing steps and one radius, drawn at true size from the tokens
          in <code>app/globals.css</code>.
        </>
      }
    >
      <Section title="Steps">
        <ul className="max-w-[52rem]">
          {spacing?.tokens.map((token) => (
            <Step key={token.name} token={token} />
          ))}
        </ul>
      </Section>

      <Note title="Section spacing isn&rsquo;t tokenised">
        <p>
          Vertical space between page sections is set per component with Tailwind
          utilities — <code>py-20</code>, <code>md:py-28</code> — rather than from
          a token here. It&rsquo;s the one part of the system that can&rsquo;t be
          adjusted from a single place.
        </p>
        <p className="mt-3">
          Adding tokens to <code>globals.css</code> would bring it in line, and
          this page would pick them up automatically.
        </p>
      </Note>
    </Page>
  ),
  play: async ({ canvas }) => {
    await expect(resolvedValue('--space-sm')).toBe('8px');
    await expect(resolvedValue('--space-2xl')).toBe('48px');
    await expect(resolvedValue('--radius-full')).toBe('9999px');
    await expect(canvas.getByText('--space-xl')).toBeVisible();
  },
};
