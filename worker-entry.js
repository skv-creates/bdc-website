/**
 * Worker entry: the OpenNext worker, with one addition — `/_next/image`
 * responses go through Cloudflare's edge cache.
 *
 * OpenNext's image handler transforms on every request: the Worker is
 * invoked, calls the Images binding, and streams the result, ~400ms per
 * image measured from Sofia — while the static assets next to it serve
 * in ~30ms as edge HITs. The handler already stamps the responses
 * `public, max-age=…, immutable`; it just never puts them anywhere. This
 * wrapper does: look in `caches.default` first, hand misses to OpenNext,
 * and store what comes back.
 *
 * The cache key must carry content negotiation, because one URL serves
 * WebP to browsers and the original encoding to clients that don't accept
 * it (the Cache API does not honour `Vary`). The negotiated format is
 * folded into a synthetic key URL instead — same policy the handler
 * itself applies when it picks the output format from `Accept`.
 *
 * Deploys don't invalidate this cache, which is exactly the contract the
 * `immutable` header already claims: a transform's URL names the source
 * file, and replacing a picture means adding a file under a new name (the
 * event sync writes slug-numbered files), not editing bytes in place.
 */
import handler from "./.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/_next/image" && request.method === "GET") {
      const accept = request.headers.get("accept") ?? "";
      const format = accept.includes("image/webp") ? "webp" : "orig";
      const keyURL = new URL(url);
      keyURL.searchParams.set("__fmt", format);
      const cacheKey = new Request(keyURL, { method: "GET" });

      const cache = caches.default;
      const hit = await cache.match(cacheKey);
      if (hit) return hit;

      const response = await handler.fetch(request, env, ctx);
      if (response.ok && response.headers.get("cache-control")?.includes("immutable")) {
        // Tee so the visitor's copy streams while a clone is stored.
        const forCache = response.clone();
        ctx.waitUntil(cache.put(cacheKey, forCache));
      }
      return response;
    }
    return handler.fetch(request, env, ctx);
  },
};
