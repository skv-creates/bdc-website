/**
 * TDMRep — a machine-readable reservation of text-and-data-mining rights.
 *
 * The council's position is that the site may be read, indexed, cited and
 * used to answer questions about who we are and what we argue for, but that
 * none of it — the writing, the photographs, or the people described in it —
 * may be used to train a model. Article 4 of the EU DSM Directive (2019/790)
 * makes that reservation effective only if it is expressed in a machine
 * readable form, and this is the standardised way to express it
 * (W3C TDM Reservation Protocol, Community Group Final Report, 2023).
 *
 * It is not a duplicate of the Cloudflare Content-Signal. That signal is a
 * setting on an account and travels with the CDN; if the site ever moves off
 * Cloudflare it silently stops being published. This file is in the repo and
 * moves with the site. Two independent statements of one position, which is
 * the point — neither one going missing takes the position with it.
 *
 * `tdm-reservation: 1` reserves rights over everything under `location`.
 * `tdm-policy` points at the human-readable terms; omitted here rather than
 * pointed at a page that does not yet spell out the licensing position, since
 * a dangling policy URL is worse than none.
 *
 * Enforcement is a separate question from declaration. GPTBot and ClaudeBot
 * have both been observed requesting paths robots.txt disallows, so this is a
 * statement of rights, not a wall. Blocking is Cloudflare's AI Crawl Control.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json([{ location: "/", "tdm-reservation": 1 }], {
    headers: { "content-type": "application/tdmrep+json" },
  });
}
