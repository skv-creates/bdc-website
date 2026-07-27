/**
 * InitiativeOverlayContent — the initiative inside of <OverlayPanel/>.
 *
 * Long-form document rather than the two-up split used by the event and member
 * bodies, following Figma "home-desktop-info-overlay" (node 246:707): title →
 * category → separator → standfirst → two text columns → cover → body →
 * feature block → checklist rows.
 *
 * `detail` is optional. Initiatives without it (everything except Policy Lab
 * today) fall back to the short card copy, so adding one to the carousel never
 * requires writing long-form content first.
 */
import Image from "next/image";
import { Button } from "@/components/ui/Button";
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

  return (
    <div
      className={`bdc-grid gap-y-12 ${inPage ? "" : "px-6 pt-16 md:px-0 lg:pt-20"}`}
      style={inPage ? undefined : { paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))" }}
    >
      <div className={`${cols} flex flex-col gap-12`}>
        <h1 className="t-h01 max-w-[720px]">{initiative.title}</h1>

        <div className="flex items-center gap-3">
          <Accent />
          <span className="t-caption">{initiative.label}</span>
        </div>

        <div className="h-px w-full bg-border" />

        {d ? (
          <>
            <p className="t-body-lg max-w-[540px] font-bold leading-[1.1]">{d.lead}</p>

            {/* Two equal text columns on desktop with a 120px gutter, stacked
                below lg. */}
            <div className="grid gap-y-6 lg:grid-cols-2 lg:gap-x-[120px]">
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
          </>
        ) : (
          <p className="t-body max-w-[540px]">{initiative.text}</p>
        )}
      </div>

      {d?.cover && (
        <div className={`relative aspect-[1233/542] w-full overflow-hidden ${cols}`}>
          <Image
            src={d.cover.src}
            alt={d.cover.alt}
            fill
            sizes="(max-width: 1023px) 90vw, 80vw"
            className="object-cover"
          />
        </div>
      )}

      {d && (
        <div className={`${cols} flex flex-col gap-12`}>
          {/* Body copy and its CTA occupy the left column only; the right
              stays empty, as in the design. */}
          <div className="grid gap-y-8 lg:grid-cols-2 lg:gap-x-[120px]">
            <div className="flex flex-col items-start gap-12">
              <div className="flex flex-col gap-5">
                {d.body.map((p) => (
                  <p key={p} className="t-body">
                    {p}
                  </p>
                ))}
              </div>
              {d.bodyCta && <Button href={d.bodyCta.href}>{d.bodyCta.label}</Button>}
            </div>
          </div>

          {/* Feature — label + statement on the left, body-medium column on the
              right. body-medium is 24px/1.5 in the design system, i.e. t-body-lg. */}
          <div className="grid gap-y-8 py-12 lg:grid-cols-2 lg:gap-x-[120px]">
            <div className="flex flex-col gap-8">
              <p className="t-body font-bold tracking-[0.05px]">{d.feature.label}</p>
              <h2 className="t-h02">{d.feature.heading}</h2>
            </div>

            <div className="flex flex-col gap-6 lg:pt-[72px]">
              <p className="t-body-lg font-bold">{d.feature.intro}</p>
              {d.feature.paragraphs.map((p) => (
                <p key={p} className="t-body-lg">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Checklist question — left column only, right intentionally empty. */}
          <div className="grid gap-y-8 py-12 lg:grid-cols-2 lg:gap-x-[120px]">
            <h2 className="t-h02">{d.checklistHeading}</h2>
          </div>

          {/* Checklist — one bordered row per line. The indent is padding, not
              margin, so the rule spans the full column while only the bullet is
              inset (in Figma the border sits on the row, the 36px offset on the
              list item inside it). */}
          <ul className="flex flex-col pb-20">
            {d.checklist.map((row) => (
              <li
                key={row}
                // list-inside keeps the marker within the padded box, so the
                // bullet sits 36px inside the rule rather than hanging left of
                // it (the default list-outside puts it before the padding).
                className="t-body-lg list-inside list-disc border-t border-border py-3 ps-9 font-bold leading-[1.1]"
              >
                {row}
              </li>
            ))}
          </ul>

          {d.actions && (
            <div className="flex flex-wrap gap-6 pb-16">
              {d.actions.map((a) => (
                <Button key={a.href + a.label} href={a.href} variant={a.variant ?? "primary"}>
                  {a.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {initiative.cta && !d && (
        <div className={cols}>
          <Button href={initiative.cta.href} variant="secondary">
            {initiative.cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}
