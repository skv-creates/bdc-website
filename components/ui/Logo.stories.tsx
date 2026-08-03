import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Logo } from './Logo';

const meta = {
  component: Logo,
  tags: ['ai-generated'],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bulgarian: Story = {
  args: { locale: 'bg' },
  play: async ({ canvas }) => {
    // The wordmark spells the council's name out, so alt is that name in the
    // language the mark is set in — not "logo". That contract is the reason
    // the component takes a locale at all, and nothing else would catch it
    // silently regressing to a description.
    await expect(canvas.getByRole('img')).toHaveAttribute('alt', 'Български Дизайн Съвет');
  },
};

export const English: Story = {
  args: { locale: 'en' },
};

export const WhiteOnDark: Story = {
  args: { locale: 'bg', variant: 'white' },
  decorators: [
    (Story) => (
      <div className="bg-dark p-8">
        <Story />
      </div>
    ),
  ],
};

export const WhiteEnglishOnDark: Story = {
  args: { locale: 'en', variant: 'white' },
  decorators: [
    (Story) => (
      <div className="bg-dark p-8">
        <Story />
      </div>
    ),
  ],
};

/** Taller than the h-8 default, to check the four files scale on their own ratios. */
export const Large: Story = {
  args: { locale: 'bg', className: 'h-16 w-auto' },
};
