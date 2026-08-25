import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Page, Note } from '../design-system/Page';
import { Markdown } from './markdown';

import agentsMd from '../AGENTS.md?raw';

/**
 * AGENTS.md, rendered from the real file — the instructions the harness
 * reads at the start of every session. CLAUDE.md is only the pointer
 * (`@AGENTS.md`), so this page is the whole of the project memory.
 */
const meta = {
  title: 'AI/Project instructions',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AgentsMd: Story = {
  render: () => (
    <Page
      eyebrow="AI"
      title="AGENTS.md"
      lede="The welcome document. The assistant reads it automatically at the start of every work session. It holds the knowledge a newcomer — a person or an AI — would otherwise have to rediscover: how publishing works, where the texts come from, what must stay private."
    >
      <Note title="This is the real document">
        The page reads AGENTS.md itself — it is not a copy. When someone edits the file, this
        page shows the new text after the next publish.
      </Note>
      <div className="mt-8">
        <Markdown source={agentsMd} />
      </div>
    </Page>
  ),
};
