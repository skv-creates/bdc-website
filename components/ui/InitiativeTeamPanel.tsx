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
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Button } from "@/components/ui/Button";
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

<AvatarGroup members={members} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
