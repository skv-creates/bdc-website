#!/usr/bin/env node
/**
 * Refuses to deploy production if the staging-only dev tools are in the bytes a
 * visitor downloads.
 *
 * Shift+R (Redlines) and Shift+E (EditMode) are staging surfaces. They are
 * gated at render time by `!IS_PRODUCTION_SITE` in app/[locale]/layout.tsx,
 * which is what makes them unreachable on the apex — that gate is not in
 * question and this script does not test it.
 *
 * What this tests is the second, quieter half: that they are not *bundled*.
 * They were, for months, while three separate comments asserted that
 * `next/dynamic` prevented it. A dynamic import is still a static edge in the
 * module graph; Turbopack folded both components into one shared client chunk
 * and the apex loaded it as an async script on the home page and on every event
 * page. Nothing rendered, nothing was reachable, and 16KB of editing tooling
 * shipped to every visitor of a site that publishes a carbon figure.
 *
 * `next.config.ts` now aliases both specifiers to components/dev/DevToolsStub.tsx
 * on a production build. This script is what stops that going quietly stale —
 * a Turbopack change, a renamed specifier, a fourth dev tool added without an
 * alias entry. An invariant nobody checks is a comment.
 *
 * Client assets only, on purpose. /api/staging-edit legitimately exists in the
 * production server bundle — it answers 404 there — so scanning the Worker for
 * "staging-edit" would fail every honest build.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

/**
 * Where the client's JavaScript ends up, in order of authority. The FIRST of
 * these that exists is the one scanned — not both.
 *
 * `.open-next/assets` is what wrangler actually uploads, so it is the thing
 * worth checking. `.next/static` is the fallback for a bare `next build`, when
 * OpenNext has not run yet.
 *
 * Scanning both looks more careful and is worse: neither directory is cleaned
 * between builds, so a `.open-next` left over from `npm run deploy` (staging,
 * tools present) makes a perfectly clean production build fail with a message
 * saying the tools are in the bundle. A guard that cries wolf is a guard
 * somebody deletes. In the real chain — `opennextjs-cloudflare build --env
 * production` immediately before this script — `.open-next` is freshly written
 * by the production build, which is exactly what should be inspected.
 */
const ROOTS = [".open-next/assets/_next/static", ".next/static"];

/**
 * Strings that exist only in the two client components — each tool covered by
 * more than one, and by at least one that is not user-facing copy.
 *
 * Both tools are listed separately on purpose: if one were ever un-aliased on
 * its own, fingerprints for the other would not notice.
 *
 * The module paths are kept because they cost nothing and would match if
 * Turbopack emitted module ids as paths — measured against 16.2.9, it does not,
 * so they are a belt, not the braces. The strings below them are what actually
 * caught this, verified by building both origins and checking each one matches
 * on staging and not on production.
 */
const FINGERPRINTS = [
  // EditMode — the passphrase cookie name, and the prompt's label.
  "bdc-edit-pass",
  "Edit passphrase",
  // Redlines — a class string it builds the grid overlay from, and the label it
  // prints for an element carrying no type style.
  "bdc-grid absolute top-0 h-full",
  "no t- style",
  // Module specifiers, in case a future Turbopack keeps them.
  "components/dev/Redlines",
  "components/dev/EditMode",
];

/** Source maps are not served to visitors and would match on comments. */
const skip = (name) => name.endsWith(".map");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (!skip(entry)) out.push(full);
  }
  return out;
}

const scanned = [];
const hits = [];

const target = ROOTS.map((rel) => join(root, rel)).find((dir) => existsSync(dir));

if (target) {
  for (const file of walk(target)) {
    scanned.push(file);
    const text = readFileSync(file, "latin1");
    for (const fingerprint of FINGERPRINTS) {
      if (text.includes(fingerprint)) {
        hits.push({ file: file.slice(root.length + 1), fingerprint });
      }
    }
  }
}

if (scanned.length === 0) {
  console.error(
    [
      "",
      "  Refusing to deploy production: found no client assets to check.",
      "",
      `  Looked in: ${ROOTS.join(", ")}`,
      "",
      "  This script runs between the production build and the production",
      "  deploy. Nothing to scan means the build did not happen, or its output",
      "  moved — either way the dev-tools guard did not run, so this fails",
      "  rather than passing on an empty scan.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

if (hits.length > 0) {
  const shown = hits.slice(0, 12);
  console.error(
    [
      "",
      "  Refusing to deploy production: staging-only dev tools are in the",
      "  client bundle.",
      "",
      ...shown.map((h) => `      ${h.fingerprint}  ->  ${h.file}`),
      ...(hits.length > shown.length ? [`      … and ${hits.length - shown.length} more`] : []),
      "",
      "  Shift+R and Shift+E are staging surfaces. They will not render on the",
      "  apex — the !IS_PRODUCTION_SITE gate in app/[locale]/layout.tsx holds —",
      "  but their code would be downloaded by every visitor.",
      "",
      "  The fix is the alias in next.config.ts, which swaps both specifiers",
      "  for components/dev/DevToolsStub.tsx when SITE_ORIGIN is the apex.",
      "  Check that SITE_ORIGIN was set for the build, and that any dev tool",
      "  added since has an entry there.",
      "",
      "  Do not weaken this check to get a deploy through.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  `  No staging-only dev tools in ${scanned.length} client asset(s) under ` +
    `${target.slice(root.length + 1)}. Safe to publish.`,
);
