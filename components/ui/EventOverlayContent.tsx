/**
 * EventOverlayContent — the event-specific inside of <OverlayPanel/>.
 *
 * Server-renderable (no interactivity): title, type accent + label, date,
 * separator, description on the left; cover image on the right. Stacks to a
 * single column below `lg`. The parallel shell to be built later for team
 * members (name / role / bio / photo) will slot into <OverlayPanel/> the same way.
 */
import Image from "next/image";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { youtubeId } from "@/lib/youtube";
import type { BdcEvent } from "@/lib/events";
import type { Locale } from "@/lib/home-content";
import type { SiteContent } from "@/lib/home-content";

/** Only the strings this overlay needs, so callers pass `content.ui` as-is. */
type OverlayUi = Pick<SiteContent["ui"], "prev" | "next" | "pause" | "play" | "opensInNewTab" | "openLink">;

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

function withLinks(text: string, ui: OverlayUi) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <ExternalLink
        key={`${m.index}-${m[2]}`}
        href={m[2]}
        newTabLabel={ui.opensInNewTab}
        openLabel={ui.openLink}
      >
        {m[1]}
      </ExternalLink>,
    );
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

/** The body, split into paragraphs. Notion separates them with a blank line. */
const paragraphs = (s: string) =>
  s
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

/**
 * A paragraph that is nothing but one YouTube link is a recording the editor
 * meant people to watch, so it becomes a player rather than a line of text to
 * click away from. A link sitting inside a sentence stays a link — replacing
 * that with a video would tear the sentence in half.
 */
const ONLY_LINK = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/;

function videoIn(paragraph: string): { id: string; title: string } | null {
  const m = paragraph.match(ONLY_LINK);
  if (!m) return null;
  const id = youtubeId(m[2]);
  return id ? { id, title: m[1] } : null;
}

/** One paragraph: a player where it is a lone video link, prose otherwise. */
function Para({ text, ui }: { text: string; ui: OverlayUi }) {
  const video = videoIn(text);
  if (video) return <VideoEmbed id={video.id} title={video.title} />;
  return <p className="t-body">{withLinks(text, ui)}</p>;
}

export function EventOverlayContent({
  event,
  ui,
  locale,
}: {
  event: BdcEvent;
  ui: OverlayUi;
  locale: Locale;
}) {
  // Two or more pictures makes this an "event with photo carousel". With one
  // picture the original side-by-side layout is still the right shape, and
  // most events have no pictures at all.
  if (event.covers.length >= 2) return <EventOverlayGallery event={event} ui={ui} locale={locale} />;

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
          {paragraphs(event.description).map((p) => (
            <Para key={p} text={p} ui={ui} />
          ))}
        </div>
      </div>

      {/* Cover — page grid cols 8–11 on desktop (col 7 is the gutter). */}
      {event.covers[0] && (
        <div className="relative aspect-square w-full col-span-full md:col-start-2 md:col-span-6 lg:col-start-8 lg:col-span-5 lg:aspect-auto lg:h-[640px]">
          <Image
            src={event.covers[0].src}
            alt={event.name}
            fill
            sizes="(max-width: 1023px) 90vw, 45vw"
            quality={80}
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}

/**
 * "Event with photo carousel" (Figma 449:1511) — the layout an event gets once
 * it has pictures worth showing as a set.
 *
 * Unlike the single-cover version this runs down the page rather than across
 * it: intro in a narrow column, the carousel across the width, remaining body
 * in two columns below. The first paragraph is the intro and the rest fall
 * underneath, which is how the frame reads and means an event with only one
 * paragraph has nothing below the carousel rather than an empty column.
 */
function EventOverlayGallery({
  event,
  ui,
  locale,
}: {
  event: BdcEvent;
  ui: OverlayUi;
  locale: Locale;
}) {
  const [intro, ...rest] = paragraphs(event.description);
  // Split what is left down the middle, so the two columns end level rather
  // than one running twice the length of the other.
  const half = Math.ceil(rest.length / 2);
  const columns = [rest.slice(0, half), rest.slice(half)];

  return (
    <div
      className="bdc-grid gap-y-12 px-6 pt-16 md:px-0 lg:pt-20"
      style={{ paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))" }}
    >
      {/* event-info-wrapper (449:1705) — five of the twelve columns, so the
          title wraps as it does in the frame instead of running the full width. */}
      <div className="col-span-full flex flex-col gap-8 md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-5">
        <h1 className="t-h03">{event.name}</h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-3">
            <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
            <span className="t-caption">{event.type.label}</span>
          </span>
          <span className="t-caption">{event.dateLong}</span>
        </div>

        <div className="h-px w-full bg-border" />

        {intro && <Para text={intro} ui={ui} />}
      </div>

      {/* Column 2 through the last one. It used to stop at 11, which left a
          column of dead space down the right that read as a mistake — and the
          reason for it (giving a two-slide strip something to travel) went
          away once the gallery took all six pictures and started gliding
          rather than paging. */}
      <div className="col-span-full lg:col-start-2 lg:col-span-11">
        <PhotoCarousel
          images={event.covers}
          label={event.name}
          alt={event.name}
          labels={{ prev: ui.prev, next: ui.next, pause: ui.pause, play: ui.play }}
          locale={locale}
        />
      </div>

      {rest.length > 0 && (
        <div className="col-span-full grid gap-x-[var(--grid-gap)] gap-y-5 md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-10 lg:grid-cols-2 lg:gap-x-[120px]">
          {columns.map((col, i) =>
            col.length ? (
              <div key={i} className="flex flex-col gap-5">
                {col.map((p) => (
                  <Para key={p} text={p} ui={ui} />
                ))}
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
