import carbon from "@/lib/carbon.generated.json";
import type { SiteContent } from "@/lib/home-content";

/**
 * Green-hosting and carbon figures for the footer.
 *
 * A server component with no client bundle: the values are read from
 * lib/carbon.generated.json at build time, so this costs one paragraph of
 * markup and nothing else. That is the whole point of it.
 *
 * Both vendors publish embeds that would do this at runtime instead, and both
 * are a bad trade. The Green Web badge is a 13KB PNG behind a redirect to a
 * URL that expires hourly; the Website Carbon badge is a script from unpkg.com
 * that then calls their API — which was returning 503 while this was written,
 * and which their own results page was meanwhile using to claim this site
 * emits "0.00 g" and is "cleaner than 0% of all web pages". A badge that makes
 * the page heavier to say the page is light is the wrong artefact for a design
 * council to ship, and one that displays a wrong number is worse.
 *
 * Refresh with `npm run sync:carbon`.
 */
export function CarbonBadge({
  carbon: labels,
  locale,
}: {
  carbon: SiteContent["footer"]["carbon"];
  locale: string;
}) {
  const measured = new Date(carbon.measuredOn).toLocaleDateString(
    locale === "bg" ? "bg-BG" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="flex flex-col gap-2">
      <a
        href={carbon.sources.greenHosting}
        target="_blank"
        rel="noreferrer"
        className="group flex items-baseline gap-2"
      >
        {/* Decorative: the text beside it already says "green hosting", and a
            leaf announced before it would just be noise. */}
        <span aria-hidden className="text-[0.9em] leading-none">
          ●
        </span>
        <span className="t-caption font-bold border-b-2 border-transparent transition-colors group-hover:border-current">
          {labels.greenHosting}
        </span>
      </a>

      <p className="t-caption opacity-70">{labels.greenHostingBy}</p>

      {/* Always shown. A static figure that does not say when it was taken is
          the one dishonest version of this — with the date it is strictly more
          truthful than a live badge, which can serve a stale cached result
          with nothing at all to indicate its age. */}
      <p className="t-caption opacity-50">
        {labels.measuredOn} {measured}
      </p>
    </div>
  );
}
