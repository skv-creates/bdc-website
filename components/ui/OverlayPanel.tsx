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
  onClose,
}: {
  children: ReactNode;
  // Routable use (events): dismiss navigates via homeHref / router.back().
  homeHref?: string;
  intercepted?: boolean;
  // Client-modal use (board members): dismiss calls onClose instead of routing.
  onClose?: () => void;
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
    const dismiss =
      onClose ?? (() => (intercepted ? router.back() : router.push(homeHref ?? "/")));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dismiss();
      return;
    }
    setExiting(true);
    window.setTimeout(dismiss, 80);
  }, [onClose, intercepted, homeHref, router]);

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

  /**
   * A dialog only when there is a page behind it.
   *
   * `intercepted` already distinguishes the two ways this mounts, and the
   * semantics have to follow it. Opened over the home page via @modal it is a
   * genuine modal: `aria-modal="true"` correctly tells a screen reader the
   * content behind is inert, and Esc/scrim dismiss it.
   *
   * Arrived at directly — /bg/events/<slug> from a search result, a shared
   * link or a refresh — none of that is true. There is nothing behind it to
   * make inert, so `aria-modal` hides a page that does not exist, `role`
   * announces a dialog the reader never opened, and because the whole route
   * renders through here the page ends up with no `main` landmark and no skip
   * link at all. All eight event pages are in the sitemap and indexed, so this
   * is the state Google sends people to.
   *
   * As a full page it is therefore plain `<main>`: the landmark screen-reader
   * and keyboard users navigate by, and what the skip link in the layout
   * targets.
   */
  const Root = intercepted ? "div" : "main";
  const rootRole = intercepted
    ? ({ role: "dialog", "aria-modal": true as const } as const)
    : ({ id: "main", tabIndex: -1 } as const);

  return (
    <Root
      className={`overlay-root fixed inset-0 z-[60] ${
        exiting ? "opacity-0 transition-opacity duration-[80ms] ease-out" : ""
      }`}
      {...rootRole}
    >
      {/* Phase 1 — full-viewport translucent dark scrim; fades in first, and a
          click on it (anywhere not covered by the panel) dismisses. */}
      <div
        onClick={close}
        // Fully opaque on phones — the 48px band is too narrow for the page
        // showing through to read as anything but noise. 90% from md up, where
        // the band is wide enough for the translucency to look deliberate.
        className={`absolute inset-0 bg-dark md:bg-dark/90 ${
          reduced ? "" : "transition-opacity duration-[240ms] ease-out"
        } ${entered ? "opacity-100" : "opacity-0"}`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          // 44px hit area (WCAG 2.5.5 target size) with the 24px glyph centred
          // inside it. `left` centres that 44px box in the scrim band at every
          // width, so it tracks --overlay-panel-left instead of needing a
          // per-breakpoint offset. Inline style rather than a Tailwind
          // arbitrary-var class, which Safari can drop — same reason as the
          // panel's own left below.
          style={{ left: "calc((var(--overlay-panel-left) - 44px) / 2)" }}
          // top-12/lg:top-14 with -translate-y-1/2 keeps the glyph's centre
          // where it was (48px, 56px on lg) now that the box is 44px tall.
          className="absolute top-12 grid size-11 -translate-y-1/2 place-items-center text-text-invert transition-opacity hover:opacity-70 lg:top-14"
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
    </Root>
  );
}
