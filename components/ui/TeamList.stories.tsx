import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import type { Member } from '@/lib/home-content';
import { TeamList } from './TeamList';

const meta = {
  component: TeamList,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[1400px] px-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TeamList>;

export default meta;
type Story = StoryObj<typeof meta>;

const members: Member[] = [
  {
    name: 'Стефи Пейкова Кришнан',
    role: 'Председател / Съосновател',
    photo: '/figma/team/stefi-peykova-krishnan.png',
    bio: 'Дизайнер и изследовател, работещ на пресечната точка на политиките и практиката.',
  },
  {
    name: 'Стефан Владимиров',
    role: 'Член на борда / Съосновател',
    photo: '/figma/team/stefan-vladimirov.png',
  },
  {
    name: 'Йоанна Тодорова',
    role: 'Консултативен съвет',
    photo: '/figma/team/yoanna-todorova.png',
  },
];

export const Default: Story = {
  args: { members },
  play: async ({ canvas }) => {
    // Every member is a row regardless of whether a bio has been published —
    // the reveal panel falls back to the placeholder rather than dropping them.
    for (const member of members) {
      await expect(canvas.getByText(member.name)).toBeVisible();
    }
  },
};

/** The sticky reveal column is desktop-only; below lg the rows become an accordion. */
export const SingleMember: Story = {
  args: { members: members.slice(0, 1) },
};

/** No portraits at all — the Figma placeholder tile stands in. */
export const AwaitingPortraits: Story = {
  args: {
    members: members.map(({ name, role, bio }) => ({ name, role, bio })),
  },
};
