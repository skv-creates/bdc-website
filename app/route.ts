import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales } from "@/lib/i18n";

/**
 * Locale routing for the bare `/` entry point.
 *
 * This lives in a route handler rather than `proxy.ts` because Next 16 compiles
 * proxy on the Node.js runtime (the `runtime` option throws there), while the
 * Cloudflare adapter only accepts an edge middleware — so a proxy file cannot
 * build for our deploy target at all.
 *
 * Locale is picked from the saved cookie → best Accept-Language match → `bg`.
 * The cookie is refreshed on locale pages by <SiteNav/> on the client.
 * `/bg` and `/en` are served directly by `app/[locale]`, which 404s anything
 * that isn't a supported locale, so nothing else needs intercepting.
 */

const COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Pick a locale: saved cookie → best Accept-Language match → default.
    `negotiated` records whether the request itself decided — it is what
    separates the temporary redirect from the permanent one below. */
function detectLocale(req: NextRequest): { locale: string; negotiated: boolean } {
  const saved = req.cookies.get(COOKIE)?.value;
  if (saved && hasLocale(saved)) return { locale: saved, negotiated: true };

  const header = req.headers.get("accept-language");
  if (header) {
    const ranked = header
      .split(",")
      .map((part) => {
        const [tag, q] = part.trim().split(";q=");
        return { base: tag.toLowerCase().split("-")[0], q: q ? parseFloat(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);
    for (const { base } of ranked) {
      if (hasLocale(base)) return { locale: base, negotiated: true };
    }
  }
  return { locale: defaultLocale, negotiated: false };
}

export function GET(req: NextRequest): NextResponse {
  const { locale, negotiated } = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}`;
  // 307 when the request itself chose the language (cookie or
  // Accept-Language): that answer really is per-request, and a permanent
  // redirect would let caches and browsers pin one language for everyone.
  // 308 when the request sent no language signal at all — the fall-through
  // to the default is deterministic, and that is exactly how search
  // crawlers ask: a permanent redirect tells them / is /bg, canonically,
  // rather than a detour to keep re-checking.
  const res = NextResponse.redirect(url, negotiated ? 307 : 308);
  res.cookies.set(COOKIE, locale, { path: "/", maxAge: ONE_YEAR });

  // This response genuinely differs per request, and nothing said so. Without
  // Vary, any cache in front of it — Cloudflare's included, the moment a rule
  // turns caching on for this path — is free to hand a Bulgarian redirect to
  // an English reader and vice versa.
  res.headers.set("Vary", "Accept-Language, Cookie");
  res.headers.set("Cache-Control", "no-store");

  // hreflang for a redirect. There is no HTML here to put <link> tags in, and
  // HTTP Link headers are the only way to tell a crawler that / has language
  // alternates at all. Built from the request's own origin rather than
  // SITE_ORIGIN: this is the one route that runs in the Worker, where the
  // build-time variable does not exist — and it makes / correct on any host.
  const { origin } = req.nextUrl;
  res.headers.set(
    "Link",
    [
      ...locales.map((l) => `<${origin}/${l}>; rel="alternate"; hreflang="${l}"`),
      `<${origin}/${defaultLocale}>; rel="alternate"; hreflang="x-default"`,
    ].join(", "),
  );

  return res;
}
