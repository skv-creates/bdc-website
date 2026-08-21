/**
 * Copy for the membership landing page (/[locale]/join).
 *
 * The application itself is the Tally form the button links out to — nothing
 * in this codebase collects the answers. The page exists so the site's primary
 * CTA lands somewhere that explains before it asks: who membership is for,
 * what it involves, and what happens after the form is sent. The header's
 * "Членувай" button points here (see nav.cta in lib/home-content.ts).
 */

export type Locale = "bg" | "en";

/** The membership application, hosted on Tally. */
export const MEMBERSHIP_FORM_URL = "https://tally.so/r/81PbQA";

export const JOIN_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    bodyLeft: string[];
    bodyRight: string;
    /** The statute, linked where membership terms are mentioned. */
    statuteLabel: string;
    ctaTitle: string;
    ctaHighlight: string;
    ctaBody: string;
    ctaLabel: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Членство в Български дизайн съвет",
    title: "Членувай в Българския дизайн съвет",
    lead: "Обединяваме хората и организациите, които вярват, че дизайнът е двигател на иновации и положителна промяна.",
    bodyLeft: [
      "Членството е отворено за физически лица и организации, които споделят мисията и ценностите на Български дизайн съвет — дизайнери, компании, университети, неправителствени организации, публични институции и професионалисти от различни области.",
      "Не е необходимо да си дизайнер.",
    ],
    bodyRight:
      "Като член участваш в общите събрания на сдружението, в работата по инициативите и в общността, която изгражда дизайн способността на България. Условията за членство са описани в устава на сдружението.",
    statuteLabel: "Устав на сдружението",
    ctaTitle: "Готов си да кандидатстваш?",
    ctaHighlight: "Попълването отнема няколко минути.",
    ctaBody:
      "Заявлението се подава през формата ни за кандидатстване. Ще го прегледаме и ще се свържем с теб по имейл.",
    ctaLabel: "Кандидатствай за членство",
    metaTitle: "Членувай — Български Дизайн Съвет",
    metaDescription:
      "Членството в Български дизайн съвет е отворено за физически лица и организации, които споделят мисията ни. Кандидатствай онлайн.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Membership in the Bulgarian Design Council",
    title: "Join the Bulgarian Design Council",
    lead: "We bring together the people and organisations who believe design is a driver of innovation and positive change.",
    bodyLeft: [
      "Membership is open to individuals and organisations who share the mission and values of the Bulgarian Design Council — designers, companies, universities, non-governmental organisations, public institutions and professionals from many fields.",
      "You do not need to be a designer.",
    ],
    bodyRight:
      "As a member you take part in the association's general assemblies, in the work of its initiatives, and in the community building Bulgaria's design capability. The terms of membership are set out in the association's statute.",
    statuteLabel: "Statute of the association",
    ctaTitle: "Ready to apply?",
    ctaHighlight: "The form takes a few minutes to fill in.",
    ctaBody:
      "Applications go through our online form. We will review yours and get back to you by email.",
    ctaLabel: "Apply for membership",
    metaTitle: "Join — Bulgarian Design Council",
    metaDescription:
      "Membership in the Bulgarian Design Council is open to individuals and organisations who share our mission. Apply online.",
  },
};
