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
 * Notion body text with the sync's markup taken back out.
 *
 * Event descriptions reach us as the whole Notion body, including the raw
 * `[label](url)` runs the sync writes for links. Twelve of the sixteen event
 * descriptions shipped literal square brackets and a URL into the page's <meta>
 * tag, one of them a percent-encoded Cyrillic LinkedIn address 90 characters
 * long.
 *
 * Google asks a description to be unique per page, to summarise it accurately,
 * and to be human-readable rather than "long strings of keywords". A tag
 * containing a percent-encoded URL fails the last of those. Length is not part
 * of it: Google states outright that "there's no limit on how long a meta
 * description can be" and truncates the snippet at display width itself, so
 * nothing here shortens the text.
 *
 * Used wherever the prose leaves the page for a machine: the <meta> tag on the
 * event route, and schema.org/Event in lib/structured-data.ts.
 */
export function plainText(text: string): string {
  return (
    text
      // `[label](url)` becomes `label`: the label is the readable half, and a
      // bare URL in a description is characters that tell a reader nothing.
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")
      // Notion separates paragraphs with blank lines. A newline inside an
      // attribute is legal and survives to the tag, where it is noise.
      .replace(/\s+/g, " ")
      .trim()
  );
}

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

/**
 * The default share card, one per language.
 *
 * The card carries a sentence — "Една държава се проектира всеки ден" on /bg,
 * "A country is designed every day" on /en — so it cannot be one file. That is
 * why this is here and not app/[locale]/opengraph-image.jpg: the file
 * convention resolves per *segment*, not per param, so a single file served
 * both locales and showed the English line to Bulgarian readers.
 *
 * Relative on purpose, like `url` below: Next resolves it against
 * metadataBase, so staging cards point at staging instead of quietly
 * advertising production URLs from a noindex host.
 *
 * PNG rather than JPEG, which is not the usual choice for a share card: this
 * one is three flat brand colours and a line of type, so JPEG spent its bytes
 * putting ringing around every letter edge. Lossless came out at 29KB against
 * the JPEG's 67KB — sharper and less than half the size.
 *
 * The alt text is written out here rather than pulled from lib/home-content so
 * this module stays content-free and app/sitemap.ts can keep importing it
 * without dragging the whole dictionary along.
 */
const shareCard = (locale: Locale) => ({
  url: `/og/share-${locale}.png`,
  width: 1200,
  height: 630,
  alt:
    locale === "bg"
      ? "Български дизайн съвет — Една държава се проектира всеки ден"
      : "Bulgarian Design Council — A country is designed every day",
});

/**
 * The Open Graph fields every page shares.
 *
 * `url` is left relative so it resolves against metadataBase, which keeps
 * staging cards pointing at staging rather than quietly advertising production
 * URLs from a noindex host.
 *
 * `images` is set here rather than on the layout because metadata does not
 * merge: an `openGraph` object on a page replaces the layout's wholesale, and
 * every page in this app builds its `openGraph` through this helper. Pages that
 * own a photograph — events, initiatives — spread this and then set `images`
 * themselves, so theirs still wins.
 */
export function openGraphBase(
  locale: Locale,
  path: string,
  { title, description, type = "website" as "website" | "article" }: {
    title: string;
    description: string;
    type?: "website" | "article";
  },
  siteName: string,
) {
  const other = locales.find((l) => l !== locale);
  return {
    type,
    url: localePath(locale, path),
    title,
    description,
    siteName,
    images: [shareCard(locale)],
    // Facebook's territory-qualified form; anything else is ignored.
    locale: locale === "bg" ? "bg_BG" : "en_US",
    ...(other ? { alternateLocale: other === "bg" ? "bg_BG" : "en_US" } : {}),
  };
}
