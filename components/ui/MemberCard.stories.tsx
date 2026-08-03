import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { MemberCard } from './MemberCard';

const meta = {
  component: MemberCard,
  tags: ['ai-generated'],
  // The card is built for a 304px grid track; at full canvas width the 304/405
  // portrait box would be misleadingly tall.
  decorators: [
    (Story) => (
      <div className="w-[304px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MemberCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Стефи Пейкова Кришнан',
    role: 'Председател / Съосновател',
    photo: '/figma/team/stefi-peykova-krishnan.png',
    photoHover: '/figma/team/stefi-peykova-krishnan-hover.jpg',
  },
  play: async ({ canvas }) => {
    // The portrait is named for the person; the hover frame beside it is
    // aria-hidden with an empty alt, so exactly one image should be reachable.
    await expect(canvas.getByRole('img')).toHaveAttribute('alt', 'Стефи Пейкова Кришнан');
    // Cards carry the role up to the first " / " so they stay one line — the
    // full title is the overlay's job.
    await expect(canvas.getByText('Председател')).toBeVisible();
  },
};

/** What the parent grid paints on hover or focus: inset by 16px, alternate frame up. */
export const ShowingAlternate: Story = {
  args: {
    name: 'Стефи Пейкова Кришнан',
    role: 'Председател / Съосновател',
    photo: '/figma/team/stefi-peykova-krishnan.png',
    photoHover: '/figma/team/stefi-peykova-krishnan-hover.jpg',
    showAlt: true,
  },
};

/** No alternate frame supplied — hover should inset without cross-fading. */
export const WithoutHoverFrame: Story = {
  args: {
    name: 'Зинаида Илер',
    role: 'Член на борда',
    photo: '/figma/team/zinaida-iller.png',
    showAlt: true,
  },
};

/** Portrait pending: the Figma placeholder tile rather than a broken image. */
export const AwaitingPortrait: Story = {
  args: {
    name: 'Нов член',
    role: 'Доброволец',
  },
};
