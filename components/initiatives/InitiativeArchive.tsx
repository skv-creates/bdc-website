"use client";

/**
 * The /initiatives index's archive (Figma 604:4917): the initiative rows on
 * the right, one tall cover on the left that follows the row under the
 * pointer. The frame draws a single 467×600 photograph with the category
 * label under it; which initiative it shows is what hover decides here,
 * starting from the first.
 *
 * Every cover loads eagerly — the covers are this page's subject, there are
 * four of them, and the home-page carousel already taught us what lazy
 * loading does to a stacked crossfade (see Initiatives.tsx).
 */
import { useState } from "react";
import Image from "next/image";
import type { Locale, SiteContent } from "@/lib/home-content";

/** The corner triangle prefixing each label — Initiatives' own LabelMark. */
function LabelMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <polygon points="1,3 15,3 1,17" fill="currentColor" />
    </svg>
  );
}

export function InitiativeArchive({
  initiatives,
  readMore,
  locale,
}: {
  initiatives: SiteContent["initiatives"];
  readMore: string;
  locale: Locale;
}) {
  const items = initiatives.items;
  const [active, setActive] = useState(0);
  const shown = items[active];

  return (
    <div className="bdc-grid">
      {/* The cover column (frame: 467×600 in columns 1–5). Sticky, so the
          photograph keeps the rows company while they scroll past it. Hidden
          below lg — stacked on a phone it would put a full-screen photograph
          between the heading and the list it illustrates. */}
      <div className="relative hidden lg:col-span-5 lg:block">
        <div className="sticky top-32 flex flex-col gap-2">
          <div className="relative aspect-[467/600] w-full overflow-hidden bg-brand">
            {items.map(
              (it, i) =>
                it.cover && (
                  <Image
                    key={it.slug}
                    src={it.cover.src}
                    alt={i === active ? it.cover.alt : ""}
                    fill
                    sizes="(max-width: 1023px) 90vw, 40vw"
                    loading="eager"
                    className="object-cover transition-opacity duration-300"
                    style={{
                      opacity: i === active ? 1 : 0,
                      objectPosition: it.cover.focal ?? "center",
                    }}
                  />
                ),
            )}
          </div>
          <span className="t-label inline-flex items-center gap-3">
            <LabelMark />
            {shown.label}
          </span>
        </div>
      </div>

      {/* The archive rows (frame: columns 6–11, inset 32px): category label,
          title, blurb, and the read-more. The title and the read-more are the
          links — not the whole row: a row-sized anchor made the blurbs
          unselectable, and text a visitor (or a crawler) cannot select and
          copy is a page telling them it is an application, not a document.
          Plain <a>, not <Link> — a soft navigation is intercepted by
          @modal/(.)initiatives and opens the overlay; from the index the
          destination is the initiative's own page. */}
      <ul className="col-span-full flex flex-col lg:col-span-6 lg:col-start-6 lg:px-8">
        {items.map((it, i) => {
          const href = `/${locale}/initiatives/${it.slug}`;
          return (
            <li
              key={it.slug}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="flex flex-col gap-4 border-t border-border py-6 lg:py-8"
            >
              <span className="t-label inline-flex items-center gap-3">
                <LabelMark />
                {it.label}
              </span>
              <h3 className="t-h03">
                <a href={href} className="border-b-2 border-transparent transition-colors hover:border-current">
                  {it.title}
                </a>
              </h3>
              <p className="t-body">{it.text}</p>
              <a
                href={href}
                tabIndex={-1}
                aria-hidden
                className="t-caption group inline-flex items-center gap-3 self-start font-medium"
              >
                {readMore}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
