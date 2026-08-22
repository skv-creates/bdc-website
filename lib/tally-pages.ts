/**
 * How many steps the membership application shows a visitor — read from
 * Tally itself, or null when it cannot be.
 *
 * The page's own progress bar (TallyProgress) needs the total, and Tally's
 * forwarded events carry only the current physical page. The form's public
 * page embeds its full definition, from which the per-visitor step count
 * is derived:
 *
 *   - pages = PAGE_BREAK blocks + 1 (the first page has no break before
 *     it), excluding the thank-you page — the redirect leaves the form the
 *     moment it is submitted, so the thank-you is never a step;
 *   - branch alternatives collapse to one: CONDITIONAL_LOGIC blocks that
 *     JUMP_TO_PAGE off the same multiple-choice answer (the individual /
 *     organisation fork) mean a visitor sees exactly one page of each
 *     group, so a group of k target pages contributes 1, not k.
 *
 * For the current form: 4 non-thank-you breaks + 1 = 5 physical pages,
 * one two-way fork → 4 steps, whichever branch is chosen.
 *
 * No hardcoded count anywhere: when the fetch or the arithmetic fails,
 * this returns null and the apply page lets Tally's own bar show instead
 * of drawing one from an invented number. The apply page is prerendered,
 * so the fetch happens at build, never on a visitor's request.
 */
import { MEMBERSHIP_FORM_ID } from "@/lib/tally";

type Block = {
  type?: string;
  payload?: {
    isThankYouPage?: boolean;
    conditionals?: {
      payload?: { field?: { uuid?: string; questionType?: string }; comparison?: string };
    }[];
    actions?: { type?: string; payload?: { jumpToPage?: string } }[];
  };
};

export async function getMembershipFormPages(): Promise<number | null> {
  try {
    // force-cache is load-bearing: this version of Next defaults fetch to
    // no-store, which would silently turn the prerendered apply route
    // dynamic (● → ƒ) — the exact regression the event pages once had.
    const res = await fetch(`https://tally.so/r/${MEMBERSHIP_FORM_ID}`, {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const json = html.match(
      /__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    )?.[1];
    if (!json) return null;
    const blocks: Block[] = JSON.parse(json)?.props?.pageProps?.blocks ?? [];

    const contentBreaks = blocks.filter(
      (b) => b.type === "PAGE_BREAK" && !b.payload?.isThankYouPage,
    ).length;
    if (contentBreaks === 0) return null;
    const physicalPages = contentBreaks + 1;

    // Alternative branches: jump rules keyed on the same choice field lead
    // to mutually exclusive pages — a visitor takes exactly one.
    const targetsByField = new Map<string, Set<string>>();
    for (const b of blocks) {
      if (b.type !== "CONDITIONAL_LOGIC") continue;
      const field = b.payload?.conditionals?.[0]?.payload?.field;
      const jump = b.payload?.actions?.find((a) => a.type === "JUMP_TO_PAGE")
        ?.payload?.jumpToPage;
      if (field?.questionType !== "MULTIPLE_CHOICE" || !field.uuid || !jump) continue;
      const set = targetsByField.get(field.uuid) ?? new Set<string>();
      set.add(jump);
      targetsByField.set(field.uuid, set);
    }
    let collapsed = 0;
    for (const targets of targetsByField.values()) {
      if (targets.size > 1) collapsed += targets.size - 1;
    }

    const steps = physicalPages - collapsed;
    return steps > 0 ? steps : null;
  } catch {
    return null;
  }
}
