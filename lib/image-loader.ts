/**
 * next/image loader for the build-time variants.
 *
 * scripts/prerender-images.mjs renders every local image into
 * public/_img/<path>.w<width>.q<quality>.webp at build time; this loader
 * maps next/image's (src, width, quality) onto those files. Static
 * assets serve fast from every Cloudflare location — unlike the runtime
 * /_next/image route, whose per-datacentre cache made the site fast only
 * where it had already been warmed (Sofia) and slow everywhere else,
 * including wherever Google reviews from.
 *
 * Width and quality must land on the grid the script rendered
 * (next.config.ts deviceSizes/imageSizes and qualities) — next/image
 * only ever asks for configured values, so this is a mapping, not a
 * negotiation. Anything remote (http…) passes through untouched.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Remote URLs and SVGs pass through: SVG scales natively and would only
  // lose from rasterisation, and the script renders neither.
  if (/^https?:\/\//.test(src) || /\.svg$/i.test(src)) return src;
  return `/_img${src}.w${width}.q${quality ?? 75}.webp`;
}
