/**
 * Which site this is. Everything canonical hangs off it: the sitemap,
 * metadataBase, robots, JSON-LD @ids.
 *
 * Set in BOTH places, and both are needed:
 *
 * - `vars` in wrangler.jsonc, per environment. This is the one that actually
 *   decides what a visitor sees. Despite every page being statically
 *   prerenderable, OpenNext ships no HTML — there is not one .html file in
 *   .open-next — so pages are rendered on demand inside the Worker and this is
 *   read per request. @opennextjs/cloudflare copies Worker vars into
 *   process.env on each request (populateProcessEnv, in its init template).
 *   `vars` are not inherited into a named environment, so production repeats
 *   its own.
 * - the npm deploy scripts, for `next build`. wrangler vars genuinely do not
 *   reach the build (getEnvFromPlatformProxy is used by deploy/preview/upload,
 *   never by build), so anything Next does evaluate at build time needs it
 *   there.
 *
 * Getting this wrong is not subtle in effect but is invisible in review: with
 * only the build-time half set, production served staging canonicals and a
 * noindex tag, and looked fine in every local check.
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
