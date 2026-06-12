import { Button } from "@/components/ui/Button";
import { hero } from "@/lib/home-content";

export function Hero() {
  return (
    <section className="pt-10 pb-20 md:pt-16 md:pb-28">
      <div>
        {/* heading spans 9 of the 11 content columns */}
        <h1
          className="t-h01"
          style={{ maxWidth: "calc((100% - 10 * var(--grid-gap)) / 11 * 9 + 8 * var(--grid-gap))" }}
        >
          {hero.heading}
        </h1>
        <p className="t-body-lg mt-12 max-w-[640px]">{hero.subheading}</p>
        <div className="mt-12 flex flex-wrap gap-4">
          <Button variant="primary" href={hero.primary.href}>{hero.primary.label}</Button>
        </div>
      </div>
    </section>
  );
}
