/**
 * MemberOverlayContent — the team-member inside of <OverlayPanel/>.
 *
 * Same shell + grid as EventOverlayContent, but the order is reversed: portrait
 * on the left (cols 2–6), info on the right (cols 8–12 — name, role, separator,
 * bio) — mirrors EventOverlayContent's spans so the bottom pattern strip traces
 * the left block the same way. Portrait comes first in the DOM, so on mobile it
 * stacks on top.
 * Server-renderable (no interactivity).
 */
import Image from "next/image";
import { LinkedIn } from "@/components/ui/icons";
import type { Member } from "@/lib/home-content";
import { roleForms } from "@/lib/role-forms";

export function MemberOverlayContent({
  member,
  bioPlaceholder,
}: {
  member: Member;
  /** Locale-correct fallback copy, from the content dictionary. */
  bioPlaceholder: string;
}) {
  const { full: roleFull, abbr: roleAbbr } = roleForms(member.role);
  return (
    <div
      className="bdc-grid gap-y-10 px-6 pt-16 md:px-0 lg:gap-y-0 lg:pt-20"
      style={{ paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))" }}
    >
      {/* Portrait — grid cols 2–5 on desktop, 2–5 of the 8-col tablet grid.
          Without the md placement the 768–1023 band had neither padding (px-0
          from md) nor a column offset (lg only), so content sat flush against
          the panel edge and the portrait ballooned to ~88% of it. 3:4 at all
          sizes, so its height grows with the column width. */}
      <div className="relative col-span-full aspect-[3/4] w-full md:col-start-2 md:col-span-4 lg:col-start-2 lg:col-span-5">
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

      {/* Info — page grid cols 8–12 on desktop; stacks under the portrait on
          tablet, sharing its col-2 start so both align to one edge.
          @container: the column's width decides which form of the role fits —
          see the role row below. */}
      <div className="@container col-span-full flex flex-col gap-8 md:col-start-2 md:col-span-6 lg:col-start-8 lg:col-span-5">
        <h1 className="t-h02">{member.name}</h1>

        {/* Role and LinkedIn share one row, the mark pushed to the far edge of
            the info column — same on desktop and mobile.
            The title is written out in full — „Заместник-председател /
            Съосновател" — dropping to the abbreviation only where the line
            would wrap: the full string (measured 334px bold) plus the
            LinkedIn mark and its gap (40px) need 374px of column. */}
        <div className="flex items-center justify-between gap-4">
          {roleFull === roleAbbr ? (
            <p className="t-caption font-bold">{roleFull}</p>
          ) : (
            <p className="t-caption font-bold">
              <span className="@max-[376px]:hidden">{roleFull}</span>
              <span className="hidden @max-[376px]:inline">{roleAbbr}</span>
            </p>
          )}
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
              <LinkedIn className="h-6 w-6" />
            </a>
          )}
        </div>

        <div className="h-px w-full bg-border" />
        <p className="t-body">{member.bio ?? bioPlaceholder}</p>
      </div>
    </div>
  );
}
