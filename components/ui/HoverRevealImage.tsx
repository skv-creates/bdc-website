"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * A photograph that swaps for a second one — on hover, and again when it is
 * scrolled past.
 *
 ── Geometry: the same frame every other page uses ─────────────────────────
 *
 * Full width of the content column, the design's aspect from md up, capped at
 * the design's height — exactly the initiative hero (see the note on the
 * 1092×640 frame in InitiativeOverlayContent) and for the same reasons:
 *
 * - **Full width**, so it lines up with the copy above and below it. An
 *   earlier version derived a max *width* from the height cap, which left the
 *   picture narrower than its own column and every edge on the page
 *   disagreeing with every other.
 * - **Aspect only, no height clamp.** Setting both an aspect and a max-height
 *   makes them fight: at a column wider than the design's, the aspect asks for
 *   more height than the clamp allows, the clamp wins, and the frame ends up at
 *   whatever ratio the viewport happens to produce — 1.89 at 1512, against the
 *   design's 1.75 — so object-cover eats 21% of a 3:2 photograph instead of
 *   14%. That is what read as distortion. The initiative hero has no clamp for
 *   the same reason and renders 1179×691 at its drawn 1092×640.
 * - **Square on phones.** A 1.75:1 crop at a phone's width is barely 200px
 *   tall and three people read as a strip.
 * - **Centred crop.** The frame is wider than a 3:2 photograph, so something
 *   has to go; taken off the top it removes heads, which is how the first
 *   attempt at this cut all three. Centre loses a little at both edges and
 *   keeps the faces, and `focal` is there for a photograph that needs
 *   otherwise.
 *
 * ── Two triggers ──────────────────────────────────────────────────────────
 *
 * - **Pointer** — hover, the obvious desktop gesture.
 * - **Scrolled past** — the picture's middle rising above the viewport's
 *   middle. Deliberately "past" and not "in view": an in-view test fires while
 *   the picture is still arriving, so the first photograph is swapped away
 *   before it has been looked at. This way the default is what you meet, and
 *   the second is the reward for carrying on down the page — which is also the
 *   only way anyone on a phone sees it, there being no hover there.
 *
 * Both feed one boolean, so they cannot disagree.
 *
 */
export function HoverRevealImage({
  src,
  hoverSrc,
  alt,
  width,
  height,
  /** The frame's aspect from md up. Figma 500:1917 draws 1092×624. */
  aspect = "1092/624",
  /** Phones get a square: a wide crop at that width is a strip, not a portrait. */
  phoneAspect = "1/1",
  /**
   * The container's height cap, from the design (523:2898 is 1092×600).
   *
   * Note what this costs, because it is a real trade and not free: the frame is
   * full width, and this column is wider than Figma's 1092, so once the aspect
   * would exceed 600px the cap wins and the box grows *wider* than the drawn
   * ratio. A 3:2 photograph then loses more of its height to the crop. Capping
   * the width instead would keep the drawn ratio exactly, but would leave the
   * picture narrower than the copy above it.
   */
  maxHeight = 600,

  /** object-position, for a photograph that a centred crop does not suit. */
  focal = "center",
  /** Brand frame revealed in the active state — 18px in Figma 518:2577. */
  frame = 18,
  priority = false,
}: {
  src: string;
  hoverSrc: string;
  /** One alt for the pair: it is the same three people in both frames. */
  alt: string;
  /** Intrinsic pixels, so the aspect is exact rather than assumed. */
  width: number;
  height: number;
  aspect?: string;
  phoneAspect?: string;
  maxHeight?: number;
  focal?: string;
  frame?: number;
  priority?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState(false);
  const [past, setPast] = useState(false);
  /**
   * The second photograph is not in the document until the first one is on
   * screen, and never leaves once it is.
   *
   * Two reasons, and neither is micro-optimism. Next flagged the hover image as
   * the Largest Contentful Paint: a lazily-loaded, fully transparent,
   * decorative photograph was setting the page's headline performance metric,
   * and Next's own advice — mark it `eager` — would fix the metric by
   * downloading half a megabyte nobody asked for. Not rendering it until the
   * figure is in view removes it from the question entirely.
   *
   * The second is carbon. A visitor who never scrolls this far downloads one
   * photograph rather than two, on a site that publishes its gCO₂ per view in
   * the footer.
   *
   * Armed on *in view* rather than on the swap itself, so the file is fetched
   * while the first picture is being looked at and is ready by the time anyone
   * hovers or scrolls past — the reveal never waits on the network.
   */
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    const read = () => {
      const r = el.getBoundingClientRect();
      // Middle of the picture above the middle of the viewport = scrolled past.
      setPast(r.top + r.height / 2 < window.innerHeight / 2);
      // Anywhere on screen is enough to start fetching the second one.
      if (r.top < window.innerHeight && r.bottom > 0) setArmed(true);
    };

    read();
    // Passive, and rAF-coalesced: a scroll handler that measures on every
    // event is the classic way to make a page janky, and this one runs on a
    // page that is mostly photographs.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        read();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const active = pointer || past;
  // Full-bleed within the column, like every other hero on the site.
  const sizes = "(max-width: 1023px) 92vw, 80vw";

  return (
    <figure
      data-hero-photo
      className="relative w-full overflow-hidden bg-brand [aspect-ratio:var(--phone-aspect)] md:[aspect-ratio:var(--frame-aspect)]"
      style={
        {
          "--phone-aspect": phoneAspect,
          "--frame-aspect": aspect,
          maxHeight,
        } as React.CSSProperties
      }
      ref={box}
      onMouseEnter={() => setPointer(true)}
      onMouseLeave={() => setPointer(false)}
    >
      <div
        className="absolute overflow-hidden transition-[inset] duration-[200ms] ease-out motion-reduce:transition-none"
        style={{ inset: active ? frame : 0 }}
      >
        {/* The pair is announced once, by the first: the second is the same
            people in the same place, and describing it again would have a
            screen reader read the photograph twice. */}
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          // 80, not the site default of 75: fine for a 60px avatar, visibly
          // soft across a full-width photograph. Same note as the initiative
          // hero and next.config.ts's images.qualities.
          quality={80}
          priority={priority}
          className="object-cover"
          style={{ objectPosition: focal }}
        />
        {armed && (
          <Image
            src={hoverSrc}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            quality={80}
            // Low, not lazy: by the time this mounts the picture is already on
            // screen, so `lazy` would load it immediately anyway. `low` tells
            // the browser it may wait behind anything the visitor is actually
            // reading.
            fetchPriority="low"
            className={`object-cover transition-opacity duration-[200ms] ease-out motion-reduce:transition-none ${
              active ? "opacity-100" : "opacity-0"
            }`}
            style={{ objectPosition: focal }}
          />
        )}
      </div>

    </figure>
  );
}
