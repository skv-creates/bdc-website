import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Image optimisation runs through Cloudflare's IMAGES binding (see the
   * `images` block in wrangler.jsonc), not on a build server — every distinct
   * width/quality/format combination is a transform done in the request path.
   * So the settings here are a cost decision as much as a quality one.
   */
  images: {
    /**
     * Next 16 changed the default to `[75]` and — importantly — *coerces* any
     * higher `quality` prop down to the nearest allowed value rather than
     * erroring. So without this every photograph on the site was re-encoded at
     * 75 whatever the source was and whatever the component asked for, which is
     * what the softness on the full-bleed heroes was.
     *
     * 75 stays in the list because it is the right default for the small stuff
     * — avatars, card thumbnails — where nobody looks closely and the bytes
     * matter more. 90 is for the images that run the width of the page.
     */
    qualities: [75, 90],
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1920, 2560],
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
