import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ExternalLink } from './ExternalLink';

const meta = {
  component: ExternalLink,
  tags: ['ai-generated'],
  // It is an inline reference — it only reads correctly inside a sentence, and
  // the panel it opens is positioned above the text, so it needs headroom.
  decorators: [
    (Story) => (
      <p className="t-body max-w-[46ch] pt-32">
        Съветът е член на <Story /> и работи с организации в цяла Европа.
      </p>
    ),
  ],
} satisfies Meta<typeof ExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const labels = {
  newTabLabel: '(отваря се в нов прозорец)',
  openLabel: 'Отвори',
};

export const Default: Story = {
  args: { href: 'https://www.theicod.org/', children: 'ico-D', ...labels },
};

/**
 * The point of the component: clicking the reference does not leave the site.
 * It opens a panel, and only the control inside that panel navigates — so a
 * stray click mid-sentence costs you nothing.
 */
export const OpensPanelRatherThanNavigating: Story = {
  args: { href: 'https://www.theicod.org/', children: 'ico-D', ...labels },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /ico-D/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Before the click there is no way out of the page at all.
    await expect(canvas.queryByRole('link')).toBeNull();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const out = await canvas.findByRole('link', { name: /Отвори/i });
    await expect(out).toHaveAttribute('href', 'https://www.theicod.org/');
    await expect(out).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

/** Escape closes it — otherwise the panel is a thing you can open and not get rid of. */
export const ClosesOnEscape: Story = {
  args: { href: 'https://www.studiokomplekt.com/', children: 'Studio Komplekt', ...labels },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /Studio Komplekt/i });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

/** An unparseable href shows the raw string rather than nothing. */
export const UnparseableHref: Story = {
  args: { href: 'not-a-url', children: 'счупена препратка', ...labels },
};
