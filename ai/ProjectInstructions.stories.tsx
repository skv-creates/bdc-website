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
      lede="Loaded into every Claude session automatically. It carries the decisions a newcomer — human or model — would otherwise re-derive or get wrong: deploys, Notion syncs, the crawler policy, what must never be committed."
    >
      <Note title="Rendered from the file itself">
        This page imports AGENTS.md at build time — it always shows the current text, never a
        copy. Edit the file, rebuild, and this page follows.
      </Note>
      <div className="mt-8">
        <Markdown source={agentsMd} />
      </div>
    </Page>
  ),
};
