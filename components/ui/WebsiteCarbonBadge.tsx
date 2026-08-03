"use client";

import { useEffect } from "react";

const SCRIPT = "https://unpkg.com/website-carbon-badges@1.1.3/b.min.js";

/**
 * The official Website Carbon badge.
 *
 * Deliberately not the `react-carbonbadge` npm package, which is a nine-line
 * wrapper around exactly this and cannot be installed here: it `require`s
 * `prop-types` without declaring it as a dependency, and its peer range is
 * `react@^18` against this project's 19.2.4. What it actually does is append
 * the upstream script and render `<div id="wcb" class="wcb carbonbadge">`,
 * which is what this does, minus the broken install.
 *
 * The script is loaded from unpkg rather than vendored. It is GPL-3.0-or-later
 * (wholegrain/website-carbon-badges), and this repository is public — linking
 * to their CDN is what their own instructions say to do and keeps their code
 * out of our tree.
 *
 * What it costs, so nobody is surprised later:
 *   - one script from unpkg.com, then a call to api.websitecarbon.com, on
 *     every page view;
 *   - a `wcb_<url>` entry in localStorage, which it uses to cache the result
 *     for 24 hours;
 *   - the badge's own typeface and its blue/mint palette, which are not the
 *     council's — it is their mark, and it is fixed.
 *
 * It measures `window.location.href`, so each page reports its own weight. On
 * localhost that is unreachable from their API and the badge will read
 * "No Result"; that is expected in development, not a fault.
 *
 * The green-hosting line beside it (CarbonBadge) is the claim that does not
 * depend on any of this: verified, static, and still correct when their API is
 * down — which it was throughout the day this was built.
 */
export function WebsiteCarbonBadge() {
  useEffect(() => {
    // The upstream script is not idempotent — it appends its markup to #wcb
    // with insertAdjacentHTML every time it runs. A client-side navigation
    // that remounts this component would stack a second badge inside the
    // first, so only ever add it once per document.
    if (document.querySelector(`script[src="${SCRIPT}"]`)) return;
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // `wcb-d` is the badge's own dark variant, for the dark footer.
  return <div id="wcb" className="wcb carbonbadge wcb-d" />;
}
