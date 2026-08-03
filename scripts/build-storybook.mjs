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
import { renameSync, rmSync } from "node:fs";
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

console.log("Storybook built into public/bdc-storybook (staging only).");
