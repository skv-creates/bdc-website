/**
 * InitiativeOverlayContent — the initiative inside of <OverlayPanel/>.
 *
 * Third member of the overlay family, after EventOverlayContent and
 * MemberOverlayContent, and deliberately built on the same grid so the three
 * read as one component: visual on the left (cols 2–5), info on the right
 * (cols 7–11), stacking on tablet and phone. Server-renderable.
 *
 * Initiatives have no photography — the card's pattern tile stands in, inked in
 * the same triad slot the card uses so the overlay keeps the card's identity.
 */
import { PatternTile } from "@/components/initiatives/patterns";
import type { Initiative } from "@/lib/home-content";
import type { CSSProperties } from "react";

/** Corner triangle prefixing the label — mirrors the card's LabelMark. */
function LabelMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <polygon points="1,3 15,3 1,17" fill="currentColor" />
    </svg>
  );
}

export function InitiativeOverlayContent({
  initiative,
  patternStyle,
}: {
  initiative: Initiative;
  /** --p1/--p2 ink + ground, so the tile matches the card that was clicked. */
  patternStyle?: CSSProperties;
}) {
  return (
    <div
      className="bdc-grid gap-y-10 px-6 pt-16 md:px-0 lg:gap-y-0 lg:pt-20"
      style={{ paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))" }}
    >
      {/* Pattern — grid cols 2–5 on desktop, 2–5 of the 8-col tablet grid. The
          md placement is load-bearing: px-0 starts at md but the lg column
          offset doesn't, so without it this sits flush to the panel edge. */}
      <div
        className="relative col-span-full aspect-[4/3] w-full overflow-hidden md:col-start-2 md:col-span-4 lg:col-start-2 lg:col-span-4"
        style={patternStyle}
      >
        <PatternTile n={initiative.pattern} />
      </div>

      {/* Info — cols 7–11 on desktop; stacks under the pattern on tablet,
          sharing its col-2 start so both align to one edge. */}
      <div className="col-span-full flex flex-col gap-8 md:col-start-2 md:col-span-6 lg:col-start-7 lg:col-span-5">
        <div className="flex items-center gap-5">
          <LabelMark />
          <span className="t-caption font-bold">{initiative.label}</span>
        </div>

        <h1 className="t-h02">{initiative.title}</h1>
        <div className="h-px w-full bg-border" />
        <p className="t-body">{initiative.text}</p>

        {initiative.cta && (
          <a
            href={initiative.cta.href}
            className="t-label inline-flex items-center justify-center self-start rounded-full border-2 border-current px-8 py-4 transition-colors hover:bg-text hover:text-text-invert"
            {...(/^https?:\/\//.test(initiative.cta.href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {initiative.cta.label}
          </a>
        )}
      </div>
    </div>
  );
}
