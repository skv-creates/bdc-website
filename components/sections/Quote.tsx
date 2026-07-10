import type { SiteContent } from "@/lib/home-content";

export function Quote({ quote }: { quote: SiteContent["quote"] }) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1072px]">
        {/* 200px glyph overflows its box ~23px; mt accounts for that + 40px gap */}
        <span aria-hidden className="t-h01 block text-[200px] leading-none text-brand">„</span>
        <blockquote className="t-quote mt-[63px]">{quote.text}</blockquote>
        <p className="t-body mt-8 font-bold">{quote.author}</p>
      </div>
    </section>
  );
}
