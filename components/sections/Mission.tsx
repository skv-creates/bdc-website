import { mission } from "@/lib/home-content";

export function Mission() {
  return (
    <section className="py-20 md:py-28">
      <p className="t-label">{mission.label}</p>
      <h2 className="t-h02 mt-6 max-w-[851px]">{mission.heading}</h2>

      <div className="mt-16 grid grid-cols-1 gap-x-16 gap-y-14 sm:grid-cols-2 md:mt-24 lg:max-w-[742px]">
        {mission.stats.map((s) => (
          <div key={s.title} className="max-w-[313px]">
            <p className="t-digit">{s.value}</p>
            <p className="t-body mt-6 font-bold">{s.title}</p>
            <p className="t-body mt-3">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
