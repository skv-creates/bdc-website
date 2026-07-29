/**
 * Pulls the home-page FAQ from the "Въпроси (FAQ)" tab of the Notion
 * "Website CMS: Съдържание" database into lib/faq.generated.json, which
 * home-content.ts merges over the hand-written groups.
 *
 * Build-time only — same arrangement as sync-team-bios.mjs, and for the same
 * reason: this repo is public, so no Notion token may reach CI or the Worker.
 * An editor runs this locally and commits the JSON.
 *
 *   node scripts/sync-notion-faq.mjs [--dry] [--publish]
 *
 * Reads NOTION_TOKEN and NOTION_FAQ_DATA_SOURCE_ID from .env.local.
 *
 * Only rows with Статус = "Готово за публикуване" are pulled. The answer is the
 * page BODY, not the "Отговор" property — the CMS reserves that column for a
 * short summary and the editors write the real answer in the page.
 *
 * --publish additionally flips each pulled row to "Публикуван". That needs an
 * integration with WRITE capability; the read-only token described in
 * .env.example cannot do it, which is deliberate. Run it only once the
 * regenerated JSON is actually committed and deployed, or Notion will claim
 * things are live that aren't.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "faq.generated.json");
const READY = "Готово за публикуване";
const PUBLISHED = "Публикуван";
const NOTION_VERSION = "2025-09-03";

const DRY = process.argv.includes("--dry");
const PUBLISH = process.argv.includes("--publish");

/** Minimal .env.local reader — avoids a dependency for two variables. */
function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local — fall back to the ambient environment.
  }
}

loadEnv();
const TOKEN = process.env.NOTION_TOKEN;
const SOURCE = process.env.NOTION_FAQ_DATA_SOURCE_ID;
if (!TOKEN || !SOURCE) {
  console.error(
    "Missing NOTION_TOKEN or NOTION_FAQ_DATA_SOURCE_ID.\n" +
      "Copy .env.example to .env.local and paste your own integration secret.",
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

/** Page body → FaqBlock[]. Paragraphs, bullet lists and standalone links. */
async function blocksOf(pageId) {
  const out = [];
  let cursor;
  let bullets = null;
  const flush = () => {
    if (bullets?.length) out.push({ ul: bullets });
    bullets = null;
  };
  do {
    const qs = new URLSearchParams({ page_size: "100", ...(cursor ? { start_cursor: cursor } : {}) });
    const res = await api(`blocks/${pageId}/children?${qs}`);
    for (const b of res.results) {
      if (b.type === "bulleted_list_item") {
        (bullets ??= []).push(plain(b.bulleted_list_item.rich_text));
        continue;
      }
      flush();
      if (b.type === "heading_2" || b.type === "heading_3") {
        out.push({ h: plain(b[b.type].rich_text) });
      } else if (b.type === "paragraph") {
        const rich = b.paragraph.rich_text;
        const body = plain(rich);
        if (!body) continue;
        // A paragraph that is nothing but a link becomes a link block, so the
        // URL survives into the site instead of being flattened to text.
        const linked = rich.filter((r) => r.href);
        if (linked.length === 1 && plain(linked) === body) {
          out.push({ link: { label: body, href: linked[0].href } });
        } else {
          out.push({ p: body });
        }
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  flush();
  return out;
}

const rows = (await allRows()).filter((r) => select(r, "Статус") === READY);
if (rows.length === 0) {
  console.error(`No rows with Статус = "${READY}". Nothing to write.`);
  process.exit(1);
}

/**
 * The English answer, as the same block shape the Bulgarian body produces.
 *
 * Notion gives the Bulgarian answer a rich page body but the English only a
 * plain-text property, so the structure is written into that text and read back
 * out here. Three forms, one per line:
 *
 *   - item            → a bullet, consecutive ones grouped into a single list
 *   [label](href)     → a link block, the same one the BG body emits
 *   anything else     → a paragraph
 *
 * Without this an English answer arrives as one flat paragraph and loses the
 * bulleted lists and the links to the statute and the membership form.
 */
function enBlocks(source) {
  const blocks = [];
  let bullets = null;
  const flush = () => {
    if (bullets?.length) blocks.push({ ul: bullets });
    bullets = null;
  };
  for (const raw of source.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^[-•]\s+(.*)$/);
    if (bullet) {
      (bullets ??= []).push(bullet[1].trim());
      continue;
    }
    flush();
    const link = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) blocks.push({ link: { label: link[1].trim(), href: link[2].trim() } });
    else blocks.push({ p: line });
  }
  flush();
  return blocks;
}

/**
 * Category names have no EN column in Notion. Rather than leave the English
 * site with Bulgarian section headings — which is what happened before — the
 * translation lives here, keyed by the Bulgarian label. An unmapped category
 * falls back to the Bulgarian, so adding one in Notion degrades rather than
 * breaks.
 */
const CATEGORY_EN = {
  "Мисия и дейност": "Mission and activity",
  "Структура и управление": "Structure and governance",
  "Партньорства": "Partnerships",
  "Членство": "Membership",
  "Финансиране": "Funding",
};

// Group by Категория, preserving the CMS's own ordering (Категория, then Ред).
const order = (r) => prop(r, "Ред")?.number ?? Number.MAX_SAFE_INTEGER;
rows.sort((a, b) => select(a, "Категория").localeCompare(select(b, "Категория")) || order(a) - order(b));

const byCategory = new Map();
for (const row of rows) {
  const category = select(row, "Категория") || "—";
  const bgBlocks = await blocksOf(row.id);
  const enQuestion = text(row, "Question (EN)");
  const enAnswer = text(row, "Answer (EN)");
  const item = {
    q: { bg: text(row, "Въпрос"), en: enQuestion || text(row, "Въпрос") },
    // "Answer (EN)" is a plain-text property, so its structure is written by
    // hand and parsed back here — see enBlocks. Empty falls back to the
    // Bulgarian blocks, which is what an untranslated question looks like.
    a: { bg: bgBlocks, en: enAnswer ? enBlocks(enAnswer) : bgBlocks },
  };
  if (!byCategory.has(category)) byCategory.set(category, []);
  byCategory.get(category).push(item);
}

const payload = {
  _comment:
    "Generated by `npm run sync:faq` from the 'Въпроси (FAQ)' tab of the Notion 'Website CMS: Съдържание' database. Do not hand-edit — re-run the sync.",
  groups: [...byCategory].map(([title, items]) => ({
    title: { bg: title, en: CATEGORY_EN[title] ?? title },
    items,
  })),
};

const json = `${JSON.stringify(payload, null, 2)}\n`;
if (DRY) {
  console.log(json);
} else {
  writeFileSync(OUT, json);
  console.log(`Wrote ${rows.length} question(s) to ${OUT}`);
}

if (PUBLISH && !DRY) {
  for (const row of rows) {
    await api(`pages/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: { "Статус": { select: { name: PUBLISHED } } } }),
    });
  }
  console.log(`Marked ${rows.length} row(s) as "${PUBLISHED}" in Notion.`);
}
