"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { nav } from "@/lib/home-content";

/* Match the page content column: gutter on the left, rail + gap on the right. */
const padStyle = {
  paddingInlineStart: "var(--page-gutter)",
  paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))",
} as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  // The header is position:fixed (so it reliably covers the very top of the
  // viewport on iOS — sticky pins below the status-bar inset there). A spacer
  // matching its measured height keeps the content flowing below it.
  const headerRef = useRef<HTMLElement>(null);
  const [navH, setNavH] = useState(0);

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
        className="fixed inset-x-0 top-0 z-40 bg-page pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)]"
        style={padStyle}
      >
        <div className="flex items-center justify-between gap-6">
          <a href="#" aria-label="Начало" className="shrink-0">
            <Logo variant="dark" className="h-8 w-auto md:h-10" />
          </a>

          {/* desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {nav.links.map((l) => (
              <a key={l.label} href={l.href} className="t-caption border-b-2 border-transparent transition-colors hover:border-current">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Button variant="small" href={nav.cta.href}>{nav.cta.label}</Button>
            <a href={nav.lang.href} className="t-caption border-b-2 border-transparent transition-colors hover:border-current">
              {nav.lang.label}
            </a>
          </div>

          {/* mobile toggle */}
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-label="Меню"
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
              <a key={l.label} href={l.href} className="t-h05" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <Button variant="small" href={nav.cta.href}>{nav.cta.label}</Button>
              <a href={nav.lang.href} className="t-body">{nav.lang.label}</a>
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
