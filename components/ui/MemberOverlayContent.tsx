/**
 * MemberOverlayContent — the team-member inside of <OverlayPanel/>.
 *
 * Same shell + grid as EventOverlayContent, but the order is reversed: portrait
 * on the left (cols 2–5), info on the right (cols 7–11 — mandate eyebrow, name,
 * role, separator, bio). Portrait comes first in the DOM, so on mobile it stacks
 * on top. Server-renderable (no interactivity).
 */
import Image from "next/image";
import type { Member } from "@/lib/home-content";

// Shown until real board bios are supplied per member.
const PLACEHOLDER_BIO =
  "Кратко представяне на този член от екипа — професионален опит, ключови проекти и роля в развитието на Българския дизайн съвет. Пълната биография предстои да бъде добавена съвсем скоро.";

export function MemberOverlayContent({
  member,
  eyebrow,
}: {
  member: Member;
  eyebrow?: string;
}) {
  return (
    <div
      className="bdc-grid gap-y-10 px-6 pt-16 md:px-0 lg:gap-y-0 lg:pt-20"
      style={{ paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))" }}
    >
      {/* Portrait — page grid cols 2–5 on desktop; 3:4 portrait (height:width
          4:3) at all sizes, so its height grows with the column width. */}
      <div className="relative col-span-full aspect-[3/4] w-full lg:col-start-2 lg:col-span-4">
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

      {/* Info — page grid cols 7–11 on desktop. */}
      <div className="col-span-full flex flex-col gap-8 lg:col-start-7 lg:col-span-5">
        {eyebrow && <p className="t-caption">{eyebrow}</p>}
        <h1 className="t-h02">{member.name}</h1>
        <p className="t-caption font-bold">{member.role}</p>
        <div className="h-px w-full bg-border" />
        <p className="t-body">{member.bio ?? PLACEHOLDER_BIO}</p>
      </div>
    </div>
  );
}
