/**
 * InitiativeOverlayContent — the initiative body, shared by the standalone page
 * and the <OverlayPanel/> overlay.
 *
 * Long-form document rather than the two-up split used by the event and member
 * bodies, following Figma "home-desktop-info-overlay" (node 327:1137): title →
 * category → separator → standfirst → two text columns → cover → body →
 * feature block → checklist rows → closing CTAs.
 *
 * Two rules carried over from that frame and easy to undo by accident:
 *
 * - Every two-up row is a plain 50/50 split with the 24px grid gutter between
 *   the halves (516 + 24 + 516 on the 1056 column), not a wide editorial gap.
 *   Widening it reflows every heading in the page.
 * - Vertical rhythm is owned by the blocks, not by a gap on the wrapper: 48px
 *   between the hero and the cover on each side (96 total), then 80px above and
 *   below the feature and checklist-question rows (160 between them), 48 around
 *   the closing CTAs. Sizes below lg are halved to 48 so the page doesn't turn
 *   into whitespace on a phone.
 *
 * `detail` is optional. Initiatives without it (everything except Policy Lab
 * today) fall back to the short card copy, so adding one to the carousel never
 * requires writing long-form content first.
 */
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ListPointer } from "@/components/ui/icons";
import type { Initiative } from "@/lib/home-content";

/** 16×8 accent block before the category — matches EventOverlayContent. */
function Accent() {
  return (
    <span
      className="h-2 w-4 shrink-0"
      style={{ background: "var(--tri-band)" }}
      aria-hidden
    />
  );
}

export function InitiativeOverlayContent({
  initiative,
  variant = "overlay",
}: {
  initiative: Initiative;
  /**
   * "overlay" — inside <OverlayPanel/>, which spans over the rail, so the body
   * supplies its own gutters and rail inset.
   * "page" — inside the standalone page shell, whose wrapper already applies
   * both. Repeating them there double-pads the right edge.
   */
  variant?: "overlay" | "page";
}) {
  const d = initiative.detail;
  const inPage = variant === "page";

  /**
   * Column placement per variant.
   *
   * overlay — the panel has no gutter of its own, so col 1 acts as one and
   *   every block starts at col 2. The md step is load-bearing: px-0 begins at
   *   md but the lg offset doesn't, and without it content sits flush against
   *   the panel edge (same bug fixed earlier on the event/member bodies).
   * page — the shell already applies --page-gutter, so blocks start at col 1
   *   and run the full grid. Starting at col 2 here indents everything one
   *   column past the logo.
   */
  const cols = inPage
    ? "col-span-full"
    : "col-span-full md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-10";

  /** Two-up row: 50/50 from lg, split by the grid gutter. */
  const twoUp = "grid gap-y-8 lg:grid-cols-2 lg:gap-x-[var(--grid-gap)]";

  return (
    <div
      // The reading column stops at column 11 so the copy never runs up against
      // the pattern. It lives here rather than on the page's <main> — see the
      // note there.
      className={`bdc-grid ${inPage ? "bdc-stop-11" : "px-6 md:px-0"}`}
      style={inPage ? undefined : { paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))" }}
    >
      {/* section-mission — title through the two intro columns. */}
      <div
        className={`${cols} flex flex-col gap-12 pb-12 ${
          inPage ? "pt-16 lg:pt-[120px]" : "pt-16 lg:pt-20"
        }`}
      >
        <h1 className="t-h01 max-w-[732px]">{initiative.title}</h1>

        <div className="flex items-center gap-3">
          <Accent />
          <span className="t-caption">{initiative.label}</span>
        </div>

        <div className="h-px w-full bg-border" />

        {d ? (
          <>
            <p className="t-body-lg max-w-[540px] font-bold leading-[1.1] tracking-[-1px]">
              {d.lead}
            </p>

            <div className={twoUp}>
              {d.columns.map((column, i) => (
                <div key={i} className="flex flex-col gap-5">
                  {column.map((p) => (
                    <p key={p} className="t-body">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            {/* Wrapped so the flex column's default stretch doesn't pull the
                pill across the full width. */}
            {d.leadAction && (
              <div>
                <Button href={d.leadAction.href} variant="secondary">
                  {d.leadAction.label}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="t-body max-w-[540px]">{initiative.text}</p>
        )}
      </div>

      {d?.cover && (
        <div className={`${cols} py-12`}>
          {/* Square on phones, the design's 1092/589 letterbox from md up. A
              landscape crop at a phone's width is barely 200px tall and the
              subject reads as a strip; square uses the full column. */}
          <div className="relative aspect-square w-full overflow-hidden md:aspect-[1092/589]">
            <Image
              src={d.cover.src}
              alt={d.cover.alt}
              fill
              sizes="(max-width: 1023px) 90vw, 80vw"
              // The box is the design's 1092/589; the cover photo is 3:2, so a
              // centred crop takes ~19% off the height and clips the subject's
              // head. Anchor to the top — the dead space in these shots is at
              // the bottom.
              className="object-cover object-top"
            />
          </div>
        </div>
      )}

      {d && (
        <div className={`${cols} pt-12 pb-12 lg:pb-20`}>
          {/* Body copy occupies the left column only; the right stays empty, as
              in the design. */}
          <div className={twoUp}>
            <div className="flex flex-col gap-5">
              {d.body.map((p) => (
                <p key={p} className="t-body">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Both CTAs sit here, straight under the body copy (Figma 351:1077)
              — they used to be split, one here and one in a closing row at the
              foot of the page. The page now ends on the checklist. */}
          {d.actions && (
            <div className="flex flex-wrap gap-6 py-12">
              {d.actions.map((a) => (
                <Button key={a.href + a.label} href={a.href} variant={a.variant ?? "primary"}>
                  {a.label}
                </Button>
              ))}
            </div>
          )}

          {/* Feature — label + statement on the left, body-medium column on the
              right. body-medium is 24px/1.5 in the design system, i.e. t-body-lg.
              The right column drops 72px so its first line sits against the
              statement rather than the label above it. */}
          <div className={`${twoUp} py-12 lg:py-20`}>
            <div className="flex flex-col gap-8">
              <p className="t-body font-bold tracking-[0.05px]">{d.feature.label}</p>
              <h2 className="t-h02">{d.feature.heading}</h2>
            </div>

            <div className="flex flex-col gap-6 lg:pt-[72px]">
              {/* In the design the opening line and the paragraph under it are
                  one text block separated by a blank line, so the gap there
                  reads as a full 36px line rather than the 24px between the
                  paragraphs that follow. */}
              {d.feature.intro && <p className="t-body-lg pb-3 font-bold">{d.feature.intro}</p>}
              {d.feature.paragraphs.map((p) => (
                <p key={p} className="t-body-lg">
                  {p}
                </p>
              ))}

              {/* Nested placement (373:4473): the rows continue the sentence
                  above them, so they stay inside this column instead of
                  breaking out to full width. */}
              {d.checklistInFeature && <ChecklistRows rows={d.checklist} className="pt-2" />}
            </div>
          </div>

          {/* Checklist question — left column only, right intentionally empty.
              Absent on initiatives whose list follows on from the feature text. */}
          {d.checklistHeading && (
            <div className={`${twoUp} py-12 lg:py-20`}>
              <h2 className="t-h02">{d.checklistHeading}</h2>
            </div>
          )}

          {/* Full-width placement — the default. See ChecklistRows. */}
          {!d.checklistInFeature && (
            <div className="bdc-grid pb-12">
              <ChecklistRows
                rows={d.checklist}
                className="col-span-full lg:col-start-2 lg:col-span-10"
              />
            </div>
          )}

          {/* Second feature block, closing the argument (355:3316). Same two-up
              as the first; no bold opening line in the frame. */}
          {d.featureClosing && (
            <div className={`${twoUp} py-12 lg:py-20`}>
              <div className="flex flex-col gap-8">
                <p className="t-body font-bold tracking-[0.05px]">{d.featureClosing.label}</p>
                <h2 className="t-h02">{d.featureClosing.heading}</h2>
              </div>

              <div className="flex flex-col items-start gap-6 lg:pt-[72px]">
                {d.featureClosing.paragraphs.map((p) => (
                  <p key={p} className="t-body-lg">
                    {p}
                  </p>
                ))}
                {d.featureClosing.action && (
                  <div className="pt-6">
                    <Button href={d.featureClosing.action.href} variant="primary">
                      {d.featureClosing.action.label}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {initiative.cta && !d && (
        <div className={`${cols} pb-12`}>
          <Button href={initiative.cta.href} variant="secondary">
            {initiative.cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * The ruled "list-wrapper" rows (Figma 327:1174).
 *
 * Hover fills the row with the brand rose — which is also the colour of the
 * marker, so the marker would vanish into it. That is why the design swaps it
 * for a ✲ on hover rather than just tinting the row. Both markers occupy the
 * same fixed 16px slot, so nothing shifts.
 *
 * Shared because two frames place it differently: full width under the feature
 * block, or nested inside the feature's right column. Only the wrapper class
 * differs.
 */
function ChecklistRows({ rows, className = "" }: { rows: string[]; className?: string }) {
  return (
    <ul className={`flex flex-col ${className}`}>
      {rows.map((row) => (
        <li
          key={row}
          // A hovered row loses its own rule and the one under it — the rose
          // fill is the separator at that point, and leaving the rules in cuts
          // the block in two. The sibling selector is why this can't be a plain
          // hover: utility on the row, effect on the next one.
          className="group border-t border-border transition-colors duration-[120ms] ease-out hover:border-t-transparent hover:bg-brand [&:hover+li]:border-t-transparent"
        >
          {/* items-start, not items-center: the marker aligns to the first
              line, so a row that wraps — which is most of them once the column
              narrows — keeps its marker at the top rather than floating to the
              middle. The 14px/3px offsets are the design's. */}
          <div className="flex items-start gap-3 py-3">
            <span className="relative w-4 shrink-0" aria-hidden>
              <span
                className="mt-[14px] block h-2 w-4 transition-opacity duration-[120ms] group-hover:opacity-0"
                style={{ background: "var(--tri-accent)" }}
              />
              <ListPointer className="absolute left-1/2 top-[3px] -translate-x-1/2 opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100" />
            </span>
            <p className="t-body-lg font-bold leading-[1.3] tracking-[-0.7px]">{row}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
