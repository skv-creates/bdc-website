/**
 * Lets the AI pages import the real skill files as text.
 *
 * Vite's `?raw` suffix hands back the file's contents as a string — the
 * same mechanism design-system/raw-css.d.ts declares for globals.css, so
 * these pages render whatever the files say today rather than keeping a
 * second copy that would silently drift.
 */
declare module "*.md?raw" {
  const content: string;
  export default content;
}
