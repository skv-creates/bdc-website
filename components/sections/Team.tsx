import { MemberCard } from "@/components/ui/MemberCard";
import { team, type Member } from "@/lib/home-content";

/* Each member spans 3 of the 11 page columns (≈304px, matching Figma).
   On desktop (lg) members sit on the page grid; below lg they fall back to a
   simple 2-up / 2-up flow. */
const MEMBER_SPAN = "col-span-2 md:col-span-4 lg:col-span-3";

/* Core team checkerboard on lg: top (cols 1–3 & 7–9), middle (4–6), bottom. */
const CORE_PLACEMENT = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-7 lg:row-start-1",
  "lg:col-start-4 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-7 lg:row-start-3",
];

function CoreGrid({ heading, members }: { heading: string; members: Member[] }) {
  return (
    <div>
      <h3 className="t-h03">{heading}</h3>
      <div className="bdc-grid mt-8 gap-y-12">
        {members.map((m, i) => (
          <div key={`${m.name}-${i}`} className={`${MEMBER_SPAN} ${CORE_PLACEMENT[i] ?? ""}`}>
            <MemberCard {...m} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Council: plain flow — 3 then 2 across (cols 1–3 / 4–6 / 7–9, then 1–3 / 4–6). */
function CouncilGrid({ heading, members }: { heading: string; members: Member[] }) {
  return (
    <div>
      <h3 className="t-h03">{heading}</h3>
      <div className="bdc-grid mt-8 gap-y-12">
        {members.map((m, i) => (
          <div key={`${m.name}-${i}`} className={MEMBER_SPAN}>
            <MemberCard {...m} />
          </div>
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
