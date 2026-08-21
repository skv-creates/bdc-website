/**
 * The sitemap — every indexable URL, each with its bg/en/x-default alternates.
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
 * No changeFrequency or priority — Google ignores both outright. lastModified
 * appears only where a real modification time exists: the `lastEdited` the
 * events sync stamps from Notion's last_edited_time (rows synced before the
 * field existed carry none and say nothing), and the events index, which is
 * honestly "modified" whenever its newest row is. The hand-edited pages state
 * no lastmod at all: a build date is not an edit date, and a sitemap caught
 * lying about lastmod once has the whole file's lastmod discounted
 * thereafter.
 */
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getEventSlugs } from "@/lib/events";
import { getInitiativeSlugs } from "@/lib/home-content";
import { absoluteUrl, localePath, sitemapAlternates } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEventSlugs();
  // The index changes when its newest-edited row does; with no stamped rows
  // it simply says nothing, like the hand-edited pages.
  const eventsIndexEdited = events
    .map((e) => e.lastEdited)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  const paths: { path: string; lastModified?: string }[] = [
    { path: "" },
    { path: "/about" },
    { path: "/initiatives" },
    { path: "/events", lastModified: eventsIndexEdited },
    { path: "/statute" },
    { path: "/privacy" },
    { path: "/accessibility" },
    { path: "/volunteer" },
    // /partner/thanks is deliberately absent: it is the Ad Grants conversion
    // page (noindexed), and a crawler-found arrival would count as a
    // conversion that never happened.
    { path: "/partner" },
    { path: "/contact" },
    ...events.map(({ slug, lastEdited }) => ({
      path: `/events/${slug}`,
      lastModified: lastEdited,
    })),
    ...getInitiativeSlugs().map(({ slug }) => ({ path: `/initiatives/${slug}` })),
  ];

  return paths.flatMap(({ path, lastModified }) =>
    locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages: sitemapAlternates(path) },
    })),
  );
}
