/**
 * Typographic forms of the deputy-chair title.
 *
 * The council's rule: the title is always written out in full —
 * „Заместник-председател" — and the abbreviation „Зам.-председател" exists
 * only as a fallback for a line that would otherwise wrap. Notion may store
 * either form (editors own the Позиция cell), so both derivations run on
 * whatever arrives; a role with no known abbreviation comes back unchanged
 * in both forms, which is the signal that no swap is needed.
 */
const FULL = "Заместник-председател";
const ABBR = "Зам.-председател";

export function roleForms(role: string): { full: string; abbr: string } {
  return {
    full: role.replace(ABBR, FULL),
    abbr: role.replace(FULL, ABBR),
  };
}
