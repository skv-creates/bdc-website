/**
 * Copy for the contact page (/[locale]/contact).
 *
 * The organisation's registered details in one discoverable place — name,
 * legal status, ЕИК, registered office, mailbox — plus signposts to the forms
 * that already exist (/partner, /volunteer, /join), so a visitor writes to the
 * right place first time. The email and the social links themselves come from
 * `footer` in lib/home-content.ts, so an address change stays a one-line edit.
 *
 * The registered office matches the statute page's own wording
 * (lib/home-content.ts, "Седалище"); if the seat moves, both change together.
 */

export type Locale = "bg" | "en";

export const CONTACT_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    /** The organisation card. */
    orgHeading: string;
    orgName: string;
    orgStatus: string;
    orgUic: string;
    addressLabel: string;
    addressLines: string[];
    emailLabel: string;
    /** What to write about, where. */
    routesHeading: string;
    routes: { title: string; body: string; label: string; href: string }[];
    /** What to expect after writing. */
    responseNote: string;
    privacyNote: string;
    privacyLabel: string;
    socialHeading: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Пиши ни — отговаряме",
    title: "Свържи се с Българския дизайн съвет",
    lead: "Въпрос, идея или предложение за съвместна работа — това е мястото.",
    orgHeading: "Данни на сдружението",
    orgName: "Сдружение „Български дизайн съвет“",
    orgStatus: "Юридическо лице с нестопанска цел",
    orgUic: "ЕИК 208377927",
    addressLabel: "Седалище и адрес на управление",
    addressLines: ["ул. „Винсент ван Гог“ 1, ап. 7", "кв. Лозенец, 1407 София, България"],
    emailLabel: "Имейл",
    routesHeading: "За какво ни пишеш?",
    routes: [
      {
        title: "Партньорство",
        body: "Организация, институция или компания, която иска да работи с нас по инициатива или събитие.",
        label: "Формуляр за партньори",
        href: "/partner",
      },
      {
        title: "Членство",
        body: "Искаш да станеш част от сдружението — като физическо лице или организация.",
        label: "Как се членува",
        href: "/join",
      },
      {
        title: "Доброволчество",
        body: "Искаш да дариш време и умения за инициативите ни. Не е необходимо да си дизайнер.",
        label: "Стани доброволец",
        href: "/volunteer",
      },
    ],
    responseNote:
      "За всичко останало — медии, покани за участие, общи въпроси — пиши на имейла ни. Четем всяко писмо и обикновено отговаряме до няколко работни дни.",
    privacyNote: "Как работим с личните данни, които ни изпращаш, е описано в",
    privacyLabel: "Политиката за поверителност",
    socialHeading: "Следвай ни",
    metaTitle: "Контакт — Български Дизайн Съвет",
    metaDescription:
      "Свържи се с Български дизайн съвет — имейл, регистрационни данни, адрес на управление и формуляри за партньорство, членство и доброволчество.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Write to us — we answer",
    title: "Contact the Bulgarian Design Council",
    lead: "A question, an idea, or a proposal to work together — this is the place.",
    orgHeading: "Registered details",
    orgName: "Bulgarian Design Council Association",
    orgStatus: "Non-profit legal entity",
    orgUic: "UIC 208377927",
    addressLabel: "Registered office",
    addressLines: ["1 Vincent van Gogh St, apt. 7", "Lozenets, 1407 Sofia, Bulgaria"],
    emailLabel: "Email",
    routesHeading: "What are you writing about?",
    routes: [
      {
        title: "Partnership",
        body: "An organisation, institution or company that wants to work with us on an initiative or an event.",
        label: "Partner form",
        href: "/partner",
      },
      {
        title: "Membership",
        body: "You want to become part of the association — as an individual or an organisation.",
        label: "How to join",
        href: "/join",
      },
      {
        title: "Volunteering",
        body: "You want to give time and skills to our initiatives. You do not need to be a designer.",
        label: "Become a volunteer",
        href: "/volunteer",
      },
    ],
    responseNote:
      "For everything else — press, invitations, general questions — write to our email. We read every message and usually reply within a few working days.",
    privacyNote: "How we handle the personal data you send us is described in the",
    privacyLabel: "Privacy Policy",
    socialHeading: "Follow us",
    metaTitle: "Contact — Bulgarian Design Council",
    metaDescription:
      "Contact the Bulgarian Design Council — email, registered details, office address, and the forms for partnership, membership and volunteering.",
  },
};
