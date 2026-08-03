import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { CarbonBadge } from './CarbonBadge';

const meta = {
  component: CarbonBadge,
  tags: ['ai-generated'],
  // It lives in the footer, which is dark-on-light like the rest of the page.
  decorators: [
    (Story) => (
      <div className="max-w-[320px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CarbonBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bulgarian: Story = {
  args: {
    carbon: { greenHosting: 'Зелен хостинг', greenHostingBy: 'Green Web Foundation' },
    newWindow: '(отваря се в нов прозорец)',
  },
  play: async ({ canvas, canvasElement }) => {
    const link = canvas.getByRole('link');
    // The verdict is read from lib/carbon.generated.json at build time, and the
    // claim is only worth showing because it links to the live check — a static
    // badge nobody can verify is decoration. Refresh with `npm run sync:carbon`.
    await expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('thegreenwebfoundation.org/green-web-check'),
    );
    await expect(link).toHaveAttribute('target', '_blank');
    // The mark is decorative — the two lines beside it already name the
    // foundation, and announcing it too would say it twice. Queried through the
    // DOM rather than by role precisely because an empty alt removes it from
    // the accessibility tree: there is no `img` role to find, and that absence
    // is the thing being asserted.
    const mark = canvasElement.querySelector('img');
    await expect(mark).toHaveAttribute('alt', '');
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};

export const English: Story = {
  args: {
    carbon: { greenHosting: 'Green hosting', greenHostingBy: 'Green Web Foundation' },
    newWindow: '(opens in a new window)',
  },
};
