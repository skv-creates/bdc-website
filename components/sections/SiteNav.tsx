"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { nav } from "@/lib/home-content";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-6 bg-page py-6 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-[50vh] before:bg-page before:content-['']">
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

      {/* mobile panel */}
      {open && (
        <div className="absolute inset-x-0 top-full z-30 flex flex-col gap-5 bg-page py-6 lg:hidden">
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
  );
}
