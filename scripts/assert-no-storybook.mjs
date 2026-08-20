#!/usr/bin/env node
/**
 * Refuses to build or deploy production if Storybook is sitting in `public/`
 * or in the generated OpenNext asset manifest.
 *
 * `/bdc-storybook` is a staging-only surface: it is the design system in
 * progress, it is not translated, it is not part of what the council publishes,
 * and it carries component states that are deliberately half-finished. None of
 * that belongs on the apex.
 *
 * It should be impossible to get there — `public/bdc-storybook` is gitignored
 * and only `npm run deploy` (staging) ever creates it — but "impossible" here
 * rests on a gitignore, and the cost of being wrong is a public site serving an
 * internal tool. A local `npm run deploy` followed by `npm run deploy:production`
 * in the same working copy is the obvious way it happens, and that sequence is
 * exactly what someone does when promoting a change they have just reviewed.
 *
 * So: check, and fail loudly, rather than trust the sequence.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const targets = [
  resolve(root, "public", "bdc-storybook"),
  resolve(root, ".open-next", "assets", "bdc-storybook"),
];
const target = targets.find((candidate) => existsSync(candidate));

if (target) {
  console.error(
    [
      "",
      `  Refusing production release: ${target.slice(root.length + 1)} exists.`,
      "",
      "  That directory is a staging-only Storybook build. Shipping it would",
      "  publish the design system on the live site.",
      "",
      "  Remove public/bdc-storybook when present, clean the generated OpenNext",
      "  output, and build production again.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
