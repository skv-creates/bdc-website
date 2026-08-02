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

/** Pick a locale: saved cookie → best Accept-Language match → default. */
function detectLocale(req: NextRequest): string {
  const saved = req.cookies.get(COOKIE)?.value;
  if (saved && hasLocale(saved)) return saved;

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
      if (hasLocale(base)) return base;
    }
  }
  return defaultLocale;
}

export function GET(req: NextRequest): NextResponse {
  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}`;
  const res = NextResponse.redirect(url);
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

  // Stays a 307, not a 301: the destination really does depend on the request,
  // and a permanent redirect would let caches and browsers pin one language
  // forever for everyone.
  return res;
}
