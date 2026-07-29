import type { SiteContent } from "@/lib/home-content";

export function Quote({ quote }: { quote: SiteContent["quote"] }) {
  return (
    // 60px here + 60px on the team section above = the 120px the design asks
    // for between the volunteer button and the quote mark. Halved below md so
    // the phone doesn't open on a screen of whitespace.
    <section className="pb-20 pt-10 md:pb-28 md:pt-[60px]">
      <div className="max-w-[1072px]">
        {/* „ is a low glyph: even at leading-none its box reserves the font's
            full ascent, so roughly half the 200px sits empty above the ink and
            the section reads as though it were 105px further down than the
            padding says. The negative margin cancels that bearing, which is
            what lets the gap above be set in real, measurable pixels. In em so
            it tracks the glyph if the size ever changes. Everything below the
            mark shifts with it, so the spacing down to the quote is unchanged. */}
        <span aria-hidden className="t-h01 -mt-[0.52em] block text-[200px] leading-none text-brand">„</span>
        <blockquote className="t-quote mt-[63px]">{quote.text}</blockquote>
        <p className="t-body mt-8 font-bold">{quote.author}</p>
      </div>
    </section>
  );
}
