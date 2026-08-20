import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// The site has no ISR or revalidated data, so no incremental cache override is
// needed. Its route handlers are either static files/redirects or deliberately
// request-time endpoints; the partner endpoint's Resend fetch is not cacheable.
// Add `incrementalCache` (and the matching R2 bucket in wrangler.jsonc) if a
// page ever starts revalidating.
export default defineCloudflareConfig({});
