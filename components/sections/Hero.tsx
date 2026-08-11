import { Button } from "@/components/ui/Button";
import type { SiteContent } from "@/lib/home-content";

/**
 * Home hero — Figma "section-hero" (332:2936).
 *
 * Three rows of the page grid, 48px apart: the h01 across columns 1–10, the
 * standfirst across 1–5, then the two buttons. The column spans are the whole
 * point of the section: the heading is meant to run nearly the full width while
 * the sentence under it stops just under halfway, and that contrast disappears
 * if either is given a fixed max-width instead.
 */
export function Hero({ hero }: { hero: SiteContent["hero"] }) {
  return (
    // bdc-stop-11 keeps the column spans below literally the ones Figma draws
    // (10 and 5 of 11) now that the page grid itself is 12 wide, and stops the
    // heading short of the pattern rail.
    <section className="bdc-stop-11 bdc-grid gap-y-12 pt-16 pb-20 lg:pt-[120px]">
      <h1 className="t-h01 col-span-full lg:col-span-10">{hero.heading}</h1>

      {/* body-medium — 24px/1.5 in the design system, i.e. .t-body-lg. */}
      <p className="t-body-lg col-span-full lg:col-span-5">{hero.subheading}</p>

      {/* Who is saying it. Deliberately in the hero rather than the footer: the
          site used to state its non-profit status only inside an FAQ answer a
          third of the way down and in the privacy policy, so a first-time reader
          — or a grant reviewer — had to hunt for it. Caption-size and on the
          same 5 columns as the standfirst, so it reads as a byline under the
          claim rather than competing with it.

          `col-start-1` is load-bearing: the standfirst above spans only 5 of the
          11 tracks, so without it auto-placement drops this into the free
          columns *beside* the standfirst instead of under it — which reads as a
          floating caption in the middle of the hero. Starting it explicitly on
          column 1 forces a new row.

          Negative top margin then pulls it up out of the grid's 48px row gap: it
          belongs to the sentence above it, not to the buttons below. */}
      <p className="t-caption col-span-full -mt-8 lg:col-start-1 lg:col-span-5">
        {hero.status}
      </p>

      <div className="col-span-full flex flex-wrap gap-6">
        <Button variant="primary" href={hero.primary.href}>
          {hero.primary.label}
        </Button>
        <Button variant="secondary" href={hero.secondary.href}>
          {hero.secondary.label}
        </Button>
      </div>
    </section>
  );
}
