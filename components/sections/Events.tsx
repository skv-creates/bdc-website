import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { HighlightDetail } from "@/components/ui/icons";
import { event } from "@/lib/home-content";

export function Events() {
  return (
    <section className="py-20 md:py-28">
      <div className="lg:max-w-[1070px]">
        {/* label + cover */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="flex shrink-0 items-center gap-3 md:w-[195px]">
            <HighlightDetail className="h-5 w-5 text-brand" />
            <span className="t-label">{event.label}</span>
          </div>
          <div className="relative aspect-[632/480] w-full overflow-hidden bg-black/5">
            <Image
              src={event.image}
              alt=""
              fill
              sizes="(max-width: 767px) 90vw, 632px"
              className="object-cover"
            />
          </div>
        </div>

        {/* title + meta + cta */}
        <div className="mt-12 md:mt-16">
          <h3 className="t-h03 max-w-[852px]">{event.title}</h3>
          <p className="t-body mt-8">{event.info}</p>
          <div className="mt-10">
            <Button variant="secondary" href={event.cta.href}>{event.cta.label}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
