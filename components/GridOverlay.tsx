"use client";

import { useEffect, useState } from "react";

/**
 * DEV-ONLY layout-grid overlay. Press "g" to toggle.
 * Mirrors the real grid: same page padding + rail offset, the responsive
 * column count (--grid-cols: 11 / 8 / 4) and gutter (--grid-gap). Gated to
 * development in page.tsx so it never ships to production.
 */
export function GridOverlay() {
  const [show, setShow] = useState(false);
  const [cols, setCols] = useState(12);

  // toggle with "g" (ignore while typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key.toLowerCase() === "g") setShow((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // keep the overlay column count in sync with the responsive --grid-cols
  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--grid-cols").trim();
      setCols(parseInt(v, 10) || 12);
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{
        paddingInlineStart: "var(--page-gutter)",
        paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))",
      }}
    >
      <div className="bdc-grid h-full">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-full bg-[rgba(242,82,84,0.12)] outline outline-[rgba(242,82,84,0.25)]" />
        ))}
      </div>
      <span className="pointer-events-none fixed bottom-3 left-3 rounded bg-black/80 px-2 py-1 font-mono text-[11px] text-white">
        grid · {cols} cols · press g
      </span>
    </div>
  );
}
