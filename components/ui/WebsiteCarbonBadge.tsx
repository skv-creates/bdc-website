"use client";

import { useEffect } from "react";
import carbon from "@/lib/carbon.generated.json";

const SCRIPT = "https://unpkg.com/website-carbon-badges@1.1.3/b.min.js";

/**
 * The official Website Carbon badge.
 *
 * Deliberately not the `react-carbonbadge` npm package, which is a nine-line
 * wrapper around exactly this and cannot be installed here: it `require`s
 * `prop-types` without declaring it as a dependency, and its peer range is
 * `react@^18` against this project's 19.2.4. What it does is append the
 * upstream script and render `<div id="wcb" class="wcb carbonbadge">`, which
 * is what this does, minus the broken install.
 *
 * The script is loaded from unpkg rather than vendored. It is GPL-3.0-or-later
 * (wholegrain/website-carbon-badges) and this repository is public, so linking
 * their CDN — what their own instructions say — keeps their code out of our
 * tree.
 *
 * Three adjustments to what the script produces, all of them from the outside:
 *
 *   - `--b2` is the badge's accent, which the upstream stylesheet declares on
 *     `#wcb.carbonbadge` as a custom property. Setting it inline overrides that
 *     without touching their code, so the badge carries the council's green
 *     rather than its default mint, and matches the sprout in the green-hosting
 *     mark beside it. Their blue on this green measures 9.27:1.
 *   - `text-align` is `center` in their stylesheet, which floated the badge off
 *     the grid column it sits in. Left, so it starts on the column edge like
 *     everything else on that line.
 *   - the anchor they render points at the websitecarbon.com home page; it is
 *     repointed at this site's own result page, which is the thing a reader
 *     clicking a figure about *this* site expects to arrive at.
 *
 * It measures `window.location.href`, so each page reports its own weight. On
 * localhost that is unreachable from their API and the badge reads "No Result";
 * that is expected in development, not a fault.
 *
 * The script is not loaded until the footer is within a viewport of being
 * seen. It used to load on mount, which put unpkg.com and websitecarbon.com
 * on every page view's critical window — two third-party connections spent
 * measuring the weight of a page they were making heavier, for a badge the
 * visitor had not scrolled to. Lighthouse billed those connections at ~300ms
 * each on mobile.
 */
export function WebsiteCarbonBadge() {
  useEffect(() => {
    // Their script builds #wcb_a asynchronously, after it loads and again
    // after the fetch resolves, so the href has to be corrected whenever the
    // subtree changes rather than once.
    const fix = () => {
      const a = document.querySelector<HTMLAnchorElement>("#wcb #wcb_a");
      if (a && a.href !== carbon.sources.carbon) a.href = carbon.sources.carbon;

      // Fall back to the committed figure rather than publish "No Result".
      //
      // Their script writes that literal into #wcb_g whenever its API call
      // fails, and it has been failing for this domain since a test on 3 Aug
      // stored a row reading 0.00g and "cleaner than 0% of all web pages" —
      // self-contradictory, and their API will not serve it. Their own note
      // says badge results are cached seven days on a different clock from
      // their website, which is why a fresh test can report 0.05g while the
      // badge still gets nothing, and why re-running it does not help.
      //
      // So when the call comes back empty the badge shows the figure from
      // that measurement instead, in their own markup. It is a real number
      // with a date and a link behind it, which is better than an error and
      // better than an empty cell. The moment their cache turns over, the
      // live value replaces it with nothing to undo.
      const g = document.getElementById("wcb_g");
      if (g && g.textContent === "No Result") {
        g.innerHTML = `${carbon.carbon.gramsPerView}g of CO<sub>2</sub>/view`;

        // The percentile line beneath, which their renderResult writes into
        // #wcb_2 and which therefore stays empty on failure — the badge is
        // both halves, and the figure alone says nothing about how it
        // compares. textContent rather than their insertAdjacentHTML: this
        // runs from a MutationObserver and would otherwise append the
        // sentence again on every mutation.
        const p = document.getElementById("wcb_2");
        if (p) {
          p.textContent = `Cleaner than ${carbon.carbon.cleanerThanPercent}% of pages tested`;
        }
      }
    };
    const root = document.getElementById("wcb");
    const observer = root ? new MutationObserver(fix) : null;
    if (root && observer) observer.observe(root, { childList: true, subtree: true });

    // The upstream script is not idempotent — it appends its markup to #wcb
    // with insertAdjacentHTML every time it runs — so only ever add it once
    // per document, or a client-side navigation stacks a second badge inside
    // the first.
    const load = () => {
      if (!document.querySelector(`script[src="${SCRIPT}"]`)) {
        const script = document.createElement("script");
        script.src = SCRIPT;
        script.defer = true;
        document.body.appendChild(script);
      }
    };
    // rootMargin of one viewport: the script has time to load and its API
    // call to resolve while the visitor covers the last screenful, so the
    // badge is usually populated by the time it is actually seen.
    let io: IntersectionObserver | null = null;
    if (root && !document.querySelector(`script[src="${SCRIPT}"]`)) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            load();
            io?.disconnect();
            io = null;
          }
        },
        { rootMargin: "100% 0px" },
      );
      io.observe(root);
    } else {
      // No #wcb in the document, or the script is already there from a
      // previous page — nothing to defer.
      load();
    }
    fix();

    return () => {
      observer?.disconnect();
      io?.disconnect();
    };
  }, []);

  return (
    <div
      id="wcb"
      className="wcb carbonbadge wcb-d"
      // Inline, because both properties are set on this exact selector by the
      // stylesheet their script injects at runtime — there is no build-time
      // rule of ours that could win against it.
      // font-size joins them because the badge's own stylesheet sets it on
      // this exact selector too, and everything inside is sized in em — so
      // scaling it is the only way to make a fixed-width widget fit a narrow
      // grid track. The var is set by the grid cell; 15px is their default.
      style={{
        // --b1 is the badge's ink, which their stylesheet sets to #0e11a8.
        // The council's near-black reads better against both halves and is
        // the colour the rest of the site sets text in: 18.3:1 on the white
        // box and 13.4:1 on the green pill, both past the 7:1 AAA threshold,
        // where their blue managed 12.6 and 9.3.
        ["--b1" as string]: "#151515",
        ["--b2" as string]: "#00FF55",
        textAlign: "left",
        fontSize: "var(--wcb-size, 15px)",
      }}
    />
  );
}
