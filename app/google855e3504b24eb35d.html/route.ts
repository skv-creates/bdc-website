/**
 * Google Search Console ownership file.
 *
 * Google accepts either this file or the meta tag in app/[locale]/layout.tsx;
 * both are wired, because they fail in different ways. The meta tag rides on a
 * page that must render correctly, while this is a flat string — so if a
 * rendering change ever breaks the tag, verification survives, and Search
 * Console does not silently unverify and stop reporting.
 *
 * A route rather than a file in public/ only so it sits beside the other
 * machine-readable endpoints (robots, sitemap, llms.txt, IndexNow key) instead
 * of being the one that lives somewhere else.
 *
 * Contents are Google's, verbatim; the body must match the filename exactly.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response("google-site-verification: google855e3504b24eb35d.html", {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
