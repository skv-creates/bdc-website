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
 * Type, date and place — the line under the title, shared by both layouts.
 *
 * It was written out twice, and the copies had already drifted by one class.
 * Adding the location to both was the second time the same three lines needed
 * the same edit, so they live here now.
 *
 * The location is the `Локация` column of the Notion row. It has been synced
 * into events.generated.json all along and fed to schema.org/Event, but no part
 * of the page ever showed it — so seven of the eight events knew where they
 * happened and told nobody. Online events have none, and the field is simply
 * absent rather than filled with "Онлайн", which the type label already says.
 */
function EventMeta({ event }: { event: BdcEvent }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="flex items-center gap-3">
        {/* 16×8 accent block before the event type. Tracks the pattern-rail
            recolour (--tri-band = tomato by default), like the bottom strip.
            Inline style, not bg-[var(--tri-band)] — see Safari gotcha. */}
        <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
        <span className="t-caption">{event.type.label}</span>
      </span>
      <span className="t-caption">{event.dateLong}</span>
      {event.location && <span className="t-caption">{event.location}</span>}
    </div>
  );
}

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

/**
 * One paragraph: a player where it is a lone video link, prose otherwise.
 *
 * `className` carries the type treatment because the same paragraph is set
 * three ways — 24px as a standfirst, 20px at looser leading in a long body,
 * 20px at the site's default elsewhere — and the caller is the only thing that
 * knows which. A video is a video in all three, so it ignores it.
 */
function Para({ text, ui, className = "t-body" }: { text: string; ui: OverlayUi; className?: string }) {
  const video = videoIn(text);
  if (video) return <VideoEmbed id={video.id} title={video.title} />;
  return <p className={className}>{withLinks(text, ui)}</p>;
}

/**
 * Body type for the description. Plain .t-body — 20/1.4, the scale's own
 * value.
 *
 * This used to add `leading-[1.6]`, on the reasoning that 1.4 is tight for
 * long copy. That reasoning may even be right, but it is an argument to have
 * against the type scale in Storybook and settle once for the whole site — not
 * a local override that silently makes one page's paragraphs disagree with
 * every other page's.
 */
const PROSE = "t-body";

/**
 * Reading measure. 65 characters is the middle of the 60–75 band typography
 * has settled on: wider and the return sweep starts missing lines, narrower
 * and it breaks the sentence into stutters. It is a cap, not a width — the
 * column is still fluid below it.
 */
const MEASURE = "max-w-[65ch]";

/**
 * Column placement per variant, shared by both layouts.
 *
 * overlay — <OverlayPanel/> spans over the pattern rail and has no gutter of
 *   its own, so column 1 acts as one and every block starts at column 2. The md
 *   step is load-bearing: px-0 begins at md but the lg offset does not, and
 *   without it content sits flush against the panel edge. Twelve tracks.
 * page — the standalone shell already applies --page-gutter and the rail inset,
 *   so blocks start at column 1. Repeating either here double-pads the edge and
 *   indents everything one column past the logo.
 *
 * **The two variants have different column counts.** The page variant sits in
 * `.bdc-stop-11`, which sets `--grid-cols: 11` from 1024px up — the same
 * breakpoint every `lg:` class here applies at. So a `lg:col-start-7
 * lg:col-span-6` cover, which is right in a twelve-track grid, asks for columns
 * 7–12 of an eleven-track one and CSS Grid quietly invents a twelfth. Five
 * columns of copy, a column of air, five of photograph — the overlay's
 * proportions, one track narrower. Check any new class here against 11, not 12.
 */
function columns(inPage: boolean) {
  return {
    text: inPage
      ? "col-span-full lg:col-span-5"
      : "col-span-full md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-5",
    cover: inPage
      ? "col-span-full lg:col-start-7 lg:col-span-5"
      : "col-span-full md:col-start-2 md:col-span-6 lg:col-start-8 lg:col-span-5",
    wide: inPage
      ? "col-span-full"
      : "col-span-full md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-11",
    // Running text — starts on the same left axis as the title and is capped
    // by MEASURE rather than by a column count, so the line length is the
    // constraint on every screen instead of a proportion of the viewport.
    prose: inPage
      ? "col-span-full"
      : "col-span-full md:col-start-2 md:col-span-6 lg:col-start-2 lg:col-span-10",
  };
}

export function EventOverlayContent({
  event,
  ui,
  locale,
  variant = "overlay",
}: {
  event: BdcEvent;
  ui: OverlayUi;
  locale: Locale;
  /** Which shell this is inside. See `columns` above. */
  variant?: "overlay" | "page";
}) {
  // Two or more pictures makes this an "event with photo carousel". With one
  // picture the original side-by-side layout is still the right shape, and
  // most events have no pictures at all.
  if (event.covers.length >= 2)
    return (
      <EventOverlayGallery
        event={event}
        ui={ui}
        locale={locale}
        variant={variant}
      />
    );

  const inPage = variant === "page";
  const col = columns(inPage);

  return (
    <div
      // Same column grid as the rest of the site (.bdc-grid = --grid-cols cols,
      // --grid-gap gutter). In the panel, col 1 lines up with the page's col 1
      // and the rail-width right padding matches the page's end inset, so all
      // 12 columns coincide with the global grid. In the page shell both come
      // from the wrapper instead, and bdc-stop-11 keeps the copy off the
      // pattern.
      className={`bdc-grid gap-y-10 pt-16 lg:gap-y-0 lg:pt-20 ${
        inPage ? "bdc-stop-11" : "px-6 md:px-0"
      }`}
      style={inPage ? undefined : { paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))" }}
    >
      <div className={`${col.text} flex flex-col gap-8`}>
        <h1 className="t-h03">{event.name}</h1>

        <EventMeta event={event} />

        <div className="h-px w-full bg-border" />

        {/* The Notion body is several paragraphs separated by blank lines, and
            a single <p> would run them together into one wall of text. Split
            here rather than storing HTML — the JSON stays plain text, which is
            what the sync can regenerate losslessly. */}
        <div className="flex flex-col gap-6">
          {paragraphs(event.description).map((p) => (
            <Para key={p} text={p} ui={ui} className={PROSE} />
          ))}
        </div>
      </div>

      {/* Cover — page grid cols 8–11 on desktop (col 7 is the gutter).

          The frame takes the photograph's own proportions rather than a fixed
          640px height. Every event cover is 3:2 landscape and the fixed frame
          was 613x640, so object-cover threw away 36% of the width — 18% off
          each side. On the PechaKucha cover that removed a woman in
          traditional dress from the picture entirely and kept the empty half
          of the room. A frame that crops a third out of every photograph is
          not framing them, and the dimensions needed to avoid it are already
          recorded on EventImage, which is what PhotoCarousel does with them.

          Falls back to square only if a record is missing its dimensions. */}
      {event.covers[0] && (
        <div
          className={`relative w-full ${col.cover}`}
          style={{
            aspectRatio: event.covers[0].width
              ? `${event.covers[0].width} / ${event.covers[0].height}`
              : "1 / 1",
          }}
        >
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
  variant,
}: {
  event: BdcEvent;
  ui: OverlayUi;
  locale: Locale;
  variant: "overlay" | "page";
}) {
  const [intro, ...rest] = paragraphs(event.description);

  const inPage = variant === "page";
  const col = columns(inPage);

  return (
    <div
      className={`bdc-grid gap-y-12 pt-16 lg:pt-20 ${inPage ? "bdc-stop-11" : "px-6 md:px-0"}`}
      style={inPage ? undefined : { paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))" }}
    >
      {/* event-info-wrapper (449:1705) — five of the twelve columns, so the
          title wraps as it does in the frame instead of running the full width. */}
      <div className={`${col.text} flex flex-col gap-8`}>
        <h1 className="t-h03">{event.name}</h1>

        <EventMeta event={event} />

        <div className="h-px w-full bg-border" />
      </div>

      {/* The opening paragraph, above the carousel.

          Set at the body size, not a step up: a standfirst was tried here and
          reads as a second heading under the title rather than as the start of
          the piece. It keeps its own row rather than sitting in the
          five-column header, though — at that width it wrapped to a column of
          fragments with the right half of the row empty above a full-width
          carousel. Out here it takes the same measure as the body below, so
          the whole page runs on one left axis at one size. */}
      {intro && (
        <div className={col.prose}>
          <Para text={intro} ui={ui} className={`${PROSE} ${MEASURE}`} />
        </div>
      )}

      {/* Column 2 through the last one. It used to stop at 11, which left a
          column of dead space down the right that read as a mistake — and the
          reason for it (giving a two-slide strip something to travel) went
          away once the gallery took all six pictures and started gliding
          rather than paging. */}
      <div className={col.wide}>
        <PhotoCarousel
          images={event.covers}
          label={event.name}
          alt={event.name}
          labels={{ prev: ui.prev, next: ui.next, pause: ui.pause, play: ui.play }}
          locale={locale}
        />
      </div>

      {/* The body, in one column.
          It was two, split down the middle so they ended level. That reads in
          print, where both columns are in view at once; on a screen you reach
          the foot of the first and have to scroll back up to start the second.
          It survived only because the copy was short enough that neither
          column ran past a screen — at three thousand characters it does. */}
      {rest.length > 0 && (
        <div className={`${col.prose} ${MEASURE} flex flex-col gap-6`}>
          {rest.map((p) => (
            <Para key={p} text={p} ui={ui} className={PROSE} />
          ))}
        </div>
      )}
    </div>
  );
}
