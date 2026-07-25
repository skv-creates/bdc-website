/**
 * Pulls team bios from the "Екип" tab of the Notion "Website CMS: Съдържание"
 * database into lib/team-bios.generated.json, which home-content.ts merges onto
 * the member lists by slug.
 *
 * Build-time only — the site ships static, so no Notion token ever reaches the
 * Cloudflare Worker and a Notion outage can't take the team section down.
 *
 *   node scripts/sync-team-bios.mjs [--dry]
 *
 * Reads NOTION_TOKEN and NOTION_TEAM_DATA_SOURCE_ID from .env.local.
 *
 * Only rows marked "Готово за публикуване" are pulled; anything still in
 * Backlog / Да се добави / Чернова stays off the site until an editor promotes
 * it. Rows are matched to members by slug (see slugify) — NOT by name, so
 * renaming a person in Notion or in the content file can't silently orphan
 * their bio.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "team-bios.generated.json");
const PUBLISHED = "Готово за публикуване";
const NOTION_VERSION = "2025-09-03";

/** Minimal .env.local reader — avoids a dependency for two variables. */
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

/**
 * "Stefi Peykova-Krishnan" -> "stefi-peykova-krishnan".
 * Matches the photo filenames already used in home-content.ts, which is what
 * makes the two sides line up without an extra Slug column in Notion.
 */
const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Notion rich_text/title arrays -> plain string. */
const plain = (prop) => {
  if (!prop) return "";
  const parts = prop.type === "title" ? prop.title : prop.rich_text;
  return (parts ?? []).map((t) => t.plain_text).join("").trim();
};

async function queryAll(dataSourceId, token) {
  const rows = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: cursor,
        filter: { property: "Статус", select: { equals: PUBLISHED } },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        res.status === 404
          ? `404 from Notion. The data source id may be wrong, or the integration was never ` +
            `connected to the database (Notion: ⋯ → Connections → your integration).\n${body}`
          : `Notion API ${res.status}: ${body}`,
      );
    }
    const page = await res.json();
    rows.push(...page.results);
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return rows;
}

loadEnv();
const token = process.env.NOTION_TOKEN;
const dataSourceId = process.env.NOTION_TEAM_DATA_SOURCE_ID;
if (!token || !dataSourceId) {
  console.error(
    "Missing NOTION_TOKEN and/or NOTION_TEAM_DATA_SOURCE_ID.\n" +
      "Add them to .env.local — see the Notion section of README/AGENTS notes.",
  );
  process.exit(1);
}

const rows = await queryAll(dataSourceId, token);
const bios = {};
const skipped = [];

for (const row of rows) {
  const p = row.properties;
  const nameBg = plain(p["Име и фамилия"]);
  const nameEn = plain(p["Name (EN)"]);
  // The Екип tab contains a blank row; skip anything without a name rather than
  // emitting an entry keyed off "".
  if (!nameBg && !nameEn) continue;
  if (!nameEn) {
    skipped.push(`${nameBg} — no "Name (EN)", cannot derive a slug`);
    continue;
  }

  const bioBg = plain(p["Био (BGN)"]);
  const bioEn = plain(p["Bio (EN)"]);
  if (!bioBg && !bioEn) {
    skipped.push(`${nameBg} — published but both bio fields are empty`);
    continue;
  }
  if (!bioBg || !bioEn) {
    // Half-translated rows are a real risk here: the site would fall back to the
    // placeholder in one locale only, which reads like a bug rather than a gap.
    skipped.push(`${nameBg} — bio present in only one language (bg:${!!bioBg} en:${!!bioEn})`);
  }

  bios[slugify(nameEn)] = {
    bg: { name: nameBg, role: plain(p["Позиция"]), bio: bioBg },
    en: { name: nameEn, role: plain(p["Position (EN)"]), bio: bioEn },
  };
}

const sorted = Object.fromEntries(Object.entries(bios).sort(([a], [b]) => a.localeCompare(b)));
const json = `${JSON.stringify(sorted, null, 2)}\n`;

if (process.argv.includes("--dry")) {
  console.log(json);
} else {
  writeFileSync(OUT, json);
}

console.log(
  `${Object.keys(sorted).length} published bio(s) -> lib/team-bios.generated.json\n` +
    Object.keys(sorted)
      .map((s) => `  ✓ ${s}`)
      .join("\n"),
);
if (skipped.length) console.log(`\nNot written:\n${skipped.map((s) => `  ! ${s}`).join("\n")}`);
