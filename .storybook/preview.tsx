import type { Preview } from '@storybook/nextjs-vite'
import type { CSSProperties } from 'react'
import localFont from 'next/font/local'
import '../app/globals.css'

/**
 * The same face, declared the same way as app/[locale]/layout.tsx.
 *
 * It has to be redeclared rather than imported: the layout builds it inside a
 * server component, and next/font/local wants a call with a literal argument at
 * module scope. Keep the three weights in step with the layout — a story that
 * renders in a fallback face is a story that cannot show a type decision.
 */
const aboutBeige = localFont({
  src: [
    { path: '../app/fonts/AboutBeigeStandard-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../app/fonts/AboutBeigeStandard-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../app/fonts/AboutBeigeStandard-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-about-beige',
  display: 'swap',
})

const preview: Preview = {
  /**
   * Everything the real document supplies and a story otherwise would not.
   *
   * `--font-about-beige` lives on <html> in the layout, and the type classes in
   * globals.css resolve --font-display/--font-body through it — so without this
   * wrapper every t-* class silently falls back to system-ui. The page
   * background and text colour come with it, because body carries them in the
   * real document and a story canvas has no body of its own to inherit from.
   *
   * There are no providers to add: the layout is <html><body>{children}</body>,
   * with no context anywhere in the tree. If one ever appears, it goes here
   * rather than into individual stories.
   */
  decorators: [
    (Story) => (
      <div
        className={`${aboutBeige.variable} bg-page text-text`}
        /**
         * The class alone is not enough here, and this is worth knowing before
         * anyone "tidies" it away. In a real Next build `.variable` emits a rule
         * that defines --font-about-beige; under Storybook's next/font handling
         * the class is emitted (`__variable_font-…`) but that custom property
         * never is. So `var(--font-about-beige)` is invalid at computed-value
         * time, every .t-* class drops its whole font-family declaration, and
         * the canvas quietly falls back to Tailwind's ui-sans-serif — the site's
         * type scale rendered in a face the site does not use.
         *
         * Setting the property from the font's own generated family name works
         * under both, and the CssCheck story in Button.stories.tsx asserts it
         * stays defined.
         */
        style={{ '--font-about-beige': aboutBeige.style.fontFamily } as CSSProperties}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    /**
     * Foundations before the things built out of them.
     *
     * Alphabetical order would put "components" above "Foundations" and teach
     * the system backwards — you cannot read a Button story properly until you
     * know what `bg-brand` and `t-label` are.
     */
    options: {
      storySort: { order: ['Foundations', 'components'] },
    },

    /**
     * The site's real breakpoints, not a catalogue of phones.
     *
     * These are the widths where something in globals.css actually changes, so
     * stepping through them is how you see the system respond — the grid going
     * 12 → 8 → 4, the gap dropping to 12px, and the type scale leaving its
     * clamp() behind for the fixed mobile sizes at 767. Both edges of each band
     * are here on purpose: most breakpoint bugs live one pixel either side of
     * the boundary, not in the middle of a band.
     */
    viewport: {
      options: {
        phone: { name: 'Phone · 4 col', styles: { width: '390px', height: '844px' } },
        phoneMax: {
          name: 'Phone, last pixel · 767',
          styles: { width: '767px', height: '900px' },
        },
        tablet: { name: 'Tablet · 8 col · 768', styles: { width: '768px', height: '1024px' } },
        tabletMax: {
          name: 'Tablet, last pixel · 1023',
          styles: { width: '1023px', height: '900px' },
        },
        desktop: {
          name: 'Desktop · 12 col · 1024',
          styles: { width: '1024px', height: '800px' },
        },
        figma: {
          name: 'Figma design width · 1512',
          styles: { width: '1512px', height: '950px' },
        },
      },
    },

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;