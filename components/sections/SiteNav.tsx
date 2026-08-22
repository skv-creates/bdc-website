"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { MegaMenu } from "@/components/sections/MegaMenu";
import { Button } from "@/components/ui/Button";
import type { Locale, SiteContent } from "@/lib/home-content";

/* Match the page content column: gutter on the left, and on the right only
   --rail-clear — the header already stops at the rail's left edge (see
   headerStyle), which is where the page grid ends, so it needs just the same
   mobile breathing room the rest of the page gets (0 from md up). */
const padStyle = {
  paddingInlineStart: "var(--page-gutter)",
  paddingInlineEnd: "var(--rail-clear)",
} as const;

/* The sticky header is full-bleed at the top, including the iOS safe area, but
   its right edge stops where the rail begins so its bg-page never paints over
   the pattern. Because it remains in the page shell's flow, it yields when the
   shell ends instead of floating over the footer. */
const headerStyle = {
  ...padStyle,
  // SiteNav sits inside the page's already-padded content shell. Pull only the
  // header background back across the leading gutter and the small mobile
  // rail-clear gap. The inner padding puts the navigation content back on the
  // same grid while the white paint still reaches the rail's leading edge.
  marginInlineStart: "calc(-1 * var(--page-gutter))",
  marginInlineEnd: "calc(-1 * var(--rail-clear))",
} as const;

export function SiteNav({
  nav,
  ui,
  locale,
  path = "",
  initiatives,
}: {
  nav: SiteContent["nav"];
  ui: SiteContent["ui"];
  locale: Locale;
  /** Route path after the locale (e.g. "/privacy"); "" on the home page.
      Off home, the in-page "#..." links and the logo have to point back at the
      home route, and the language toggle has to stay on the current page. */
  path?: string;
  /** Supply to turn the "Инициативи" link into the mega-menu trigger (354:2834).
      Omit and it stays an ordinary anchor. */
  initiatives?: SiteContent["initiatives"];
}) {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  // The nav item that opens the menu is the one pointing at the initiatives
  // index — matching on href rather than label so it survives translation.
  const megaHref = "/initiatives";

  /**
   * The logo always goes home — including from the home page itself.
   *
   * It used to be `path ? \`/${locale}\` : "#"`, so on the home page, and on
   * any page rendering the nav without a `path` (the 404), it was href="#":
   * the one link on the site that went nowhere, on the pages a visitor is most
   * likely to click it. A logo is the most-clicked way home on any website,
   * and "#" jumps to the top of the current document instead — which on the
   * home page looks like it worked and on a 404 looks broken.
   *
   * Linking home from home is not a problem: it is what every site does, it
   * costs nothing on a prerendered route, and it is what a screen reader
   * announces via ui.home anyway.
   */
  const homeHref = `/${locale}`;
  // Hash links point into the home page (prefixed once we are off it);
  // path links ("/about") are locale-prefixed always.
  const linkHref = (href: string) =>
    href.startsWith("/")
      ? `/${locale}${href}`
      : path && href.startsWith("#")
        ? `/${locale}${href}`
        : href;

  // Language toggle points at the same page in the other locale.
  const otherLocale: Locale = locale === "bg" ? "en" : "bg";
  const switchHref = `/${otherLocale}${path}`;
  const switchLabel = otherLocale.toUpperCase(); // compact "EN" / "BG"
  // Its measured height tells the mega-menu scrim where the panel ends. The
  // header itself remains in flow, so the page needs no duplicate spacer.
  const headerRef = useRef<HTMLElement>(null);
  const [navH, setNavH] = useState(0);
  // The panel is absolutely positioned, so it does not count toward the
  // header's height — the scrim needs its own measurement to know where to
  // start. See the scrim below.
  const megaRef = useRef<HTMLDivElement>(null);
  const [megaH, setMegaH] = useState(0);

  // Remember the language being viewed so a later bare visit to `/` lands here
  // again (app/route.ts reads this cookie before falling back to
  // Accept-Language). Written client-side because the locale pages are static.
  useEffect(() => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, [locale]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setNavH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = megaRef.current;
    if (!el) {
      setMegaH(0);
      return;
    }
    const update = () => setMegaH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mega]);

  // Escape closes the mega menu — the keyboard equivalent of moving the pointer
  // off the header, and the only way out for someone who opened it by keyboard.
  // It closes the mobile drawer too, for anyone on a tablet with a keyboard.
  useEffect(() => {
    if (!mega && !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMega(false);
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mega, open]);

  // The drawer covers the viewport, so the page behind it must not scroll —
  // otherwise a swipe carried past the drawer's own end drags the page under it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Widening past lg swaps the drawer for the desktop bar; without this the
  // drawer's scroll lock would survive as an invisible frozen page.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const close = () => mq.matches && setOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        // The bar stays light while the menu is open (354:2903) — the only cue
        // is the underline on the trigger.
        // pb-10 below lg, pb-6 from there: on a phone and a tablet the bar is
        // the only thing between the logo and whatever is scrolling under it,
        // and 24px left the copy looking stuck to the wordmark.
        className="sticky left-0 top-0 z-40 bg-page pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:pb-6"
        style={headerStyle}
        onMouseLeave={() => setMega(false)}
      >
        <div className="flex items-center justify-between gap-6 lg:grid lg:grid-cols-12 lg:gap-x-[var(--grid-gap)]">
          <a href={homeHref} aria-label={ui.home} className="shrink-0 lg:col-start-1 lg:col-span-3 lg:justify-self-start">
            <Logo variant="dark" locale={locale} className="h-8 w-auto md:h-10" />
          </a>

          {/* desktop nav — one row starting at page-grid column 4, links spaced
              by a 16px gap at lg and the design's 20px from xl — the
              Bulgarian labels miss the 1024 grid by a few pixels at 20px.
              Watch the width when adding a link or lengthening a label: the
              row once outgrew its columns at 1024 and the CTA printed over
              the last link, swallowing its clicks. */}
          <nav className="hidden lg:col-start-4 lg:col-span-4 lg:flex lg:items-center lg:gap-4 lg:justify-self-start xl:gap-5">
            {nav.links.map((l) =>
              initiatives && l.href === megaHref ? (
                // A link that also discloses: hover opens the panel, click and
                // Enter navigate to the initiatives index — so the item is a
                // conventional nav link to a crawler and to the keyboard, and
                // the panel is a pointer shortcut on top. Plain <a>, like the
                // panel's own rows, so the @modal interceptor stays out of it.
                <a
                  key={l.label}
                  href={linkHref(l.href)}
                  aria-expanded={mega}
                  aria-haspopup="true"
                  onMouseEnter={() => setMega(true)}
                  className={`t-caption whitespace-nowrap border-b-2 transition-colors ${
                    mega ? "border-current" : "border-transparent hover:border-current"
                  }`}
                >
                  {l.label}
                </a>
              ) : (
                <a
                  key={l.label}
                  href={linkHref(l.href)}
                  onMouseEnter={() => setMega(false)}
                  className="t-caption whitespace-nowrap border-b-2 border-transparent transition-colors hover:border-current"
                >
                  {l.label}
                </a>
              ),
            )}
          </nav>

          {/* justify-end against cols 8–11 lands the CTA + language toggle on
              the right edge of column 11, clear of the rail. Column 12 stays
              empty on purpose — it is the breathing room before the rail, and
              spanning into it once shoved EN against the pattern. */}
          <div className="hidden items-center gap-4 lg:col-start-8 lg:col-span-4 lg:flex lg:justify-end">
            {/* Членувай leads to the membership page, where the application
                is embedded. From xl only: two pills plus four Bulgarian links
                do not fit the 1024 grid, and at lg the partner CTA keeps the
                slot. */}
            <span className="hidden xl:contents">
              <Button variant="small" href={linkHref(nav.memberCta.href)}>
                {nav.memberCta.label}
              </Button>
            </span>
            <Button variant="small" href={linkHref(nav.cta.href)}>{nav.cta.label}</Button>
            {/* inline-grid + min-h-6/min-w-6 so the two-letter toggle still
                meets the 24×24 of WCAG 2.2 2.5.8; it measured 22×26. */}
            <a
              href={switchHref}
              aria-label={ui.switchLanguage}
              className="t-caption inline-grid min-h-6 min-w-6 place-items-center border-b-2 border-transparent transition-colors hover:border-current"
            >
              {switchLabel}
            </a>
          </div>

          {/* mobile toggle */}
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-label={ui.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`block h-0.5 w-6 bg-text transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-text transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-text transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>

        {/* Mobile drawer (355:3152). Sits under the bar and runs to the bottom
            of the viewport — 100dvh, not vh, so the browser chrome retracting
            on scroll doesn't leave a gap. It scrolls internally when the
            initiatives list makes it taller than the screen. */}
        {open && (
          <div
            // Only the link list scrolls. The actions used to sit at the foot
            // of one long scrolling column, so on a short screen — or once the
            // initiatives archive is expanded — "Членувай" and the language
            // toggle fell off the bottom and had to be hunted for.
            className="absolute inset-x-0 top-full z-30 flex flex-col bg-page lg:hidden"
            style={{ ...padStyle, height: `calc(100dvh - ${navH}px)` }}
          >
            <nav className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain pb-8 pt-4">
              {nav.links.map((l) => (
                <div key={l.label} className="flex flex-col gap-8">
                  <a href={linkHref(l.href)} className="t-h05" onClick={() => setOpen(false)}>
                    {l.label}
                  </a>

                  {/* The initiatives item carries the archive inline — the
                      phone equivalent of the desktop mega menu. Ruled titles,
                      flush with the drawer's own start so they sit on column 1
                      with the nav links above them rather than indented under
                      them. Plain <a> for the same reason as the mega menu:
                      next/link here would be caught by the
                      @modal/(.)initiatives interceptor and open the overlay
                      instead of the page. */}
                  {initiatives && l.href === megaHref && (
                    <ul className="flex flex-col pb-4">
                      {initiatives.items.map((item) => (
                        <li
                          key={item.slug}
                          // Same rule as the checklist and the mega menu: the
                          // touched row and the one after it drop their border
                          // so the rose reads as one unbroken band. `active:`
                          // alongside `hover:` because a tap on iOS resolves
                          // hover only after the first touch.
                          className="group border-t border-border transition-colors duration-[120ms] ease-out hover:border-t-transparent hover:bg-brand active:border-t-transparent active:bg-brand [&:active+li]:border-t-transparent [&:hover+li]:border-t-transparent"
                        >
                          {/* Just the title now — no column grid left to hold,
                              since the category it used to sit beside is gone.
                              The rose band on tap is the affordance the pointer
                              mark used to be; on a phone that mark only ever
                              appeared mid-tap anyway, while costing the title
                              its start position the rest of the time. */}
                          <a
                            href={`/${locale}/initiatives/${item.slug}`}
                            onClick={() => setOpen(false)}
                            className="t-body block py-3"
                          >
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>

            {/* Pinned. The rule marks it off from the list that scrolls past. */}
            <div className="flex shrink-0 items-center gap-8 border-t border-border/20 pb-8 pe-8 pt-6">
              <div className="flex flex-1 flex-col gap-3">
                <Button variant="secondary" href={linkHref(nav.memberCta.href)} fullWidth>
                  {nav.memberCta.label}
                </Button>
                <Button variant="secondary" href={linkHref(nav.cta.href)} fullWidth>
                  {nav.cta.label}
                </Button>
              </div>
              <a href={switchHref} aria-label={ui.switchLanguage} className="t-caption">
                {switchLabel}
              </a>
            </div>
          </div>
        )}

        {/* Mega menu. Inside the <header> so the pointer can travel from the
            trigger into the panel without leaving the element that keeps it
            open, and so it inherits the header's gutters. */}
        {initiatives && mega && (
          <div
            // bg-page here, not on the panel: the white has to run the full
            // width of the header (edge to rail), while the content inside it
            // still sits on the page gutter. Tinting the padded child instead
            // leaves the scrim showing down the left.
            ref={megaRef}
            className="absolute inset-x-0 top-full z-40 hidden bg-page lg:block"
            style={padStyle}
          >
            <MegaMenu
              initiatives={initiatives}
              locale={locale}
              onNavigate={() => setMega(false)}
            />
          </div>
        )}
      </header>

      {/* Scrim. Starts where the panel ends rather than at the top of the
          viewport, so the strip of pattern rail beside the panel stays at full
          strength and only the page below it is dimmed. Closes the menu on
          click — the usual way out, alongside Escape and moving the pointer off
          the header. */}
      {initiatives && mega && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 hidden bg-[rgba(21,21,21,0.3)] lg:block"
          style={{ top: navH + megaH }}
          onClick={() => setMega(false)}
          aria-hidden
        />
      )}

    </>
  );
}
