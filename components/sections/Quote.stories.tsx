import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { getContent } from '@/lib/home-content';
import { Quote } from './Quote';

const meta = {
  component: Quote,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[1400px] px-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Quote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bulgarian: Story = {
  args: { quote: getContent('bg').quote },
  play: async ({ canvas }) => {
    // The „ mark is aria-hidden decoration; the quotation itself is the only
    // thing that should reach a screen reader, and it is a blockquote.
    await expect(canvas.getByText(getContent('bg').quote.text)).toBeVisible();
    await expect(canvas.getByText(getContent('bg').quote.author)).toBeVisible();
  },
};

export const English: Story = {
  args: { quote: getContent('en').quote },
};

/** A longer attribution, to check the author line does not collide with the mark. */
export const LongAttribution: Story = {
  args: {
    quote: {
      text: getContent('en').quote.text,
      author: 'Stefi Peykova Krishnan, Chair and co-founder, Bulgarian Design Council',
    },
  },
};
