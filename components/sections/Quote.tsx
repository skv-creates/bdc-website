import { quote } from "@/lib/home-content";

export function Quote() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1072px]">
        <span aria-hidden className="t-h01 block leading-none text-brand">„</span>
        <blockquote className="t-h02 mt-2">{quote.text}</blockquote>
        <p className="t-body mt-8 font-bold">{quote.author}</p>
      </div>
    </section>
  );
}
