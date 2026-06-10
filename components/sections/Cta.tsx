import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cta } from "@/lib/home-content";

export function Cta() {
  return (
    <section id="cta" className="py-20 md:py-28">
      {/* photo: 3 cols · 1-col gap · content: 6 cols (5–10), top-aligned */}
      <div className="bdc-grid items-start gap-y-10">
        <div className="col-span-4 md:col-span-3">
          <div className="relative aspect-[304/405] w-full overflow-hidden bg-black/5">
            <Image
              src={cta.image}
              alt=""
              fill
              sizes="(max-width: 767px) 90vw, 304px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="col-span-4 md:col-span-5 lg:col-start-5 lg:col-span-6">
          <h2 className="t-h03">{cta.heading}</h2>
          <p className="t-body mt-4">{cta.subheading}</p>

          <form className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center" action="#">
            <input
              type="email"
              required
              placeholder={cta.inputPlaceholder}
              aria-label={cta.inputPlaceholder}
              className="t-body flex-1 border-b-2 border-border bg-transparent py-4 outline-none placeholder:text-text/60 focus:border-brand"
            />
            <Button variant="primary" type="submit">{cta.button}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
