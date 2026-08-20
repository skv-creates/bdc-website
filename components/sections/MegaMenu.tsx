"use client";

/**
 * Initiatives mega menu — Figma "navigation-initiatives-hover" (398:3417).
 *
 * A white panel under the nav, over a 30%-dark scrim. Left: a preview of
 * whichever row the pointer is on — the cover in its rose frame, with the blurb
 * under it. Right: one row per initiative — name, category, → — each linking to
 * its page.
 *
 * The preview is the point of the component: hovering a row swaps the cover, so
 * the first row is previewed by default and the panel is never empty.
 *
 * The frame pares this back from 354:2834: the standfirst above the list, the
 * label plate on the preview card and the pointer mark on each row are all
 * gone, and the arrow now belongs to the active row alone rather than sitting
 * on all five at once.
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
        {/* initiative-cover-wrapper (398:3477) — the rose is a frame around the
            cover rather than a card behind it, so the padding is deliberately
            uneven: 12px on the sides and top, 32px at the foot. */}
        <div
          className="bg-brand px-3 pb-8 pt-3 text-text"
          style={{ ...slotStyle(activeIndex), background: undefined, color: undefined }}
        >
          {/* card-hero-image, 240px (391:4835) — the same frame the carousel
              card uses, so a photograph crops identically in both. */}
          <div className="relative h-[240px] w-full overflow-hidden">
            {/* The initiative's own cover, matching the carousel card, so the
                preview shows the page the row opens. Initiatives without a
                long-form page have no cover and keep their pattern tile — none
                of the published ones are in that state today, so this is a
                floor rather than something the menu actually shows.
                alt="" — the row being previewed already names it. */}
            {(active.cardCover ?? active.cover) ? (
              <Image
                src={(active.cardCover ?? active.cover)!.src}
                alt=""
                fill
                sizes="504px"
                quality={80}
                className="object-cover"
              />
            ) : (
              <PatternTile n={active.pattern} />
            )}
          </div>
        </div>

        {/* No button: the preview belongs to whichever row the pointer is on,
            and that row is already the link. A second control for the same
            destination, one the pointer has to leave the list to reach, is
            just something else to aim at. Clamped to three rows so a long
            blurb can't stretch the panel — and held at three rows' height
            (3 × 1.4 line-height) even when the blurb is shorter, so the panel
            does not change height as the pointer walks the rows. */}
        <p className="t-body line-clamp-3 min-h-[4.2em] text-[18px]">{active.text}</p>
      </div>

      {/* Columns 5–11 of the panel. Seven tracks rather than six so the rows can
          reach column 11, where the arrow sits. */}
      <div className="col-span-full flex flex-col lg:col-start-5 lg:col-span-7">
        <ul>
          {items.map((item, i) => (
            <li
              key={item.slug}
              // Driven by activeIndex rather than :hover, so the row the preview
              // belongs to is marked even before the pointer arrives — on open
              // that is the first row, which is what the preview is showing.
              // Every row keeps its rule now, the active one included: the rose
              // is a band behind the row, not a shape the rules make way for.
              className={`border-t border-border transition-colors duration-[120ms] ${
                i === activeIndex ? "bg-brand" : ""
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
            >
              {/* Seven tracks over the region's seven columns, so they land on
                  page columns 5–11 and the row reads against the same grid as
                  everything else on the page: name 5–8, type 9–10, arrow 11.
                  A subgrid of its own (the old 8) put the type and the arrow on
                  lines that existed nowhere else. */}
              <a
                href={`/${locale}/initiatives/${item.slug}`}
                onClick={onNavigate}
                className="bdc-grid items-center py-3"
                style={{ ["--grid-cols" as string]: 7 }}
              >
                <span className="t-body col-span-4 font-bold">{item.title}</span>
                <span className="t-body col-span-2 col-start-5">{item.label}</span>
                {/* The arrow belongs to the row being previewed, so it reads as
                    "this is the one you are about to open" rather than as five
                    identical marks. Held in the layout at zero opacity so the
                    columns don't shift as it moves down the list. Left-aligned
                    on column 11 rather than pushed to the row's end. */}
                <span
                  className={`t-caption col-start-7 transition-opacity duration-[120ms] ${
                    i === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* The one destination the rows can't offer: the index page that
            collects and explains all the initiatives — the crawlable URL the
            mega-menu button itself is not. Bottom rule closes the list. */}
        {/* mt-12: the frame's 48px of air between the last row and this link,
            so the index link reads as the list's coda rather than a fifth row. */}
        <a
          href={`/${locale}/initiatives`}
          onClick={onNavigate}
          className="group mt-12 border-t border-border py-3"
        >
          <span className="t-caption inline-flex items-center gap-3 border-b-2 border-transparent pb-0.5 transition-colors group-hover:border-current">
            {initiatives.allLabel} <span aria-hidden>→</span>
          </span>
        </a>
      </div>
    </div>
  );
}
