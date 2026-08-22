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
    bodyLeft: string[];
    bodyRight: string;
    statuteLabel: string;
    /** The embedded application's accessible name. */
    formTitle: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Членство в Български дизайн съвет",
    title: "Стани член на Съвета.",
    lead: "Членството е отворено за физически лица и организации, които споделят мисията и ценностите на сдружението.",
    bodyLeft: [
      "Сред членовете ни са дизайнери, компании, университети, неправителствени организации и професионалисти от различни области — хора, които вярват, че дизайнът е двигател на иновации и положителна промяна.",
      "Като член участваш в общите събрания на сдружението, в работата по инициативите и в общността, която изгражда дизайн способността на България.",
    ],
    bodyRight:
      "Заявлението отнема няколко минути и се попълва направо тук. Ще го прегледаме и ще се свържем с теб по имейл. Условията за членство са описани в устава на сдружението.",
    statuteLabel: "Устав на сдружението",
    formTitle: "Заявление за членство в БДС",
    metaTitle: "Членство — Български Дизайн Съвет",
    metaDescription:
      "Членството в Български дизайн съвет е отворено за физически лица и организации, които споделят мисията ни. Кандидатствай направо тук.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Membership in the Bulgarian Design Council",
    title: "Become a member of the Council.",
    lead: "Membership is open to individuals and organisations who share the mission and values of the association.",
    bodyLeft: [
      "Our members include designers, companies, universities, non-governmental organisations and professionals from many fields — people who believe design is a driver of innovation and positive change.",
      "As a member you take part in the association's general assemblies, in the work of its initiatives, and in the community building Bulgaria's design capability.",
    ],
    bodyRight:
      "The application takes a few minutes and is filled in right here. We will review it and get back to you by email. The terms of membership are set out in the association's statute.",
    statuteLabel: "Statute of the association",
    formTitle: "BDC membership application",
    metaTitle: "Membership — Bulgarian Design Council",
    metaDescription:
      "Membership in the Bulgarian Design Council is open to individuals and organisations who share our mission. Apply right here.",
  },
};
