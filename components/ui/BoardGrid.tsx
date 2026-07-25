"use client";

import { useState } from "react";
import { MemberCard } from "@/components/ui/MemberCard";
import { OverlayPanel } from "@/components/ui/OverlayPanel";
import { MemberOverlayContent } from "@/components/ui/MemberOverlayContent";
import type { Member } from "@/lib/home-content";

// Phones: single-column stack; md 2-up; lg 3-up (auto-placed).
const MEMBER_SPAN = "col-span-full md:col-span-4 lg:col-span-3";

export function BoardGrid({
  members,
  eyebrow,
  bioPlaceholder,
}: {
  members: Member[];
  eyebrow?: string;
  bioPlaceholder: string;
}) {
  // Desktop hover drives the card's swap-and-inset state (see MemberCard).
  const [hovered, setHovered] = useState<number | null>(null);
  // Clicking a member opens the shared overlay panel as a client-side modal.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const clear = (i: number) => setHovered((h) => (h === i ? null : h));

  return (
    <>
      <div className="bdc-grid mt-10 gap-y-12 md:mt-14">
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
          <MemberOverlayContent
            member={members[openIndex]}
            eyebrow={eyebrow}
            bioPlaceholder={bioPlaceholder}
          />
        </OverlayPanel>
      )}
    </>
  );
}
