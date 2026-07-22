"use client";

/**
 * OverlayPanel — reusable full-screen takeover shell.
 *
 * Chrome only: a translucent dark scrim band on the left (the page shows
 * through it), an opaque content panel filling the rest, and the brand pattern
 * strip pinned to the bottom. The inside is whatever `children` you pass — today
 * `EventOverlayContent`, later a team member panel. Keeping the shell
 * content-agnostic is the whole point of the reuse.
 *
 * Motion (on mount): a full-viewport translucent dark scrim fades in, and the
 * whole white content panel slides in over it from right → left, starting part
 * way through the scrim fade (its transition-delay < the scrim's duration) so
 * the two overlap. The panel rests short of the left band, so it can start fully
 * off-screen right without ever covering the ✕. Skipped under
 * prefers-reduced-motion.
 *
 * Dismissal:
 *   - `intercepted` (opened as a modal over the home page via the @modal
 *     parallel route) → `router.back()`, which unwinds the URL and lets the
 *     parallel slot fall back to its `default` (null), closing the modal.
 *   - full page (hard nav / share / refresh) → `router.push(homeHref)`.
 * Esc and a click on the exposed dark scrim both mirror the ✕. Closing plays an
 * 80ms dissolve (the whole overlay fades out) before the navigation unmounts it.
 * Body scroll is locked while mounted.
 */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Close } from "@/components/ui/icons";

export function OverlayPanel({
  children,
  homeHref,
  intercepted = false,
}: {
  children: ReactNode;
  homeHref: string;
  intercepted?: boolean;
}) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  // `entered` drives the enter transition: scrim opacity (immediate) and the
  // panel slide, delayed one beat so the scrim reads as arriving first.
  const [entered, setEntered] = useState(false);
  // Reduced motion drops the transitions entirely (snap straight to `entered`).
  const [reduced, setReduced] = useState(false);
  // `exiting` plays the 80ms dissolve before the navigation unmounts us.
  const [exiting, setExiting] = useState(false);

  const close = useCallback(() => {
    if (closingRef.current) return; // guard against Esc + click double-fire
    closingRef.current = true;
    const navigate = () => (intercepted ? router.back() : router.push(homeHref));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigate();
      return;
    }
    setExiting(true);
    window.setTimeout(navigate, 80);
  }, [intercepted, homeHref, router]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [close]);

  // Kick off the enter transition one paint after mount (double rAF so the
  // initial hidden state is committed first). Reduced motion → snap in place.
  useEffect(() => {
    // Reduced motion: snap both phases in on the next frame (no transitions).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => {
        setReduced(true);
        setEntered(true);
      });
      return () => cancelAnimationFrame(id);
    }
    // Otherwise flip `entered` two frames in, so the initial hidden state is
    // committed first and the enter transitions actually play.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[60] ${
        exiting ? "opacity-0 transition-opacity duration-[80ms] ease-out" : ""
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Phase 1 — full-viewport translucent dark scrim; fades in first, and a
          click on it (anywhere not covered by the panel) dismisses. */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-dark/80 ${
          reduced ? "" : "transition-opacity duration-[240ms] ease-out"
        } ${entered ? "opacity-100" : "opacity-0"}`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute left-6 top-9 text-text-invert transition-opacity hover:opacity-70 lg:left-12 lg:top-11"
        >
          <Close />
        </button>
      </div>

      {/* Phase 2 — the whole white content panel slides in over the scrim from
          right → left after it. It rests short of the left band, so it starts
          fully off-screen right and never covers the ✕. */}
      <div
        // Left inset via inline style + CSS var (not a Tailwind arbitrary-var
        // class) so Safari applies it too — see --overlay-panel-left.
        style={{ left: "var(--overlay-panel-left)" }}
        className={`absolute inset-y-0 right-0 bg-page ${
          reduced ? "" : "transition-transform duration-[400ms] ease-out delay-[20ms] will-change-transform"
        } ${entered ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full overflow-y-auto">
          <div className="min-h-full pb-24">{children}</div>
        </div>

        {/* Bottom brand pattern strip — widths follow the grid (block 1 → start
            of col 2, block 2 → cols 2–6, block 3 → rest); colours track the
            pattern-rail recolour (--tri-*). See .overlay-strip in globals.css. */}
        <div className="overlay-strip pointer-events-none absolute inset-x-0 bottom-0 flex">
          <div className="strip-1 h-3" />
          <div className="strip-2 h-3" />
          <div className="strip-3 h-3" />
        </div>
      </div>
    </div>
  );
}
