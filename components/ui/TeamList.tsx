"use client";

import { useState } from "react";
import Image from "next/image";
import type { Member } from "@/lib/home-content";

// Shown in the reveal panel until real bios are supplied per member.
const PLACEHOLDER_BIO =
  "Кратка биография предстои — съвсем скоро тук ще намерите повече за професионалния път, интересите и приноса на този член към Българския дизайн съвет.";

/* Shared portrait tile — real photo or the Figma placeholder colour. */
function Portrait({ member }: { member: Member }) {
  return (
    <div className="relative aspect-[304/405] w-full overflow-hidden bg-black/5">
      {member.photo ? (
        <Image
          key={member.photo}
          src={member.photo}
          alt={member.name}
          fill
          sizes="(max-width: 1023px) 90vw, 304px"
          className="object-cover"
        />
      ) : (
        <div className="size-full bg-[#9faacb]" aria-hidden />
      )}
    </div>
  );
}

/* Photo + bio shown in the sticky reveal panel (desktop) and inline (mobile). */
function MemberReveal({ member }: { member: Member }) {
  return (
    <div className="flex flex-col gap-6">
      <Portrait member={member} />
      <p className="t-body">{member.bio ?? PLACEHOLDER_BIO}</p>
    </div>
  );
}

export function TeamList({ members }: { members: Member[] }) {
  // Desktop: the hovered row drives the sticky panel; empty when nothing is hovered.
  const [active, setActive] = useState<number | null>(null);
  // Mobile: tapped row reveals its portrait inline (accordion, one at a time).
  const [openMobile, setOpenMobile] = useState<number | null>(null);

  return (
    <div className="bdc-grid mt-20">
      {/* Reveal panel — cols 1–3, sticky beside the list (desktop only). */}
      <div className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-28">
          {/* Always rendered so the column keeps its height; hidden (but its space
              reserved) until a row is hovered, so the layout below never jumps. */}
          <div className={active === null ? "invisible" : undefined} aria-hidden={active === null}>
            <MemberReveal member={members[active ?? 0]} />
          </div>
        </div>
      </div>

      {/* Name / role rows — page cols 4–10 on desktop, full width below. */}
      <ul
        className="col-span-full border-t-2 border-border lg:col-start-4 lg:col-span-7"
        onMouseLeave={() => setActive(null)}
      >
        {members.map((m, i) => {
          const isOpen = openMobile === i;
          return (
            <li key={`${m.name}-${i}`} className="border-b-2 border-border">
              <button
                type="button"
                className="group grid w-full grid-cols-7 items-baseline gap-x-6 py-3 text-left hover:bg-brand"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-expanded={isOpen}
                onClick={() => setOpenMobile(isOpen ? null : i)}
              >
                {/* name — flush to the start of col 4; ✲ + 16px indent on hover */}
                <span className="col-span-4 flex items-baseline">
                  <span
                    className="inline-block w-0 overflow-hidden text-center opacity-0 group-hover:mr-4 group-hover:w-5 group-hover:opacity-100"
                    aria-hidden
                  >
                    ✲
                  </span>
                  <span className="t-body">{m.name}</span>
                </span>
                {/* role — same style as name, left-aligned starting at col 8 */}
                <span className="t-body col-start-5 col-span-3">{m.role}</span>
              </button>

              {/* Mobile inline reveal (tap) — hidden on desktop, which uses the panel. */}
              <div
                className="grid transition-[grid-template-rows] duration-[160ms] ease-out lg:hidden"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden" aria-hidden={!isOpen}>
                  <div className="max-w-[320px] pb-6">
                    <MemberReveal member={m} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
