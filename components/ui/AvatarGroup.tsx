/**
 * The overlapping team faces with their hover tooltips — name, role and
 * LinkedIn in a dark card that lifts off the avatar.
 *
 * Extracted verbatim from InitiativeTeamPanel (Figma 329:2122), because the
 * About page's «Да създадем заедно с(ъ)вета» band shows the same faces and
 * the two must behave identically — a second copy would have drifted on the
 * first change, which is exactly how the event meta lines once diverged.
 * Pure CSS (group-hover), so it stays server-renderable.
 */
import Image from "next/image";
import { LinkedIn } from "@/components/ui/icons";
import type { Member } from "@/lib/home-content";

export function AvatarGroup({ members }: { members: Member[] }) {
  return (
    <>
            {/* Overlapping faces: each clipped to a circle with a 4px
              page-coloured ring, pulled 8px onto its neighbour.

              The circular clip sits on the inner div, not the <li> — the
              tooltip is a child and overflow-hidden on the <li> would cut
              it off. Hovering lifts the face and raises it above its
              neighbours, which otherwise overlap it by 8px. */}
            <ul className="flex items-center">
              {members.map((m) => (
                <li
                  key={m.name}
                  className="group/av relative -mr-2 shrink-0 last:mr-0 hover:z-20 focus-within:z-20"
                >
                  <div className="relative size-[60px] overflow-hidden rounded-full border-4 border-[#f3f3f3] bg-[#f3f3f3] transition-transform duration-[120ms] ease-out group-hover/av:-translate-y-1 group-focus-within/av:-translate-y-1">
                    {m.photo ? (
                      <Image
                        src={m.photo}
                        alt={m.name}
                        fill
                        sizes="60px"
                        // Portraits are 3:4 and head-up, so anchor the crop to
                        // the top — object-cover centred would cut the faces off.
                        className="object-cover object-top"
                      />
                    ) : (
                      <span
                        className="block size-full bg-[#9faacb]"
                        aria-hidden
                      />
                    )}
                  </div>

                  {/* Tooltip. The pb-3 is the gap to the face AND the bridge
                      across it — without it the pointer leaves the <li> on
                      the way up and the card flickers shut. Hidden below md:
                      there is no hover on a phone, and it would overflow the
                      column. */}
                  {/* Centred on its avatar, except on the last two — the
                      stack is right-aligned against the rail, so a centred
                      tooltip there hangs off the page and gets painted over
                      by the pattern. Those anchor to their right edge
                      instead, which keeps them inside the column. */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 hidden w-max -translate-x-1/2 pb-3 opacity-0 transition-opacity duration-[120ms] ease-out group-hover/av:pointer-events-auto group-hover/av:opacity-100 group-focus-within/av:pointer-events-auto group-focus-within/av:opacity-100 md:block [li:nth-last-child(-n+2)_&]:left-auto [li:nth-last-child(-n+2)_&]:right-0 [li:nth-last-child(-n+2)_&]:translate-x-0">
                    <div className="relative flex items-start gap-8 rounded-2xl bg-dark px-5 py-4 text-text-invert">
                      <div className="flex flex-col">
                        <span className="t-caption font-bold">
                          {m.name}
                        </span>
                        <span className="t-caption opacity-80">
                          {m.role}
                        </span>
                      </div>
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`LinkedIn — ${m.name}`}
                          // grid + size-6: the icon stays 20px, the target
                          // reaches the 24×24 of WCAG 2.2 2.5.8.
                          className="grid size-6 shrink-0 place-items-center transition-opacity hover:opacity-70"
                        >
                          <LinkedIn className="h-5 w-5" />
                        </a>
                      )}
                      {/* Tail: a rotated square straddling the bottom edge,
                          centred on the face below it. */}
                      <span
                        className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-dark [li:nth-last-child(-n+2)_&]:left-auto [li:nth-last-child(-n+2)_&]:right-6 [li:nth-last-child(-n+2)_&]:translate-x-0"
                        aria-hidden
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
    </>
  );
}
