import { mission } from "@/lib/home-content";

/* Each stat spans 3 columns with a 1-column gap between the pair (cols 1–3 and
   5–7). Applied at md+ (works for both the 8-col tablet and 12-col desktop
   grids); on mobile each stat is full-width and stacks. */
const STAT_PLACEMENT = [
  "md:col-start-1",
  "md:col-start-5",
  "md:col-start-1",
  "md:col-start-5",
];

export function Mission() {
  return (
    <section className="py-20 md:py-28">
      <p className="t-label">{mission.label}</p>
      <h2 className="t-h02 mt-6 max-w-[851px]">{mission.heading}</h2>

      <div className="bdc-grid mt-16 gap-y-16 md:mt-24 md:gap-y-24">
        {mission.stats.map((s, i) => (
          <div
            key={s.title}
            className={`col-span-4 md:col-span-3 ${STAT_PLACEMENT[i]}`}
          >
            <p className="t-digit">{s.value}</p>
            <p className="t-body mt-6 font-bold">{s.title}</p>
            <p className="t-body mt-3">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
