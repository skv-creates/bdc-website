/**
 * MemberOverlayContent — the team-member inside of <OverlayPanel/>.
 *
 * Same shell + grid as EventOverlayContent, but the order is reversed: portrait
 * on the left (cols 2–5), info on the right (cols 7–11 — name, role, separator,
 * bio). Portrait comes first in the DOM, so on mobile it stacks on top.
 * Server-renderable (no interactivity).
 */
import Image from "next/image";
import { LinkedInFilled } from "@/components/ui/icons";
import type { Member } from "@/lib/home-content";

export function MemberOverlayContent({
  member,
  bioPlaceholder,
}: {
  member: Member;
  /** Locale-correct fallback copy, from the content dictionary. */
  bioPlaceholder: string;
}) {
  return (
    <div
      className="bdc-grid gap-y-10 px-6 pt-16 md:px-0 lg:gap-y-0 lg:pt-20"
      style={{ paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))" }}
    >
      {/* Portrait — grid cols 2–5 on desktop, 2–5 of the 8-col tablet grid.
          Without the md placement the 768–1023 band had neither padding (px-0
          from md) nor a column offset (lg only), so content sat flush against
          the panel edge and the portrait ballooned to ~88% of it. 3:4 at all
          sizes, so its height grows with the column width. */}
      <div className="relative col-span-full aspect-[3/4] w-full md:col-start-2 md:col-span-4 lg:col-start-2 lg:col-span-4">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="(max-width: 1023px) 90vw, 35vw"
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-[#9faacb]" aria-hidden />
        )}
      </div>

      {/* Info — page grid cols 7–11 on desktop; stacks under the portrait on
          tablet, sharing its col-2 start so both align to one edge. */}
      <div className="col-span-full flex flex-col gap-8 md:col-start-2 md:col-span-6 lg:col-start-7 lg:col-span-5">
        <h1 className="t-h02">{member.name}</h1>

        {/* Role and LinkedIn share one row, the mark pushed to the far edge of
            the info column — same on desktop and mobile. */}
        <div className="flex items-center justify-between gap-4">
          <p className="t-caption font-bold">{member.role}</p>
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              // -m-2.5 + p-2.5 grows the tap target to 44px (WCAG 2.5.5)
              // without the padding adding height to this row.
              className="-m-2.5 shrink-0 p-2.5 transition-opacity hover:opacity-70"
            >
              <LinkedInFilled className="h-6 w-6" />
            </a>
          )}
        </div>

        <div className="h-px w-full bg-border" />
        <p className="t-body">{member.bio ?? bioPlaceholder}</p>
      </div>
    </div>
  );
}
