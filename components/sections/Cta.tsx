import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cta } from "@/lib/home-content";

export function Cta() {
  return (
    <section id="cta" className="py-20 md:py-28">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[304px_1fr] md:gap-16 lg:items-center">
        <div className="relative aspect-[304/405] w-full max-w-[304px] overflow-hidden bg-black/5">
          <Image
            src={cta.image}
            alt=""
            fill
            sizes="(max-width: 767px) 90vw, 304px"
            className="object-cover"
          />
        </div>

        <div className="max-w-[632px]">
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
