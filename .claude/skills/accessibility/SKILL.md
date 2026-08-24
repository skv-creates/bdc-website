---
name: accessibility
description: Accessibility (WCAG AA baseline, AAA where set) and responsive-design contract for this site. Use when building or changing any interactive component — dialogs, dropdowns, carousels, accordions, forms — and when verifying a page across breakpoints.
---

# Accessible and responsive, by construction

The bar: Lighthouse accessibility **100** on every page, keyboard-first
interaction on every component, and no layout that only works at one
width. The components below have already earned their patterns — copy
them instead of inventing new ones.

## Proven patterns in this repo

- **Modal drawer** — `components/partner/PartnerDrawer.tsx`: native
  `<dialog>` + `showModal()` (free focus trap and top-layer), Escape
  closes, focus returns to the trigger, ✕ is ≥44px with a localized
  label, body scroll locked. Backdrop-click close is **deliberately
  absent** — the ways out are ✕ and Escape. The trigger renders as an
  `<a href>` fallback so no-JS still navigates somewhere real.
- **Custom dropdown** — `components/ui/SelectField.tsx`: ARIA
  combobox/listbox pattern; `role="combobox"`, `aria-expanded`,
  `aria-controls`, `aria-activedescendant`; keyboard map ArrowUp/Down,
  Home/End, Enter/Space, Escape, Tab-closes; pointerdown-outside closes;
  a hidden input keeps the native form POST working.
- **Infinite carousel** — `components/initiatives/Initiatives.tsx`:
  clone copies are `aria-hidden` with `tabIndex={-1}` and refuse focus on
  mousedown, so each item is announced once; roving tabindex gives the
  strip a single tab stop; `aria-current` marks the active item.
- **Cards** — stretched link (`after:absolute after:inset-0`) so the
  whole card clicks without nesting anchors; the visible CTA sits above
  it with `relative z-10` and out of the tab order to avoid double
  announcement; the title is the accessible name.
- **Forms** — real `<fieldset>`/`<legend>` structure (sr-only legends
  where the design hides them), real radios/checkboxes, labels wrapping
  inputs; honeypot is `aria-hidden` with `tabIndex={-1}` so no real
  visitor can land in it.

## Hidden means inert

Anything visually collapsed that still contains focusable elements must
use the `inert` attribute — `aria-hidden` alone leaves links reachable by
Tab from invisible content (an axe violation and a keyboard trap). The
FAQ accordion (`components/sections/Faq.tsx`) is the reference:
`inert={!open || undefined}` on the collapsing wrapper.

## Checks to run (see verify-in-browser for recipes)

1. Lighthouse accessibility category → **100**, no exceptions.
2. Keyboard-only walk of any new interactive component: Tab order sane,
   Enter/Space activate, Escape exits, arrows move where a native
   control's would. Remember: programmatic `.click()` doesn't focus —
   `.focus()` first.
3. Hidden-focusable scan:
   `[...document.querySelectorAll('[aria-hidden="true"] a, [aria-hidden="true"] button')].filter(el => el.tabIndex >= 0 && !el.closest('[inert]'))`
   must be empty.
4. Screen-reader sanity on images: meaningful `alt` on the shown layer,
   `alt=""` + `aria-hidden` on decorative twins (crossfade stacks
   describe the image once).

## Responsive matrix

Verify every UI change at **390** (phone), **768**, **1024** (the nav's
`lg` switch — historically the fragile breakpoint) and **1440**:

- No horizontal scroll on the body at any width; wide content (tables,
  code, strips) scrolls inside its own `overflow-x: auto` container.
- Touch targets ≥ 44px (the drawer's ✕ is the reference).
- Mobile type: t-body 18px, t-body-lg 20px (see design-system) — the
  scale bands down, it doesn't stay desktop-sized.
- Primary/secondary buttons stretch full-width on phones and shrink from
  `sm` up; small and tertiary never stretch.
- The membership apply page stays viewport-locked (`h-[100dvh]`) — check
  the form fills without double scrollbars on mobile.

## Motion and contrast

- Respect `prefers-reduced-motion`: transitions and autoplay disable
  (patterns in `Initiatives.module.css` and the carousel's `reduced`
  flag).
- Brand tokens on the page ground meet AA contrast; body text is near
  black on off-white. The brand rose is an accent (rules, active rows),
  never body-text-on-white.
