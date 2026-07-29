/**
 * EventOverlayContent — the event-specific inside of <OverlayPanel/>.
 *
 * Server-renderable (no interactivity): title, type accent + label, date,
 * separator, description on the left; cover image on the right. Stacks to a
 * single column below `lg`. The parallel shell to be built later for team
 * members (name / role / bio / photo) will slot into <OverlayPanel/> the same way.
 */
import Image from "next/image";
import type { BdcEvent } from "@/lib/events";

/**
 * Turn the `[label](href)` runs the sync writes into real anchors.
 *
 * The descriptions come out of Notion as plain text, and the links in them —
 * festivals, partner organisations, the recordings of the talks — are the whole
 * reason several of these paragraphs exist. Only this one pattern is
 * recognised; the bodies are prose, not documents, and anything richer belongs
 * in Notion rather than in a parser here.
 */
const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function withLinks(text: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <a
        key={`${m.index}-${m[2]}`}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 transition-opacity hover:opacity-70"
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

export function EventOverlayContent({ event }: { event: BdcEvent }) {
  return (
    <div
      // Same column grid as the rest of the site (.bdc-grid = --grid-cols cols,
      // --grid-gap gutter). The panel starts at --page-gutter, so col 1 lines up
      // with the page's col 1; the rail-width right padding matches the page's
      // end inset, so all 12 columns coincide with the global grid.
      className="bdc-grid gap-y-10 px-6 pt-16 md:px-0 lg:gap-y-0 lg:pt-20"
      style={{ paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))" }}
    >
      {/* Text — page grid cols 2–6 on desktop (col 1 is the gutter), cols 2–7
          of the 8-col tablet grid. The md placement matters: px-0 starts at md
          but the lg column offset doesn't, so without it the 768–1023 band had
          no left inset at all and text sat flush against the panel edge. */}
      <div className="col-span-full flex flex-col gap-8 md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-5">
        <h1 className="t-h03">{event.name}</h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-3">
            {/* 16×8 accent block before the event type. Tracks the pattern-rail
                recolour (--tri-band = tomato by default), like the bottom strip.
                Inline style, not bg-[var(--tri-band)] — see Safari gotcha. */}
            <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
            <span className="t-caption">{event.type.label}</span>
          </span>
          <span className="t-caption">{event.dateLong}</span>
        </div>

        <div className="h-px w-full bg-border" />

        {/* The Notion body is several paragraphs separated by blank lines, and
            a single <p> would run them together into one wall of text. Split
            here rather than storing HTML — the JSON stays plain text, which is
            what the sync can regenerate losslessly. */}
        <div className="flex flex-col gap-5">
          {event.description
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) => (
              <p key={p} className="t-body">
                {withLinks(p)}
              </p>
            ))}
        </div>
      </div>

      {/* Cover — page grid cols 8–11 on desktop (col 7 is the gutter). */}
      {event.cover && (
        <div className="relative aspect-square w-full col-span-full md:col-start-2 md:col-span-6 lg:col-start-8 lg:col-span-5 lg:aspect-auto lg:h-[640px]">
          <Image
            src={event.cover}
            alt={event.name}
            fill
            sizes="(max-width: 1023px) 90vw, 45vw"
            quality={90}
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
