import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { VideoEmbed } from './VideoEmbed';

const meta = {
  component: VideoEmbed,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="max-w-[720px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VideoEmbed>;

export default meta;
type Story = StoryObj<typeof meta>;

const TALK = {
  id: 'aH1VjOnjS3E',
  title: 'PechaKucha Sofia — Стефи Пейкова Кришнан',
};

/** At rest this is entirely our own markup — nothing has been asked of YouTube yet. */
export const Idle: Story = {
  args: TALK,
  play: async ({ canvas, canvasElement }) => {
    // The whole reason the component exists: no iframe until someone asks for
    // one, so a visitor who merely scrolls past is not handed to YouTube.
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    // "Play" alone would name neither the action nor what it acts on.
    await expect(
      canvas.getByRole('button', { name: `Play: ${TALK.title}` }),
    ).toBeVisible();
  },
};

export const PlayerCreatedOnlyOnPress: Story = {
  args: TALK,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: `Play: ${TALK.title}` }));

    const frame = await canvas.findByTitle(TALK.title);
    await expect(frame).toBeInTheDocument();
    // youtube-nocookie, not youtube.com — Google's host that holds off on
    // tracking until playback starts. A copy-paste of the ordinary embed URL
    // would look identical on screen and quietly undo that.
    await expect(frame).toHaveAttribute(
      'src',
      expect.stringContaining('youtube-nocookie.com/embed/'),
    );
    await expect(canvasElement.querySelectorAll('iframe')).toHaveLength(1);
  },
};

export const LongTitle: Story = {
  args: {
    id: 'aH1VjOnjS3E',
    title:
      'Когато една държава открие дизайнерската си сила, тя открива и своето бъдеще — запис от конференцията',
  },
};
