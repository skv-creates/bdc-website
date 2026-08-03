/**
 * Pulls events from the "Събития" tab of the Notion "Website CMS: Съдържание"
 * database into lib/events.generated.json, which lib/events.ts reads.
 *
 *   node scripts/sync-notion-events.mjs [--dry]
 *
 * Reads NOTION_TOKEN and NOTION_EVENTS_DATA_SOURCE_ID from .env.local, or from
 * the ambient environment when it runs in CI (see
 * .github/workflows/sync-events.yml, which runs this every 8 hours on main).
 *
 * Only rows whose Статус matches NOTION_EVENTS_STATUS are pulled — default
 * "Готово за публикуване". Change the variable, not this file, when the
 * editors move to a different column.
 *
 * Output is deterministic: rows sorted newest first, object keys written in a
 * fixed order. Two people (or a person and the scheduled job) syncing the same
 * Notion state produce byte-identical files, which is what lets the workflow
 * decide "nothing changed, don't commit".
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
// Already in the tree — next uses it for image optimisation — so this costs no
// new dependency. Without it the originals would be committed as they arrive:
// 36-42MB PNGs straight off a camera.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "events.generated.json");
/** Gallery images are committed next to the JSON they are referenced from. */
const IMG_DIR = join(ROOT, "public", "figma", "events");
const NOTION_VERSION = "2025-09-03";
const DRY = process.argv.includes("--dry");

/** Notion's "Формат" select → the type keys in lib/events.ts. */
const FORMAT = {
  "На живо": "live",
  Онлайн: "online",
  Хибридно: "hybrid",
};

/** Minimal .env.local reader — avoids a dependency for three variables. */
function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local — fall back to the ambient environment (CI).
  }
}

loadEnv();
const TOKEN = process.env.NOTION_TOKEN;
const SOURCE = process.env.NOTION_EVENTS_DATA_SOURCE_ID;
const STATUS = process.env.NOTION_EVENTS_STATUS || "Готово за публикуване";
if (!TOKEN || !SOURCE) {
  console.error(
    "Missing NOTION_TOKEN or NOTION_EVENTS_DATA_SOURCE_ID.\n" +
      "Locally: copy .env.example to .env.local and paste your own integration secret.",
  );
  process.exit(1);
}

const api = async (path, init = {}) => {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Notion ${path} → ${res.status} ${await res.text()}`);
  return res.json();
};

const plain = (rich) => (rich ?? []).map((r) => r.plain_text).join("").trim();

/**
 * Rich text with its links kept, as `[label](href)`.
 *
 * `plain` throws hrefs away, which silently turned every linked organisation,
 * festival and talk in the event bodies into dead text on the site. Markdown
 * rather than HTML because the JSON stays plain data — the overlay parses this
 * one pattern, and the FAQ sync already uses the same convention.
 *
 * Adjacent runs sharing an href are joined first: Notion splits a link the
 * moment part of it is bolded, which would otherwise emit the same URL two or
 * three times in a row mid-sentence.
 */
/** Drop share/campaign parameters, leaving the rest of the query intact. */
const TRACKING = /^(si|utm_[a-z_]+|fbclid|gclid|igshid|mc_[ce]id|_hsenc|_hsmi)$/i;

function stripTracking(href) {
  try {
    const u = new URL(href);
    const hits = [...u.searchParams.keys()].filter((k) => TRACKING.test(k));
    // Return the original string untouched when there was nothing to strip.
    // Round-tripping through URL normalises as a side effect — it appends a
    // trailing slash to a bare domain, for one — which would rewrite every
    // link in the file the next time anyone syncs, for no reason.
    if (hits.length === 0) return href;
    for (const k of hits) u.searchParams.delete(k);
    // Re-serialising drops a now-empty "?" as well, so a link that carried
    // nothing but tracking comes back clean rather than with a bare question
    // mark hanging off it.
    return u.toString();
  } catch {
    // Not parseable as a URL — leave it exactly as the editor wrote it rather
    // than risk mangling something this function does not understand.
    return href;
  }
}

function richText(rich) {
  const out = [];
  for (const r of rich ?? []) {
    const href = r.href ?? null;
    const last = out[out.length - 1];
    if (last && last.href === href) last.text += r.plain_text;
    else out.push({ text: r.plain_text, href });
  }
  return out
    .map(({ text, href }) => {
      if (!href) return text;
      // Links into the workspace resolve only for people who are already in it
      // — a visitor gets a login wall or a 404 — so on a public site they are
      // worse than no link at all. Both spellings have to go: Notion writes a
      // link picked from the picker as a relative "/<id>", but the same link
      // pasted as a URL arrives as https://app.notion.com/... or notion.so/...,
      // which the protocol check alone lets straight through.
      //
      // notion.site is deliberately NOT in here: that is Notion's public
      // publishing domain, where the volunteer form already lives, and those
      // pages work for anyone.
      if (!/^https?:\/\//.test(href)) return text;
      if (/^https?:\/\/([^/]+\.)?(notion\.so|notion\.com)\//.test(href)) {
        console.warn(`[events] dropping workspace link on "${text.trim()}" → ${href}`);
        return text;
      }
      // Share-tracking parameters, which arrive on anything copied out of a
      // "Share" dialog: YouTube's ?si= identifies the person who copied the
      // link, and utm_* follow the visitor to the destination. Neither belongs
      // in copy on a public page, and stripping them here keeps the JSON
      // identical however an editor happened to paste the URL.
      const clean = stripTracking(href);

      // Trailing spaces inside the label push the underline past the word.
      const label = text.replace(/\s+$/, "");
      return label ? `[${label}](${clean})${text.slice(label.length)}` : text;
    })
    .join("")
    .trim();
}
const prop = (page, name) => page.properties?.[name];
const text = (page, name) => plain(prop(page, name)?.rich_text) || plain(prop(page, name)?.title);
const select = (page, name) => prop(page, name)?.select?.name ?? "";

/**
 * Cyrillic → Latin, for the fallback slug only.
 *
 * The slug is the URL and is meant to be permanent, so it comes from the Slug
 * column first. That column exists because the titles are per-language — the
 * Bulgarian page shows the Bulgarian title, the English one the English title —
 * and a URL cannot follow either without moving whenever a translation is
 * edited. Two events proved it: renaming them to Bulgarian titles moved both
 * pages and 404'd every link already sent out.
 *
 * This is what a row with an empty Slug falls back to. Derived from the
 * Bulgarian name, never the English one: заглавията на английски се добавят
 * по-късно, and slugging the English would rewrite the URL of every event on
 * the day its translation lands.
 */
const CYR = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht", ъ: "a", ь: "", ю: "yu", я: "ya",
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => CYR[ch] ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Every row of the data source, following pagination. */
async function allRows() {
  const rows = [];
  let cursor;
  do {
    const body = { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) };
    const res = await api(`data_sources/${SOURCE}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    rows.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return rows;
}

/**
 * The page body, as plain paragraphs.
 *
 * The long description is written in the page itself, not in the Описание
 * property — that column holds a one-line summary at best and is empty on some
 * rows. Only top-level text blocks are read; the bodies are prose.
 */
async function bodyBlocks(pageId) {
  const out = [];
  let cursor;
  do {
    const qs = cursor ? `?start_cursor=${cursor}&page_size=100` : "?page_size=100";
    const res = await api(`blocks/${pageId}/children${qs}`);
    for (const b of res.results) {
      // Editors lay pictures out side by side, which wraps them in a
      // column_list. Those carry nothing themselves, so without descending
      // into them the images in the first row of the gallery are invisible to
      // this script while the ones below it are not — a confusing half-result.
      if (b.type === "column_list" || b.type === "column") {
        out.push(...(await bodyBlocks(b.id)));
        continue;
      }
      // Images: the URL Notion returns here is signed and short-lived, so it
      // is only useful long enough to download the bytes.
      if (b.type === "image") {
        const url = b.image.file?.url ?? b.image.external?.url;
        // The caption is the picture's alt text. Notion has no separate alt
        // field on an image block, and the caption is the one place an editor
        // can describe a photograph without leaving the page they are editing.
        if (url) out.push({ type: "image", text: "", url, caption: plain(b.image.caption) });
        continue;
      }
      // Bookmark / embed / video blocks carry no rich_text at all — they are a
      // bare URL — so reading only rich_text dropped the talk recordings at the
      // foot of a body without a trace. Caption first, URL as the fallback
      // label, so the row still says something if nobody wrote one.
      if (b.type === "bookmark" || b.type === "embed" || b.type === "video") {
        const url = b[b.type].url ?? b[b.type].external?.url;
        if (!url) continue;
        const label = plain(b[b.type].caption) || url;
        out.push({ type: b.type, text: `[${label}](${url})` });
        continue;
      }
      const rich = b[b.type]?.rich_text;
      if (!rich) continue;
      out.push({ type: b.type, text: richText(rich) });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

/**
 * Split a body into its Bulgarian and English halves.
 *
 * The editors mark the English section with a heading — "Description (EN)" —
 * and everything above it is the Bulgarian. Older pages used a bare "EN:"
 * paragraph and a "BG:" one above it, so both are recognised and the markers
 * themselves are dropped. A page with no marker at all is treated as Bulgarian
 * only, which is what an untranslated event looks like.
 */
const EN_MARK = /^\s*(##\s*)?(description \(en\)|en)\s*:?\s*$/i;
const BG_MARK = /^\s*(##\s*)?(описание \(bg\)|bg)\s*:?\s*$/i;
/**
 * "Images to be used:" — the heading an editor puts above the pictures meant
 * for the gallery. Everything after it is images rather than prose, so the
 * description has to stop here; without it the heading itself lands in the
 * English copy as a stray final paragraph.
 */
const IMG_MARK = /^\s*(##\s*)?(images to be used|снимки)\s*:?\s*$/i;

/**
 * Read a picture's caption as alt text, in both languages.
 *
 * An editor writes one caption per image and marks the two languages inside
 * it, mirroring how the body is already split:
 *
 *     BG: Стефи Пейкова Кришнан на сцената на PechaKucha
 *     EN: Stefi Peykova Krishnan on stage at PechaKucha
 *
 * Either marker may be missing. A caption with no marker at all is used for
 * both languages, which is the right answer for a caption that is a name or a
 * place — those do not need translating and forcing an editor to write them
 * twice would only invite them to drift apart.
 *
 * An empty caption returns null rather than "", and that distinction matters:
 * null means nobody has described this picture yet, so the renderer decides
 * what to do. "" would claim the picture is decorative, which for a
 * photograph in a gallery is a statement, not a default.
 */
function captionAlt(caption) {
  const raw = (caption || "").trim();
  if (!raw) return null;

  const bg = raw.match(/(?:^|\n)\s*BG\s*:\s*(.+?)(?=\n\s*EN\s*:|$)/is)?.[1]?.trim();
  const en = raw.match(/(?:^|\n)\s*EN\s*:\s*(.+?)(?=\n\s*BG\s*:|$)/is)?.[1]?.trim();
  if (!bg && !en) return { bg: raw, en: raw };
  return { bg: bg || en, en: en || bg };
}

function splitBody(blocks) {
  const bg = [];
  const en = [];
  const images = [];
  let target = bg;
  for (const b of blocks) {
    if (b.type === "image") {
      // Only the ones under the heading. A picture sitting in the middle of
      // the prose is illustrating a paragraph, not queueing for the gallery.
      if (target === images) images.push({ url: b.url, alt: captionAlt(b.caption) });
      continue;
    }
    const t = b.text.trim();
    if (!t) continue;
    if (IMG_MARK.test(t)) { target = images; continue; }
    if (EN_MARK.test(t)) { target = en; continue; }
    if (BG_MARK.test(t)) { target = bg; continue; }
    if (target === images) continue; // captions and stray notes in that block
    target.push(t);
  }
  return { bg: bg.join("\n\n"), en: en.join("\n\n"), images };
}

/**
 * Download the gallery pictures into public/figma/events and return the paths
 * plus their proportions, in the order the editor arranged them.
 *
 * The URLs come from the "Images to be used:" section of the page body rather
 * than the Hero-image property: that section is where editors actually curate
 * what the gallery should show, and Notion hands out a real (if short-lived)
 * download URL for a block image, which the property never did.
 *
 * Everything is re-encoded to JPEG at 2400px. The originals are 36-42MB PNGs
 * straight off a camera; committed raw they would put well over a hundred
 * megabytes into a public repository, permanently, for pictures the site
 * serves at 540px tall.
 *
 * Named after the slug so re-syncing overwrites in place. Anything previously
 * written for this slug is cleared first: extensions change, and an event that
 * drops from six pictures to three would otherwise leave the tail behind.
 */
async function galleryImages(urls, slug) {
  if (urls.length === 0) return [];

  mkdirSync(IMG_DIR, { recursive: true });
  // Drop the extension and compare the rest exactly. Stripping a trailing
  // "-<n>" with a regex looks equivalent and is not: "pechakucha-night-sofia-42"
  // ends in -42, so that reading eats part of the slug and the file stops
  // matching its own event.
  const owned = (file) => {
    const base = file.replace(/\.[^.]+$/, "");
    return base === slug || new RegExp(`^${slug}-\\d+$`).test(base);
  };
  for (const stale of readdirSync(IMG_DIR)) {
    if (owned(stale)) rmSync(join(IMG_DIR, stale));
  }

  const out = [];
  for (const [i, { url, alt }] of urls.entries()) {
    const res = await fetch(url);
    if (!res.ok) {
      // A missing picture is not worth failing the sync over — the overlay
      // reads perfectly well without one, and the text is the point here.
      console.warn(`[events] could not download image ${i + 1} for "${slug}" (${res.status})`);
      continue;
    }

    const name = i === 0 ? `${slug}.jpg` : `${slug}-${i + 1}.jpg`;
    const info = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize({ width: 2400, withoutEnlargement: true })
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toFile(join(IMG_DIR, name));

    // `alt` is null when the Notion caption is empty. It is carried through as
    // null rather than dropped so the renderer can tell "nobody has described
    // this yet" from "this is decorative", and so a future check can list the
    // pictures still waiting on a caption.
    out.push({ src: `/figma/events/${name}`, width: info.width, height: info.height, alt });
  }
  return out;
}

/** Only reached when the Slug column is empty — see the note on slugify. */
function fallbackSlug(row, nameBg, nameEn) {
  const derived = slugify(nameBg) || slugify(nameEn) || row.id.replace(/-/g, "").slice(0, 12);
  console.warn(
    `[events] "${nameBg}" has no Slug — falling back to "${derived}". ` +
      `Fill the Slug column, or renaming this event will move its URL.`,
  );
  return derived;
}

const rows = (await allRows()).filter((r) => select(r, "Статус") === STATUS);

// Bodies are one request per row, so only the published rows are fetched.
const bodies = new Map(
  await Promise.all(rows.map(async (r) => [r.id, splitBody(await bodyBlocks(r.id))])),
);

const events = rows
  .map((row) => {
    const nameBg = text(row, "Събитие");
    const nameEn = text(row, "Title (EN)") || nameBg;
    // Body first, property second: the property is a summary, the body is the
    // description the editors actually write.
    const body = bodies.get(row.id) ?? { bg: "", en: "", images: [] };
    const descBg = body.bg || text(row, "Описание");
    const descEn = body.en || text(row, "Description (EN)");
    const date = prop(row, "Дата")?.date?.start?.slice(0, 10) ?? "";
    return {
      // Slug column first: it is the only thing here that is allowed to
      // decide a URL. The title-derived fallback is for a row nobody has
      // filled in yet, and it warns rather than doing it quietly.
      slug: text(row, "Slug") || fallbackSlug(row, nameBg, nameEn),
      date,
      type: FORMAT[select(row, "Формат")] ?? "live",
      location: text(row, "Локация"),
      name: { bg: nameBg, en: nameEn },
      description: { bg: descBg, en: descEn || descBg },
      // Carried alongside so the download pass below can reach them; stripped
      // again before the JSON is written.
      imageUrls: body.images,
    };
  })
  // Undated rows would sort unpredictably and render a blank date column.
  .filter((e) => {
    if (e.date) return true;
    console.warn(`[events] skipping "${e.name.bg}" — no Дата set in Notion`);
    return false;
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

if (events.length === 0) {
  // Writing an empty list would silently blank the section; lib/events.ts falls
  // back to its mock only when the file is empty, which is not what a bad sync
  // should look like. Fail instead and leave the committed JSON alone.
  console.error(`No rows with Статус = "${STATUS}". Leaving ${OUT} untouched.`);
  process.exit(1);
}

// After the empty-list guard: a failed sync should not have already rewritten
// the images on disk. Sequential rather than parallel — three or four downloads
// of a few megabytes each, and Notion rate-limits bursts.
for (const e of events) {
  const covers = DRY ? [] : await galleryImages(e.imageUrls, e.slug);
  delete e.imageUrls;
  if (covers.length) e.covers = covers;
}

const payload = {
  _comment:
    "Generated by `npm run sync:events` from the Събития tab of the Notion 'Website CMS: Съдържание' database. Do not hand-edit — re-run the sync.",
  events,
};

const json = `${JSON.stringify(payload, null, 2)}\n`;
if (DRY) {
  console.log(json);
} else {
  writeFileSync(OUT, json);
  console.log(`Wrote ${events.length} event(s) to ${OUT}`);
}
