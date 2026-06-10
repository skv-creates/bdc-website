import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { HighlightDetail } from "@/components/ui/icons";
import { event } from "@/lib/home-content";

export function Events() {
  return (
    <section className="py-20 md:py-28">
      <div className="bdc-grid">
        {/* brand card: 10 of 12 cols on desktop (full width below) */}
        <div className="col-span-4 bg-brand md:col-span-8 lg:col-span-10">
          {/* nested 10-col grid → content sits in cols 2–9 (1-col padding) */}
          <div
            className="grid py-12 md:py-16 lg:py-20"
            style={{
              gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
              columnGap: "var(--grid-gap)",
            }}
          >
            <div style={{ gridColumn: "2 / 10" }}>
              {/* label + image */}
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="flex shrink-0 items-center gap-3">
                  <HighlightDetail className="h-5 w-5 text-text" />
                  <span className="t-label">{event.label}</span>
                </div>
                <div className="relative h-[480px] w-full overflow-hidden md:w-[56%]">
                  <Image
                    src={event.image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 90vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* title + meta + cta */}
              <h3 className="t-h03 mt-12">{event.title}</h3>
              <p className="t-body mt-8">{event.info}</p>
              <div className="mt-10">
                <Button variant="secondary" href={event.cta.href}>
                  {event.cta.label}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
