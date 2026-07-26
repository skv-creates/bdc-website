import type { SiteContent } from "@/lib/home-content";

/* v02: mission is just the label + a large statement (no stat grid). */
export function Mission({ mission }: { mission: SiteContent["mission"] }) {
  return (
    <section id="mission" className="py-20 md:py-28">
      <p className="t-label">{mission.label}</p>
      <h2 className="t-h02 mt-10 max-w-[1000px]">{mission.heading}</h2>

      {/* Supporting copy at body-medium — 24px/1.5 in the design system, which
          is .t-body-lg here (.t-body is body-default at 20px). */}
      <div className="mt-10 flex max-w-[800px] flex-col gap-6">
        {mission.body.map((p) => (
          <p key={p} className="t-body-lg">
            {p}
          </p>
        ))}
        <p className="t-body-lg font-bold">{mission.emphasis}</p>
      </div>
    </section>
  );
}
