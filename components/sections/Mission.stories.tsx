import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { getContent } from '@/lib/home-content';
import { Mission } from './Mission';

const meta = {
  component: Mission,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[1400px] px-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Mission>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bulgarian: Story = {
  args: { mission: getContent('bg').mission },
  play: async ({ canvas }) => {
    // Both locales carry the same shape, so the heading is the cheapest proof
    // that the section is being handed real content rather than an empty object.
    await expect(
      canvas.getByRole('heading', { name: getContent('bg').mission.heading }),
    ).toBeVisible();
  },
};

export const English: Story = {
  args: { mission: getContent('en').mission },
};
