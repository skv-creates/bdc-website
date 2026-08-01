"use client";

/**
 * VideoEmbed — a YouTube recording played in place.
 *
 * Nothing from YouTube is requested until someone asks for it. The card is our
 * own markup, and the iframe is only created on the click that starts playing.
 * An iframe rendered up front would have YouTube setting cookies and profiling
 * every visitor who merely scrolled past a page they never intended to watch —
 * on a site that declines non-essential cookies elsewhere, that would be
 * inconsistent as well as slow.
 *
 * For the same reason the player is youtube-nocookie.com, which is Google's
 * host that holds off on tracking until playback actually starts.
 */
import { useState } from "react";

export function VideoEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    // 16/9 rather than a fixed height, so the player keeps its shape at every
    // width instead of letterboxing itself inside our box.
    <div className="relative aspect-video w-full overflow-hidden bg-[color-mix(in_srgb,var(--color-text)_8%,var(--color-page))]">
      {playing ? (
        <iframe
          // autoplay is honest here: it only ever runs because someone just
          // pressed play, so it is completing their action rather than
          // starting one they did not ask for.
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          // The accessible name says what pressing it does and to what, since
          // out of context "Play" alone names neither.
          aria-label={`Play: ${title}`}
          className="group absolute inset-0 flex h-full w-full flex-col items-start justify-end gap-4 p-8 text-start"
        >
          {/* Not a real <button> — it is inside one. A nested button would be
              invalid and would take a second tab stop for the same action. */}
          <span
            aria-hidden
            className="grid size-16 place-items-center rounded-full bg-brand text-2xl transition-transform group-hover:scale-105"
          >
            ▶
          </span>
          <span className="t-body font-bold">{title}</span>
        </button>
      )}
    </div>
  );
}
