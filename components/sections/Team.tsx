import { BoardGrid } from "@/components/ui/BoardGrid";
import { TeamList } from "@/components/ui/TeamList";
import { Button } from "@/components/ui/Button";
import { team, type Member } from "@/lib/home-content";

/* Eyebrow label on the left, an optional intro paragraph (and CTA) on the right —
   echoes the section headers in Figma (label cols 1–3, copy cols 4–9). */
function GroupHeader({
  eyebrow,
  intro,
  children,
}: {
  eyebrow: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bdc-grid gap-y-6">
      <p className="t-label col-span-full lg:col-span-3">{eyebrow}</p>
      {(intro || children) && (
        <div className="col-span-full flex flex-col items-start gap-8 lg:col-start-4 lg:col-span-6">
          {intro && <p className="t-h05 leading-tight">{intro}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

export function Team() {
  const { board, advisory, volunteers } = team;

  // Council + volunteers share one interactive list; each row's role tells them
  // apart (— matches the "combine the council and volunteers" Figma design).
  const community: Member[] = [...advisory.members, ...volunteers.members];

  return (
    <section id="team" className="py-20 md:py-28">
      <div className="bdc-grid gap-y-10">
        <h2 className="t-h02 col-span-full lg:col-span-2">{team.heading}</h2>
        <p className="t-h05 leading-tight col-span-full lg:col-start-4 lg:col-span-6">
          {team.vision}
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-20 md:mt-24 md:gap-28">
        <div>
          <GroupHeader eyebrow={board.eyebrow} />
          <BoardGrid members={board.members} />
        </div>

        <div>
          <GroupHeader eyebrow={volunteers.eyebrow} intro={volunteers.intro}>
            <Button href={volunteers.cta.href}>{volunteers.cta.label}</Button>
          </GroupHeader>
          <TeamList members={community} />
        </div>
      </div>
    </section>
  );
}
