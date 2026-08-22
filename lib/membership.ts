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
    eyebrow: string;
    title: string;
    lead: string;
    body: string;
    /** Scrolls to the embedded application below. */
    startLabel: string;
    /** The embedded application's accessible name. */
    formTitle: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Членство в Български дизайн съвет",
    title: "Кандидатствай за членство",
    lead: "Български дизайн съвет обединява хора и организации, които споделят мисията ни и искат да участват в развитието на дизайна в България.",
    body: "Можете да кандидатствате като физическо лице или организация, за пълноправно или асоциирано членство.",
    startLabel: "Започнете кандидатурата",
    formTitle: "Заявление за членство в БДС",
    metaTitle: "Членство — Български Дизайн Съвет",
    metaDescription:
      "Кандидатствайте за членство в Български дизайн съвет — като физическо лице или организация, за пълноправно или асоциирано членство.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Membership in the Bulgarian Design Council",
    title: "Apply for membership",
    lead: "The Bulgarian Design Council brings together people and organisations who share our mission and want to take part in the development of design in Bulgaria.",
    body: "You can apply as an individual or an organisation, for full or associate membership.",
    startLabel: "Start your application",
    formTitle: "BDC membership application",
    metaTitle: "Membership — Bulgarian Design Council",
    metaDescription:
      "Apply for membership in the Bulgarian Design Council — as an individual or an organisation, for full or associate membership.",
  },
};
