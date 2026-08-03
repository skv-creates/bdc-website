import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import type { Member } from '@/lib/home-content';
import { BoardGrid } from './BoardGrid';

const meta = {
  component: BoardGrid,
  tags: ['ai-generated'],
  // bdc-grid is the site's 12-column grid; it needs the page container to lay
  // out at anything other than one column.
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[1400px] px-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BoardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const members: Member[] = [
  {
    name: 'Стефи Пейкова Кришнан',
    role: 'Председател / Съосновател',
    photo: '/figma/team/stefi-peykova-krishnan.png',
    photoHover: '/figma/team/stefi-peykova-krishnan-hover.jpg',
    bio: 'Дизайнер и изследовател, работещ на пресечната точка на политиките и практиката.',
  },
  {
    name: 'Зинаида Илер',
    role: 'Член на борда',
    photo: '/figma/team/zinaida-iller.png',
    photoHover: '/figma/team/zinaida-iller-hover.jpg',
  },
  {
    name: 'Стефан Владимиров',
    role: 'Член на борда / Съосновател',
    photo: '/figma/team/stefan-vladimirov.png',
    photoHover: '/figma/team/stefan-vladimirov-hover.jpg',
  },
];

export const Default: Story = {
  args: { members, bioPlaceholder: 'Биографията предстои.' },
  play: async ({ canvas }) => {
    const cards = canvas.getAllByRole('button');
    await expect(cards).toHaveLength(members.length);
    // Each card opens the shared overlay as a modal rather than navigating, and
    // that promise is only made to assistive tech through aria-haspopup.
    for (const card of cards) {
      await expect(card).toHaveAttribute('aria-haspopup', 'dialog');
    }
  },
};

/** Focus drives the same swap-and-inset state as hover, so keyboard users see it too. */
export const FocusRevealsAlternate: Story = {
  args: { members, bioPlaceholder: 'Биографията предстои.' },
  play: async ({ canvas, userEvent }) => {
    const [first] = canvas.getAllByRole('button');
    await userEvent.tab();
    await expect(first).toHaveFocus();
  },
};

/** One member — the grid should not stretch a lone card across three tracks. */
export const SingleMember: Story = {
  args: { members: members.slice(0, 1), bioPlaceholder: 'Биографията предстои.' },
};

/** Members whose bios have not been published fall back to the per-locale placeholder. */
export const AwaitingBios: Story = {
  args: {
    members: members.map(({ name, role, photo, photoHover }) => ({
      name,
      role,
      photo,
      photoHover,
    })),
    bioPlaceholder: 'Биографията предстои.',
  },
};
