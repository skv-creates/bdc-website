#!/usr/bin/env node
/**
 * Records the type scale the LIVE site is actually serving.
 *
 * Not the repo's globals.css — the compiled CSS that bulgariandesigncouncil.org
 * hands to a browser right now. The two can differ, and did: the apex only
 * updates when someone runs the production deploy by hand, so main and staging
 * can be several commits ahead of what a visitor sees.
 *
 * The output is what the Foundations "Live site" page compares against, so a
 * discrepancy between design, code and production is visible rather than
 * assumed. Refresh it with:
 *
 *     npm run sync:live-type
 *
 * Reads only. It never writes to the site, and it needs no credentials.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ORIGIN = process.env.LIVE_ORIGIN ?? "https://bulgariandesigncouncil.org";
const PAGE = `${ORIGIN}/bg`;
const OUT = resolve(import.meta.dirname, "..", "design-system", "live-type.generated.json");

/** Pull every stylesheet the page links, in document order. */
async function stylesheetUrls() {
  const res = await fetch(PAGE, { headers: { "user-agent": "bdc-design-system-sync" } });
  if (!res.ok) throw new Error(`${PAGE} returned ${res.status}`);
  const html = await res.text();

  const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(
    (match) => match[1],
  );
  if (hrefs.length === 0) throw new Error("No stylesheet links found on the live page.");
  return hrefs.map((href) => (href.startsWith("http") ? href : `${ORIGIN}${href}`));
}

/**
 * Balanced-brace scan for @media blocks.
 *
 * Minified CSS nests rules inside media queries, so a regex that stops at the
 * first `}` truncates the block and silently loses the overrides — which are
 * exactly what this script exists to capture.
 */
function mediaBlocks(css) {
  const out = [];
  for (const match of css.matchAll(/@media\s*([^{]+?)\s*\{/g)) {
    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") depth -= 1;
      i += 1;
    }
    out.push({ query: match[1], body: css.slice(start, i - 1) });
  }
  return out;
}

function withoutMedia(css) {
  let result = css;
  for (const { body } of mediaBlocks(css)) result = result.replace(body, "");
  return result;
}

/** Declarations from a rule body, as an object. */
function declarations(body) {
  const out = {};
  for (const part of body.split(";")) {
    const [prop, ...rest] = part.split(":");
    if (!prop || rest.length === 0) continue;
    out[prop.trim()] = rest.join(":").trim();
  }
  return out;
}

/**
 * Every `.t-*` rule, base values merged with their media-query overrides.
 *
 * Selector lists matter here: production minifies `.t-body` and `.t-label` into
 * one rule when they share a declaration, so each selector in the list has to be
 * credited separately or half the overrides go missing.
 */
function typeStyles(css) {
  const rule = /((?:\.t-[a-z0-9-]+\s*,\s*)*\.t-[a-z0-9-]+)\s*\{([^}]*)\}/g;
  const styles = new Map();

  for (const match of withoutMedia(css).matchAll(rule)) {
    const decls = declarations(match[2]);
    if (!decls["font-size"]) continue;
    for (const selector of match[1].split(",")) {
      const name = selector.trim().slice(1);
      styles.set(name, {
        name,
        fontSize: decls["font-size"] ?? "",
        lineHeight: decls["line-height"] ?? "",
        letterSpacing: decls["letter-spacing"] ?? "",
        fontWeight: decls["font-weight"] ?? "",
      });
    }
  }

  for (const { query, body } of mediaBlocks(css)) {
    for (const match of body.matchAll(rule)) {
      const decls = declarations(match[2]);
      const fontSize = decls["font-size"];
      const lineHeight = decls["line-height"];
      const letterSpacing = decls["letter-spacing"];
      if (!fontSize && !lineHeight && !letterSpacing) continue;

      for (const selector of match[1].split(",")) {
        const style = styles.get(selector.trim().slice(1));
        if (!style) continue;
        style.overrides ??= [];
        style.overrides.push({
          query: query.trim(),
          ...(fontSize ? { fontSize } : {}),
          ...(lineHeight ? { lineHeight } : {}),
          ...(letterSpacing ? { letterSpacing } : {}),
        });
      }
    }
  }

  return [...styles.values()];
}

/** `:root` custom properties, base declarations only. */
function rootTokens(css) {
  const tokens = {};
  for (const match of withoutMedia(css).matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const [prop, value] of Object.entries(declarations(match[1]))) {
      if (prop.startsWith("--")) tokens[prop] = value;
    }
  }
  return tokens;
}

const urls = await stylesheetUrls();
let combined = "";
for (const url of urls) {
  const res = await fetch(url, { headers: { "user-agent": "bdc-design-system-sync" } });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  combined += `\n${await res.text()}`;
}

const styles = typeStyles(combined);
if (styles.length === 0) {
  // Better to fail than to write an empty file: an empty parity page reads as
  // "no discrepancies" when it means "we could not look".
  console.error("No .t-* rules found in the live stylesheets. Refusing to write.");
  process.exit(1);
}

const payload = {
  fetchedFrom: PAGE,
  // Date only. A timestamp would rewrite this file on every run and produce a
  // diff that says nothing.
  fetchedOn: new Date().toISOString().slice(0, 10),
  stylesheets: urls.map((url) => url.replace(ORIGIN, "")),
  // Sorted so the output is deterministic and two people syncing agree.
  tokens: Object.fromEntries(Object.entries(rootTokens(combined)).sort()),
  styles: styles.sort((a, b) => a.name.localeCompare(b.name)),
};

writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  `Recorded ${styles.length} text styles and ${Object.keys(payload.tokens).length} tokens from ${PAGE}`,
);
