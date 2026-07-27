/**
 * "The team behind X" panel on an initiative page (Figma 327:1137,
 * section-volunteer). A tinted block: heading + line + volunteer CTA on the
 * left, and on the right a right-aligned credit above a stack of overlapping
 * member portraits.
 */
import Image from "next/image";
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
    <div className="bg-[rgba(21,21,21,0.05)] px-8 py-10 md:px-12 md:py-12">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="flex flex-col items-start gap-8">
          <h2 className="t-h02">{team.heading}</h2>
          <p className="t-body max-w-[629px]">{team.text}</p>
          <Button href={team.cta.href} variant="secondary">
            {team.cta.label}
          </Button>
        </div>

        {members.length > 0 && (
          <div className="flex flex-col items-start gap-8 md:items-end">
            <p className="t-caption md:text-right">{team.creditLabel}</p>
            {/* Overlapping avatars: each is clipped to a circle with a 4px
                page-coloured ring, and pulled 8px onto its neighbour. */}
            <ul className="flex items-center">
              {members.map((m) => (
                <li
                  key={m.name}
                  className="relative -mr-2 size-[54px] shrink-0 overflow-hidden rounded-full border-4 border-[#f3f3f3] bg-[#f3f3f3] last:mr-0"
                  title={m.name}
                >
                  {m.photo ? (
                    <Image
                      src={m.photo}
                      alt={m.name}
                      fill
                      sizes="54px"
                      // Portraits are 3:4 and head-up, so anchor the crop to the
                      // top — object-cover centred would cut the faces off.
                      className="object-cover object-top"
                    />
                  ) : (
                    <span className="block size-full bg-[#9faacb]" aria-hidden />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
