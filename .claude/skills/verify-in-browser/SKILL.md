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

## After every deploy

Curl the deployed origin (page status + one image's latency), then run the
puppeteer check relevant to the change. Only then report done — with what
was verified, not just what was shipped.
