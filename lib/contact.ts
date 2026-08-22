/**
 * Copy for the contact page (/[locale]/contact).
 *
 * One strong invitation, three clear paths, and the official details as
 * reassurance rather than the opening act: the page leads with the mailbox
 * and a plain promise about answering, sends each kind of message to the
 * door that is staffed for it, and keeps the registration data — which a
 * grants reviewer still needs to find — lower down where it reassures
 * without becoming the page.
 *
 * The email itself comes from `footer` in lib/home-content.ts, so an address
 * change stays a one-line edit. The registered office matches the statute
 * page's own wording (lib/home-content.ts, "Седалище"); if the seat moves,
 * both change together.
 */

export type Locale = "bg" | "en";

export const CONTACT_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    /** The three pathways — whole cards are the links. */
    routesHeading: string;
    routes: { title: string; body: string; label: string; href: string }[];
    /** The official details, lower down. */
    legalHeading: string;
    orgName: string;
    orgStatus: string;
    orgUic: string;
    addressLabel: string;
    addressLines: string[];
    privacyNote: string;
    privacyLabel: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Контакти",
    title: "Идеите започват с разговор.",
    lead: "Пиши ни с въпрос, идея или предложение за обща работа. Четем всяко писмо и обикновено отговаряме до три работни дни.",
    routesHeading: "Как искаш да се включиш?",
    routes: [
      {
        title: "Партньорство",
        body: "За организации, институции и компании, които виждат възможност за обща работа по инициатива, изследване или събитие.",
        label: "Предложи партньорство",
        href: "/partner",
      },
      {
        title: "Членство",
        body: "За хора и организации, които искат да допринасят дългосрочно за развитието на дизайна в България.",
        label: "Кандидатствай за членство",
        href: "/membership",
      },
      {
        title: "Доброволчество",
        body: "За хора, които искат да вложат време, опит или умения в конкретна наша инициатива. Не е необходимо да си дизайнер.",
        label: "Стани доброволец",
        href: "/volunteer",
      },
    ],
    legalHeading: "Официални данни",
    orgName: "Сдружение „Български дизайн съвет“",
    orgStatus: "Юридическо лице с нестопанска цел",
    orgUic: "ЕИК 208377927",
    addressLabel: "Седалище и адрес на управление",
    addressLines: ["ул. „Винсент ван Гог“ №1, ап. 7", "кв. Лозенец, 1407 София, България"],
    privacyNote: "Как работим с личните данни, които ни изпращаш, е описано в",
    privacyLabel: "Политиката за поверителност",
    metaTitle: "Контакти — Български Дизайн Съвет",
    metaDescription:
      "Свържи се с Български дизайн съвет — пиши ни за партньорство, членство или доброволчество. Отговаряме до три работни дни.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Contacts",
    title: "Ideas start with a conversation.",
    lead: "Write to us with a question, an idea, or a proposal for working together. We read every message and usually reply within three working days.",
    routesHeading: "How would you like to get involved?",
    routes: [
      {
        title: "Partnership",
        body: "For organisations, institutions and companies that see an opportunity to work together on an initiative, a study or an event.",
        label: "Propose a partnership",
        href: "/partner",
      },
      {
        title: "Membership",
        body: "For people and organisations who want to contribute to the long-term development of design in Bulgaria.",
        label: "Apply for membership",
        href: "/membership",
      },
      {
        title: "Volunteering",
        body: "For people who want to put time, experience or skills into one of our initiatives. You do not need to be a designer.",
        label: "Become a volunteer",
        href: "/volunteer",
      },
    ],
    legalHeading: "Official details",
    orgName: "Bulgarian Design Council Association",
    orgStatus: "Non-profit legal entity",
    orgUic: "UIC 208377927",
    addressLabel: "Registered office",
    addressLines: ["1 Vincent van Gogh St, apt. 7", "Lozenets, 1407 Sofia, Bulgaria"],
    privacyNote: "How we handle the personal data you send us is described in the",
    privacyLabel: "Privacy Policy",
    metaTitle: "Contacts — Bulgarian Design Council",
    metaDescription:
      "Contact the Bulgarian Design Council — write to us about partnership, membership or volunteering. We reply within three working days.",
  },
};
