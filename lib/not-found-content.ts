/**
 * Copy for the 404 page.
 *
 * Both locales are written, but only one is ever shown — see the note at the
 * top of app/[locale]/not-found.tsx. A not-found component receives no props,
 * and on this app it does not render inside the locale layout either, so
 * nothing on that page can know which language the visitor came for. It
 * therefore renders `defaultLocale`, which is also the sitemap's x-default.
 *
 * The other locale is kept rather than deleted because it costs nothing, it is
 * already written, and the day the locale becomes knowable — a middleware
 * rewrite, or Next passing params to not-found — the page needs one line
 * changed rather than a translation commissioned.
 *
 * The tone is deliberate. A 404 is the one page where the site admits a fault,
 * and the council's own voice elsewhere is plain and warm rather than
 * corporate. It says what happened, does not blame the visitor for typing the
 * address, and offers the one thing worth offering.
 */
import type { Locale } from "./i18n";

export type NotFoundCopy = {
  /** Read by screen readers in place of the giant "404". */
  markLabel: string;
  heading: string;
  body: string;
  /**
   * The primary way out: joining. `href` comes from nav.cta, not from here.
   *
   * Addressed as "ти", not "вие" — the council's own CTA next to it says
   * "Членувай", and switching to the formal person mid-sentence would make the
   * button read as somebody else talking.
   *
   * There is no second "back home" line: the logo in the nav above does that,
   * which is where anyone looks for it.
   */
  ctaLead: string;
};

export const NOT_FOUND: Record<Locale, NotFoundCopy> = {
  bg: {
    markLabel: "Грешка 404",
    heading: "Загубихме тази страница.",
    body:
      "Търсихме я навсякъде, но не я открихме. Възможно е адресът да е записан " +
      "с грешка или страницата да е преместена.",
    ctaLead: "Но има по-добро място, където да отидеш:",
  },
  en: {
    markLabel: "Error 404",
    heading: "We lost this page.",
    body:
      "We looked everywhere and could not find it. The address may have been " +
      "mistyped, or the page may have moved.",
    ctaLead: "But there is a better place for you to go:",
  },
};
