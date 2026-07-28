"use client";

/**
 * Initiatives mega menu — Figma "home-desktop-mega-menu-initiatives" (354:2834).
 *
 * A white panel under the nav, over a 30%-dark scrim. Left: a preview card for
 * whichever row the pointer is on. Right: the standfirst, then one row per
 * initiative — name, category, ↗ — each linking to its page.
 *
 * The preview is the point of the component: hovering a row swaps the card, so
 * the first row is previewed by default and the panel is never empty.
 *
 * Desktop only. Below lg the nav collapses to its own drawer, which already
 * lists the same links, and a 504px panel has nowhere to go on a phone.
 *
 * Plain <a>, not next/link, on purpose: a soft navigation from here is caught by
 * the @modal/(.)initiatives interceptor and opens the overlay. From the menu the
 * destination is the page itself, so it has to be a document navigation.
 */
import { useState } from "react";
import Image from "next/image";
import { PatternTile, slotStyle } from "@/components/initiatives/patterns";
import { ArrowUpRight, HighlightDetail, ListPointer } from "@/components/ui/icons";
import type { Locale, SiteContent } from "@/lib/home-content";

export function MegaMenu({
  initiatives,
  locale,
  onNavigate,
}: {
  initiatives: SiteContent["initiatives"];
  locale: Locale;
  /** Close the menu once a row is followed. */
  onNavigate: () => void;
}) {
  const items = initiatives.items;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];
  if (!active) return null;

  return (
    // bdc-stop-11 gives the panel the same clearance before the rail that every
    // other section has — without it the rows run flush into the pattern.
    <div className="bdc-stop-11 bdc-grid gap-y-12 py-12">
      {/* Preview: columns 1–4 of the panel's 10, per the frame. */}
      <div className="col-span-full flex flex-col gap-6 lg:col-span-4">
        {/* Always the brand rose (354:2912), unlike the carousel card, which
            takes a different ground per list position. The panel swaps this
            card on every hover, so cycling it through three colours turns the
            menu into a flicker. slotStyle still supplies --p1/--p2/--p3 so the
            pattern fallback below keeps its own palette; the background and
            ink are overridden after it. */}
        <div
          className="flex flex-col gap-6 bg-brand p-6 text-text"
          style={{ ...slotStyle(activeIndex), background: undefined, color: undefined }}
        >
          {/* card-hero-image, 240px (391:4835) — the same frame the carousel
              card uses, so a photograph crops identically in both. */}
          <div className="relative h-[240px] w-full overflow-hidden">
            {/* The initiative's own cover, matching the carousel card, so the
                preview shows the page the row opens. Initiatives without a
                long-form page have no cover and keep their pattern tile.
                alt="" — the row being previewed already names it. */}
            {active.cover ? (
              <Image
                src={active.cover.src}
                alt=""
                fill
                sizes="504px"
                className="object-cover"
              />
            ) : (
              <PatternTile n={active.pattern} />
            )}
          </div>

          <div className="flex items-center gap-5">
            <HighlightDetail className="shrink-0" />
            <span className="t-label font-bold">{active.label}</span>
          </div>
        </div>

        {/* No button: the card is a preview of whichever row the pointer is on,
            and that row is already the link. A second control for the same
            destination, one the pointer has to leave the list to reach, is
            just something else to aim at. Clamped to the frame's 88px box so a
            long blurb can't stretch the panel. */}
        <p className="t-body line-clamp-3">{active.text}</p>
      </div>

      <div className="col-span-full flex flex-col lg:col-start-5 lg:col-span-6">
        <h2 className="t-h03 pb-12">{initiatives.lede ?? initiatives.heading}</h2>

        <ul>
          {items.map((item, i) => (
            <li
              key={item.slug}
              // Driven by activeIndex rather than :hover, so the row the preview
              // belongs to is marked even before the pointer arrives — on open
              // that is the first row, which is what the card is showing.
              // Same rule behaviour as the checklist: the active row and the one
              // after it drop their border so the rose reads as one band.
              className={`border-t transition-colors duration-[120ms] ${
                i === activeIndex ? "bg-brand" : ""
              } ${i === activeIndex || i === activeIndex + 1 ? "border-t-transparent" : "border-border"}`}
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
            >
              <a
                href={`/${locale}/initiatives/${item.slug}`}
                onClick={onNavigate}
                className="bdc-grid items-center py-3"
                style={{ ["--grid-cols" as string]: 8 }}
              >
                <span className="col-span-5 flex items-center gap-3">
                  <ListPointer
                    className={`w-3 shrink-0 transition-opacity ${
                      i === activeIndex ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden
                  />
                  <span className="t-body">{item.title}</span>
                </span>
                <span className="t-body col-span-2">{item.label}</span>
                <span className="col-span-1 justify-self-end" aria-hidden>
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
