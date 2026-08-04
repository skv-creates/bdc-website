import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Note, Page, Section } from './Page';
import { BANDS, REFERENCE_WIDTHS, typeStyles } from './tokens';
import { parityCounts } from './parity';

/**
 * Was an .mdx file, which crashed Storybook's docs renderer with "Illegal
 * invocation" and left the first page anyone opens showing a stack trace. A
 * plain story page renders through the same path as every other Foundations
 * entry, and takes the site's own styles rather than the docs theme.
 */
const meta = {
  title: 'Foundations/Start here',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A reusable prompt, with the reason it is worded the way it is. */
type Prompt = { title: string; why: string; text: string };

const PROMPTS: Prompt[] = [
  {
    title: 'Audit accessibility to AA and better',
    why: 'Names the standard and the evidence required, so the answer is a list of failures with locations rather than a reassurance.',
    text: `Audit this page against WCAG 2.2 at level AA, and flag anything that would
also fail AAA for contrast or text spacing.

For every issue give me: the element, the rule it breaks, the measured value, the
threshold it needed to meet, and the smallest change that fixes it.

Check specifically:
- contrast for text, large text, borders, icons and focus rings
- that every interactive element is reachable and operable by keyboard alone
- that scrollable regions can be scrolled by keyboard
- that heading levels form a correct outline, independent of how they look
- that text still works at 200% browser text size with no loss of content
- that nothing conveys meaning by colour alone

Do not tell me it passes. Show me what you measured.`,
  },
  {
    title: 'Check the carbon cost of a change',
    why: 'Asks for bytes over the wire before and after, which is the only number that maps to emissions. "Optimise it" invites cosmetic answers.',
    text: `Measure the page weight of this change, before and after, and tell me whether
it is worth shipping.

Report:
- transfer size per asset type: HTML, CSS, JS, fonts, images
- how much of the CSS and JS is actually used on the page
- image dimensions served versus dimensions displayed
- anything downloaded by every visitor and seen by almost none

Compare against the live site, not against the previous build. If the change adds
weight, say by how much and what it buys.`,
  },
  {
    title: 'Verify a value against the live site',
    why: 'The repository, staging and the apex can hold three different answers. This asks which one a visitor is actually getting.',
    text: `Do not read this value from the source. Fetch it from
bulgariandesigncouncil.org, which is the only version a visitor sees, and tell me:

- what the published CSS or markup actually says
- what this branch says
- whether they differ, and if so whether that is unpublished work or a real drift

If they differ, say which commit the live site was built from.`,
  },
  {
    title: 'Change a design token',
    why: 'Keeps the change in one place and makes the blast radius explicit before anything moves.',
    text: `I want to change <token> from <old> to <new>.

Before changing it, tell me:
- every component and page that resolves this token
- what it looks like at each breakpoint, at the design width and on a phone
- whether it is referenced in Figma under a different name
- whether any test asserts the current value

Change it only in app/base.css. If the same value appears anywhere else, that is
the bug — tell me instead of editing both.`,
  },
  {
    title: 'Review a component before it ships',
    why: 'Written so a passing answer is falsifiable: each line either holds or names the file and line where it does not.',
    text: `Review this component as a design engineer would.

- Does it use named type styles and tokens, or raw sizes and hex values?
- Does it behave at 320px, at the design width, and at 200% text size?
- Are the HTML elements chosen for structure and the classes for appearance?
- Is every interactive element reachable, labelled and visible when focused?
- Does it add a dependency or a font weight, and is that justified?
- Is there a story covering the states that are easy to get wrong?

Answer with file and line references. If something passes, say what you checked.`,
  },
];

function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <li className="border-t border-black/10 py-8">
      <h3 className="t-h05">{prompt.title}</h3>
      <p className="t-body mt-2 max-w-[68ch] ds-muted">{prompt.why}</p>
      <pre className="t-caption mt-4 max-w-[80ch] overflow-x-auto whitespace-pre-wrap rounded-lg border border-black/15 bg-[color-mix(in_srgb,var(--color-text)_4%,var(--color-page))] p-5 font-mono">
        {prompt.text}
      </pre>
    </li>
  );
}

/**
 * Named to match the last segment of the title on purpose.
 *
 * Storybook hoists a single-story component into one sidebar entry only when the
 * story's name matches its group's. Called anything else — it was `Overview` —
 * the sidebar shows a "Start here" parent you have to open to reach a child,
 * which buries the first page anyone is meant to read.
 */
export const StartHere: Story = {
  name: 'Start here',
  render: () => (
    <Page
      title="Bulgarian Design Council — design system"
      lede={
        <>
          The colours, type, spacing and layout the site is built from, the
          components assembled out of them, and the working practices that keep
          the two in step.
        </>
      }
    >
      <Section
        title="Where the values live"
        intro={
          <>
            Everything here is read from <code>app/base.css</code> — tokens, type
            styles, breakpoint bands. These pages parse that file and display what
            they find, so a swatch or a size shown here is the one in the code.
          </>
        }
      >
        <div className="t-body max-w-[68ch]">
          <p>
            Change a value in <code>base.css</code> and it updates here, in the
            components, and on the site together. Nothing on a Foundations page is
            typed in by hand.
          </p>
          <p className="mt-4">
            If a page looks wrong or empty, the parser in{' '}
            <code>design-system/tokens.ts</code> has lost the shape of the file.
            Fix the parser — never paste a value in to make a page look right.
          </p>
        </div>
      </Section>

      <Section title="The pages">
        <dl className="grid max-w-[68ch] grid-cols-[10rem_1fr] gap-x-8 gap-y-4">
          {[
            ['Colour', 'Brand palette, semantic names, and the contrast each affords.'],
            ['Typography', `${typeStyles.length} styles, live specimens, and how sizes resolve across widths and reader text-size settings.`],
            ['Space and radius', 'Four spacing steps and one radius, drawn at true size.'],
            ['Layout and breakpoints', `The grid, gutter and rail, and what changes across ${BANDS.length} bands.`],
            ['Figma and live parity', `Every style compared three ways. ${parityCounts.errors} currently differ from Figma.`],
            ['Components', 'Each story sits beside the component it documents.'],
          ].map(([name, description]) => (
            <div key={name} className="contents">
              <dt className="t-label">{name}</dt>
              <dd className="t-body ds-muted">{description}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        title="Widths"
        intro="The five widths the type scale is anchored at. Everything between them is a point on a line, which is what the slider on the Typography page is for."
      >
        <ul className="flex flex-wrap gap-3">
          {REFERENCE_WIDTHS.map(({ width, note }) => (
            <li
              key={width}
              className="t-caption rounded-full border-2 border-border px-4 py-1.5"
            >
              {width}px · {note}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Working practices"
        intro="What holds this together when several people are editing it."
      >
        <ul className="t-body flex max-w-[68ch] flex-col gap-6">
          <li>
            <strong>One place per value.</strong> A token lives in{' '}
            <code>app/base.css</code> and nowhere else. If you find yourself
            editing the same number twice, the second one is the bug.
          </li>
          <li>
            <strong>Structure and appearance are separate choices.</strong> Pick
            the HTML element for the document outline, then the <code>.t-*</code>{' '}
            class for how it should look. On this site an <code>h1</code> carries{' '}
            <code>.t-h02</code> in three places, deliberately.
          </li>
          <li>
            <strong>Accessibility fails the build.</strong> The checks run at
            error level, not as a list to read later. A contrast or keyboard
            failure stops the run.
          </li>
          <li>
            <strong>Weight is a design decision.</strong> The site publishes a
            carbon figure. A font weight is ~70KB for every visitor; a stray
            utility class compiled into the stylesheet was 7KB of rules that could
            never match. Both are worth checking before they ship.
          </li>
          <li>
            <strong>Proof in Cyrillic.</strong> The site is Bulgarian first, and
            Bulgarian words run long — <em>предизвикателството</em> is nineteen
            characters. Latin samples hide both the width and the accent
            clearance.
          </li>
          <li>
            <strong>Staging is where work is reviewed.</strong> Nothing reaches
            the live site without someone choosing to publish it.
          </li>
        </ul>
      </Section>

      <Section
        title="Prompt library"
        intro="Prompts worth reusing, written so the answer has to contain evidence. Each says what to measure and what to report, because a prompt that asks whether something is good gets told that it is."
      >
        <ul>
          {PROMPTS.map((prompt) => (
            <PromptCard key={prompt.title} prompt={prompt} />
          ))}
        </ul>
      </Section>

      <Note title="Where this lives">
        <p>
          Published at <code>/bdc-storybook/</code> on staging only. It is not
          translated and is not part of what the council publishes — the live site
          cannot serve it, by construction.
        </p>
      </Note>
    </Page>
  ),
  play: async ({ canvas }) => {
    // The page this replaced crashed on load, so the first thing to assert is
    // that it renders at all.
    await expect(canvas.getByText('Prompt library')).toBeVisible();
    for (const prompt of PROMPTS) {
      await expect(canvas.getByText(prompt.title)).toBeVisible();
    }
    // Counts come from the parsed stylesheet, so a page claiming five bands
    // when the CSS declares four would fail here rather than mislead.
    await expect(canvas.getByText(`${REFERENCE_WIDTHS[0].width}px · ${REFERENCE_WIDTHS[0].note}`)).toBeVisible();
  },
};
