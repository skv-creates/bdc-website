/**
 * What the apex gets instead of the Shift+R and Shift+E tools.
 *
 * `next.config.ts` aliases both `@/components/dev/Redlines` and
 * `@/components/dev/EditMode` to this file when SITE_ORIGIN is the production
 * origin, so on a production build the real components are not in the module
 * graph at all — not in a chunk, not in a preload, not in the bytes a visitor
 * downloads.
 *
 * The `!IS_PRODUCTION_SITE` gate in app/[locale]/layout.tsx was always enough to
 * stop them *rendering*, and it stays. This exists because it was not enough to
 * stop them *shipping*: Turbopack folded both components into a shared client
 * chunk that the apex loaded as an async script on the home page and on every
 * event page — 16KB of editing tooling, along with the passphrase cookie name
 * and the editing endpoint's path, published on a site that reports a carbon
 * figure. The components' own comments claimed `next/dynamic` prevented this.
 * It did not.
 *
 * The literal strings the guard script looks for are deliberately not repeated
 * in this comment: a source map carrying them would trip it.
 *
 * Two components, one stub, because the aliased specifier decides which name is
 * read off the module: layout.tsx does `.then((mod) => mod.Redlines)` and
 * `.then((mod) => mod.EditMode)`, so both have to exist here.
 *
 * `scripts/assert-no-dev-tools.mjs` fails the production build if any of this
 * ever stops working. Do not delete it to get a deploy through.
 */

export const Redlines = () => null;

export const EditMode = () => null;
