/* eslint-disable @next/next/no-img-element */
import carbon from "@/lib/carbon.generated.json";
import type { SiteContent } from "@/lib/home-content";

/**
 * The green-hosting claim (Figma 454:2445, node 462:1480).
 *
 * A server component with no client bundle: the verdict is read from
 * lib/carbon.generated.json at build time, so this costs one line of markup.
 * The Green Web Foundation's own embed is a 13KB PNG behind a redirect to a
 * URL that expires hourly, on every page view — a badge that makes the page
 * heavier to say the page is light is the wrong artefact for a design council.
 *
 * The mark is their exported logo, committed at public/badges, not a redrawn
 * approximation: it is their identity and the whole point of showing it is
 * that a reader recognises whose verification this is.
 *
 * The block links to the live Green Web Check. That is what keeps a static
 * claim honest — anyone can confirm the current verdict in one click, which is
 * better than a date stamp, because the date tells you when we looked and the
 * link tells you what is true now.
 *
 * Refresh the committed verdict with `npm run sync:carbon`.
 */
export function CarbonBadge({ carbon: labels }: { carbon: SiteContent["footer"]["carbon"] }) {
  // The sync refuses to write `green: false` — a verdict that flips is a real
  // change someone must look at, not something to quietly render. So reaching
  // here means the claim holds.
  if (!carbon.greenHosting.green) return null;

  return (
    <a
      href={carbon.sources.greenHosting}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start gap-4"
    >
      {/* Decorative: the two lines beside it already name the foundation, and
          announcing the mark too would say it twice. Both dimensions are set
          from the file's own 32.711 x 36 so it cannot be stretched by a flex
          parent, which is exactly how the wordmark above got distorted. */}
      <img
        src="/badges/green-web-foundation.svg"
        alt=""
        aria-hidden
        width={33}
        height={36}
        className="h-9 w-[33px] shrink-0"
      />
      <span className="flex flex-col">
        <span className="t-caption font-bold border-b-2 border-transparent transition-colors group-hover:border-current">
          {labels.greenHosting}
        </span>
        <span className="t-caption opacity-80">{labels.greenHostingBy}</span>
      </span>
    </a>
  );
}
