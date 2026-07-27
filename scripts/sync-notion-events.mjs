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
 * "Чернова / Да се преработи". Change the secret, not this file, when the
 * editors move to a different column.
 *
 * Output is deterministic: rows sorted newest first, object keys written in a
 * fixed order. Two people (or a person and the scheduled job) syncing the same
 * Notion state produce byte-identical files, which is what lets the workflow
 * decide "nothing changed, don't commit".
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "events.generated.json");
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
const STATUS = process.env.NOTION_EVENTS_STATUS || "Чернова / Да се преработи";
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
const prop = (page, name) => page.properties?.[name];
const text = (page, name) => plain(prop(page, name)?.rich_text) || plain(prop(page, name)?.title);
const select = (page, name) => prop(page, name)?.select?.name ?? "";

/**
 * Cyrillic → Latin, so a Bulgarian-only title still produces a readable ASCII
 * slug. Slugs are the URL and are meant to be permanent, but Събития has no
 * Slug column — so renaming an event in Notion DOES change its URL. Add a Slug
 * column to that tab and read it here if that ever matters.
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

const rows = (await allRows()).filter((r) => select(r, "Статус") === STATUS);

const events = rows
  .map((row) => {
    const nameBg = text(row, "Събитие");
    const nameEn = text(row, "Title (EN)") || nameBg;
    const descBg = text(row, "Описание");
    const date = prop(row, "Дата")?.date?.start?.slice(0, 10) ?? "";
    return {
      slug: slugify(nameEn) || slugify(nameBg) || row.id.replace(/-/g, "").slice(0, 12),
      date,
      type: FORMAT[select(row, "Формат")] ?? "live",
      location: text(row, "Локация"),
      name: { bg: nameBg, en: nameEn },
      description: { bg: descBg, en: text(row, "Description (EN)") || descBg },
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
