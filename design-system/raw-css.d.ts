/**
 * Lets the foundations pages import globals.css as text.
 *
 * Vite's `?raw` suffix hands back the file's contents as a string, which is how
 * design-system/tokens.ts reads the real token declarations instead of keeping
 * a second copy of them.
 */
declare module "*.css?raw" {
  const content: string;
  export default content;
}
