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
 * honestly "modified" whenever its newest row is. The hand-edited pages carry
 * the date of the last commit that touched their content files
 * (lib/page-lastmod.generated.json, from scripts/page-lastmod.mjs) — a true
 * edit date at git's granularity. A build date is not an edit date, and a
 * sitemap caught lying about lastmod once has the whole file's lastmod
 * discounted thereafter.
 */
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getEventSlugs } from "@/lib/events";
import { getInitiativeSlugs } from "@/lib/home-content";
import { absoluteUrl, localePath, sitemapAlternates } from "@/lib/seo";
// Real dates from git: for each static page, the last commit that touched
// the files its content lives in (scripts/page-lastmod.mjs — committed, so
// CI's shallow clone cannot turn every date into HEAD's).
import pageLastmod from "@/lib/page-lastmod.generated.json";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEventSlugs();
  // The index changes when its newest-edited row does; with no stamped rows
  // it simply says nothing, like the hand-edited pages.
  const eventsIndexEdited = events
    .map((e) => e.lastEdited)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  const dated = (path: string) => ({
    path,
    lastModified: (pageLastmod as Record<string, string>)[path],
  });

  const paths: { path: string; lastModified?: string }[] = [
    dated(""),
    dated("/about"),
    dated("/initiatives"),
    { path: "/events", lastModified: eventsIndexEdited },
    dated("/statute"),
    dated("/privacy"),
    dated("/accessibility"),
    dated("/volunteer"),
    // /partner/thanks is deliberately absent: it is the Ad Grants conversion
    // page (noindexed), and a crawler-found arrival would count as a
    // conversion that never happened.
    dated("/partner"),
    dated("/membership"),
    dated("/contact"),
    ...events.map(({ slug, lastEdited }) => ({
      path: `/events/${slug}`,
      lastModified: lastEdited,
    })),
    ...getInitiativeSlugs().map(({ slug }) => dated(`/initiatives/${slug}`)),
  ];

  return paths.flatMap(({ path, lastModified }) =>
    locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages: sitemapAlternates(path) },
    })),
  );
}
