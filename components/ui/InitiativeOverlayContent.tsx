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

export function InitiativeOverlayContent({ initiative }: { initiative: Initiative }) {
  const d = initiative.detail;

  return (
    <div
      className="bdc-grid gap-y-12 px-6 pt-16 md:px-0 lg:pt-20"
      style={{ paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))" }}
    >
      {/* Head — grid col 2 onward, matching the page gutter. The md placement
          is load-bearing: px-0 starts at md but the lg offset doesn't, so
          without it this sits flush against the panel edge (see the tablet
          inset fix on the event/member bodies). */}
      <div className="col-span-full flex flex-col gap-12 md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-10">
        <h1 className="t-h01 max-w-[720px]">{initiative.title}</h1>

        <div className="flex items-center gap-3">
          <Accent />
          <span className="t-caption">{initiative.label}</span>
        </div>

        <div className="h-px w-full bg-border" />

        {d ? (
          <>
            <p className="t-body-lg max-w-[540px] font-bold leading-[1.1]">{d.lead}</p>

            {/* Two text columns on desktop, stacked below lg. */}
            <div className="grid gap-x-12 gap-y-6 lg:grid-cols-2">
              {d.columns.map((column, i) => (
                <div key={i} className="flex max-w-[540px] flex-col gap-5">
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
        <div className="relative col-span-full aspect-[1191/524] w-full overflow-hidden md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-10">
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
        <div className="col-span-full flex flex-col gap-12 md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-10">
          <div className="flex max-w-[540px] flex-col gap-5">
            {d.body.map((p) => (
              <p key={p} className="t-body">
                {p}
              </p>
            ))}
          </div>

          {/* Feature — label + statement on the left, body-medium column on the
              right. body-medium is 24px/1.5 in the design system, i.e. t-body-lg. */}
          <div className="grid gap-x-12 gap-y-8 pt-12 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <p className="t-body font-bold tracking-[0.05px]">{d.feature.label}</p>
              <h2 className="t-h02">{d.feature.heading}</h2>
            </div>

            <div className="flex flex-col gap-6">
              <p className="t-body-lg font-bold">{d.feature.intro}</p>
              {d.feature.paragraphs.map((p) => (
                <p key={p} className="t-body-lg">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Checklist — one bordered row per line. */}
          <ul className="flex flex-col">
            {d.checklist.map((row) => (
              <li
                key={row}
                className="t-body-lg list-disc border-t border-border py-3 font-bold leading-[1.1] ms-9"
              >
                {row}
              </li>
            ))}
          </ul>
        </div>
      )}

      {initiative.cta && (
        <div className="col-span-full md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-10">
          <a
            href={initiative.cta.href}
            className="t-label inline-flex items-center justify-center rounded-full border-2 border-current px-8 py-4 transition-colors hover:bg-text hover:text-text-invert"
            {...(/^https?:\/\//.test(initiative.cta.href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {initiative.cta.label}
          </a>
        </div>
      )}
    </div>
  );
}
