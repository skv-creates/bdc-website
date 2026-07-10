"use client";

import { useEffect, useRef, useState } from "react";
import { MemberCard } from "@/components/ui/MemberCard";
import type { Member } from "@/lib/home-content";

// Placeholder until real board bios are supplied per member.
const PLACEHOLDER_BIO =
  "Кратко представяне на този член от Управителния съвет — професионален опит, ключови проекти и роля в развитието на Българския дизайн съвет. Пълната биография предстои да бъде добавена съвсем скоро.";

// Phones: single-column stack (full-width card + full-width tap bio).
const MEMBER_SPAN = "col-span-full md:col-span-4 lg:col-span-3";

/* Explicit md/lg placement so the bio can land in the neighbouring slot.
   md is an 8-col grid, 2-up: cols 1 / 5. lg is a 12-col grid, 3-up: cols
   1 / 4 / 7. In both, a member that starts a row shows its bio to the right;
   the rest show it to the left, in the slot the previous card sits in. */
const CARD_POS = [
  "md:col-start-1 md:row-start-1 lg:col-start-1 lg:row-start-1",
  "md:col-start-5 md:row-start-1 lg:col-start-4 lg:row-start-1",
  "md:col-start-1 md:row-start-2 lg:col-start-7 lg:row-start-1",
  "md:col-start-5 md:row-start-2 lg:col-start-1 lg:row-start-2",
  "md:col-start-1 md:row-start-3 lg:col-start-4 lg:row-start-2",
];
const BIO_POS = [
  "md:col-start-5 md:row-start-1 lg:col-start-4 lg:row-start-1",
  "md:col-start-1 md:row-start-1 lg:col-start-1 lg:row-start-1",
  "md:col-start-5 md:row-start-2 lg:col-start-4 lg:row-start-1",
  "md:col-start-1 md:row-start-2 lg:col-start-4 lg:row-start-2",
  "md:col-start-5 md:row-start-3 lg:col-start-1 lg:row-start-2",
];

export function BoardGrid({ members }: { members: Member[] }) {
  const [hovered, setHovered] = useState<number | null>(null); // desktop hover
  const [openMobile, setOpenMobile] = useState<number | null>(null); // mobile tap

  // Entering a photo activates that member and cancels any pending dismiss.
  // Leaving a photo schedules a dismiss after a short delay: entering another
  // photo within the delay cancels it (so sweeping across the row hands off
  // smoothly through the gutters), but landing on blank space lets it fire.
  // Dimmed members stay interactive so the hand-off works.
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activate = (i: number) => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setHovered(i);
  };
  const scheduleDismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setHovered(null), 140);
  };
  useEffect(() => () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  }, []);

  return (
    <div className="bdc-grid mt-10 gap-y-12 md:mt-14">
      {members.map((m, i) => {
        const isHovered = hovered === i;
        const dimmed = hovered !== null && !isHovered;
        const isOpen = openMobile === i;
        const bio = m.bio ?? PLACEHOLDER_BIO;
        return (
          <div key={`${m.name}-${i}`} className="contents">
            {/* Member card — dims (keeps its cell) when another is hovered. */}
            <button
              type="button"
              className={`${MEMBER_SPAN} ${CARD_POS[i]} block text-left md:transition-opacity md:duration-[120ms] md:ease-out ${dimmed ? "md:opacity-5" : "md:opacity-100"}`}
              onFocus={() => activate(i)}
              onBlur={scheduleDismiss}
              aria-expanded={isOpen}
              onClick={() => setOpenMobile(isOpen ? null : i)}
            >
              <MemberCard
                {...m}
                showAlt={isHovered}
                photoProps={{ onMouseEnter: () => activate(i), onMouseLeave: scheduleDismiss }}
              />

              {/* Phone inline reveal (tap) — md and up use the side slot instead. */}
              <div
                className="grid transition-[grid-template-rows] duration-[160ms] ease-out md:hidden"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden" aria-hidden={!isOpen}>
                  <p className="t-body pt-3">{bio}</p>
                </div>
              </div>
            </button>

            {/* Bio — sits in the neighbouring slot; shown only on hover/focus. */}
            <div
              className={`hidden ${BIO_POS[i]} md:col-span-4 md:block md:transition-opacity md:duration-[120ms] md:ease-out lg:col-span-3 ${isHovered ? "md:opacity-100" : "md:pointer-events-none md:opacity-0"}`}
              aria-hidden={!isHovered}
            >
              <p className="t-body">{bio}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
