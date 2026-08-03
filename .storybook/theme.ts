import { create } from 'storybook/theming/create';

/**
 * The Storybook chrome, in the council's own colours.
 *
 * Not decoration. A design system read in a stock-grey interface teaches people
 * that the system is a developer tool; one that looks like the thing it
 * documents teaches that the system *is* the brand. It also makes an
 * out-of-system colour obvious — a component that clashes with the surrounding
 * chrome is showing you something true.
 *
 * The values are the ones from app/globals.css. They are literals here because
 * Storybook's manager runs outside the preview iframe and never loads the site's
 * stylesheet, so there is no custom property to read. This is the one place in
 * the design system where a brand value is written twice — if the palette ever
 * changes, this file changes with it.
 */
export default create({
  base: 'light',

  brandTitle: 'Bulgarian Design Council — design system',
  brandUrl: 'https://staging.bulgariandesigncouncil.org',
  // Resolves against the site root, which serves this file at both
  // /bdc-storybook (deployed) and in dev via staticDirs.
  brandImage: '/figma/logo-dark.svg',
  brandTarget: '_self',

  colorPrimary: '#f3a3ca', // --bdc-rose
  colorSecondary: '#770f42', // --bdc-burgundy — the focus-ring colour, 10.9:1 on white

  appBg: '#ffffff', // --bdc-white
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: 'rgba(21, 21, 21, 0.12)',
  appBorderRadius: 8,

  textColor: '#151515', // --bdc-dark
  textInverseColor: '#ffffff',

  barTextColor: 'rgba(21, 21, 21, 0.65)',
  barSelectedColor: '#770f42',
  barHoverColor: '#770f42',
  barBg: '#ffffff',

  inputBg: '#ffffff',
  inputBorder: 'rgba(21, 21, 21, 0.2)',
  inputTextColor: '#151515',
  inputBorderRadius: 6,
});
