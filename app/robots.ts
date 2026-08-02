/**
 * robots.txt.
 *
 * Staging disallows everything: it serves near-identical content to the public
 * site, so left crawlable it competes with the real thing for the same
 * queries. It also does not advertise the sitemap — a host that has just said
 * "do not crawl me" listing its URLs is an invitation, not a rule.
 *
 * WHAT THIS FILE CANNOT DO: unblock AI crawlers. Cloudflare injects a managed
 * robots.txt declaring agent-specific groups —
 *
 *     User-agent: GPTBot
 *     Disallow: /
 *
 * — and by the robots.txt spec the most specific matching group wins, so a
 * `User-agent: *` group here loses to it however permissive it is. ClaudeBot,
 * GPTBot, Google-Extended, CCBot, Amazonbot, Applebot-Extended, Bytespider and
 * meta-externalagent are blocked in the Cloudflare dashboard (AI Crawl
 * Control) and can only be unblocked there. Nothing in this repo will do it.
 *
 * Cloudflare also owns the `Content-Signal:` line, which states what AI systems
 * may do with the content. MetadataRoute.Robots has no field for it, so it
 * cannot be expressed here either.
 */
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { IS_PRODUCTION_SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_SITE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
