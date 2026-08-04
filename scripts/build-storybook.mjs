#!/usr/bin/env node
/**
 * Builds Storybook into `public/bdc-storybook`, so the staging deploy serves the
 * design system at https://staging.bulgariandesigncouncil.org/bdc-storybook.
 *
 * This runs from `npm run deploy` (staging) and from nowhere else. That is the
 * whole mechanism keeping Storybook off the live site, and it is deliberately
 * structural rather than a flag someone has to remember:
 *
 *   - `public/bdc-storybook` is gitignored, so it is never committed.
 *   - `npm run deploy:production` does not call this script, and asserts the
 *     directory is absent before it builds (scripts/assert-no-storybook.mjs).
 *   - deploy-production.yml builds from a fresh checkout, where the directory
 *     therefore cannot exist.
 *
 * So shipping Storybook to the apex is not a mistake someone can make by
 * forgetting a variable — the files would have to be committed on purpose, past
 * a gitignore and a build-time assertion.
 *
 * Why the build goes to a scratch directory and is then moved: `.storybook/
 * main.ts` sets `staticDirs: ['../public']`, so a build writing straight into
 * `public/` would be copying its own output directory into itself while
 * creating it. Building outside `public/` and moving afterwards means that at
 * no point during the build does `public/bdc-storybook` exist.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const scratch = resolve(root, ".storybook-static");
const target = resolve(root, "public", "bdc-storybook");

// Both, and before the build: see the note above about staticDirs. Removing the
// target first is also what stops a stale build lingering when stories are
// deleted — the directory is replaced wholesale, never merged into.
rmSync(scratch, { recursive: true, force: true });
rmSync(target, { recursive: true, force: true });

execFileSync("npx", ["storybook", "build", "-o", scratch], {
  cwd: root,
  stdio: "inherit",
});

renameSync(scratch, target);

/**
 * Name the page, and give it a link preview.
 *
 * Storybook writes `<title>storybook - Storybook</title>` into index.html itself,
 * before anything manager-head.html injects — and a browser or a link-preview
 * crawler takes the FIRST title in the document, so adding a second one there
 * does nothing. Pasting the URL into Slack or a message produced a card reading
 * "storybook - Storybook" with no description.
 *
 * Crawlers do not run the manager's JavaScript either, so the static HTML is the
 * only chance to say what this is. Rewritten here, after the build, for that
 * reason.
 */
const ORIGIN = process.env.STORYBOOK_ORIGIN ?? "https://staging.bulgariandesigncouncil.org";
const BASE = `${ORIGIN}/bdc-storybook/`;
const TITLE = "BDC GEL Storybook";
const DESCRIPTION =
  "The Bulgarian Design Council's global experience language: colour, typography, " +
  "space and layout, and the components built from them.";

const indexPath = resolve(target, "index.html");
const meta = [
  `<meta name="description" content="${DESCRIPTION}" />`,
  `<meta property="og:type" content="website" />`,
  `<meta property="og:site_name" content="${TITLE}" />`,
  `<meta property="og:title" content="${TITLE}" />`,
  `<meta property="og:description" content="${DESCRIPTION}" />`,
  `<meta property="og:url" content="${BASE}" />`,
  `<meta property="og:image" content="${BASE}brand/favicon.png" />`,
  `<meta name="twitter:card" content="summary" />`,
  `<meta name="twitter:title" content="${TITLE}" />`,
  `<meta name="twitter:description" content="${DESCRIPTION}" />`,
  `<meta name="twitter:image" content="${BASE}brand/favicon.png" />`,
  // Staging only, and not something search engines should hold on to.
  `<meta name="robots" content="noindex, nofollow" />`,
].join("\n    ");

const html = readFileSync(indexPath, "utf8");
if (!/<title>[^<]*<\/title>/.test(html)) {
  console.error("No <title> found in the Storybook index. Refusing to guess.");
  process.exit(1);
}
writeFileSync(
  indexPath,
  html.replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>\n    ${meta}`),
);

console.log(`Storybook built into public/bdc-storybook (staging only), titled "${TITLE}".`);
