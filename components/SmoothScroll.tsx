"use client";

import { useEffect } from "react";

/**
 * Smoothly scrolls to in-page anchors (#id), offsetting by the sticky nav's
 * actual height so section headings aren't hidden behind it. Delegated at the
 * document so it covers nav items, hero CTAs, and footer links alike.
 * (CSS scroll-padding-top isn't usable here — Lightning CSS strips it from the
 * html rule during its color-scheme transform.)
 */
export function SmoothScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href") || "";
      if (hash.length < 2) return; // ignore bare "#"
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      const navHeight = document.querySelector("header")?.offsetHeight ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
