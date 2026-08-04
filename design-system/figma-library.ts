/**
 * The Figma text styles, as listed in the library panel.
 *
 * This is the one file in the design system whose values are typed in by hand.
 * Everything else is parsed from the stylesheet or fetched from the live site;
 * these were read off the Figma "Text styles" panel because there is no
 * connection to the file itself. If the Figma file URL is added, this should be
 * replaced by a pull from the Figma API so it stops being a transcription.
 *
 * Sizes and line heights are as Figma states them: `80/110` means 80px at 110%.
 */

export type FigmaTextStyle = {
  /** Name in the Figma library, e.g. `h01` or `body-medium`. */
  name: string;
  /** Group in the panel, where there is one. */
  group?: 'Heading' | 'Body';
  sizePx: number;
  /** Line height as a percentage, as Figma shows it. */
  lineHeightPct: number;
  /** The CSS class intended to implement it, if one exists. */
  cssClass?: string;
};

export const FIGMA_TEXT_STYLES: FigmaTextStyle[] = [
  { name: 'label', sizePx: 20, lineHeightPct: 140, cssClass: 't-label' },
  { name: 'caption', sizePx: 16, lineHeightPct: 150, cssClass: 't-caption' },
  { name: 'quote', sizePx: 64, lineHeightPct: 120, cssClass: 't-quote' },

  { name: 'h01', group: 'Heading', sizePx: 80, lineHeightPct: 110, cssClass: 't-h01' },
  { name: 'h02', group: 'Heading', sizePx: 56, lineHeightPct: 110, cssClass: 't-h02' },
  { name: 'h03', group: 'Heading', sizePx: 40, lineHeightPct: 110, cssClass: 't-h03' },
  { name: 'h04', group: 'Heading', sizePx: 32, lineHeightPct: 110, cssClass: 't-h04' },
  { name: 'h05', group: 'Heading', sizePx: 24, lineHeightPct: 130, cssClass: 't-h05' },

  // body-large and body-small have no CSS class. That is the finding, not an
  // omission here — leaving cssClass undefined is what makes the parity page
  // report them as missing.
  { name: 'body-large', group: 'Body', sizePx: 32, lineHeightPct: 120 },
  { name: 'body-medium', group: 'Body', sizePx: 24, lineHeightPct: 150, cssClass: 't-body-lg' },
  { name: 'body-default', group: 'Body', sizePx: 20, lineHeightPct: 140, cssClass: 't-body' },
  { name: 'body-small', group: 'Body', sizePx: 18, lineHeightPct: 140 },
];

/** CSS classes that exist in the stylesheet with no matching Figma style. */
export const CSS_ONLY_CLASSES = ['t-digit'];
