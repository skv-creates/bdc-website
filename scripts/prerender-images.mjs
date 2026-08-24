/**
 * Pre-render every image variant at build time, as static WebP files.
 *
 * Why this exists: the runtime image route (/_next/image) transforms on
 * demand, and its edge cache is per-datacentre. Warming it from Sofia
 * makes Sofia fast and nowhere else — a visitor (or a Google reviewer)
 * arriving through a US colo pays ~0.5–0.9s per image, every image, and
 * the site reads as slow no matter what the Worker's own numbers say.
 * Static assets have no such cliff: they serve fast from every location.
 *
 * So the build renders every (image × width × quality) the pages can ask
 * for into public/_img/, and lib/image-loader.ts points next/image at
 * those files instead of /_next/image. WebP only — every browser and
 * crawler that matters has read it for years, and it is what the runtime
 * route served browsers anyway.
 *
 * The variant grid must match next.config.ts (deviceSizes + imageSizes ×
 * qualities) and the loader's URL scheme exactly: loader asks for
 * `/_img/<path>.w<width>.q<quality>.webp`, so every such URL must exist.
 * Widths above the source's own are rendered at source width (never
 * upscaled) but still written under the requested name, so no URL 404s.
 *
 * Output is gitignored (generated, ~tens of MB); a mtime-keyed cache in
 * .image-cache/ makes rebuilds incremental — only new or changed source
 * files re-encode.
 */
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const OUT = join(PUBLIC, "_img");
const CACHE = join(ROOT, ".image-cache");

// Must mirror next.config.ts images.deviceSizes/imageSizes and qualities.
const WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1280, 1920];
const QUALITIES = [75, 80];
const SOURCES = /\.(jpe?g|png|webp)$/i;

/** Every raster image under public/, except our own output. */
function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (p === OUT || entry.name === "bdc-storybook") continue;
      yield* walk(p);
    } else if (SOURCES.test(entry.name)) {
      yield p;
    }
  }
}

const started = Date.now();
let rendered = 0;
let reused = 0;

for (const file of walk(PUBLIC)) {
  const rel = relative(PUBLIC, file); // e.g. figma/team/radina-doneva.png
  const stat = statSync(file);
  // One cache entry per source file covers all its variants: the key
  // folds in path, mtime, size and the variant grid itself.
  const key = createHash("sha1")
    .update(JSON.stringify([rel, stat.mtimeMs, stat.size, WIDTHS, QUALITIES]))
    .digest("hex");
  const cacheDir = join(CACHE, key);
  const outDir = join(OUT, dirname(rel));
  mkdirSync(outDir, { recursive: true });

  if (existsSync(cacheDir)) {
    cpSync(cacheDir, outDir, { recursive: true });
    reused += 1;
    continue;
  }

  const src = sharp(file, { limitInputPixels: false });
  const { width: srcWidth } = await src.metadata();
  mkdirSync(cacheDir, { recursive: true });
  const base = rel.split("/").pop();

  for (const w of WIDTHS) {
    for (const q of QUALITIES) {
      const name = `${base}.w${w}.q${q}.webp`;
      await src
        .clone()
        .resize({ width: Math.min(w, srcWidth ?? w), withoutEnlargement: true })
        .webp({ quality: q })
        .toFile(join(cacheDir, name));
      rendered += 1;
    }
  }
  cpSync(cacheDir, outDir, { recursive: true });
}

// Drop cache entries whose source is gone or changed (their key no longer
// gets touched) so the cache does not grow without bound.
if (existsSync(CACHE)) {
  const live = new Set();
  for (const file of walk(PUBLIC)) {
    const stat = statSync(file);
    live.add(
      createHash("sha1")
        .update(JSON.stringify([relative(PUBLIC, file), stat.mtimeMs, stat.size, WIDTHS, QUALITIES]))
        .digest("hex"),
    );
  }
  for (const entry of readdirSync(CACHE)) {
    if (!live.has(entry)) rmSync(join(CACHE, entry), { recursive: true, force: true });
  }
}

console.log(
  `prerender-images: ${rendered} variants rendered, ${reused} sources reused from cache, ${Math.round((Date.now() - started) / 1000)}s`,
);
