/**
 * Which site this build is. Everything canonical hangs off it: the sitemap,
 * metadataBase, robots, JSON-LD @ids.
 *
 * Read at BUILD time, deliberately. Every page here is prerendered, so by the
 * time a request reaches the Worker the HTML — canonical tags and all — has
 * already been written. `getCloudflareContext().env` would be too late.
 *
 * It also cannot come from `vars` in wrangler.jsonc, which is the obvious place
 * to look: `opennextjs-cloudflare build` never passes those to `next build`
 * (getEnvFromPlatformProxy is used by deploy/preview/upload, not build). A var
 * there would look correct and silently do nothing — so the value is set on the
 * npm script instead, on the same line as the wrangler env it belongs with.
 */

export const PRODUCTION_ORIGIN = "https://bulgariandesigncouncil.org";
export const STAGING_ORIGIN = "https://staging.bulgariandesigncouncil.org";

/**
 * The origin this build will be served from.
 *
 * Defaults to staging, never production. Staging deploys on every push to main
 * and production only from a manual workflow, so the failure modes are not
 * symmetrical: a forgotten variable on staging would quietly publish a second
 * indexable copy of the whole site competing with the real one, while the same
 * mistake on production makes it noindex — obvious within minutes and one
 * commit to undo. Fail towards the loud mistake.
 */
export const SITE_ORIGIN =
  process.env.SITE_ORIGIN ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : STAGING_ORIGIN);

/**
 * Whether this build is the public site.
 *
 * Drives robots.txt and the noindex meta. Compares against the production
 * origin rather than checking for "not staging", so any unrecognised value —
 * a preview, a typo — is treated as not-production and stays out of the index.
 */
export const IS_PRODUCTION_SITE = SITE_ORIGIN === PRODUCTION_ORIGIN;
