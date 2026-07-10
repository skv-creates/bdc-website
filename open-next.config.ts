import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// The site has no ISR, route handlers, or server-side `fetch`, so no
// incremental cache override is needed. Add `incrementalCache` (and the
// matching R2 bucket in wrangler.jsonc) if a route ever starts revalidating.
export default defineCloudflareConfig({});
