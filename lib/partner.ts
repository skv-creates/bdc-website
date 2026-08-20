/**
 * Copy for the partnership page (/[locale]/partner) and its thank-you page.
 *
 * The page replaced the "Партнирай с нас" mailto: links. A mailto depends on
 * the visitor's machine having a default mail app — most desktop visitors read
 * mail in a browser tab and the click silently does nothing. A form also gives
 * Google Ad Grants what it actually wants tracked: the /partner/thanks URL is
 * the conversion, which a mailto click never credibly was.
 *
 * The form posts to /api/partner (see app/api/partner/route.ts), which mails
 * the submission to the council and redirects here to /partner/thanks.
 */

export type Locale = "bg" | "en";

/**
 * Topic values are locale-independent and match the initiative slugs, so a
 * button on an initiative page can preselect its own topic via ?re=<value>.
 * The value is what lands in the email subject.
 */
export const PARTNER_TOPICS = [
  "general",
  "policy-lab",
  "bulgaria-by-design",
  "future-makers-lab",
  "design-maturity",
] as const;

export type PartnerTopic = (typeof PARTNER_TOPICS)[number];

export const PARTNER_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    /** Field labels; every input carries a visible label, not a placeholder. */
    form: {
      name: string;
      organisation: string;
      organisationOptional: string;
      email: string;
      topic: string;
      topicLabels: Record<PartnerTopic, string>;
      message: string;
      submit: string;
      /** Point-of-collection notice beside the submit action. */
      privacyNotice: string;
      privacyLink: string;
      /** Shown when the API reports a failure — with the email as fallback. */
      error: string;
    };
    metaTitle: string;
    metaDescription: string;
    thanks: {
      title: string;
      body: string;
      backLabel: string;
      metaTitle: string;
    };
  }
> = {
  bg: {
    eyebrow: "Партньорства",
    title: "Да създадем заедно с(ъ)вета",
    lead:
      "Работим в партньорство с организации и институции по изследвания, " +
      "програми и пилотни инициативи. Разкажете ни за предизвикателството и " +
      "промяната, която искате да създадем заедно.",
    form: {
      name: "Име",
      organisation: "Организация",
      organisationOptional: "(по избор)",
      email: "Имейл",
      topic: "Тема на партньорството",
      topicLabels: {
        general: "Общо партньорство",
        "policy-lab": "Лаборатория за политики",
        "bulgaria-by-design": "България чрез Дизайн",
        "future-makers-lab": "Създатели на бъдещето",
        "design-maturity": "Дизайн зрялост",
      },
      message: "Съобщение",
      submit: "Изпрати запитване",
      privacyNotice:
        "Използваме предоставените данни само за да разгледаме и отговорим " +
        "на запитването ви за партньорство. Изпращаме формуляра до служебната " +
        "ни поща чрез доставчика на имейл услуги Resend.",
      privacyLink: "Прочетете Политиката за поверителност.",
      error:
        "Съобщението не можа да бъде изпратено. Опитайте отново или ни " +
        "пишете направо на info@bulgariandesigncouncil.org.",
    },
    metaTitle: "Партнирай с нас",
    metaDescription:
      "Партнирайте с Български дизайн съвет — по инициативите ни или по идея, " +
      "която носите вие. Разкажете ни за организацията си и се свързваме с вас.",
    thanks: {
      title: "Благодарим ви!",
      body:
        "Получихме запитването ви и ще се свържем с вас на посочения имейл. " +
        "Междувременно можете да разгледате инициативите ни.",
      backLabel: "Към инициативите",
      metaTitle: "Благодарим ви",
    },
  },

  en: {
    eyebrow: "Partnerships",
    title: "Let's create the council together",
    lead:
      "We partner with organisations and institutions on research, programmes " +
      "and pilot initiatives. Tell us about the challenge and the change you " +
      "want us to create together.",
    form: {
      name: "Name",
      organisation: "Organisation",
      organisationOptional: "(optional)",
      email: "Email",
      topic: "Partnership topic",
      topicLabels: {
        general: "General partnership",
        "policy-lab": "Policy Lab",
        "bulgaria-by-design": "Bulgaria by Design",
        "future-makers-lab": "Future Makers Lab",
        "design-maturity": "Design Maturity",
      },
      message: "Message",
      submit: "Send enquiry",
      privacyNotice:
        "We use the information you provide only to review and respond to your " +
        "partnership enquiry. We send the form to our council inbox through " +
        "the email service provider Resend.",
      privacyLink: "Read our Privacy Policy.",
      error:
        "The message could not be sent. Try again, or write to us directly " +
        "at info@bulgariandesigncouncil.org.",
    },
    metaTitle: "Partner with us",
    metaDescription:
      "Partner with the Bulgarian Design Council — on our initiatives or on an " +
      "idea of your own. Tell us about your organisation and we will be in touch.",
    thanks: {
      title: "Thank you!",
      body:
        "We received your enquiry and will reach you at the email you gave. " +
        "In the meantime, have a look at our initiatives.",
      backLabel: "See the initiatives",
      metaTitle: "Thank you",
    },
  },
};
