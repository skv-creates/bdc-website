/**
 * "Защо дизайнът е важен" — two sourced statistics between the mission and the
 * initiatives (Figma 355:3200).
 *
 * The stats sit in columns 2–4 and 6–8: a full column of air between them, so
 * the two figures read as separate claims rather than a table. Below md they
 * stack, since three columns on a phone is about forty characters a line.
 *
 * The whole section starts on column 2, indented to match the mission band
 * above it. The two grids are siblings rather than one nested inside the other
 * — nesting would re-divide a single cell into eleven of its own, and the stats
 * would stop lining up with the heading.
 */
import type { SiteContent } from "@/lib/home-content";

export function DesignImpact({ designImpact }: { designImpact: SiteContent["designImpact"] }) {
  return (
    <section className="bdc-stop-11 py-20">
      {/* span-7 rather than running to the end: it has to hold at both the
          8-column and the 11-column grid, and starting on 2 leaves only 7
          tracks at md. Spanning further would spill into implicit columns. */}
      <div className="bdc-grid">
        {/* v03 (590:3272) sets this as the feature label — 20px bold, wide
            tracking — rather than a display heading. */}
        <h3 className="t-body col-span-full font-bold tracking-[0.05px] md:col-start-2 md:col-span-6">
          {designImpact.heading}
        </h3>
      </div>

      <div className="bdc-grid mt-12 gap-y-16">
        {designImpact.stats.map((stat, i) => {
          // Positional, not typed into the copy: the first claim is starred
          // once, the second twice, and the marker on the figure matches the one
          // on its source.
          const marker = "*".repeat(i + 1);
          return (
            <div
              key={stat.value}
              className={`col-span-full flex flex-col gap-6 md:col-span-3 ${
                i > 0 ? "md:col-start-6" : "md:col-start-2"
              }`}
            >
              {/* aria-hidden on the marker: it is a typographic pointer to the
                  line below, and read aloud it is just "star". */}
              <p className="t-digit">{stat.value}</p>
              <div>
                <p className="t-body font-bold">
                  {stat.text}
                  <span aria-hidden className="font-normal">
                    {marker}
                  </span>
                </p>
                {/* 28px — the blank line the frame sets with a double break. */}
                <p className="t-caption mt-7">
                  <span aria-hidden>{marker}</span>
                  {stat.source}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
