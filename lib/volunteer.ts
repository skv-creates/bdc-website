/**
 * Copy for the volunteer landing page (/[locale]/volunteer, Figma 358:3646).
 *
 * The application itself is the form hosted in Notion — the page's button links
 * straight out to it. There is no form in this codebase; if one comes back,
 * this is where its copy would sit alongside the landing page's.
 */

export type Locale = "bg" | "en";

/**
 * The application form, hosted in Notion. The landing page's button links
 * straight out to it; nothing in this codebase collects the answers.
 */
export const VOLUNTEER_FORM_URL =
  "https://ivory-sumac-e99.notion.site/30ac7693aa0380b18035f56657f28616";

export const LANDING_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    bodyLeft: string[];
    bodyRight: string;
    ctaTitle: string;
    /** Rendered highlighted in amber, as the frame draws it. */
    ctaHighlight: string;
    ctaBody: string;
    ctaLabel: string;
    /** Privacy sentence under the CTA; `privacyLink` is its linked tail. */
    privacyPrefix: string;
    privacyLink: string;
    imageAlt: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Доброволците превръщат идеите в промяна",
    title: "Стани част от Българския дизайн съвет",
    lead: "Дизайнът променя средата, когато хората превръщат идеите в действие.",
    bodyLeft: [
      "Помогни ни да изградим по-силна, свързана и влиятелна дизайн среда в България. Благодарение на хора, които даряват време, знания и енергия, превръщаме идеите в реални инициативи.",
      "Не е необходимо да си дизайнер.",
    ],
    bodyRight:
      "Участието е доброволно и неплатено. От нас можеш да очакваш ясна роля, контекст, подкрепа и обратна връзка. От теб очакваме реалистично поет ангажимент, навременна комуникация и отговорност към общата работа.",
    ctaTitle: "Готов си да кандидатстваш?",
    ctaHighlight: "Попълването отнема около 6-8 минути.",
    ctaBody:
      "Ще прегледаме отговорите ти и при подходяща възможност ще се свържем за кратък разговор.",
    ctaLabel: "Стани част от екипа ни",
    privacyPrefix: "Прочетете как обработваме личните Ви данни в нашата",
    privacyLink: "Политика за поверителност",
    imageAlt: "Доброволци на Българския дизайн съвет работят заедно",
    metaTitle: "Стани доброволец — Български Дизайн Съвет",
    metaDescription:
      "Помогни ни да изградим по-силна, свързана и влиятелна дизайн среда в България. Не е необходимо да си дизайнер.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Volunteers turn ideas into change",
    title: "Become part of the Bulgarian Design Council",
    lead: "Design changes the environment when people turn ideas into action.",
    bodyLeft: [
      "Help us build a stronger, better connected and more influential design environment in Bulgaria. It is people giving their time, knowledge and energy who turn ideas into real initiatives.",
      "You don't have to be a designer.",
    ],
    bodyRight:
      "Taking part is voluntary and unpaid. From us you can expect a clear role, context, support and feedback. From you we expect a realistic commitment, timely communication and responsibility towards the shared work.",
    ctaTitle: "Ready to apply?",
    ctaHighlight: "The form takes about 6–8 minutes.",
    ctaBody:
      "We'll read your answers, and if there's a good opportunity we'll get in touch for a short conversation.",
    ctaLabel: "Join our team",
    privacyPrefix: "Read how we process your personal data in our",
    privacyLink: "Privacy Policy",
    imageAlt: "Bulgarian Design Council volunteers working together",
    metaTitle: "Volunteer — Bulgarian Design Council",
    metaDescription:
      "Help us build a stronger, better connected and more influential design environment in Bulgaria. You don't have to be a designer.",
  },
};
