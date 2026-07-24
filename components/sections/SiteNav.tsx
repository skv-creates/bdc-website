"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import type { Locale, SiteContent } from "@/lib/home-content";

/* Match the page content column: gutter on the left, gap on the right.
   The header itself stops at the rail's left edge (see headerStyle) so its
   bg-page background never paints over the fixed pattern rail; the content
   then only needs the gap on its end to clear into the space before the rail. */
const padStyle = {
  paddingInlineStart: "var(--page-gutter)",
  paddingInlineEnd: "var(--rail-gap)",
} as const;

/* The fixed header is full-bleed at the top to cover the iOS status-bar area,
   but its right edge stops where the rail begins so it doesn't overlap it. */
const headerStyle = {
  ...padStyle,
  insetInlineEnd: "var(--rail-w)",
} as const;

export function SiteNav({
  nav,
  ui,
  locale,
  path = "",
}: {
  nav: SiteContent["nav"];
  ui: SiteContent["ui"];
  locale: Locale;
  /** Route path after the locale (e.g. "/privacy"); "" on the home page.
      Off home, the in-page "#..." links and the logo have to point back at the
      home route, and the language toggle has to stay on the current page. */
  path?: string;
}) {
  const [open, setOpen] = useState(false);

  const homeHref = path ? `/${locale}` : "#";
  const linkHref = (href: string) =>
    path && href.startsWith("#") ? `/${locale}${href}` : href;

  // Language toggle points at the same page in the other locale.
  const otherLocale: Locale = locale === "bg" ? "en" : "bg";
  const switchHref = `/${otherLocale}${path}`;
  const switchLabel = otherLocale.toUpperCase(); // compact "EN" / "BG"
  // The header is position:fixed (so it reliably covers the very top of the
  // viewport on iOS — sticky pins below the status-bar inset there). A spacer
  // matching its measured height keeps the content flowing below it.
  const headerRef = useRef<HTMLElement>(null);
  const [navH, setNavH] = useState(0);

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

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 top-0 z-40 bg-page pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)]"
        style={headerStyle}
      >
        <div className="flex items-center justify-between gap-6 lg:grid lg:grid-cols-11 lg:gap-x-[var(--grid-gap)]">
          <a href={homeHref} aria-label={ui.home} className="shrink-0 lg:col-start-1 lg:col-span-3 lg:justify-self-start">
            <Logo variant="dark" className="h-8 w-auto md:h-10" />
          </a>

          {/* desktop nav — one row starting at page-grid column 4, links spaced
              by a fixed 20px gap (they no longer snap to a column each). */}
          <nav className="hidden lg:col-start-4 lg:col-span-4 lg:flex lg:items-center lg:gap-5 lg:justify-self-start">
            {nav.links.map((l) => (
              <a
                key={l.label}
                href={linkHref(l.href)}
                className="t-caption whitespace-nowrap border-b-2 border-transparent transition-colors hover:border-current"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:col-start-8 lg:col-span-4 lg:flex lg:justify-end">
            <Button variant="small" href={nav.cta.href}>{nav.cta.label}</Button>
            <a href={switchHref} aria-label={ui.switchLanguage} className="t-caption border-b-2 border-transparent transition-colors hover:border-current">
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

        {/* mobile panel */}
        {open && (
          <div className="absolute inset-x-0 top-full z-30 flex flex-col gap-5 bg-page pb-6 lg:hidden" style={padStyle}>
            {nav.links.map((l) => (
              <a key={l.label} href={linkHref(l.href)} className="t-h05" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <Button variant="small" href={nav.cta.href}>{nav.cta.label}</Button>
              <a href={switchHref} aria-label={ui.switchLanguage} className="t-body">{switchLabel}</a>
            </div>
          </div>
        )}
      </header>

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
