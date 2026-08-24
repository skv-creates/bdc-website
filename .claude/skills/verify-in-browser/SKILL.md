---
name: verify-in-browser
description: How to verify UI changes on this site with a real browser before calling them done. Use after any visual or interactive change, before and after every deploy, when testing forms, drawers, carousels or hover states, and when measuring page or image speed.
---

# Verify in a real browser, on the real URL

Nothing is "done" on this site until it has been exercised in Chrome — and
after a deploy, on the **deployed** origin (staging or the apex), not just
localhost. Prerendered pages, the Worker's image route and the edge cache
all behave differently from `next dev`.

## Launch recipe

`puppeteer-core` drives the system Chrome. It lives in the session
scratchpad (install there if missing: `npm i puppeteer-core lighthouse
chrome-launcher`), never in the repo.

```js
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  userDataDir: './some-name-' + process.pid,   // inside the scratchpad
  args: ['--no-first-run'],
});
```

## Mobile profile — every UI change is checked desktop AND mobile

```js
await page.emulate({
  viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
});
```

Desktop is `setViewport({ width: 1440, height: 900 })`; also check 1024,
the nav's `lg` switch.

## Testing forms WITHOUT sending real email

Fill the honeypot before submitting — the API pretends success and sends
nothing, so the full POST → 303 → thanks-page round-trip is asserted
safely:

```js
form.querySelector('input[name=website]').value = 'bot';  // honeypot
// fill the visible fields, check consent, then submit and
// waitForNavigation → expect /bg/partner/thanks
```

Also test the failure path: submit empty → browser validation must keep
the page in place (`location.pathname` unchanged).

## Pitfalls that have already cost time

- Programmatic `.click()` does **not** focus — call `.focus()` before
  keyboard tests (Enter/arrows on the SelectField combobox).
- The infinite carousel recenters `scrollLeft` under the pointer — mouse
  coordinates race it; prefer keyboard activation or `scrollIntoView`.
- Headless clipboard API is denied — CopyEmail needs its execCommand
  fallback; don't diagnose a site bug from a headless clipboard failure.
- Served HTML writes `srcSet` (camel case) — match case-insensitively or
  you'll wrongly conclude images have no responsive sources.
- Crossfade stacks (archive cover, carousel) keep all layers "visible" by
  bounding rect; find the shown one by walking ancestor `opacity`:

```js
[...document.querySelectorAll('img')].map(i => {
  let el = i, op = 1;
  while (el && el !== document.body) { op *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; }
  return { src: i.currentSrc, shown: op > 0.5 };
});
```

- A dialog's triggers may render as `<a>` (no-JS fallback href), not
  `<button>` — query both.

## Speed measurement

- **Pages**: `curl -s -o /dev/null -w 'ttfb %{time_starttransfer}s'` —
  healthy is well under 150ms warm.
- **Images**: grep `/_img/...webp` URLs out of the page HTML and curl
  those — warm is 40–70ms, a cold edge node ~100–300ms, and the response
  must carry `cache-control: ...immutable`. Never claim global speed
  from a single-location measurement: the old per-datacentre transform
  cache made Sofia fast while every other location stayed slow.
- **Real-world load**: `performance.getEntriesByType('navigation')[0]` in
  the page — responseStart / loadEventEnd.

## Local Lighthouse (the PSI substitute)

The public PSI API's anonymous quota is usually exhausted; run the same
engine locally from the scratchpad:

```js
const lighthouse = require('lighthouse').default || require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const chrome = await chromeLauncher.launch({ chromePath: '<system chrome>', chromeFlags: ['--headless=new'] });
await lighthouse(url, { port: chrome.port, formFactor: 'mobile',
  screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 2.625 } });
```

Scores swing ±8 points with host load — log `lhr.environment.benchmarkIndex`
to compare runs, and treat curl/navigation-timing numbers as the tiebreaker.
CLS 0 and a11y 100 are the fixed expectations; perf ≥ ~85 lab is the
normal band (SEO caps at 92 — see site-audit).

## Measuring from the rest of the world

Local curls only ever measure your own nearest datacentre. For anything
speed-related, verify from several regions with Globalping's free API —
this is how the "fast site" that was only fast in one country was finally
caught:

```bash
curl -s -X POST https://api.globalping.io/v1/measurements \
  -H 'Content-Type: application/json' -d '{
  "type": "http", "target": "bulgariandesigncouncil.org",
  "locations": [{"country":"US"},{"country":"DE"},{"country":"JP"},{"country":"AU"}],
  "measurementOptions": { "request": { "method": "GET", "path": "/bg" }, "protocol": "HTTPS" }
}'
# then GET https://api.globalping.io/v1/measurements/<id> until finished
```

Expected bands: first-ever touch at a region ~250–350ms for an image and
up to ~900ms TTFB for a page (one-time edge warm-up, TLS included);
repeats 20–110ms. Run the same probe twice — the second number is what
almost every visitor gets. The deploys warm the deploy machine's own
nearest colo automatically.

## Pointer-parked testing

Two hover traps only surface when the mouse is NOT where a test would
naturally put it:

- Scroll-linked content: park the pointer away from the component (e.g.
  over the photo column) and scroll — hover-driven behaviour can fake a
  passing test while pure scrolling does nothing. The archive cover bug
  shipped because every probe's pointer happened to hover the rows.
- Hover menus: click the trigger, land on the destination page with the
  cursor still parked on it, twitch the mouse 2px — the menu must NOT
  reopen over the page just reached (SiteNav arms hover only after the
  pointer has been elsewhere once per load).

## After every deploy

Curl the deployed origin (page status + one image's latency), then run the
puppeteer check relevant to the change. Only then report done — with what
was verified, not just what was shipped.
