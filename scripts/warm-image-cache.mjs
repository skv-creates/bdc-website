/**
 * Warm the edge cache for every image transform the site can serve.
 *
 * The Worker's /_next/image responses are edge-cached (see worker-entry.js),
 * but each (url, width, quality, format) variant starts life cold: the first
 * request pays the Images-binding transform, ~0.5s. On a site where covers
 * crossfade and portraits reveal on hover, a visitor who arrives before the
 * cache is warm sees exactly that half-second as broken-feeling images.
 *
 * So after every deploy this crawls the sitemap, collects every /_next/image
 * URL the pages actually emit — src and every srcSet width — and fetches
 * each twice: once as a browser (Accept: image/webp) and once plain, the two
 * cache keys the wrapper stores. Transforms already cached return in ~40ms,
 * so re-running is nearly free.
 *
 * The cache is per-colo: warming from here warms the data centre our
 * visitors actually hit. Run with SITE_ORIGIN to point elsewhere:
 *
 *     SITE_ORIGIN=https://staging.bulgariandesigncouncil.org node scripts/warm-image-cache.mjs
 */

const origin = process.env.SITE_ORIGIN ?? "https://bulgariandesigncouncil.org";

const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (pages.length === 0) {
  console.error(`warm-image-cache: no pages found in ${origin}/sitemap.xml`);
  process.exit(1);
}

const variants = new Set();
for (const page of pages) {
  const html = await (await fetch(page)).text();
  // src="..." and every URL inside srcSet="url w, url w, ..."
  for (const m of html.matchAll(/(?:src|srcSet)="([^"]+)"/gi)) {
    for (const part of m[1].split(",")) {
      const url = part.trim().split(/\s+/)[0].replace(/&amp;/g, "&");
      if (url.startsWith("/_next/image?")) variants.add(url);
    }
  }
}

console.log(`warm-image-cache: ${variants.size} variants from ${pages.length} pages on ${origin}`);

let warmed = 0;
let failed = 0;
const started = Date.now();
const queue = [...variants].flatMap((v) => [
  { v, headers: { Accept: "image/webp,image/*;q=0.8" } },
  { v, headers: {} },
]);

// A handful at a time — enough to finish fast, few enough to stay polite.
const CONCURRENCY = 6;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const { v, headers } = queue.pop();
      try {
        const res = await fetch(origin + v, { headers });
        // Drain so the connection is reusable and the cache write completes.
        await res.arrayBuffer();
        if (res.ok) warmed += 1;
        else {
          failed += 1;
          console.error(`  ${res.status} ${v}`);
        }
      } catch (e) {
        failed += 1;
        console.error(`  fetch failed ${v}: ${e.message}`);
      }
    }
  }),
);

console.log(
  `warm-image-cache: ${warmed} fetches warm, ${failed} failed, ${Math.round((Date.now() - started) / 1000)}s`,
);
process.exit(failed > 0 ? 1 : 0);
