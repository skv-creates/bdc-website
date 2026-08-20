import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every public page is prerendered and changes only when a new build deploys.
// Keep those build outputs in Workers Static Assets instead of asking the
// Worker to reconstruct them on every request. Besides being faster, this is
// what keeps the full Next server path away from Cloudflare's CPU limit.
//
// This cache is deliberately read-only: it is suitable only while the site has
// no ISR or on-demand revalidation. If that changes, replace it with R2 (and
// the matching bindings) rather than silently accepting failed cache writes.
// Request-time endpoints such as the partnership form have no prerender entry
// and continue through the Worker normally.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
