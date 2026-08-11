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

/* The fixed header is full-bleed at the top to cover the iOS status-bar area,
   but its right edge stops where the rail begins so its bg-page never paints
   over the pattern. */
const headerStyle = {
  ...padStyle,
  insetInlineEnd: "var(--rail-w)",
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
  // section — matching on href rather than label so it survives translation.
  const megaHref = "#initiatives";

  // Always a real route, including on the home page itself, where this used to
  // be "#". A bare "#" is the one link on the site that goes nowhere — harmless
  // to a person, but it is also what a crawler or a grant reviewer checking for
  // dead links finds first, since it sits on the logo of every page.
  const homeHref = `/${locale}`;
  /**
   * Nav hrefs come from content in two forms, and both need the locale:
   * "/about" is a route, "#team" is a section of the home page. An anchor only
   * needs rewriting when we are *not* on the home page — there it stays a plain
   * in-page jump so it scrolls instead of navigating.
   */
  const linkHref = (href: string) => {
    if (href.startsWith("#")) return path ? `/${locale}${href}` : href;
    if (href.startsWith("/")) return `/${locale}${href}`;
    return href;
  };

  // Language toggle points at the same page in the other locale.
  const otherLocale: Locale = locale === "bg" ? "en" : "bg";
  const switchHref = `/${otherLocale}${path}`;
  const switchLabel = otherLocale.toUpperCase(); // compact "EN" / "BG"
  // The header is position:fixed (so it reliably covers the very top of the
  // viewport on iOS — sticky pins below the status-bar inset there). A spacer
  // matching its measured height keeps the content flowing below it.
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
        className="fixed left-0 top-0 z-40 bg-page pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:pb-6"
        style={headerStyle}
        onMouseLeave={() => setMega(false)}
      >
        <div className="flex items-center justify-between gap-6 lg:grid lg:grid-cols-12 lg:gap-x-[var(--grid-gap)]">
          <a href={homeHref} aria-label={ui.home} className="shrink-0 lg:col-start-1 lg:col-span-3 lg:justify-self-start">
            <Logo variant="dark" locale={locale} className="h-8 w-auto md:h-10" />
          </a>

          {/* desktop nav — one row starting at page-grid column 4, links spaced
              by a fixed 20px gap (they no longer snap to a column each). */}
          <nav className="hidden lg:col-start-4 lg:col-span-4 lg:flex lg:items-center lg:gap-5 lg:justify-self-start">
            {nav.links.map((l) =>
              initiatives && l.href === megaHref ? (
                // A button, not a link: it opens a panel rather than navigating,
                // and aria-expanded is what tells a screen reader that.
                <button
                  key={l.label}
                  type="button"
                  aria-expanded={mega}
                  onClick={() => setMega((v) => !v)}
                  onMouseEnter={() => setMega(true)}
                  className={`t-caption cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
                    mega ? "border-current" : "border-transparent hover:border-current"
                  }`}
                >
                  {l.label}
                </button>
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
              the right edge of column 11, clear of the rail. */}
          <div className="hidden items-center gap-4 lg:col-start-8 lg:col-span-4 lg:flex lg:justify-end">
            <Button variant="small" href={nav.cta.href}>{nav.cta.label}</Button>
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

                      {/* The index, as in the desktop mega menu. */}
                      <li className="border-y border-border">
                        <a
                          href={`/${locale}/initiatives`}
                          onClick={() => setOpen(false)}
                          className="t-caption flex items-center gap-2 py-3"
                        >
                          {ui.allInitiatives}
                          <span aria-hidden>→</span>
                        </a>
                      </li>
                    </ul>
                  )}
                </div>
              ))}
            </nav>

            {/* Pinned. The rule marks it off from the list that scrolls past. */}
            <div className="flex shrink-0 items-center gap-8 border-t border-border/20 pb-8 pe-8 pt-6">
              <div className="flex-1">
                <Button variant="secondary" href={nav.cta.href} fullWidth>
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
              ui={ui}
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

      {/* reserves the fixed header's space in the flow; the min-height is an
          SSR/first-paint fallback until the exact height is measured. */}
      <div
        aria-hidden
        className="min-h-[calc(env(safe-area-inset-top)+5rem)]"
        style={{ height: navH || undefined }}
      />
    </>
  );
}
