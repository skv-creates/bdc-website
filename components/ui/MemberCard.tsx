"use client";

import Image from "next/image";
import type { Member } from "@/lib/home-content";
import { roleForms } from "@/lib/role-forms";

/**
 * Board member card. On hover/focus (driven by `showAlt` from the parent, not
 * CSS :hover, so the state can be shared): the portrait cross-fades to the
 * alternate photo AND insets by 16px inside a brand-coloured box — the box uses
 * --color-brand (the current hover colour, which the pattern rail recolours).
 * Padding on the outer box shrinks the inner wrapper; the fill images track it.
 */
export function MemberCard({
  name,
  role,
  photo,
  photoHover,
  showAlt = false,
  loadAlt = false,
}: Member & { showAlt?: boolean; loadAlt?: boolean }) {
  const sizes = "(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 304px";
  /**
   * The alternate portrait downloads on first intent, not on scroll: latched
   * once showAlt first goes true and never released, so the crossfade only
   * pays the network cost for cards someone actually hovers. Ten portraits
   * per page-view saved for everyone else.
   */
  // Grid cards carry the role only. Notion stores the full title
  // ("Председател / Съосновател") for the overlay; everything from the
  // first " / " onward is trimmed here so the cards stay one line.
  const { full, abbr } = roleForms(role.split(" / ")[0]);
  return (
    // @container: the card's own width decides which form of the role fits —
    // see the figcaption below.
    <figure className="@container flex flex-col gap-3">
      {/* Brand box behind; the inner photo insets 16px on hover (absolute inset,
          so the brand shows evenly on all four sides — padding + aspect-ratio
          dropped the bottom edge). */}
      <div className="relative aspect-[304/405] w-full overflow-hidden bg-brand">
        <div
          className={`absolute overflow-hidden bg-black/5 transition-all duration-[120ms] ease-out ${
            showAlt ? "inset-4" : "inset-0"
          }`}
        >
          {photo ? (
            <Image src={photo} alt={name} fill sizes={sizes} className="object-cover" />
          ) : (
            // Portrait pending — Figma placeholder tile.
            <div className="size-full bg-[#9faacb]" aria-hidden />
          )}
          {photoHover && (showAlt || loadAlt) && (
            <Image
              src={photoHover}
              alt=""
              aria-hidden
              fill
              sizes={sizes}
              // object-top, unlike the portrait above it: the hover frames are
              // 2:3 against this 3:4 box, so a centred crop trims ~11% of the
              // height and takes the top of the head with it. The slack in
              // these shots is at the bottom.
              className={`object-cover object-top transition-opacity duration-[120ms] ease-out ${
                showAlt ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      </div>
      <figcaption>
        <p className="t-body font-bold">{name}</p>
        {/* The title written out in full — „Заместник-председател" — dropping
            to the abbreviation only when the card is too narrow to hold the
            full word on one line (measured 204px at t-caption's 16px;
            threshold set with a little slack — the narrowest card the grids
            produce is 259px, so the fallback is belt only). Both spans render
            so the swap is pure CSS. */}
        {full === abbr ? (
          <p className="t-caption">{full}</p>
        ) : (
          <p className="t-caption">
            <span className="@max-[212px]:hidden">{full}</span>
            <span className="hidden @max-[212px]:inline">{abbr}</span>
          </p>
        )}
      </figcaption>
    </figure>
  );
}
