/**
 * The sitemap — 30 URLs, each with its bg/en/x-default alternates.
 *
 * Slugs are derived, never listed. getInitiativeSlugs() reads the content
 * *after* applyCms() has filtered `published !== false`, so the two
 * unpublished initiatives — which correctly 404 — cannot leak in here and
 * invite crawlers to fetch pages that do not exist. Hardcoding the list would
 * lose that guarantee the first time someone unpublishes something.
 *
 * `/` is deliberately absent: it is a redirect, not a document. The @modal
 * intercepting routes share their URLs with the real pages and produce none of
 * their own, so they cannot appear here by construction.
 *
 * No lastModified, changeFrequency or priority. Google ignores the last two
 * outright. lastModified is left off because the only date this site holds for
 * an event is the date the event happens — several of them in the future,
 * none of them a modification time — and a sitemap caught lying about lastmod
 * once has the whole file's lastmod discounted thereafter. scripts/
 * sync-notion-events.mjs can supply a real one (Notion's last_edited_time is
 * already on every row it fetches); until then, saying nothing is the honest
 * option.
 */
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getEventSlugs } from "@/lib/events";
import { getInitiativeSlugs } from "@/lib/home-content";
import { absoluteUrl, localePath, sitemapAlternates } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEventSlugs();

  const paths = [
    "",
    "/privacy",
    "/volunteer",
    ...events.map(({ slug }) => `/events/${slug}`),
    ...getInitiativeSlugs().map(({ slug }) => `/initiatives/${slug}`),
  ];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      alternates: { languages: sitemapAlternates(path) },
    })),
  );
}
