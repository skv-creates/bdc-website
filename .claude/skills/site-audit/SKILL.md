---
name: site-audit
description: The full health runbook for bulgariandesigncouncil.org — Ad Grants readiness, SEO, speed, links, consent. Use before any Google Ad Grants (re)submission, after large content or infrastructure changes, or when someone reports the site being slow, broken or badly indexed.
---

# Site audit runbook

The checklist that cleared the Ad Grants denials ("load quickly, clear
navigation, substantial up-to-date content and calls to action"). Run it
top to bottom; every step has a known-good expectation.

## 1. Sitemap sweep

Fetch `https://bulgariandesigncouncil.org/sitemap.xml`, extract every
`<loc>`, GET each: **all must be 200** (46 URLs at last count, both
locales). Any non-200 is a release blocker.

## 2. Link and asset crawl

From every sitemap page, collect every internal `href` and `src`, and HEAD
each with `redirect: 'manual'`: **zero broken, zero unexpected
redirects**. (Known-good: ~71 distinct internal links.)

## 3. Root and redirect contract

- **`/` serves the Bulgarian homepage directly — 200, not a redirect**
  (a rewrite to the prerendered `/bg` in `next.config.ts`; the page's
  canonical and hreflang say `/bg` is the official address, so Google
  sees one homepage, not two). This replaced a 308: the bare domain is
  what people type, share, and submit to review forms — including the
  Ad Grants form — and for weeks it answered with an empty redirect
  while every audit called that "standard practice". The user flagged
  it two days before it was fixed; the lesson is recorded below.
- `www.` and `http://` → 301 to the https apex. `/bg` and `/en` still
  serve directly.
- Unknown URLs return a real 404.

**Lesson:** when the site owner says something on their site feels
wrong, investigate it as a signal before rebutting it with the
textbook. "Technically correct and standard" was the answer here for
two denial cycles; the owner's instinct — "the address we submit
should be a page, not a bounce" — was the fix.

## 4. noindex discipline

`/membership/thanks`, `/partner/thanks`, `/membership/apply` carry
noindex and stay out of the sitemap — they are conversion URLs. Never
request indexing for them.

## 5. Speed

- Pages: TTFB well under 150ms warm; fully loaded sub-second on broadband.
- Images: build-time static WebP under `/_img/` —
  `scripts/prerender-images.mjs` renders every variant during the build
  and `lib/image-loader.ts` points all image URLs at them — served with
  immutable caching and fast from every Cloudflare location. This
  replaced the request-time `/_next/image` transforms, whose
  per-datacentre cache was only ever warm where it had been measured
  from: exactly what a reviewer abroad experienced as a slow site.
  Health check: any `/_img/...webp` URL returns 200 `image/webp` with
  `cache-control: ...immutable`, ~**40–70ms** warm. If a page ever emits
  `/_next/image` URLs again, the custom loader in `next.config.ts` got
  dropped — that is the regression to look for.
- Lighthouse mobile (see verify-in-browser for the recipe) on `/bg`,
  `/en`, `/bg/membership` and the campaign landing pages (`/bg/partner`,
  `/bg/volunteer`, `/bg/about`, the four initiative pages). Expected:
  perf ≥ ~85 lab (±8 host variance), **CLS 0**, a11y **100**, best
  practices **100**, **SEO 92 — that is the ceiling, not a bug**:
  Cloudflare's managed `Content-Signal` line in robots.txt trips
  Lighthouse's robots audit; Googlebot ignores it and the line is
  deliberate council policy (see AGENTS.md). LCP is the H1 webfont swap;
  fonts are already display:swap + preloaded — don't chase it.

## 5a. Speed, measured globally

Never sign off speed from one location — the reviewers sit in the US,
the council sits wherever it sits, and per-edge caches make one warm
region look like a fast site. Probe at least US + EU + Asia via
Globalping (recipe in the verify-in-browser skill): images first-touch
≤ ~350ms and repeats ≤ ~110ms everywhere, page TTFB warm ≤ ~150ms.
Anything structurally slower in a whole region is a release blocker —
that pattern is what several Ad Grants denials were actually citing.

## 6. Consent and privacy

- **No tracking loads at all** while `GA4_MEASUREMENT_ID` in
  `lib/analytics.ts` is empty. When an id is set, `AnalyticsConsent` is
  strict: nothing loads before an explicit Accept, Reject is equal and
  remembered, Consent Mode grants `analytics_storage` only (`ad_*`
  denied).
- The only cookie is `NEXT_LOCALE` (functional, consent-exempt).
- Every form links the privacy policy beside the consent checkbox, in a
  new tab. No personal data ever appears in a URL.
- Open legal flag (owner of the policy document decides, not us): the
  policy claims no non-EU transfers and names processors generically,
  while Resend (US) handles form email and Tally (BE) the membership
  form.

## 7. Ad Grants submission notes

- Submit **`https://bulgariandesigncouncil.org/bg`** — content directly,
  no redirect hop.
- Requirements map: *load quickly* → §5; *clear navigation* → §§1–3;
  *substantial up-to-date content* → two locales, events with real dates,
  honest lastmod (only from the events sync's `last_edited_time`);
  *calls to action* → Членувай / Партнирай с нас / Започни пилот /
  Стани доброволец on every relevant page, with working forms and
  branded thanks pages.
- Indexing is **not** an eligibility gate — don't wait on Search Console
  to resubmit. Request indexing for `/bg`, `/en` and campaign pages
  (≈10–12/day quota), let the sitemap carry the rest.
