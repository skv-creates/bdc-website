"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

/**
 * A sticky "On this page" index for a long single-column document.
 *
 * Built for the privacy policy, which is nine numbered clauses that people
 * arrive at looking for one of them — usually their rights, or how long we
 * keep something. Without an index that is a scroll hunt through legal prose.
 *
 * Desktop only, by design rather than by omission. It lives in the empty
 * columns beside the text, and below `lg` there are no empty columns: the body
 * already spans the full grid. Stacking the index above the document on a
 * phone would push the actual policy below the fold to save scrolling, which
 * is the opposite of the point.
 */

/**
 * How far down the viewport counts as "you are reading this".
 *
 * The header is `position: fixed` and about 7rem tall, so a heading level with
 * the top of the window is behind it, not being read. The line sits just below
 * where the header ends.
 */
const ACTIVE_LINE = 140;

export function PageToc({ label, items }: { label: string; items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  // The parent builds `items` inline, so it is a fresh array on every render
  // and depending on it directly would tear down and rebuild the listener each
  // time. Only the ids matter to the scroll maths — the labels are never read
  // here — so collapse them to a string and let that be both the dependency
  // and the data. That leaves nothing to keep in a ref.
  const key = items.map((i) => i.id).join(",");

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    let frame = 0;

    const read = () => {
      frame = 0;

      // A tall window means less total scroll, so the last heading can run out
      // of document before it ever reaches the line and the final entry would
      // never light up. Measured on the privacy policy: harmless up to a
      // viewport around 1000px tall, load-bearing from ~1100px — which is an
      // ordinary desktop monitor, so this is not a hypothetical.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        setActive(ids[ids.length - 1] ?? "");
        return;
      }

      // The last heading to have crossed the line going down is the one whose
      // text currently fills the screen. Walking in document order means the
      // answer is simply the last match.
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_LINE) current = id;
      }
      setActive(current);
    };

    // Scroll fires far more often than the screen repaints; coalescing to one
    // read per frame keeps this off the critical path. Nine getBoundingClientRect
    // calls a frame is nothing, and it avoids the ordering puzzles an
    // IntersectionObserver runs into when several short sections are on screen.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  /**
   * Scroll, then move focus to the section itself.
   *
   * The focus move is the part that matters and the part a plain `href="#id"`
   * gets wrong here: without it a screen-reader or keyboard user is scrolled
   * to the clause but their reading position is still up in the index, so the
   * next Tab goes to the following index entry rather than into the text they
   * just asked for. The sections carry `tabIndex={-1}` to receive it.
   *
   * The hash is written with replaceState rather than pushState so the browser
   * Back button leaves the policy entirely instead of retracing every heading
   * the reader glanced at.
   */
  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return; // let the browser try the plain anchor
    event.preventDefault();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav
      aria-label={label}
      className="sticky top-32 hidden lg:block"
      // Never taller than the space under the header, so a document with more
      // clauses than fit scrolls inside the index instead of running off the
      // bottom of a sticky box where the last entries are unreachable.
      style={{ maxHeight: "calc(100vh - 10rem)", overflowY: "auto" }}
    >
      <p className="t-caption font-bold">{label}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => go(e, item.id)}
                // aria-current is what carries the state to a screen reader;
                // the weight and the opacity carry it visually. The rose bar
                // is decoration on top of both, never the only signal — it is
                // a pale pink on white and would fail on contrast alone.
                aria-current={isActive ? "true" : undefined}
                className={`t-caption block border-l-2 pl-3 transition-opacity hover:opacity-100 ${
                  isActive ? "border-brand font-bold opacity-100" : "border-transparent opacity-50"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
