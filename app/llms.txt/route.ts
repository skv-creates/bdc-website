/**
 * llms.txt — a plain-text map of the site for language models.
 *
 * A compact map for the AI Search and Assistant agents the council deliberately
 * allows. Training crawlers remain a different category and are blocked by
 * Cloudflare AI Crawl Control; see AGENTS.md and app/robots.ts.
 *
 * Generated rather than a static public/llms.txt for two reasons: a static
 * file cannot know which origin it is being served from, so it would have to
 * hardcode the apex and lie on staging; and events change through the requested
 * Notion sync, so a second hand-written list would drift. force-static means it
 * is still built into the assets, with no Worker cost per request.
 */
import { getContent } from "@/lib/home-content";
import { getEvents } from "@/lib/events";
import { defaultLocale } from "@/lib/i18n";
import { absoluteUrl, localePath } from "@/lib/seo";

export const dynamic = "force-static";

export async function GET() {
  // English throughout: this file is read by models, and the English titles
  // are the ones that will match an English question. Both languages are
  // reachable from every URL, which the header says explicitly.
  const en = getContent("en");
  const bg = getContent(defaultLocale);
  const events = await getEvents("en");

  const url = (path: string) => absoluteUrl(localePath("en", path));

  const lines = [
    `# ${en.meta.title} / ${bg.meta.title}`,
    "",
    `> ${en.meta.description}`,
    ">",
    "> Bilingual site. Bulgarian is the default and lives at /bg/<path>;",
    "> the same page in English is always /en/<path>.",
    "",
    "## Initiatives",
    ...en.initiatives.items.map(
      (i) => `- [${i.title}](${url(`/initiatives/${i.slug}`)}): ${i.detail?.lead ?? i.text}`,
    ),
    "",
    "## Events",
    ...events.map((e) => {
      const where = e.location ? `, ${e.location}` : "";
      return `- [${e.name}](${url(`/events/${e.slug}`)}): ${e.date}${where}`;
    }),
    "",
    "## Pages",
    `- [Volunteer](${url("/volunteer")}): how to join the council's work`,
    `- [Privacy](${url("/privacy")})`,
    "",
    "## Contact",
    `- ${en.footer.email}`,
    ...en.footer.social.map((s) => `- ${s.label}: ${s.href}`),
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
