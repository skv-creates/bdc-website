/**
 * URL and hreflang helpers, shared by the sitemap and every generateMetadata.
 *
 * Every function here takes a locale-less `path` — "", "/privacy",
 * `/events/${slug}` — and the locale is prefixed on. That is the same shape
 * <SiteNav/> already uses to build the language toggle, and the reason is that
 * hreflang and the visible language switch have to agree: if the toggle sends
 * you to /en/events/x, that is what the alternates must claim exists. Deriving
 * both from one `path` makes disagreeing impossible.
 *
 * Imports only lib/i18n and lib/site, both content-free, so app/sitemap.ts can
 * pull it in without dragging the content dictionary along.
 */
import { locales, defaultLocale, type Locale } from "./i18n";
import { SITE_ORIGIN } from "./site";

/** "/privacy" → "/bg/privacy". The locale is always the first segment. */
export const localePath = (locale: Locale, path = "") => `/${locale}${path}`;

/**
 * Absolute URL. Required by the sitemap: Next writes <loc> verbatim and has no
 * metadataBase at that point, so a relative path would ship as-is and be junk.
 */
export const absoluteUrl = (path: string) => new URL(path, SITE_ORIGIN).toString();

/**
 * hreflang targets for one page, in every locale plus x-default.
 *
 * x-default points at /bg rather than /, even though a redirecting root is the
 * textbook x-default. Ours is a 307 that varies on cookie and Accept-Language,
 * so it returns different things to different crawlers; an hreflang target
 * should be a stable, indexable 200. /bg is the default language and always is.
 */
const alternateMap = (path: string, to: (locale: Locale) => string) => ({
  ...Object.fromEntries(locales.map((locale) => [locale, to(locale)])),
  "x-default": to(defaultLocale),
});

/**
 * `alternates` for a page's Metadata — canonical plus hreflang.
 *
 * Relative on purpose: Next resolves these against metadataBase, so the same
 * code produces staging URLs on staging and production URLs on production
 * without knowing which it is.
 *
 * MUST be set per page and never on the layout. Metadata is inherited
 * wholesale, so one canonical on app/[locale]/layout.tsx would point all
 * fifteen Bulgarian pages at the home page — a silent, total deindexing of
 * everything else.
 */
export function localeAlternates(locale: Locale, path = "") {
  return {
    canonical: localePath(locale, path),
    languages: alternateMap(path, (l) => localePath(l, path)),
  };
}

/** The same set, absolute, for sitemap entries. */
export function sitemapAlternates(path = "") {
  return alternateMap(path, (l) => absoluteUrl(localePath(l, path)));
}
