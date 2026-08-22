/**
 * Copy for the contact page (/[locale]/contact), per Figma 643:3969.
 *
 * Three movements: the invitation with the mailbox as "the fastest way to
 * reach us"; the three directions — partnership, membership, volunteering —
 * each a bordered column closing with a row CTA; and the Council's official
 * details in ruled rows, with the privacy note beside them. The email
 * address itself comes from `footer` in lib/home-content.ts, and the
 * registered office matches the statute page's wording.
 *
 * The frame draws its CTA rows in DM Sans — a stray from another kit; the
 * page sets them in the site's own face like every other row link.
 */

export type Locale = "bg" | "en";

export const CONTACT_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    /** The mailbox block beside the lead. */
    reach: { label: string; note: string };
    routesEyebrow: string;
    routesHeading: string;
    routes: { title: string; body: string; label: string; href: string }[];
    legalEyebrow: string;
    privacyNote: string;
    privacyLabel: string;
    orgName: string;
    orgStatus: string;
    orgUic: string;
    addressLabel: string;
    addressLines: string[];
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Контакт",
    title: "Идеите започват с разговор.",
    lead: "Пиши ни с въпрос, идея или предложение за обща работа. Четем всяко писмо и обикновено отговаряме до три работни дни.",
    reach: {
      label: "Най-прекият път до нас",
      note: "Обикновено отговаряме до 3 работни дни.",
    },
    routesEyebrow: "Избери посока",
    routesHeading: "Идеите намират почва, когато хората се съберат около тях.",
    routes: [
      {
        title: "Партнирай с нас",
        body: "За организации, институции и компании, които виждат възможност за обща работа по инициатива, изследване или събитие.",
        label: "Предложи партньорство",
        href: "/partner",
      },
      {
        title: "Членувай",
        body: "За хора и организации, които искат да допринасят дългосрочно за развитието на дизайна в България.",
        label: "Прочети повече",
        href: "/membership",
      },
      {
        title: "Стани доброволец",
        body: "За хора, които искат да се включат в проект и да вложат време, опит или умения в конкретна наша инициатива.",
        label: "Прочети повече",
        href: "/volunteer",
      },
    ],
    legalEyebrow: "Официални данни на Съвета",
    privacyNote: "Как работим с личните данни, които ни изпращаш, е описано в",
    privacyLabel: "Политиката за поверителност",
    orgName: "Сдружение „Български дизайн съвет“",
    orgStatus: "Юридическо лице с нестопанска цел",
    orgUic: "ЕИК 208377927",
    addressLabel: "Седалище и адрес на управление",
    addressLines: ["ул. „Винсент ван Гог“ №1, ап. 7", "кв. Лозенец, 1407", "София, България"],
    metaTitle: "Контакт — Български Дизайн Съвет",
    metaDescription:
      "Свържи се с Български дизайн съвет — пиши ни за партньорство, членство или доброволчество. Отговаряме до три работни дни.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Contact",
    title: "Ideas start with a conversation.",
    lead: "Write to us with a question, an idea, or a proposal for working together. We read every message and usually reply within three working days.",
    reach: {
      label: "The fastest way to reach us",
      note: "We usually reply within 3 working days.",
    },
    routesEyebrow: "Pick a direction",
    routesHeading: "Ideas take root when people gather around them.",
    routes: [
      {
        title: "Partner with us",
        body: "For organisations, institutions and companies that see an opportunity to work together on an initiative, a study or an event.",
        label: "Propose a partnership",
        href: "/partner",
      },
      {
        title: "Become a member",
        body: "For people and organisations who want to contribute to the long-term development of design in Bulgaria.",
        label: "Read more",
        href: "/membership",
      },
      {
        title: "Become a volunteer",
        body: "For people who want to join a project and put time, experience or skills into one of our initiatives.",
        label: "Read more",
        href: "/volunteer",
      },
    ],
    legalEyebrow: "The Council's official details",
    privacyNote: "How we handle the personal data you send us is described in the",
    privacyLabel: "Privacy Policy",
    orgName: "Bulgarian Design Council Association",
    orgStatus: "Non-profit legal entity",
    orgUic: "UIC 208377927",
    addressLabel: "Registered office",
    addressLines: ["1 Vincent van Gogh St, apt. 7", "Lozenets, 1407", "Sofia, Bulgaria"],
    metaTitle: "Contact — Bulgarian Design Council",
    metaDescription:
      "Contact the Bulgarian Design Council — write to us about partnership, membership or volunteering. We reply within three working days.",
  },
};
