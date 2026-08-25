/**
 * Real lastModified dates for the sitemap, from git.
 *
 * The sitemap's policy is honesty: a `lastmod` appears only where a real
 * modification time exists, because Google discounts a whole sitemap once
 * it catches one invented date. Events get theirs from Notion's
 * `last_edited_time` (the events sync). This script covers the rest: for
 * each static page, the date of the last commit that touched the files
 * its *content* actually lives in. That is a true statement — "the words
 * on this page last changed then" — at the granularity git can honestly
 * give.
 *
 * The result is committed (lib/page-lastmod.generated.json), not built in
 * CI: the deploy workflow clones shallowly, where every file's "last
 * commit" would be HEAD and every date a lie. The script refuses to run
 * on a shallow clone for exactly that reason. Deploys from a working
 * machine regenerate it; CI just reads what is committed.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
  encoding: "utf8",
}).trim();
if (shallow === "true") {
  console.log("page-lastmod: shallow clone — keeping the committed manifest");
  process.exit(0);
}

/** Route (locale-less) → the files its visible content lives in. */
const SOURCES = {
  "": ["lib/home-content.ts"],
  "/about": ["lib/about.ts", "lib/team-bios.generated.json"],
  "/initiatives": ["lib/home-content.ts"],
  "/initiatives/policy-lab": ["lib/home-content.ts"],
  "/initiatives/bulgaria-by-design": ["lib/home-content.ts"],
  "/initiatives/future-makers-lab": ["lib/home-content.ts"],
  "/initiatives/design-maturity-assessment": ["lib/home-content.ts"],
  "/membership": ["lib/membership.ts"],
  "/partner": ["lib/partner.ts"],
  "/volunteer": ["lib/volunteer.ts"],
  "/contact": ["lib/contact.ts", "lib/home-content.ts"],
  "/privacy": ["lib/legal-content.ts"],
  "/statute": ["lib/statute-content.ts"],
  "/accessibility": ["lib/accessibility-content.ts"],
};

const out = {};
for (const [route, files] of Object.entries(SOURCES)) {
  const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...files], {
    encoding: "utf8",
  }).trim();
  if (iso) out[route] = iso;
}

writeFileSync(
  "lib/page-lastmod.generated.json",
  JSON.stringify(out, Object.keys(out).sort(), 2) + "\n",
);
console.log(`page-lastmod: ${Object.keys(out).length} routes dated from git history`);
