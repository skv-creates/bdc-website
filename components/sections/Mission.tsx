import type { SiteContent } from "@/lib/home-content";

/* v02: mission is just the label + a large statement (no stat grid). */
export function Mission({ mission }: { mission: SiteContent["mission"] }) {
  return (
    <section id="mission" className="py-20 md:py-28">
      <p className="t-label">{mission.label}</p>
      <h2 className="t-h02 mt-10 max-w-[1000px]">{mission.heading}</h2>
    </section>
  );
}
