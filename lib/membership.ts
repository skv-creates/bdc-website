/**
 * Copy for the membership page (/[locale]/membership).
 *
 * The application itself is the Tally form, embedded inline on the page —
 * see lib/tally.ts for the form id and the script loader. This page is the
 * one place the application lives: the header's Членувай button and the
 * contact page's Членство card both land here.
 */

export type Locale = "bg" | "en";

export const MEMBERSHIP_COPY: Record<
  Locale,
  {
    title: string;
    lead: string;
    /** The embedded application's accessible name. */
    formTitle: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    title: "Кандидатствай за членство",
    lead: "Обединяваме хора и организации, които споделят мисията ни и искат да участват в развитието на дизайна в България.",
    formTitle: "Заявление за членство в БДС",
    metaTitle: "Членство — Български Дизайн Съвет",
    metaDescription:
      "Кандидатствайте за членство в Български дизайн съвет — обединяваме хора и организации, които участват в развитието на дизайна в България.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    title: "Apply for membership",
    lead: "We bring together people and organisations who share our mission and want to take part in the development of design in Bulgaria.",
    formTitle: "BDC membership application",
    metaTitle: "Membership — Bulgarian Design Council",
    metaDescription:
      "Apply for membership in the Bulgarian Design Council — we bring together the people and organisations developing design in Bulgaria.",
  },
};
