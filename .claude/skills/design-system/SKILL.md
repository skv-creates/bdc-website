---
name: design-system
description: The site's layout, type, button and copy contract. Use before any UI change — new sections, pages, components, spacing tweaks, CTA edits, or implementing a Figma frame. Prevents the recurring mistakes; wrong button variant, broken grid alignment, invented spacing, wrong mobile type sizes.
---

# The design system, as actually enforced

Every rule here was re-taught during real work. Follow them and the review
round gets shorter.

## The grid: content ends at column 11

The page grid is 12 columns (`bdc-grid`), but **content ends at column 11 —
column 12 is breathing room for the pattern rail** and must never be
occupied. `bdc-stop-11` exists for exactly this. When a CTA block or nav was
stretched into column 12 it read as "you broke the entire website
alignment". The live site is the alignment reference: match it, don't
re-derive it.

Layout changes are verified against the deployed site at 1440 and at the
1024 `lg` breakpoint (the nav's historic weak point) before they are called
done.

## Type scale (app/base.css) — exact, not approximate

| class | desktop | mobile |
|---|---|---|
| t-h01 | 80 | band down |
| t-h02 | 56 | band down |
| t-h03 | 40 | band down |
| t-h04 | 32 | — |
| t-h05 | 24 | — |
| t-quote | 64 | — |
| t-body-lg | **24** | **20** |
| t-body | **20** | **18** |
| t-label | 20 | — |
| t-caption | 16 | 16 |

Body copy is `t-body` (20px desktop) unless the Figma frame explicitly says
otherwise — a hero subheading was once set in `t-body-lg` by guesswork and
had to be corrected. Never invent a size; check the class table or the
frame.

## Buttons (components/ui/Button.tsx) — variant by role, not by taste

- **primary** — the pill, main CTA. The arrow travels *inside the label*
  with an ordinary space: „Членувай →". Full-width on phones.
- **secondary** — outlined pill, for a genuine second action beside a
  primary. Not for read-more links.
- **small** — the nav pill only.
- **tertiary** — quiet text link: plain at rest, full-row underline on
  hover, arrow chosen by destination — **↗ external, → internal**
  (computed from the href; don't hand-pick). This is the variant for card
  read-mores, "learn more" links, eyebrow links, policy links. It was
  corrected three separate times toward tertiary — when in doubt between
  secondary and tertiary for a text-like link, the answer is tertiary.
- `newTab` prop — internal links offered while a visitor is mid-form
  (privacy policy inside a form) so navigation cannot destroy their input.

Never hand-roll an `<a>` with custom classes where a Button variant exists.
Primary, secondary and tertiary must behave identically everywhere on the
site — one-off variations are the bug.

## Links inside prose

Only the *name* is the anchor: „Прочетете нашата **Политика за
поверителност**." — never the whole sentence underlined, and the final
period sits outside the anchor. (A whole underlined sentence was flagged
and reworked.)

## Forms

- **No asterisks on required fields, ever.** Required-ness is enforced by
  the browser; the label stays clean.
- A privacy sentence with the linked policy name sits **before the consent
  checkbox**, opening in a **new tab** (see Links above and Button
  `newTab`).
- Dropdowns are `components/ui/SelectField.tsx` (the branded ARIA
  combobox), never a native `<select>` — the OS popup cannot wear the
  brand and was rejected twice.
- Every form carries the honeypot field (`input[name=website]`, visually
  off-screen); the API pretends success when it is filled.
- Field style: the ruled underline (`border-b-2`), no boxes, no rounded
  corners.

## Cards (Figma 500:1989)

- Transparent background — no grey resting fill.
- `py-8 pr-8`, **no left padding** — text sits on the grid line. The 32px
  right padding is where card separation lives; the track/grid gap stays
  the ordinary 24px gutter. (Both a 128px and a 48px invented gap were
  rejected before the frame's real answer was read.)
- The top rule is a constant 4px box whose inner line flips: 1px hairline
  at rest → 4px brand bar when the card is in focus/in view
  (`data-focus`, see `Initiatives.module.css .cardRule`).
- Title `t-h03` with a stretched link (`after:absolute after:inset-0`),
  never an `<a>` inside an `<a>`; the visible CTA is a **tertiary** Button
  lifted above the stretched link with `relative z-10`.

## Figma fidelity

When a frame link is given, read gaps, paddings and sizes out of
`get_design_context` — never estimate from a screenshot and never invent
spacing. The design's separation often lives *inside* a component (card
`pr-[32px]`) rather than in the container gap; the code mirrors that
structure, not just the visual result.

## Colour accents

- The **amber highlight** (`--bdc-amber` mark) belongs only on the
  time-commitment sentence (volunteer pattern) — never on headings.
- Brand rose is the focus/active accent (card rules, combobox active row).

## Copy conventions

- **Bulgarian is the source of truth**; English is translated from it.
- Council-facing emails (partner/pilot endpoints) carry **Bulgarian
  labels**, never slugs — subjects like „Пилот / Дизайн зрялост".
- Choice values in forms are locale-independent slugs; visitors see
  labels.
- Event URLs come from the Slug column only; titles are per-language and
  must never drive a URL.
