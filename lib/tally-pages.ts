/**
 * How many pages the membership application has — read from Tally itself.
 *
 * The page's own progress bar (TallyProgress) needs the total, and Tally's
 * forwarded events carry only the current page. But the form's public page
 * embeds its full definition, and the PAGE_BREAK blocks in it match the
 * progress segments Tally's own bar draws — verified against the live
 * form. Counting them at build time keeps the bar honest when steps are
 * added or removed in the Tally editor: the next deploy picks it up, no
 * hand edit.
 *
 * The apply page is prerendered, so this fetch happens at build, never on
 * a visitor's request. Any failure — network, markup change, missing
 * blocks — falls back to MEMBERSHIP_FORM_PAGES rather than failing the
 * build; a bar with a slightly stale total beats no site.
 */
import { MEMBERSHIP_FORM_ID, MEMBERSHIP_FORM_PAGES } from "@/lib/tally";

export async function getMembershipFormPages(): Promise<number> {
  try {
    // force-cache is load-bearing: this version of Next defaults fetch to
    // no-store, which would silently turn the prerendered apply route
    // dynamic (● → ƒ) — the exact regression the event pages once had.
    const res = await fetch(`https://tally.so/r/${MEMBERSHIP_FORM_ID}`, {
      cache: "force-cache",
    });
    if (!res.ok) return MEMBERSHIP_FORM_PAGES;
    const html = await res.text();
    const json = html.match(
      /__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    )?.[1];
    if (!json) return MEMBERSHIP_FORM_PAGES;
    const blocks: { type?: string }[] =
      JSON.parse(json)?.props?.pageProps?.blocks ?? [];
    const breaks = blocks.filter((b) => b.type === "PAGE_BREAK").length;
    return breaks > 0 ? breaks : MEMBERSHIP_FORM_PAGES;
  } catch {
    return MEMBERSHIP_FORM_PAGES;
  }
}
