import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Page, Note, Section } from '../design-system/Page';

/**
 * The plain-language answer to "what is all this AI stuff called, and did
 * we build our own?" — kept here so it outlives the chat it was first
 * answered in. The neighbouring pages render the actual files.
 */
const meta = {
  title: 'AI/Start here',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const INVENTORY: { file: string; kind: string; role: string }[] = [
  {
    file: 'AGENTS.md (via CLAUDE.md)',
    kind: 'Project instructions',
    role: 'Loaded into every session automatically — the repo’s institutional memory: deploys, Notion syncs, crawler policy, secrets discipline.',
  },
  {
    file: '.claude/skills/design-system/',
    kind: 'Skill · /design-system',
    role: 'The layout, type, button and copy contract — the corrections that used to be re-taught every session.',
  },
  {
    file: '.claude/skills/verify-in-browser/',
    kind: 'Skill · /verify-in-browser',
    role: 'Real-browser verification recipes: puppeteer, mobile profiles, honeypot form tests, global latency probes.',
  },
  {
    file: '.claude/skills/site-audit/',
    kind: 'Skill · /site-audit',
    role: 'The Ad Grants / SEO / speed runbook with known-good numbers for every check.',
  },
  {
    file: '.claude/skills/accessibility/',
    kind: 'Skill · /accessibility',
    role: 'WCAG AA baseline and the proven dialog/combobox/inert patterns, plus the responsive matrix.',
  },
  {
    file: '.claude/skills/ship-to-staging/',
    kind: 'Skill · /ship-to-staging',
    role: 'Staging-first release flow: what "deploy" means, named-path commits, leak recovery, post-deploy verification.',
  },
  {
    file: 'scripts/*.mjs',
    kind: 'Automation (not AI)',
    role: 'The machinery the skills point at: Notion syncs, image prerender, cache warmer, production guards.',
  },
];

export const WhatThisIs: Story = {
  render: () => (
    <Page
      eyebrow="AI"
      title="How this repo works with Claude"
      lede="The names for everything, what lives where, and the one sentence that answers most questions: Claude Code is the harness; this repo teaches it with instructions and skills."
    >
      <Section
        title="Did we build our own harness?"
        intro="No — and knowing why is the fastest way to understand the setup."
      >
        <div className="t-body max-w-[68ch] space-y-4">
          <p>
            The <strong>harness</strong> is the program that wraps an AI model with tools,
            permissions and context. Ours is <strong>Claude Code</strong> — run as its CLI
            inside the Warp terminal. Warp is just the window; the <code>claude</code> command
            is the harness. Claude Code also exists as a desktop app, a web app and IDE
            extensions — all the same harness in different clothes.
          </p>
          <p>
            What this repository owns is the harness&rsquo;s <em>configuration</em>: the
            project instructions it loads on every session, and six skills it can invoke.
            There are no custom subagents (the built-in Explore/Plan agents ship with the
            harness), no MCP servers defined in-repo (the Figma and Notion connections live at
            the user level), and no Claude hooks — <code>.githooks/pre-commit</code> is an
            ordinary git hook guarding against committed secrets.
          </p>
        </div>
      </Section>

      <Section
        title="The inventory"
        intro="Everything AI-related that is tracked in this repository. The Skills and Project instructions pages beside this one render the real files."
      >
        <div className="max-w-full overflow-x-auto">
          <table className="t-caption w-full max-w-[80ch] border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b-2 border-border py-2 pr-6 font-bold">Where</th>
                <th className="border-b-2 border-border py-2 pr-6 font-bold">What it is</th>
                <th className="border-b-2 border-border py-2 font-bold">What it does</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map((r) => (
                <tr key={r.file}>
                  <td className="border-b border-border py-2 pr-6 align-top whitespace-nowrap">
                    <code>{r.file}</code>
                  </td>
                  <td className="border-b border-border py-2 pr-6 align-top">{r.kind}</td>
                  <td className="border-b border-border py-2 align-top">{r.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Vocabulary" intro="The terms, one line each.">
        <dl className="t-body max-w-[68ch] space-y-4">
          {(
            [
              ['Harness', 'The runtime around the model: tools, permissions, context. Here: the Claude Code CLI.'],
              ['Skill', 'A repo-checked runbook the harness loads when relevant, or on demand as /name.'],
              ['Project instructions', 'AGENTS.md — read automatically at the start of every session.'],
              ['Subagent', 'A helper agent the harness can spawn (Explore, Plan…). None are custom to this repo.'],
              ['MCP server', 'A connector giving the harness external tools (Figma, Notion). Configured per user, not in the repo.'],
            ] as const
          ).map(([term, def]) => (
            <div key={term}>
              <dt className="t-label font-bold">{term}</dt>
              <dd className="ds-muted mt-1">{def}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Note title="None of this reaches the website">
        These files never enter the site build, and this Storybook itself exists only on
        staging — the production deploy refuses to build while it is present. Nothing on this
        page can affect visitors, crawlers, or the Ad Grants review.
      </Note>
    </Page>
  ),
};
