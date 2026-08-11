/**
 * Copy for the Contact page (/[locale]/contact).
 *
 * There was no contact page. The only ways to reach the council from the site
 * were two mailto: links — one in the hero with a prefilled "Partnership"
 * subject, one in the footer — which is thin for an organisation asking
 * institutions to work with it, and is one of the five key pages the Google Ad
 * Grants policy names outright.
 *
 * The email address, the legal name, the ЕИК and the registered address are the
 * ones already published in the footer and the privacy policy.
 *
 * **The phone number in `footer.phone` is deliberately not used here.**
 * "+359 2 123 4567" is a placeholder; it is not rendered anywhere on the live
 * site today, and publishing a fake number on the page whose whole job is being
 * reachable would be worse than having no number at all. If the council has a
 * real number, this is the page for it.
 */

export type Locale = "bg" | "en";

/** General enquiries. Same address as the footer. */
export const CONTACT_EMAIL = "info@bulgariandesigncouncil.org";

/** Prefilled subject, as the hero's secondary button already does. */
export const PARTNERSHIP_MAILTO = `mailto:${CONTACT_EMAIL}?subject=Partnership`;

export const CONTACT_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    /** The routes in, each with what it is for. */
    channelsHeading: string;
    channels: { label: string; detail: string; action: string; kind: "email" | "member" | "volunteer" }[];
    detailsLabel: string;
    detailsHeading: string;
    detailsRows: { label: string; value: string }[];
    socialHeading: string;
    responseNote: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Контакти",
    title: "Свържете се с нас",
    lead: "Отворени сме за партньорства с институции, бизнес и организации, за нови членове и за доброволци.",
    channelsHeading: "Как да ни намерите",
    channels: [
      {
        label: "Общи запитвания",
        detail: "Въпроси за сдружението, за инициативите или за медийни запитвания.",
        action: "Пишете ни",
        kind: "email",
      },
      {
        label: "Партньорства",
        detail: "Институции, бизнес и организации, които искат да работят с нас.",
        action: "Предложете партньорство",
        kind: "email",
      },
      {
        label: "Членство",
        detail: "Присъединете се към сдружението като член.",
        action: "Стани член ↗",
        kind: "member",
      },
      {
        label: "Доброволчество",
        detail: "Не е необходимо да сте дизайнер.",
        action: "Стани доброволец",
        kind: "volunteer",
      },
    ],
    detailsLabel: "Данни",
    detailsHeading: "Регистрация и адрес",
    detailsRows: [
      { label: "Юридическо лице", value: "Сдружение „Български дизайн съвет“" },
      { label: "ЕИК", value: "208377927" },
      {
        label: "Седалище и адрес на управление",
        value: "ул. „Винсент Ван Гог“ № 1, ап. 7, 1407, кв. Лозенец, гр. София, България",
      },
      { label: "Имейл", value: CONTACT_EMAIL },
    ],
    socialHeading: "Социални мрежи",
    responseNote:
      "Пишем отговор на всяко запитване. Сдружението се движи от доброволен труд, така че отговорът може да отнеме няколко дни.",
    metaTitle: "Контакти",
    metaDescription:
      "Свържете се със Сдружение „Български дизайн съвет“ — общи запитвания, партньорства, членство и доброволчество. Регистрация, ЕИК и адрес на управление.",
  },
  en: {
    eyebrow: "Contact",
    title: "Get in touch",
    lead: "We are open to partnerships with institutions, business and organisations, to new members, and to volunteers.",
    channelsHeading: "How to reach us",
    channels: [
      {
        label: "General enquiries",
        detail: "Questions about the association, its initiatives, or press enquiries.",
        action: "Email us",
        kind: "email",
      },
      {
        label: "Partnerships",
        detail: "Institutions, business and organisations who want to work with us.",
        action: "Propose a partnership",
        kind: "email",
      },
      {
        label: "Membership",
        detail: "Join the association as a member.",
        action: "Become a member ↗",
        kind: "member",
      },
      {
        label: "Volunteering",
        detail: "You don't have to be a designer.",
        action: "Volunteer with us",
        kind: "volunteer",
      },
    ],
    detailsLabel: "Details",
    detailsHeading: "Registration and address",
    detailsRows: [
      { label: "Registered entity", value: "Bulgarian Design Council Association" },
      { label: "Company number (ЕИК)", value: "208377927" },
      {
        label: "Registered address",
        value: "1 Vincent Van Gogh St, apt. 7, 1407, Lozenets, Sofia, Bulgaria",
      },
      { label: "Email", value: CONTACT_EMAIL },
    ],
    socialHeading: "Social",
    responseNote:
      "We reply to every enquiry. The association runs on volunteered time, so a reply can take a few days.",
    metaTitle: "Contact",
    metaDescription:
      "Contact the Bulgarian Design Council Association — general enquiries, partnerships, membership and volunteering. Registration, company number and registered address.",
  },
};
