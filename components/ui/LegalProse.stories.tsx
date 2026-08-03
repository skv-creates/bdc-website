import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { LegalProse } from './LegalProse';

const meta = {
  component: LegalProse,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="max-w-[64ch] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LegalProse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EveryBlockType: Story = {
  args: {
    blocks: [
      { h: 'Какви данни събираме' },
      { p: 'Сайтът не използва бисквитки за проследяване и не профилира посетителите.' },
      {
        ul: [
          'Технически данни от сървърните логове',
          'Данни, които сами ни изпращате през формата за контакт',
        ],
      },
      { h: 'Вашите права' },
      {
        ol: [
          'Право на достъп до данните',
          'Право на коригиране',
          'Право на изтриване',
        ],
      },
      { a: { text: 'Комисия за защита на личните данни', href: 'https://www.cpdp.bg/' } },
    ],
  },
  play: async ({ canvas }) => {
    // {a} is the block that carries a real destination — the Notion answers
    // point at the statute and the membership forms, and without it the sync
    // would have to drop those URLs.
    await expect(canvas.getByRole('link', { name: /Комисия за защита/i })).toHaveAttribute(
      'href',
      'https://www.cpdp.bg/',
    );
  },
};

/** The common case: a heading and a couple of paragraphs. */
export const Prose: Story = {
  args: {
    blocks: [
      { h: 'Срок на съхранение' },
      { p: 'Съхраняваме данните само докато са необходими за целта, за която са събрани.' },
      { p: 'След това ги изтриваме или анонимизираме.' },
    ],
  },
};

/** First block has no top margin, so a section never opens with a gap. */
export const SingleParagraph: Story = {
  args: {
    blocks: [{ p: 'Настоящата политика може да бъде актуализирана.' }],
  },
};
