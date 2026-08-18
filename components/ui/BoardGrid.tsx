"use client";

import { useState } from "react";
import { MemberCard } from "@/components/ui/MemberCard";
import { OverlayPanel } from "@/components/ui/OverlayPanel";
import { MemberOverlayContent } from "@/components/ui/MemberOverlayContent";
import type { Member } from "@/lib/home-content";

// Phones: single-column stack; tablet 2-up; three across on any desktop.
//
// Desktop is always three per row, but the row is drawn two different ways,
// because a name must never wrap and the longest — "Стефи Пейкова Кришнан",
// 258px at .t-body's fixed 20px — outgrows a 3-of-11 track below roughly
// 1300px:
//
// - от 1300px up: the design's own three columns of the section grid
//   (span 3 of 11), which leaves the last two tracks empty before the rail.
// - 1080px to 1300px: the container swaps --grid-cols to 3, so the same
//   three cards stretch to share the full row and the name keeps its one
//   line. 1080, not lg: at 1024 even a stretched third is 250px — measured,
//   still narrower than the name — and 1024 is an iPad in landscape anyway.
//
// Below that — an actual tablet — the row drops to two cards.
//
// Custom breakpoints are written in rem (1300/16 = 81.25): Tailwind orders
// same-unit media queries by value, and a px-based arbitrary breakpoint
// sorts before the rem-based `md`/`lg`, which would let those win everywhere.
const GRID_COLS = "min-[67.5rem]:[--grid-cols:3] min-[81.25rem]:[--grid-cols:11]";
const MEMBER_SPAN = "col-span-full md:col-span-4 min-[67.5rem]:col-span-1 min-[81.25rem]:col-span-3";

export function BoardGrid({
  members,
  bioPlaceholder,
}: {
  members: Member[];
  bioPlaceholder: string;
}) {
  // Desktop hover drives the card's swap-and-inset state (see MemberCard).
  const [hovered, setHovered] = useState<number | null>(null);
  // Clicking a member opens the shared overlay panel as a client-side modal.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const clear = (i: number) => setHovered((h) => (h === i ? null : h));

  return (
    <>
      <div className={`bdc-grid mt-10 gap-y-12 md:mt-14 ${GRID_COLS}`}>
        {members.map((m, i) => (
          <button
            key={`${m.name}-${i}`}
            type="button"
            className={`${MEMBER_SPAN} block text-left`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => clear(i)}
            onFocus={() => setHovered(i)}
            onBlur={() => clear(i)}
            onClick={() => setOpenIndex(i)}
            aria-haspopup="dialog"
          >
            <MemberCard {...m} showAlt={hovered === i} />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <OverlayPanel onClose={() => setOpenIndex(null)}>
          <MemberOverlayContent member={members[openIndex]} bioPlaceholder={bioPlaceholder} />
        </OverlayPanel>
      )}
    </>
  );
}
