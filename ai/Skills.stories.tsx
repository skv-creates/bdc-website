import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Page } from '../design-system/Page';
import { Markdown, splitFrontmatter } from './markdown';

import designSystem from '../.claude/skills/design-system/SKILL.md?raw';
import verifyInBrowser from '../.claude/skills/verify-in-browser/SKILL.md?raw';
import siteAudit from '../.claude/skills/site-audit/SKILL.md?raw';
import accessibility from '../.claude/skills/accessibility/SKILL.md?raw';
import shipToStaging from '../.claude/skills/ship-to-staging/SKILL.md?raw';

/**
 * The skills, rendered from the real files. `?raw` imports mean these
 * pages can never drift from what the harness actually loads — edit a
 * SKILL.md and the next Storybook build shows the edit.
 */
const meta = {
  title: 'AI/Skills',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function SkillPage({ raw }: { raw: string }) {
  const { meta: fm, body } = splitFrontmatter(raw);
  return (
    <Page eyebrow={`AI · Skill · /${fm.name ?? ''}`} title={fm.name ?? 'skill'} lede={fm.description ?? ''}>
      <div className="mt-4">
        <Markdown source={body} />
      </div>
    </Page>
  );
}

export const DesignSystem: Story = { render: () => <SkillPage raw={designSystem} /> };
export const VerifyInBrowser: Story = { render: () => <SkillPage raw={verifyInBrowser} /> };
export const SiteAudit: Story = { render: () => <SkillPage raw={siteAudit} /> };
export const Accessibility: Story = { render: () => <SkillPage raw={accessibility} /> };
export const ShipToStaging: Story = { render: () => <SkillPage raw={shipToStaging} /> };
