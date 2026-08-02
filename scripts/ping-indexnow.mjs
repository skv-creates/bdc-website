/**
 * Submit every URL in the sitemap to IndexNow.
 *
 *   node scripts/ping-indexnow.mjs [--dry]
 *
 * Runs after a production deploy, so Bing, Yandex, Seznam and Naver are told a
 * page changed rather than finding out whenever they next crawl. Google does
 * not participate in IndexNow and retired its sitemap ping in 2023 — the only
 * way to nudge Google is Search Console, by hand, once.
 *
 * It reads the deployed sitemap rather than rebuilding the URL list, so it
 * cannot drift from what was actually published, and it submits only to the
 * production origin: announcing staging URLs would be asking search engines to
 * index the copy we spent effort keeping out of the index.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Read the key out of lib/indexnow.ts rather than importing it. Node can strip
 * the types, but warns about it on every run, and this is one string. The
 * point is that the key still has exactly one definition — the route that
 * proves ownership imports that same file.
 */
const INDEXNOW_KEY = readFileSync(join(ROOT, "lib", "indexnow.ts"), "utf8").match(
  /INDEXNOW_KEY\s*=\s*"([a-f0-9]+)"/,
)?.[1];

if (!INDEXNOW_KEY) {
  console.error("Could not read INDEXNOW_KEY from lib/indexnow.ts.");
  process.exit(1);
}

const ORIGIN = "https://bulgariandesigncouncil.org";
const HOST = new URL(ORIGIN).host;
const DRY = process.argv.includes("--dry");

const res = await fetch(`${ORIGIN}/sitemap.xml`, { headers: { "user-agent": "bdc-indexnow" } });
if (!res.ok) {
  console.error(`Could not read ${ORIGIN}/sitemap.xml — ${res.status}. Nothing submitted.`);
  process.exit(1);
}

// <loc> only. The xhtml:link alternates are the same pages in the other
// language and are already listed in their own <url> entries; submitting them
// twice is just noise.
const urls = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (urls.length === 0) {
  console.error("Sitemap parsed but contained no URLs. Nothing submitted.");
  process.exit(1);
}

console.log(`${urls.length} URLs from ${ORIGIN}/sitemap.xml`);
if (DRY) {
  for (const u of urls) console.log(`  ${u}`);
  process.exit(0);
}

const submit = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${ORIGIN}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  }),
});

// 200 accepted, 202 accepted but the key is still being verified. Anything else
// is worth seeing in the log, but it must not fail a deploy that already
// succeeded — the pages are live either way.
console.log(`IndexNow → ${submit.status} ${submit.statusText}`);
if (![200, 202].includes(submit.status)) {
  console.warn(await submit.text());
  console.warn("Submission was rejected. The site is deployed; only the ping failed.");
}
