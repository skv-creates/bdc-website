/**
 * Refresh the footer's green-hosting and carbon figures.
 *
 *   npm run sync:carbon [-- --dry]
 *
 * Hand-run, like sync:faq. The numbers move only when the site does, and a
 * scheduled job would rewrite the committed file — and the published claim —
 * without anyone looking at it.
 *
 * The point of fetching here rather than in the page is that the badges then
 * cost nothing. Both vendors' official embeds add a third-party request to
 * every page view: the Green Web badge is a 13KB PNG behind a redirect to a
 * signed URL that expires hourly, and the Website Carbon badge is a script
 * from unpkg.com that then calls their API. A badge that makes the page
 * heavier and slower in order to advertise that it is light is a bad trade for
 * anyone, and an embarrassing one for a design council. It would also hand two
 * new third parties every visitor's IP, on a site with a privacy policy that
 * does not mention them.
 *
 * So: fetch once, commit the result, render it statically, and link out to the
 * live verification pages so the claim stays checkable by anyone.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "carbon.generated.json");
const DOMAIN = "bulgariandesigncouncil.org";
const PAGE = `https://${DOMAIN}/bg`;
const DRY = process.argv.includes("--dry");

/** What is already committed. Every failure path below falls back to this. */
let current = null;
try {
  current = JSON.parse(readFileSync(OUT, "utf8"));
} catch {
  /* first run */
}

const warn = (m) => console.warn(`  ! ${m}`);

/**
 * Green hosting — does the site run on renewable-powered infrastructure.
 *
 * This is the claim worth making. It is verified by a third party, it does not
 * depend on a model, and it is the one most such footers get wrong. BDC passes
 * because Cloudflare is a listed provider.
 */
async function greenHosting() {
  const res = await fetch(`https://api.thegreenwebfoundation.org/api/v3/greencheck/${DOMAIN}`, {
    headers: { "user-agent": "bdc-website-carbon-sync" },
  });
  if (!res.ok) throw new Error(`green web check returned ${res.status}`);
  const d = await res.json();
  if (typeof d.green !== "boolean") throw new Error("green web check returned no verdict");
  // Refuse to quietly downgrade. If the answer flips to false, that is a real
  // change someone must look at, not something to write into the footer.
  if (!d.green) throw new Error(`green web check now reports NOT green (hosted by ${d.hosted_by})`);
  return { green: true, hostedBy: d.hosted_by || null };
}

/**
 * Grams of CO2 per page view, from Website Carbon.
 *
 * Treated as strictly optional, because it is a modelled estimate from a
 * service that is not always up — and when it is half up it returns numbers
 * that are worse than no numbers. At the time of writing their API answered
 * "Service temporarily unavailable" while their results page simultaneously
 * claimed this site achieves an "A" rating, is "cleaner than 0% of all web
 * pages", and emits "0.00 g". A ~900KB page does not emit zero.
 *
 * Hence the range checks. Publishing 0.00 g would be a visibly false claim on
 * a page whose entire purpose is to be credible.
 */
async function carbon() {
  const res = await fetch(`https://api.websitecarbon.com/b?url=${encodeURIComponent(PAGE)}`, {
    headers: { "user-agent": "bdc-website-carbon-sync" },
  });
  if (!res.ok) throw new Error(`website carbon returned ${res.status}`);
  const d = await res.json();
  if (d.error) throw new Error(`website carbon: ${d.error}`);

  const grams = Number(d.c);
  // `p` is already a percentage — 96 means "cleaner than 96%". It was being
  // multiplied by 100 here on the assumption it was a fraction, so the first
  // healthy response this ever saw was rejected as implausible at 9600. The
  // range check below was right; what it was handed was not.
  const cleanerThan = Math.round(Number(d.p));
  // A real page is somewhere between a fraction of a gram and a few grams.
  // Zero means their pipeline failed; anything above 10 means it misread the
  // page, and either way the honest move is to keep the last good value.
  if (!Number.isFinite(grams) || grams <= 0 || grams > 10) {
    throw new Error(`implausible carbon figure (${d.c}) — not committing it`);
  }
  if (!Number.isFinite(cleanerThan) || cleanerThan <= 0 || cleanerThan > 100) {
    throw new Error(`implausible percentile (${d.p}) — not committing it`);
  }
  return {
    gramsPerView: +grams.toFixed(2),
    cleanerThanPercent: cleanerThan,
    source: `websitecarbon.com API, ${new Date().toISOString().slice(0, 10)}`,
  };
}

const hosting = await greenHosting().catch((e) => {
  warn(`${e.message}`);
  return null;
});

const co2 = await carbon().catch((e) => {
  warn(`${e.message}`);
  return null;
});

if (!hosting && !current) {
  console.error("Nothing to write and nothing committed. Refusing to create an empty file.");
  process.exit(1);
}

const next = {
  // Shown in the footer beside the figures. A static badge that does not say
  // when it was measured is the one dishonest version of this — with the date
  // it is strictly more truthful than a live badge, which can serve a stale
  // cached result with nothing to indicate its age.
  measuredOn: new Date().toISOString().slice(0, 10),
  greenHosting: hosting ?? current.greenHosting,
  // Absent rather than zero when unavailable. The badge component renders the
  // carbon line only when this key exists, so the footer degrades to the
  // green-hosting claim alone rather than to a lie.
  ...(co2 ?? current?.carbon ? { carbon: co2 ?? current.carbon } : {}),
  sources: {
    greenHosting: `https://www.thegreenwebfoundation.org/green-web-check/?url=${DOMAIN}`,
    carbon: `https://www.websitecarbon.com/website/${DOMAIN.replace(/\./g, "-")}-bg/`,
  },
};

// Keep the date from churning the diff when nothing else changed — this file
// is committed, and a one-line date-only change on every run is noise that
// makes the real changes hard to see in review.
const unchanged =
  current &&
  JSON.stringify({ ...current, measuredOn: null }) === JSON.stringify({ ...next, measuredOn: null });

if (unchanged) {
  console.log("  no change");
} else if (DRY) {
  console.log(JSON.stringify(next, null, 2));
} else {
  writeFileSync(OUT, JSON.stringify(next, null, 2) + "\n");
  console.log(`  wrote ${OUT.replace(ROOT + "/", "")}`);
}

if (!co2) warn("carbon figure not refreshed — the footer will show green hosting only");
