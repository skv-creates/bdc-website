import { MemberCard } from "@/components/ui/MemberCard";
import { team, type Member } from "@/lib/home-content";

/* Core team: explicit 3-col checkerboard on lg (2 / 1-centered / 2 across three
   rows), matching Figma. Below lg it collapses to a plain flowing grid. */
const CORE_PLACEMENT = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-2 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-3 lg:row-start-3",
];

function CoreGrid({ heading, members }: { heading: string; members: Member[] }) {
  return (
    <div>
      <h3 className="t-h03">{heading}</h3>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-rows-3">
        {members.map((m, i) => (
          <div key={`${m.name}-${i}`} className={CORE_PLACEMENT[i] ?? ""}>
            <MemberCard {...m} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Council: plain grid — fills left-to-right (3 then 2). */
function CouncilGrid({ heading, members }: { heading: string; members: Member[] }) {
  return (
    <div>
      <h3 className="t-h03">{heading}</h3>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
        {members.map((m, i) => (
          <MemberCard key={`${m.name}-${i}`} {...m} />
        ))}
      </div>
    </div>
  );
}

export function Team() {
  return (
    <section id="team" className="py-20 md:py-28">
      <div className="max-w-[632px]">
        <h2 className="t-h02">{team.heading}</h2>
        <p className="t-body-lg mt-8">{team.vision}</p>
      </div>

      <div className="mt-16 flex flex-col gap-20 md:mt-24 md:gap-28">
        <CoreGrid heading={team.core.heading} members={team.core.members} />
        <CouncilGrid heading={team.council.heading} members={team.council.members} />
      </div>
    </section>
  );
}
