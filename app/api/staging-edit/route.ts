/**
 * The Shift+E editor's endpoint. STAGING ONLY.
 *
 * GET  — the current copy for one event in one locale, as the editor should
 *        show it: Notion source text, the covers, and their alt text.
 * POST — save. Notion first, then the staging draft store.
 *
 * Three separate things have to be true before this can write anything:
 *
 * 1. `IS_PRODUCTION_SITE` is false. Decided at build time from SITE_ORIGIN, so
 *    on the apex both handlers are a 404 and there is nothing to probe.
 * 2. The request carries the passphrase. staging.bulgariandesigncouncil.org is
 *    publicly reachable — without this, finding the URL would be enough to
 *    rewrite the council's CMS.
 * 3. A write-capable Notion token is bound. It is a Worker secret on staging
 *    and exists nowhere else: not in the repo, not in CI, not on a laptop. See
 *    AGENTS.md — every other integration here is deliberately read-only.
 *
 * Notion is written before the draft, never after. If the Notion write fails
 * the request fails and no draft is stored, so staging cannot end up showing
 * copy that only exists in a cache. The reverse order would make the page look
 * saved while the source of truth still said otherwise.
 */
import { NextResponse } from "next/server";
import { IS_PRODUCTION_SITE } from "@/lib/site";
import { getEvent } from "@/lib/events";
import { writeDraft, readDraft } from "@/lib/drafts";
import { findEventPage, pushEventCopy } from "@/lib/notion-write";
import { locales, type Locale } from "@/lib/i18n";

/** Reads a binding from the Worker env, or undefined outside one. */
async function secret(name: string): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as Record<string, string | undefined>)[name];
  } catch {
    return process.env[name];
  }
}

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

/**
 * Constant-time-ish comparison.
 *
 * A plain `===` on a secret leaks its length and its matching prefix through
 * timing. The passphrase is low-value and the attack is impractical over a
 * network, but writing the careless version of a credential check invites it to
 * be copied somewhere it matters.
 */
function matches(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

async function authorised(req: Request): Promise<boolean> {
  const expected = await secret("EDIT_PASSPHRASE");
  if (!expected) return false;
  const given = req.headers.get("x-bdc-edit") ?? "";
  return matches(given, expected);
}

function parseTarget(url: URL): { slug: string; locale: Locale } | null {
  const slug = url.searchParams.get("slug");
  const locale = url.searchParams.get("locale");
  if (!slug || !locale) return null;
  if (!(locales as readonly string[]).includes(locale)) return null;
  return { slug, locale: locale as Locale };
}

export async function GET(req: Request) {
  if (IS_PRODUCTION_SITE) return notFound();
  if (!(await authorised(req))) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const target = parseTarget(new URL(req.url));
  if (!target) return NextResponse.json({ error: "slug and locale required" }, { status: 400 });

  // getEvent already layers any draft on top, so the editor opens showing what
  // the page is showing — not what was last committed.
  const event = await getEvent(target.locale, target.slug);
  if (!event) return notFound();
  const draft = await readDraft(target.slug, target.locale);

  return NextResponse.json({
    slug: event.slug,
    locale: target.locale,
    name: event.name,
    description: event.description,
    covers: event.covers.map((c) => ({
      src: c.src,
      width: c.width,
      height: c.height,
      alt: c.alt?.[target.locale] ?? "",
    })),
    draft: draft ? { savedAt: draft.savedAt, by: draft.by } : null,
  });
}

export async function POST(req: Request) {
  if (IS_PRODUCTION_SITE) return notFound();
  if (!(await authorised(req))) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let payload: {
    slug?: string;
    locale?: string;
    description?: string;
    alts?: Record<string, string>;
    by?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON" }, { status: 400 });
  }

  const { slug, locale, description, alts = {}, by } = payload;
  if (!slug || !locale || typeof description !== "string") {
    return NextResponse.json({ error: "slug, locale and description required" }, { status: 400 });
  }
  if (!(locales as readonly string[]).includes(locale)) {
    return NextResponse.json({ error: `Unknown locale ${locale}` }, { status: 400 });
  }

  const token = await secret("NOTION_WRITE_TOKEN");
  const dataSource = await secret("NOTION_EVENTS_DATA_SOURCE_ID");
  if (!token || !dataSource) {
    return NextResponse.json(
      { error: "The staging Worker has no Notion write token bound. See AGENTS.md." },
      { status: 503 },
    );
  }

  const event = await getEvent(locale as Locale, slug);
  if (!event) return notFound();

  let written;
  try {
    const pageId = await findEventPage(token, dataSource, slug);
    if (!pageId) {
      return NextResponse.json({ error: `No Notion row with Slug "${slug}"` }, { status: 404 });
    }
    written = await pushEventCopy({
      token,
      pageId,
      locale: locale as "bg" | "en",
      description,
      alts,
      coverOrder: event.covers.map((c) => c.src),
    });
  } catch (e) {
    // Notion refused. Nothing is cached, so staging still shows the last state
    // both sides agreed on, and the editor keeps the text in the box.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Notion write failed" },
      { status: 502 },
    );
  }

  const stored = await writeDraft(slug, locale, {
    description,
    alts,
    savedAt: new Date().toISOString(),
    ...(by ? { by } : {}),
  });

  return NextResponse.json({
    ok: true,
    notion: written,
    // False means the KV namespace is missing: Notion has the edit, but staging
    // will not show it until the next sync. Worth saying out loud rather than
    // reporting a clean save.
    staging: stored,
  });
}
