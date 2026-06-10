import { Button } from "@/components/ui/Button";
import { hero } from "@/lib/home-content";

export function Hero() {
  return (
    <section className="pt-10 pb-20 md:pt-16 md:pb-28">
      <div className="max-w-[739px]">
        <h1 className="t-h01">{hero.heading}</h1>
        <p className="t-body-lg mt-8 max-w-[640px]">{hero.subheading}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button variant="primary" href={hero.primary.href}>{hero.primary.label}</Button>
          <Button variant="secondary" href={hero.secondary.href}>{hero.secondary.label}</Button>
        </div>
      </div>
    </section>
  );
}
