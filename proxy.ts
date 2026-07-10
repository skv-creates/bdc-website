import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, hasLocale } from "@/lib/i18n";

/**
 * Locale routing (Next 16 renamed `middleware` → `proxy`).
 *
 * - `/`            → redirect to the visitor's locale (cookie → Accept-Language
 *                    → default BG) as `/bg` or `/en`.
 * - `/bg`, `/en`   → pass through, and remember the choice in a cookie so the
 *                    next bare visit lands on the same language.
 *
 * Kept dependency-free: a small Accept-Language parser instead of a matcher lib.
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

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const firstSegment = pathname.split("/")[1];

  // Already inside a locale — pass through, refreshing the cookie if needed.
  if (hasLocale(firstSegment)) {
    const res = NextResponse.next();
    if (req.cookies.get(COOKIE)?.value !== firstSegment) {
      res.cookies.set(COOKIE, firstSegment, { path: "/", maxAge: ONE_YEAR });
    }
    return res;
  }

  // No locale prefix — redirect to the detected one, preserving the rest.
  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE, locale, { path: "/", maxAge: ONE_YEAR });
  return res;
}

export const config = {
  // Everything except Next internals, API routes, and files with an extension
  // (assets in /public, favicon, etc.).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
