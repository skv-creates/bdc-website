/**
 * Pull the video id out of a YouTube URL.
 *
 * Lives here, in a plain module, rather than beside the player: the player is a
 * client component, and anything exported from one of those cannot be called
 * during a server render — the server sees a reference to a client function, not
 * the function. The overlay needs to decide whether a paragraph is a video while
 * rendering on the server, so the parsing has to sit somewhere both sides can
 * reach.
 */
export function youtubeId(href: string): string | null {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") {
      return null;
    }
    if (u.pathname === "/watch") return u.searchParams.get("v");
    // The other shapes an editor might paste: /embed/, /live/, /shorts/, /v/.
    const m = u.pathname.match(/^\/(embed|live|shorts|v)\/([^/?#]+)/);
    return m ? m[2] : null;
  } catch {
    // Not a URL at all — the caller treats null as "this is not a video".
    return null;
  }
}
