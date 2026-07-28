/**
 * "Build with us" — Figma 329:2122 desktop, 353:1119 mobile.
 *
 * A tinted band across the content column: heading, copy and a primary CTA on
 * the left, the credit and the team's faces on the right.
 *
 * Two things that are easy to undo by accident:
 *
 * - The content starts at column 2, matching the checklist above it. The design
 *   insets the whole band by the page gutter instead, but on this page that
 *   would leave the text starting a column left of the list it sits under.
 * - Below md the columns stack and the credit half gains a rule and 60px of
 *   space above it (353:1119) — without it the two halves read as one block.
 */
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { LinkedIn } from "@/components/ui/icons";
import type { InitiativeDetail, Member } from "@/lib/home-content";

export function InitiativeTeamPanel({
  team,
  members,
}: {
  team: NonNullable<InitiativeDetail["team"]>;
  /** Already resolved from the slugs in `team.members`, in that order. */
  members: Member[];
}) {
  return (
    /* colors/primitives/neutral/dark at 5%.

       The band is full-bleed: negative margins cancel the page shell's gutter
       and rail inset so the tint runs corner to corner, then the inner div puts
       both back so the content still sits on the page column. Tinting the
       in-flow box instead leaves white margins either side of it. */
    <div
      className="bg-[rgba(21,21,21,0.05)] py-20"
      style={{
        marginInlineStart: "calc(-1 * var(--page-gutter))",
        marginInlineEnd: "calc(-1 * (var(--rail-w) + var(--rail-clear)))",
      }}
    >
      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        <div className="bdc-stop-11 bdc-grid px-6 md:px-0">
          {/* Columns 2–10, not 2–11: the block is indented a column on the left,
              so it gives one back on the right and the two paddings match. */}
          <div className="col-span-full flex flex-col gap-12 md:flex-row md:items-end md:justify-between lg:col-start-2 lg:col-span-9">
            <div className="flex flex-col items-start gap-8 md:max-w-[516px]">
              <h2 className="t-h02">{team.heading}</h2>
              <p className="t-body">{team.text}</p>
              <Button href={team.cta.href}>{team.cta.label}</Button>
            </div>

            {/* No fixed width on the column below: it is as wide as the faces,
                so justify-between lands them flush with the block's right edge
                rather than 9px short of it inside a 277px box. The credit still
                sets its own line break, so it can't over-wrap. */}
            {members.length > 0 && (
              // items-end from md so the faces align right with the credit
              // above them; the credit's own text-right only ever moved the
              // text inside its full-width box, which left the avatar list —
              // a shrink-to-fit block — sitting at the start. Below md the
              // column stacks under the copy and both go left.
              <div className="flex shrink-0 flex-col items-start gap-8 border-t border-border pt-[60px] md:items-end md:border-0 md:pt-0">
                {/* whitespace-pre, not pre-line: the credit already carries its
                    own break (see creditLabel), and pre-line let the second
                    line wrap again inside the 268px column, splitting it over
                    three. `pre` honours that one break and nothing else. The
                    longest line is ~226px, so it still fits the column and can
                    never widen it past the faces.
                    Right-aligned against the faces on desktop; once the column
                    stacks under the copy it goes left with everything else. */}
                <p className="t-caption w-full whitespace-pre text-left md:text-right">
                  {team.creditLabel}
                </p>

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
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 hidden w-max -translate-x-1/2 pb-3 opacity-0 transition-opacity duration-[120ms] ease-out group-hover/av:pointer-events-auto group-hover/av:opacity-100 group-focus-within/av:pointer-events-auto group-focus-within/av:opacity-100 md:block">
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
                              className="mt-0.5 shrink-0 transition-opacity hover:opacity-70"
                            >
                              <LinkedIn className="h-5 w-5" />
                            </a>
                          )}
                          {/* Tail: a rotated square straddling the bottom edge,
                              centred on the face below it. */}
                          <span
                            className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-dark"
                            aria-hidden
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
