/**
 * "Защо дизайна е важен?" — two sourced statistics between the mission and the
 * initiatives (Figma 355:3200).
 *
 * The frame places the stats in columns 1–3 and 5–7 of the eleven: a full
 * column of air between them, so the two figures read as separate claims rather
 * than a table. Below md they stack, since three of eleven columns on a phone
 * is about forty characters a line.
 */
import type { SiteContent } from "@/lib/home-content";

export function DesignImpact({ designImpact }: { designImpact: SiteContent["designImpact"] }) {
  return (
    <section className="bdc-stop-11 py-20">
      <p className="t-label font-bold">{designImpact.heading}</p>

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
                i > 0 ? "md:col-start-5" : ""
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
