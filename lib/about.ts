/**
 * Copy for the About page (/[locale]/about).
 *
 * Written for a specific reader: someone — a funder, a journalist, a Google Ad
 * Grants reviewer — who has arrived wanting to know who this organisation is,
 * what it does, and whether it is a real non-profit. Until this page existed
 * the answers were spread across a home-page section, an FAQ answer 35% down
 * that page, and the privacy policy.
 *
 * EVERY FACT HERE IS TAKEN FROM COPY THE COUNCIL HAS ALREADY PUBLISHED:
 *
 * - the legal name, ЕИК and registered address come from lib/legal-content.ts,
 *   where they appear in the privacy policy;
 * - "независима неправителствена организация" is the council's own wording from
 *   the `about` block in lib/home-content.ts (currently rendered inside the FAQ);
 * - the vision line and the shared-mission line are `mission.heading` and
 *   `mission.body` from the same file;
 * - the statute link is the one the FAQ already offers.
 *
 * Two things are deliberately NOT claimed, because nothing in this repository
 * establishes them and a page like this is the wrong place to guess:
 *
 * - whether the сдружение is registered **в обществена полза** or в частна
 *   полза. Ad Grants reviewers look for that phrase, so it is worth adding — but
 *   only by someone who can read it off the registration.
 * - the "6 регионални клона / 12 работни групи" figures in `mission.stats`.
 *   Nothing renders them today and they may be aspirational; the statute link
 *   covers structure instead.
 */

export type Locale = "bg" | "en";

/** The statute, hosted in Notion. Already linked from the FAQ. */
export const STATUTE_URL =
  "https://ivory-sumac-e99.notion.site/39fc7693aa03800c9166cb3150292332";

export const ABOUT_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    /** The one line that has to answer "what is this?" — kept above everything. */
    status: string;
    lead: string;
    missionLabel: string;
    missionHeading: string;
    missionBody: string[];
    doingLabel: string;
    doingHeading: string;
    doingIntro: string;
    governanceLabel: string;
    governanceHeading: string;
    governanceIntro: string;
    boardLabel: string;
    advisoryLabel: string;
    teamLinkLabel: string;
    identityLabel: string;
    identityHeading: string;
    /** Label/value rows: legal name, ЕИК, registered address, contact. */
    identityRows: { label: string; value: string }[];
    statuteIntro: string;
    statuteLabel: string;
    ctaTitle: string;
    ctaBody: string;
    ctaContact: string;
    ctaMember: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "За нас",
    title: "Кои сме ние",
    status:
      "Сдружение „Български дизайн съвет“ е независима неправителствена организация " +
      "с нестопанска цел, създадена от дизайнери за дизайнери.",
    lead: "Изграждаме устойчива и разпознаваема дизайн култура в България.",
    missionLabel: "Мисия",
    missionHeading:
      "България e държава, в която дизайнът е разпознат и утвърден като стратегическа сила " +
      "за иновации, обществено благополучие и устойчиво развитие.",
    missionBody: [
      "Oбединяваме дизайнерите, бизнеса, образованието и институциите в една обща мисия: да създаде България бъдещето си, с умисъл.",
      "Целта ни е да изградим устойчива, свързана и силно конкурентна дизайн екосистема в България.",
    ],
    doingLabel: "Дейност",
    doingHeading: "С какво се занимаваме",
    doingIntro:
      "Работим чрез инициативи — дългосрочни направления, всяко от които събира " +
      "институции, експерти и общности около конкретен проблем.",
    governanceLabel: "Управление",
    governanceHeading: "Кой управлява сдружението",
    governanceIntro:
      "Сдружението се управлява от Управителен съвет, избран от Общото събрание. " +
      "Консултативният съвет подпомага работата с външна експертиза.",
    boardLabel: "Управителен съвет",
    advisoryLabel: "Консултативен съвет",
    teamLinkLabel: "Целият екип",
    identityLabel: "Правен статут",
    identityHeading: "Регистрация и данни",
    identityRows: [
      { label: "Юридическо лице", value: "Сдружение „Български дизайн съвет“" },
      { label: "ЕИК", value: "208377927" },
      {
        label: "Седалище и адрес на управление",
        value: "ул. „Винсент Ван Гог“ № 1, ап. 7, 1407, кв. Лозенец, гр. София, България",
      },
      { label: "Имейл", value: "info@bulgariandesigncouncil.org" },
    ],
    statuteIntro:
      "Подробна информация за целите, структурата и управлението на сдружението — в устава.",
    statuteLabel: "Устав на сдружението",
    ctaTitle: "Да работим заедно",
    ctaBody:
      "Отворени сме за партньорства с институции, бизнес и организации, както и за нови членове.",
    ctaContact: "Свържете се с нас",
    ctaMember: "Стани член ↗",
    metaTitle: "За нас",
    metaDescription:
      "Сдружение „Български дизайн съвет“ е независима неправителствена организация с нестопанска цел, създадена от дизайнери за дизайнери. Мисия, дейност и правен статут.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth. Where the
    // council already has its own English wording — the NGO line, the vision,
    // the shared-mission line — that wording is reused verbatim.
    eyebrow: "About us",
    title: "Who we are",
    status:
      "The Bulgarian Design Council is an independent non-governmental, " +
      "not-for-profit organization, created by designers for designers.",
    lead: "We are building a sustainable and recognizable design culture in Bulgaria.",
    missionLabel: "Mission",
    missionHeading:
      "Bulgaria is a country where design is recognized and established as a strategic force " +
      "for innovation, social wellbeing and sustainable development.",
    missionBody: [
      "We bring designers, business, education and institutions together around one shared mission: for Bulgaria to design its own future, on purpose.",
      "Our goal is to build a sustainable, connected and highly competitive design ecosystem in Bulgaria.",
    ],
    doingLabel: "What we do",
    doingHeading: "Our work",
    doingIntro:
      "We work through initiatives — long-running strands, each gathering institutions, " +
      "experts and communities around one concrete problem.",
    governanceLabel: "Governance",
    governanceHeading: "Who runs the association",
    governanceIntro:
      "The association is run by a Management Board elected by the General Assembly. " +
      "An Advisory Council supports the work with outside expertise.",
    boardLabel: "Management Board",
    advisoryLabel: "Advisory Council",
    teamLinkLabel: "The whole team",
    identityLabel: "Legal status",
    identityHeading: "Registration and details",
    identityRows: [
      { label: "Registered entity", value: "Bulgarian Design Council Association" },
      { label: "Company number (ЕИК)", value: "208377927" },
      {
        label: "Registered address",
        value: "1 Vincent Van Gogh St, apt. 7, 1407, Lozenets, Sofia, Bulgaria",
      },
      { label: "Email", value: "info@bulgariandesigncouncil.org" },
    ],
    statuteIntro:
      "Full detail on the association's aims, structure and governance is in its statute.",
    statuteLabel: "Statute of the association",
    ctaTitle: "Let's work together",
    ctaBody:
      "We are open to partnerships with institutions, business and organisations, and to new members.",
    ctaContact: "Get in touch",
    ctaMember: "Become a member ↗",
    metaTitle: "About us",
    metaDescription:
      "The Bulgarian Design Council is an independent non-governmental, not-for-profit organization created by designers for designers. Mission, work and legal status.",
  },
};
