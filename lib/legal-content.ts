/**
 * Legal pages content — privacy policy, keyed by locale.
 *
 * Same contract as `home-content.ts`: Bulgarian (`bg`) is the source of truth
 * and English (`en`) is typed as `typeof bg`, so the compiler forces the two
 * locales to keep an identical shape. Kept in its own module so the long legal
 * prose never lands in the home page's bundle.
 *
 * ⚠️ This is the approved policy text, transcribed verbatim from the two Notion
 * source documents (BG "ПОЛИТИКА ЗА ПОВЕРИТЕЛНОСТ", EN "Privacy Policy", both
 * last updated 17.07.2026). Do not reword, expand or "improve" it here — it is
 * a legal document. Any change belongs in Notion first.
 */
import type { Locale } from "./i18n";

/** A block of legal prose. Mirrors `FaqBlock`, plus ordered lists and links. */
export type LegalBlock =
  | { p: string }
  | { h: string }
  | { ul: string[] }
  | { ol: string[] }
  | { a: { text: string; href: string } };

export type LegalSection = { title: string; blocks: LegalBlock[] };

/* =============================================================================
   BULGARIAN — source of truth
============================================================================= */
const bg = {
  meta: {
    title: "Политика за поверителност — Български Дизайн Съвет",
    description:
      "Как Сдружение „Български дизайн съвет“ обработва, съхранява и защитава личните данни на кандидатите за членство и членовете си.",
  },

  title: "Политика за поверителност",
  lead: "на личните данни на Сдружение „Български дизайн съвет“",
  updated: "Последно актуализирана на 17.07.2026 г.",
  backLabel: "← Към началната страница",
  onThisPage: "На тази страница",

  sections: [
    {
      title: "I. Обща информация",
      blocks: [
        {
          p: "Настоящата Политика за поверителност урежда начина, по който Сдружение „Български дизайн съвет“, ЕИК 208377927, със седалище и адрес на управление: ул. „Винсент Ван Гог“ № 1, ап. 7, 1407, кв. Лозенец, гр. София, България, обработва, съхранява и защитава личните данни на лицата, кандидатстващи за членство и/или членуващи в организацията.",
        },
        {
          p: "Сдружението обработва лични данни в съответствие с приложимото българско и европейско законодателство в областта на защитата на личните данни.",
        },
      ],
    },

    {
      title: "II. Какви лични данни събираме",
      blocks: [
        { p: "В рамките на формата за членство Сдружението събира следните лични данни:" },
        { ul: ["Име и фамилия;", "Имейл адрес."] },
        { p: "Сдружението не събира специални категории лични данни." },
      ],
    },

    {
      title: "III. Цели на обработването",
      blocks: [
        { p: "Личните данни се обработват за следните цели:" },
        {
          ol: [
            "Регистриране и администриране на членството в Сдружението;",
            "Осъществяване на контакт с членовете;",
            "Изпращане на покани и уведомления за общи събрания;",
            "Информиране относно инициативи, събития и дейности на Сдружението;",
            "Изпълнение на законови задължения, когато е приложимо.",
          ],
        },
      ],
    },

    {
      title: "IV. Правно основание за обработване",
      blocks: [
        { p: "Обработването на лични данни се извършва на основание:" },
        {
          ul: [
            "Чл. 6, пар. 1, б. „б“ от GDPR – обработване, необходимо за предприемане на стъпки по искане на субекта на данните преди сключване на договор и/или за изпълнение на договор (членство);",
            "Чл. 6, пар. 1, б. „в“ от GDPR – изпълнение на законово задължение;",
            "Чл. 6, пар. 1, б. „а“ от GDPR – изрично съгласие на субекта на данните (когато е приложимо).",
          ],
        },
      ],
    },

    {
      title: "V. Срок на съхранение",
      blocks: [
        { p: "Личните данни се съхраняват:" },
        {
          ul: [
            "За периода на членство в Сдружението;",
            "До 5 години след прекратяване на членството, освен ако по-дълъг срок не се изисква по закон.",
          ],
        },
        { p: "След изтичане на посочените срокове данните се изтриват или анонимизират." },
      ],
    },

    {
      title: "VI. Получатели на лични данни",
      blocks: [
        { p: "Сдружението не предоставя лични данни на трети лица, освен:" },
        {
          ul: [
            "Когато това се изисква от закон;",
            "На доставчици на технически услуги (напр. хостинг или имейл услуги), които обработват данните от името на Сдружението при спазване на изискванията за защита на данните.",
          ],
        },
        { p: "Сдружението не прехвърля лични данни извън Европейския съюз." },
      ],
    },

    {
      title: "VII. Права на субектите на данни",
      blocks: [
        { p: "Всяко лице има следните права съгласно GDPR:" },
        {
          ul: [
            "Право на достъп до личните данни;",
            "Право на коригиране на неточни или непълни данни;",
            "Право на изтриване;",
            "Право на ограничаване на обработването;",
            "Право на възражение срещу обработването;",
            "Право на преносимост на данните;",
            "Право на оттегляне на съгласие по всяко време (когато обработването се основава на съгласие);",
          ],
        },
        { p: "Искания могат да се отправят на имейл:" },
        {
          a: {
            text: "info@bulgariandesigncouncil.org",
            href: "mailto:info@bulgariandesigncouncil.org",
          },
        },
      ],
    },

    {
      title: "VIII. Мерки за сигурност",
      blocks: [
        {
          p: "Сдружението прилага подходящи технически и организационни мерки за защита на личните данни срещу неразрешен достъп, загуба, неправомерно разкриване или унищожаване.",
        },
      ],
    },

    {
      title: "IX. Промени в политиката",
      blocks: [
        {
          p: "Сдружението си запазва правото да актуализира настоящата Политика за поверителност при промени в законодателството или в начина на обработване на личните данни.",
        },
      ],
    },
  ] as LegalSection[],
};

/* =============================================================================
   ENGLISH
============================================================================= */
const en: typeof bg = {
  meta: {
    title: "Privacy Policy — Bulgarian Design Council",
    description:
      "How the Bulgarian Design Council Association collects, processes, stores and protects the personal data of membership applicants and members.",
  },

  title: "Privacy Policy",
  lead: "of the Bulgarian Design Council",
  updated: "Last updated on 17 July 2026.",
  backLabel: "← Back to home",
  onThisPage: "On this page",

  sections: [
    {
      title: "I. General Information",
      blocks: [
        {
          p: "This Privacy Policy sets out how the Bulgarian Design Council Association, UIC (Unified Identification Code) 208377927, with its registered office at 1 Vincent Van Gogh Street, apt. 7, 1407, Lozenets district, Sofia, Bulgaria, collects, processes, stores, and protects the personal data of individuals applying for membership and/or holding membership in the Association.",
        },
        {
          p: "The Association processes personal data in accordance with the applicable Bulgarian and European legislation on the protection of personal data.",
        },
      ],
    },

    {
      title: "II. What Personal Data We Collect",
      blocks: [
        {
          p: "As part of the membership application process, the Association collects the following personal data:",
        },
        { ul: ["First name and last name;", "Email address."] },
        { p: "The Association does not collect special categories of personal data." },
      ],
    },

    {
      title: "III. Purposes of Processing",
      blocks: [
        { p: "Personal data are processed for the following purposes:" },
        {
          ol: [
            "Registering and administering membership in the Association;",
            "Communicating with members;",
            "Sending invitations and notices regarding General Meetings;",
            "Providing information about the Association's initiatives, events, and activities;",
            "Complying with legal obligations, where applicable.",
          ],
        },
      ],
    },

    {
      title: "IV. Legal Basis for Processing",
      blocks: [
        { p: "Personal data are processed on the following legal bases:" },
        {
          ul: [
            "Article 6(1)(b) GDPR – processing necessary to take steps at the request of the data subject prior to entering into a contract and/or for the performance of a contract (membership);",
            "Article 6(1)(c) GDPR – compliance with a legal obligation;",
            "Article 6(1)(a) GDPR – the data subject's explicit consent (where applicable).",
          ],
        },
      ],
    },

    {
      title: "V. Data Retention Period",
      blocks: [
        { p: "Personal data are retained:" },
        {
          ul: [
            "For the duration of membership in the Association;",
            "For up to five (5) years after the termination of membership, unless a longer retention period is required by law.",
          ],
        },
        {
          p: "Upon expiry of the applicable retention period, the personal data will be securely deleted or anonymized.",
        },
      ],
    },

    {
      title: "VI. Recipients of Personal Data",
      blocks: [
        { p: "The Association does not disclose personal data to third parties except:" },
        {
          ul: [
            "Where disclosure is required by law;",
            "To technical service providers (such as hosting or email service providers) that process personal data on behalf of the Association in compliance with applicable data protection requirements.",
          ],
        },
        { p: "The Association does not transfer personal data outside the European Union." },
      ],
    },

    {
      title: "VII. Rights of Data Subjects",
      blocks: [
        {
          p: "Under the General Data Protection Regulation (GDPR), every data subject has the right to:",
        },
        {
          ul: [
            "Access their personal data;",
            "Request rectification of inaccurate or incomplete personal data;",
            "Request erasure of personal data;",
            "Request restriction of processing;",
            "Object to the processing of personal data;",
            "Receive their personal data in a portable format (data portability);",
            "Withdraw consent at any time, where processing is based on consent.",
          ],
        },
        { p: "Requests concerning these rights may be submitted by email to:" },
        {
          a: {
            text: "info@bulgariandesigncouncil.org",
            href: "mailto:info@bulgariandesigncouncil.org",
          },
        },
      ],
    },

    {
      title: "VIII. Security Measures",
      blocks: [
        {
          p: "The Association implements appropriate technical and organizational measures to protect personal data against unauthorized access, loss, unlawful disclosure, alteration, or destruction.",
        },
      ],
    },

    {
      title: "IX. Changes to this Privacy Policy",
      blocks: [
        {
          p: "The Association reserves the right to update this Privacy Policy in the event of changes to applicable legislation or to its personal data processing practices.",
        },
      ],
    },
  ],
};

const content = { bg, en } satisfies Record<Locale, typeof bg>;

/** Whole legal-content shape for one locale. */
/**
 * The anchor for a section, taken from its roman numeral and not its title.
 *
 * The numeral is the one part of a heading that is identical in both locales,
 * so `/bg/privacy#section-vii` and `/en/privacy#section-vii` address the same
 * clause. That is what lets the language toggle carry a deep link across
 * without dropping the reader back at the top of the page.
 *
 * Slugifying the title instead would give two different anchors for one
 * clause, and the Bulgarian one would be percent-encoded Cyrillic that nobody
 * can read in a pasted URL. Worse, it would change every time the wording was
 * edited — silently breaking any link already sent to a member or a regulator,
 * which for a privacy policy is the whole point of being able to link to it.
 *
 * Falls back to the position in the list if a section ever arrives without a
 * numeral, so an editor cannot break the page by omitting one.
 */
export function legalSectionId(section: LegalSection, index: number) {
  const numeral = section.title.match(/^([IVXLCDM]+)\./i)?.[1];
  return `section-${(numeral ?? index + 1).toString().toLowerCase()}`;
}

export type LegalContent = typeof bg;

/** Returns the privacy-policy content for a locale. */
export function getLegalContent(locale: Locale): LegalContent {
  return content[locale];
}
