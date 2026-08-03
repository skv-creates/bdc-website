import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Button } from './Button';

const meta = {
  component: Button,
  tags: ['ai-generated'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Стани член' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Виж събитията' },
};

/** The nav button — caption size, so it sits inside a header row. */
export const Small: Story = {
  args: { variant: 'small', children: 'EN' },
};

/** No chrome at rest; the rule under the row appears on hover. */
export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'Прочети повече' },
};

export const TertiaryFullWidth: Story = {
  args: { variant: 'tertiary', children: 'Прочети повече', fullWidth: true },
};

export const AsExternalLink: Story = {
  args: { href: 'https://www.theicod.org', children: 'ico-D' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /ico-D/i });
    await expect(link).toHaveAttribute('href', 'https://www.theicod.org');
    // An http(s) href is what flips this from a <button> to an <a> that leaves
    // the site — and rel has to ride along with target, or the opened page can
    // reach back through window.opener. Neither is visible in a screenshot.
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

/** An in-site href stays in this tab: no target, no rel. */
export const AsInternalLink: Story = {
  args: { href: '/bg/initiatives', children: 'Инициативи' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /Инициативи/i });
    await expect(link).not.toHaveAttribute('target');
  },
};

/**
 * The only CssCheck in the project.
 *
 * Every other story asserts structure, which passes just as happily on an
 * unstyled page. This one reads a real painted value, so if globals.css ever
 * stops reaching the preview the whole suite says so here rather than going
 * quietly green while showing Times New Roman on white.
 */
export const CssCheck: Story = {
  args: { children: 'Стани член' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /Стани член/i });
    // primary is bg-brand → --color-brand → --bdc-rose → #f3a3ca.
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(243, 163, 202)');
    // And the variable the whole type scale hangs off is actually defined. If
    // it is not, `var(--font-about-beige)` is invalid at computed-value time,
    // every .t-* class silently drops its font-family, and the canvas renders
    // the site's typography in Tailwind's ui-sans-serif instead. Asserted as
    // the property rather than the resolved family name, because the generated
    // name differs between a real Next build and Storybook's.
    await expect(getComputedStyle(button).getPropertyValue('--font-about-beige')).not.toBe('');
  },
};
