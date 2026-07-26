import type { SiteContent } from "@/lib/home-content";

/* v02: mission is just the label + a large statement (no stat grid). */
export function Mission({ mission }: { mission: SiteContent["mission"] }) {
  return (
    <section id="mission" className="py-20 md:py-28">
      <p className="t-label">{mission.label}</p>
      <h2 className="t-h02 mt-10 max-w-[1000px]">{mission.heading}</h2>

      {/* Supporting copy at body-default (20px), narrower than the statement so
          it reads as a second voice rather than a continuation of the heading. */}
      <div className="mt-10 flex max-w-[800px] flex-col gap-6">
        {mission.body.map((p) => (
          <p key={p} className="t-body">
            {p}
          </p>
        ))}
        <p className="t-body font-bold">{mission.emphasis}</p>
      </div>
    </section>
  );
}
