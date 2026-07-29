import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
     * AVIF ahead of WebP: at matching visual quality it lands roughly a quarter
     * smaller, which buys back most of what raising the quality costs. Next
     * negotiates per request and falls back to WebP and then to the original,
     * so a browser that cannot take AVIF is unaffected.
     */
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
