import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Page, Note, Section } from '../design-system/Page';

/**
 * The plain-language explanation of how this project works with AI —
 * written for the team: designers, not engineers, and not native English
 * speakers. Short sentences, everyday words, every term explained the
 * first time it appears. The neighbouring pages show the actual files.
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
    file: 'AGENTS.md',
    kind: 'The welcome document',
    role: 'The assistant reads this every time it starts. It explains how our project works: how the website goes live, where the texts come from, what must stay secret.',
  },
  {
    file: '.claude/skills/design-system/',
    kind: 'Guide: design rules',
    role: 'Our visual rules — which button goes where, text sizes, spacing, how cards look. So the assistant does not break the design.',
  },
  {
    file: '.claude/skills/verify-in-browser/',
    kind: 'Guide: checking the site',
    role: 'How to open the website in a real browser and test it — on phone sizes too — before saying "it works".',
  },
  {
    file: '.claude/skills/site-audit/',
    kind: 'Guide: health check',
    role: 'A full check-up list for the website: speed, broken links, Google requirements. Used before the Ad Grants application.',
  },
  {
    file: '.claude/skills/accessibility/',
    kind: 'Guide: accessibility',
    role: 'How to make everything usable for people with disabilities — keyboard, screen readers, small screens.',
  },
  {
    file: '.claude/skills/ship-to-staging/',
    kind: 'Guide: publishing',
    role: 'How changes go online: always to the test site first, and to the real site only when a person says so.',
  },
  {
    file: 'scripts/',
    kind: 'Small helper programs',
    role: 'Not AI — normal programs the guides mention: preparing images, syncing events from Notion, safety checks before publishing.',
  },
];

export const WhatThisIs: Story = {
  render: () => (
    <Page
      eyebrow="AI"
      title="How we work with AI"
      lede="We use an AI assistant to help build and maintain this website. This page explains, in simple words, what the assistant is, what we wrote for it, and what all the names mean."
    >
      <Section title="The short version" intro="">
        <div className="t-body max-w-[68ch] space-y-4">
          <p>
            We use an AI assistant called <strong>Claude</strong>. It works inside a program
            called <strong>Claude Code</strong>, which we did not build — it comes from
            Anthropic, the company that makes Claude. What <em>we</em> wrote is a set of
            documents that teach the assistant how <em>our</em> project works — and those
            documents are what you see in this section.
          </p>
        </div>
      </Section>

      <Section
        title="A useful picture: a workshop and a new colleague"
        intro="Two images that make everything else easy to place."
      >
        <div className="t-body max-w-[68ch] space-y-4">
          <p>
            Think of <strong>Claude Code</strong> as a <strong>workshop</strong>. Inside it,
            the AI assistant has tools: it can read our files, change them, test the website,
            and publish it. People sometimes call this workshop a &ldquo;harness&rdquo; — an
            engineering word you may hear. We did not build the workshop. We only work in it.
          </p>
          <p>
            Now think of the assistant as a <strong>new colleague</strong>. A new colleague is
            smart but knows nothing about our project on day one. So we wrote two kinds of
            documents for them:
          </p>
          <ul className="list-disc space-y-2 ps-5">
            <li>
              <strong>A welcome document</strong> (the file <code>AGENTS.md</code>). The
              assistant reads it automatically every time it starts work. It says how our
              website is published, where our texts live, and what must never be shared.
            </li>
            <li>
              <strong>Guides for specific jobs</strong> (called <strong>skills</strong>).
              Each one is like a recipe: step-by-step instructions for one kind of task —
              checking the design rules, testing the site, publishing safely. When a task
              matches a recipe, the assistant follows it instead of guessing.
            </li>
          </ul>
          <p>
            Every mistake the assistant made and we corrected — a wrong button style, a broken
            layout, a slow image — was written into these documents. That way the correction
            is permanent: the next work session starts already knowing it.
          </p>
        </div>
      </Section>

      <Section
        title="What is in this repository"
        intro="Everything AI-related that we keep in the project. The pages next to this one show the real documents, word for word."
      >
        <div
          tabIndex={0}
          className="max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-current"
        >
          <table className="t-caption w-full max-w-[80ch] border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b-2 border-border py-2 pr-6 font-bold">Where it lives</th>
                <th className="border-b-2 border-border py-2 pr-6 font-bold">What it is</th>
                <th className="border-b-2 border-border py-2 font-bold">What it is for</th>
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

      <Section
        title="Words you may hear, in plain language"
        intro="Short definitions, so these terms are familiar when they come up in messages or meetings."
      >
        <dl className="t-body max-w-[68ch] space-y-4">
          {(
            [
              [
                'Claude',
                'The AI assistant itself — the "colleague". Made by a company called Anthropic.',
              ],
              [
                'Claude Code (a "harness")',
                'The workshop the assistant works inside. It gives the assistant its tools. We run it in the terminal.',
              ],
              [
                'Skill',
                'A recipe we wrote: step-by-step instructions for one kind of job. We have five.',
              ],
              [
                'AGENTS.md (project instructions)',
                'The welcome document the assistant reads at the start of every work session.',
              ],
              [
                'Agent / subagent',
                'A helper the assistant can send off with one task — explore something, plan something — which then reports back. These come built into Claude Code; we did not make our own.',
              ],
              [
                'MCP',
                'A connector that plugs the assistant into another tool we use — for example Figma (our designs) or Notion (our texts). These connections belong to the person using the assistant, not to the project.',
              ],
            ] as const
          ).map(([term, def]) => (
            <div key={term}>
              <dt className="t-label font-bold">{term}</dt>
              <dd className="ds-muted mt-1">{def}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Common questions" intro="">
        <dl className="t-body max-w-[68ch] space-y-6">
          <div>
            <dt className="t-label font-bold">Did we build our own AI system?</dt>
            <dd className="ds-muted mt-1">
              No. The AI and its workshop come from Anthropic. Our part is the documents
              that teach it about this project — the welcome document and the five guides.
            </dd>
          </div>
          <div>
            <dt className="t-label font-bold">Can visitors of our website see any of this?</dt>
            <dd className="ds-muted mt-1">
              No. These documents never become part of the website. Even this Storybook exists
              only on the test site (staging), never on bulgariandesigncouncil.org.
            </dd>
          </div>
          <div>
            <dt className="t-label font-bold">Can the assistant publish to the real website by itself?</dt>
            <dd className="ds-muted mt-1">
              No. The publishing guide is strict: everything goes to the test site first, and
              the real website is published only when a person clearly asks for it.
            </dd>
          </div>
        </dl>
      </Section>

      <Note title="These pages always show the truth">
        The Skills and Project instructions pages next to this one are not copies — they read
        the real documents at build time. If someone edits a document, these pages show the
        edit after the next publish. They can never be out of date.
      </Note>
    </Page>
  ),
};
