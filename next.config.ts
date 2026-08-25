import type { NextConfig } from "next";

import { PRODUCTION_ORIGIN } from "./lib/site";

/**
 * Is this build the public site? Read from the same env var, and compared
 * against the same constant, as `IS_PRODUCTION_SITE` in lib/site.ts — the
 * render-time gate and this build-time one must never disagree about which
 * site is being built.
 */
const IS_PRODUCTION_BUILD = process.env.SITE_ORIGIN === PRODUCTION_ORIGIN;

const nextConfig: NextConfig = {
  /**
   * `/privacy` is canonical. Preserve previously shared `/policy` links as
   * permanent redirects rather than turning them into 404s.
   */
  /**
   * The bare root SERVES the Bulgarian homepage — a rewrite, not a redirect.
   *
   * It used to 308 to /bg, which was correct plumbing and a real liability:
   * the URL a person types, shares, and submits to a review form answered
   * with an empty redirect instead of a website. Ad Grants reviews fetch
   * exactly that URL. Now / renders the same prerendered page as /bg; the
   * page's own metadata already declares /bg canonical with hreflang
   * alternates, so search engines keep one address for it. A visitor who
   * prefers English is one click away, and every internal link still says
   * /bg or /en explicitly.
   */
  async rewrites() {
    return [{ source: "/", destination: "/bg" }];
  },
  async redirects() {
    return [
      {
        source: "/:locale(bg|en)/policy",
        destination: "/:locale/privacy",
        permanent: true,
      },
      { source: "/policy", destination: "/bg/privacy", permanent: true },
      { source: "/privacy", destination: "/bg/privacy", permanent: true },
    ];
  },
  /**
   * Keep the staging-only dev tools out of the production bundle entirely.
   *
   * `!IS_PRODUCTION_SITE` in app/[locale]/layout.tsx stops Redlines and
   * EditMode rendering on the apex, and that is what makes them unreachable.
   * It does not stop them being *bundled*: a `next/dynamic` import is still a
   * static edge in the module graph, and Turbopack put both components in a
   * shared client chunk that the apex then loaded on the home page and on every
   * event page. The comments in those files asserted the opposite for months.
   *
   * Aliasing the two specifiers to a stub that exports `() => null` removes the
   * real modules from the production graph, so there is no chunk to request.
   * Staging builds — any SITE_ORIGIN that is not the apex — resolve normally and
   * keep both tools.
   *
   * Verified by scripts/assert-no-dev-tools.mjs, which runs between the
   * production build and the production deploy.
   */
  ...(IS_PRODUCTION_BUILD
    ? {
        turbopack: {
          resolveAlias: {
            "@/components/dev/Redlines": "./components/dev/DevToolsStub.tsx",
            "@/components/dev/EditMode": "./components/dev/DevToolsStub.tsx",
          },
        },
      }
    : {}),
  /**
   * Image optimisation runs through Cloudflare's IMAGES binding (see the
   * `images` block in wrangler.jsonc), not on a build server — every distinct
   * width/quality/format combination is a transform done in the request path.
   * So the settings here are a cost decision as much as a quality one.
   */
  images: {
    /**
     * Build-time variants, not request-time transforms. The runtime
     * /_next/image route's edge cache is per-datacentre — warm in Sofia,
     * cold (0.5–0.9s per image) everywhere else, which is what a visitor
     * or reviewer abroad experienced as "the site is slow". The loader
     * maps every request onto files scripts/prerender-images.mjs rendered
     * into public/_img/, which serve fast from every location. The
     * deviceSizes/qualities lists below are the grid that script renders
     * — keep them in step.
     */
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    /**
     * Next 16 changed the default to `[75]` and — importantly — *coerces* any
     * higher `quality` prop down to the nearest allowed value rather than
     * erroring. So without this every photograph on the site was re-encoded at
     * 75 whatever the source was and whatever the component asked for, which is
     * what the softness on the full-bleed heroes was.
     *
     * 75 stays in the list because it is the right default for the small stuff
     * — avatars, card thumbnails — where nobody looks closely and the bytes
     * matter more. 80 is what the photographs use.
     *
     * They used 90 until it was actually compared. Rendered at the widths the
     * site serves and viewed at 1:1, 90 and 80 are indistinguishable on both
     * the demanding cases: a carousel slide with type projected in it, and a
     * portrait with skin tones over a flat ground where banding would show
     * first. 90 costs roughly double — a slide 378KB against 186KB, a portrait
     * 67KB against 39KB — for a difference nobody can see. Compare before
     * raising it again rather than assuming higher is better.
     */
    qualities: [75, 80],
    /**
     * The default list ends at 3840, and with `sizes="…80vw"` on the heroes
     * that is the width a wide desktop asks for. Every source photograph on
     * this site is 2400px or narrower, so those requests were asking the
     * binding to *upscale* — roughly 8.6 megapixels of transform to invent
     * detail that is not in the file. Capping at 2560 covers the widest frame
     * on the site (~1400 CSS px) at better than 1.8x, and never asks for more
     * pixels than the original actually has.
     *
     * 1280 exists because of the gap it closes. Next serves the first size at
     * or above what a slot needs, and the initiative cover sits in a 624px
     * slot — 1248 device pixels at dpr 2, six pixels past 1200. So it fell
     * through to 1920 and every visitor downloaded 317KB where 151KB shows the
     * same picture at the same quality. A step list is only as good as its
     * worst gap; check any new fixed-width slot lands just above a step rather
     * than just below one.
     */
    // 2560 is gone: no source image on the site exceeds 2400px, so that tier
    // only ever upscaled — and it was the fallback `src` every crawler fetched,
    // 11 Worker-resized requests per page.
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1920],
    /**
     * WebP only, which is Next's default. AVIF encodes smaller but costs
     * materially more per transform, and this is a shared image binding in the
     * request path — the bytes it saves are not worth spending the ceiling on.
     * Revisit if the heroes ever need it, and watch the transform count.
     */
    formats: ["image/webp"],
  },
};

export default nextConfig;
