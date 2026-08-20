import "server-only";

/**
 * Writing event copy back to Notion.
 *
 * The read direction lives in scripts/sync-notion-events.mjs and runs only
 * when requested. This is the other half: what the Shift+E editor on staging
 * calls when someone saves. Notion stays the source of truth — an edit is not
 * considered saved until it is recorded here, and only then is it mirrored into
 * the staging draft store so the page can show it immediately.
 *
 * Two things drove the shape of this file.
 *
 * **Links have to survive.** A description reaches the browser as Notion's own
 * source — `[European Design Awards Festival](https://…)` — because that is
 * what the sync writes into the JSON and what EventOverlayContent parses back
 * into anchors. If a save posted that string to Notion as plain text, the next
 * sync would read literal square brackets and every link in the paragraph would
 * be gone. `toRichText` is what stops that happening.
 *
 * **Nothing is deleted that was not replaced.** Paragraphs are updated in
 * place where the counts line up, appended after the last one where the editor
 * added some, and archived only where they removed some. A save that touches
 * the Bulgarian body cannot reach the English body, the images, or anything
 * else on the page.
 *
 * The token this uses is write-capable, which is a real departure from
 * everything else here — the CI events sync and every laptop sync use
 * read-only integrations, deliberately. See AGENTS.md; it is a separate
 * integration, held as a Worker secret on staging only.
 */

const API = "https://api.notion.com/v1";
const VERSION = "2025-09-03";

type RichText = {
  type: "text";
  text: { content: string; link: { url: string } | null };
};

type Block = {
  id: string;
  type: string;
  has_children?: boolean;
  [k: string]: unknown;
};

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": VERSION,
    "Content-Type": "application/json",
  };
}

async function api(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${API}/${path}`, { ...init, headers: headers(token) });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Notion ${init?.method ?? "GET"} ${path} → ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

/* =============================================================================
   Text ⇄ rich text
============================================================================= */

const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

/**
 * `[label](url)` runs become real Notion links; everything else is plain text.
 *
 * The same pattern EventOverlayContent renders with, read in the opposite
 * direction, so a paragraph that goes out to the browser and comes back
 * unedited produces the rich text it started as.
 *
 * Notion caps a single rich-text item at 2000 characters. Splitting is not
 * attempted: the cap is per item and these are paragraphs of prose, so the
 * only way to reach it is to paste something that was never a paragraph. The
 * API rejects it with a clear message and the editor shows that message.
 */
export function toRichText(text: string): RichText[] {
  const out: RichText[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) {
      out.push({ type: "text", text: { content: text.slice(last, m.index), link: null } });
    }
    out.push({ type: "text", text: { content: m[1], link: { url: m[2] } } });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push({ type: "text", text: { content: text.slice(last), link: null } });
  }
  // An empty paragraph is legal in Notion and is represented by no rich text
  // at all, not by one item containing "".
  return out.filter((r) => r.text.content.length > 0);
}

/** Flatten a block's rich text the way the sync's `plain()` does. */
function plain(rich: unknown): string {
  if (!Array.isArray(rich)) return "";
  return rich.map((r) => (r as { plain_text?: string }).plain_text ?? "").join("");
}

/* =============================================================================
   Finding the parts of a page
============================================================================= */

// Mirrors the markers in scripts/sync-notion-events.mjs. If one moves, both
// move: a marker recognised on read but not on write would let a save land in
// the wrong half of the page.
const EN_MARK = /^\s*(##\s*)?(description \(en\)|en)\s*:?\s*$/i;
const BG_MARK = /^\s*(##\s*)?(описание \(bg\)|bg)\s*:?\s*$/i;
const IMG_MARK = /^\s*(##\s*)?(images to be used|снимки)\s*:?\s*$/i;

type PageShape = {
  /** Paragraph-ish blocks holding the body, per locale, in document order. */
  body: { bg: Block[]; en: Block[] };
  /** The last block of each section — where new paragraphs get appended. */
  tail: { bg: Block | null; en: Block | null };
  /** Image blocks under the "Images to be used:" heading, in order. */
  images: Block[];
};

/**
 * Read the page and work out which blocks are what.
 *
 * Deliberately only descends into `column_list`/`column`, exactly as the sync
 * does. In particular it does not descend into a callout — that is what keeps
 * the two photographs under "DO NOT INCLUDE THE BELLOW IMAGES:" on Първо общо
 * събрание out of the gallery, and a write path that saw them would offer an
 * alt-text field for a picture the site does not publish.
 */
async function readPage(token: string, pageId: string): Promise<PageShape> {
  const flat: Block[] = [];

  async function children(id: string) {
    let cursor: string | undefined;
    do {
      const qs = cursor ? `?start_cursor=${cursor}&page_size=100` : "?page_size=100";
      const res = (await api(token, `blocks/${id}/children${qs}`)) as {
        results: Block[];
        has_more: boolean;
        next_cursor: string;
      };
      for (const b of res.results) {
        if (b.type === "column_list" || b.type === "column") {
          await children(b.id);
          continue;
        }
        flat.push(b);
      }
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
  }
  await children(pageId);

  const shape: PageShape = {
    body: { bg: [], en: [] },
    tail: { bg: null, en: null },
    images: [],
  };

  let target: "bg" | "en" | "images" = "bg";
  for (const b of flat) {
    if (b.type === "image") {
      if (target === "images") shape.images.push(b);
      continue;
    }
    // Bookmarks, embeds and videos carry a bare URL and no rich text at all.
    // The sync turns them into a `[label](url)` line, so they occupy a slot in
    // the body and have to occupy one here too.
    if (b.type === "bookmark" || b.type === "embed" || b.type === "video") {
      if (target !== "images") {
        shape.body[target].push(b);
        shape.tail[target] = b;
      }
      continue;
    }
    const rich = (b[b.type] as { rich_text?: unknown } | undefined)?.rich_text;
    if (!rich) continue;
    const t = plain(rich).trim();
    if (!t) continue;
    if (IMG_MARK.test(t)) { target = "images"; continue; }
    if (EN_MARK.test(t)) { target = "en"; continue; }
    if (BG_MARK.test(t)) { target = "bg"; continue; }
    if (target === "images") continue;
    // Every block the sync counts as a body line goes in, not just the
    // paragraphs. That matters for index alignment: the description the editor
    // is looking at is `body.join("\n\n")` as the sync built it, so if a video
    // or bookmark block in the middle of a page were skipped here, every
    // paragraph after it would line up one short — and a save would write the
    // wrong sentence into the wrong block. Whether a block can be *written* is
    // a separate question, answered at rewrite time.
    shape.body[target].push(b);
    shape.tail[target] = b;
  }
  return shape;
}

/* =============================================================================
   Public API
============================================================================= */

/** Look up a page id from the Slug column. */
export async function findEventPage(
  token: string,
  dataSourceId: string,
  slug: string,
): Promise<string | null> {
  const res = (await api(token, `data_sources/${dataSourceId}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: { property: "Slug", rich_text: { equals: slug } },
      page_size: 1,
    }),
  })) as { results: { id: string }[] };
  return res.results[0]?.id ?? null;
}

/**
 * Write one locale's body and any changed image alt text back to the page.
 *
 * Returns the number of blocks touched, which the editor reports — a save that
 * says it wrote nothing is a save that silently did nothing, and that is worth
 * seeing.
 */
export async function pushEventCopy({
  token,
  pageId,
  locale,
  description,
  alts,
  coverOrder,
}: {
  token: string;
  pageId: string;
  locale: "bg" | "en";
  description: string;
  /** Cover `src` → alt text in this locale. */
  alts: Record<string, string>;
  /** The site's cover `src` list, in gallery order — index i is Notion image i. */
  coverOrder: string[];
}): Promise<{ paragraphs: number; captions: number; skipped: string[] }> {
  const shape = await readPage(token, pageId);

  const wanted = description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const existing = shape.body[locale];

  let paragraphs = 0;
  const skipped: string[] = [];

  // 1. Rewrite in place, as far as both lists go together.
  const shared = Math.min(wanted.length, existing.length);
  for (let i = 0; i < shared; i++) {
    const block = existing[i];
    const rich = (block[block.type] as { rich_text?: unknown } | undefined)?.rich_text;
    const before = plain(rich).trim();
    // Unchanged lines are left completely alone. Notion stamps
    // last_edited_time on any write, and a save that rewrote all six
    // paragraphs to say what they already said would make the page look edited
    // and defeat the "Обновено" column as a way of seeing what actually moved.
    if (before === wanted[i]) continue;

    // A video, bookmark or embed holds a URL, not prose — there is no rich_text
    // to patch, and writing one would replace a player with a sentence. A
    // heading is structure the sync reads as body but that nobody edits through
    // a paragraph box. Both are reported rather than silently dropped.
    if (block.type !== "paragraph") {
      skipped.push(`${block.type}: “${before.slice(0, 60)}”`);
      continue;
    }

    await api(token, `blocks/${block.id}`, {
      method: "PATCH",
      body: JSON.stringify({ paragraph: { rich_text: toRichText(wanted[i]) } }),
    });
    paragraphs++;
  }

  // 2. Editor added paragraphs — append them after the last one in the section.
  if (wanted.length > existing.length) {
    const after = shape.tail[locale]?.id;
    const added = wanted.slice(existing.length).map((t) => ({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: toRichText(t) },
    }));
    await api(token, `blocks/${pageId}/children`, {
      method: "PATCH",
      // `after` keeps them inside the section. Without it they land at the
      // very bottom of the page, below the images, where the sync would never
      // read them as body — the edit would appear to vanish.
      body: JSON.stringify(after ? { children: added, after } : { children: added }),
    });
    paragraphs += added.length;
  }

  // 3. Editor removed paragraphs — archive the surplus. Archiving, not
  //    deleting: Notion keeps them recoverable from the page history.
  for (const block of existing.slice(wanted.length)) {
    await api(token, `blocks/${block.id}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });
    paragraphs++;
  }

  // 4. Alt text, written into each image's caption in the two-language form
  //    captionAlt() reads back. The other locale's half is preserved.
  let captions = 0;
  for (const [src, text] of Object.entries(alts)) {
    const index = coverOrder.indexOf(src);
    const block = index >= 0 ? shape.images[index] : undefined;
    if (!block) continue;

    const current = plain((block.image as { caption: unknown }).caption);
    const other = locale === "bg" ? "EN" : "BG";
    const kept = current.match(new RegExp(`(?:^|\\n)\\s*${other}\\s*:\\s*(.+?)(?=\\n|$)`, "i"))?.[1]?.trim();
    const lines =
      locale === "bg"
        ? [`BG: ${text}`, kept ? `EN: ${kept}` : null]
        : [kept ? `BG: ${kept}` : null, `EN: ${text}`];
    const caption = lines.filter(Boolean).join("\n");
    if (caption === current.trim()) continue;

    await api(token, `blocks/${block.id}`, {
      method: "PATCH",
      body: JSON.stringify({ image: { caption: toRichText(caption) } }),
    });
    captions++;
  }

  return { paragraphs, captions, skipped };
}
