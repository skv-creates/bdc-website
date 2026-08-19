/**
 * Copy for the About page (/[locale]/about).
 *
 * Transcribed from Figma `500:1894` ("about us") in the Website file — the
 * August rewrite, whose section order is: mission → design capacity →
 * "Как работим" → founding line → photograph → the founders' story → quote.
 * The registration block at the foot is NOT in the frame and is kept on
 * purpose — see below. The hover state of the hero photograph is `518:2577`.
 *
 * Two spellings differ from the frame deliberately:
 *   - "Как раборим" (561:4978) is written here as "Как работим";
 *   - "Съоснавателите" (561:4805) is written here as "Съоснователките" —
 *     the spelling the photograph's alt text already uses.
 * Both look like typos in Figma; if they were intentional, this is the file
 * to change back.
 *
 * ── "в обществена полза" stays out of the intro, on purpose ────────────────
 *
 * The statute, transcribed verbatim in lib/statute-content.ts and published at
 * /[locale]/statute, says "в частна полза" twice:
 *
 *   Чл. 1. (1) … за осъществяване на дейност в частна полза
 *   Чл. 6.     Сдружението ще осъществява дейност в частна полза.
 *
 * "Независимо сдружение с нестопанска цел" is true under either registration,
 * so the sentence stays correct if the council later converts — and the
 * statute remains the one place that states which kind it is.
 *
 * The registration block is carried over from the previous version of this
 * page deliberately: Google refused the Ad Grants activation partly for
 * having nowhere prominent stating the non-profit status, and dropping it
 * would undo that. Its facts come from the privacy policy and the statute.
 */

export type Locale = "bg" | "en";

/** The statute, now a page on this site rather than a Notion share link. */
export const STATUTE_PATH = "/statute";

export type AboutCopy = {
  eyebrow: string;
  /** 80px display headline. Wraps on its own measure; do not hard-break it. */
  headline: string;
  /** 24px bold line under the headline (body-medium Bold in the frame). */
  lead: string;
  /** The two columns beneath the lead. */
  intro: [string, string];

  capacity: {
    label: string;
    heading: string;
    /**
     * The two-column plain-language definition between the heading and the
     * marks — new in the August frame (561:4848/561:4852), and there so a
     * reader meets "дизайн капацитет" already explained.
     */
    intro: [string, string];
    /** The seven marks of design capacity. */
    items: string[];
  };

  how: {
    label: string;
    heading: string;
    lead: string;
    /**
     * The three dimensions (574:5662/5433/5498): each pairs its statement
     * with accordion cards naming the council's actual activity areas —
     * `link` rows become tertiary "Прочети → " links into programme pages.
     */
    groups: {
      title: string;
      body: string;
      items: { title: string; body: string; link?: { label: string; href: string } }[];
    }[];
    /** The closing block (574:5897) — the regional network, with the CTAs. */
    closing: { label: string; heading: string; body: string };
  };

  governance: {
    label: string;
    /** Two lines, drawn as two <p>s in the frame (574:5778). */
    headingLines: [string, string];
    paragraphs: string[];
    statuteLabel: string;
    managementLabel: string;
    eik: string;
  };

  team: {
    label: string;
    heading: string;
    subtitle: string;
    /** `homeName` keys the photo lookup into home-content's board members. */
    members: { name: string; role: string; homeName: string }[];
  };

  buildWithUs: {
    heading: string;
    paragraphs: string[];
    partnerLabel: string;
    volunteerLabel: string;
    credit: [string, string];
  };

  founding: {
    label: string;
    heading: string;
  };

  /**
   * One alt for both photographs. They are the same three people in the same
   * place, a moment apart; describing the second separately would have a
   * screen reader read the picture twice for a purely visual flourish.
   */
  photoAlt: string;
  /**
   * The caption under the photograph (561:4805): plain segments and bold
   * name segments, rendered in order.
   */
  photoCaption: { text: string; bold?: boolean }[];

  /** The founders' narrative. Ends on the founding date and the purpose. */
  story: string[];

  quote: { text: string; author: string };

  identityLabel: string;
  identityHeading: string;
  identityRows: { label: string; value: string }[];
  statuteIntro: string;
  statuteLabel: string;

  metaTitle: string;
  metaDescription: string;
};

export const ABOUT_COPY: Record<Locale, AboutCopy> = {
  bg: {
    eyebrow: "За нас",
    headline: "Една държава се проектира всеки ден",
    lead:
      "Изграждаме и развиваме способността на България да използва дизайна там, " +
      "където се взимат решения за бъдещето ни.",
    intro: [
      "Български дизайн съвет е независимо сдружение с нестопанска цел. Заедно " +
        "укрепваме националния дизайн капацитет и утвърждаваме дизайна като " +
        "стратегическа сила за икономическо, обществено, културно и екологично " +
        "развитие.",
      "Провеждаме изследвания, създаваме програми и обединяваме хора, организации " +
        "и институции около предизвикателства, които никой сектор не може да реши сам.",
    ],

    capacity: {
      label: "Как изграждаме национален дизайн капацитет?",
      heading: "Капацитет има, когато добрата работа може да се повтори.",
      intro: [
        "Дизайн капацитетът е способността да използваме дизайна системно за " +
          "по-добри решения, услуги, политики и системи.",
        "Хората развиват уменията. Организациите и институциите изграждат " +
          "капацитета да ги прилагат системно.",
      ],
      items: [
        "Институциите създават политики и услуги около потребностите на народа",
        "Бизнесът включва дизайна в стратегията",
        "Образованието развива творческо, критично и системно мислене",
        "Професията стъпва върху общи стандарти, знание и силно представителство",
        "Хората участват в решенията, които оформят живота им",
        "Българската дизайн памет се съхранява и развива",
        "Успехът се измерва чрез въздействието върху хората, обществото и природата.",
      ],
    },

    how: {
      label: "Как работим",
      heading: "От познание към промяна.",
      lead:
        "Работим така, че капацитетът да остане след нас. Изграждаме условията " +
        "дизайнът да има реално въздействие чрез три взаимосвързани измерения. " +
        "Познание. Способност. Промяна.",
      groups: [
        {
          title: "Познанието,\nвърху което стъпваме",
          body:
            "Правим видими стойността, пропуските и потенциала на дизайна в " +
            "България. Превръщаме данни, опит, практики и доказателства за " +
            "въздействие в национална дизайн интелигентност.",
          items: [
            {
              title: "Изследвания и дизайн интелигентност",
              body:
                "Изследваме и документираме историята, състоянието и въздействието " +
                "на дизайна в България. Картографираме дизайн екосистемата, " +
                "съхраняваме нейната памет и създаваме доказателствена основа за " +
                "бъдещото ѝ развитие.",
            },
            {
              title: "История на българския дизайн",
              body:
                "Изследваме, документираме и свързваме хората, практиките и идеите, " +
                "които изграждат историята на българския дизайн.",
            },
          ],
        },
        {
          title: "Способността,\nкоято изграждаме",
          body:
            "Чрез програми и пилотни инициативи развиваме у хората способността да " +
            "разбират сложността, а в институциите — устойчив капацитет да използват " +
            "силата на стратегическия дизайн самостоятелно.",
          items: [
            {
              title: "Публичен сектор",
              body:
                "Подкрепяме публичните институции да използват дизайна при " +
                "създаването на политики, услуги и взаимодействия с гражданите. Чрез " +
                "Лабораторията за политики свързваме администрация, изследвания и " +
                "професионална експертиза около сложни предизвикателства, преди " +
                "институциите да се обвържат с конкретно решение.",
              link: { label: "Прочети за Лабораторията за политики", href: "/initiatives/policy-lab" },
            },
            {
              title: "Дизайн зрялост",
              body:
                "Национална инициатива за оценка, развитие и повишаване на дизайн " +
                "зрелостта на българския бизнес. Развиваме способността на българския " +
                "бизнес да използва дизайна като стратегически ресурс за по-добри " +
                "решения, иновации, конкурентоспособност и устойчив растеж.",
              link: { label: "Прочети повече за Бизнес дизайн зрялост", href: "/initiatives/design-maturity-assessment" },
            },
            {
              title: "Създатели на бъдещето",
              body:
                "Жива, модулна образователна система, превръщаща библиотека от дизайн " +
                "знания и практики в гъвкави лаборатории. Модулният ѝ модел позволява " +
                "да достига до училища, университети и младежки програми в цялата " +
                "страна. Мисията ни е да поставим силата на дизайна в ръцете на " +
                "поколението, което създава нашето утре.",
              link: { label: "Прочети за Създатели на бъдещето", href: "/initiatives/future-makers-lab" },
            },
            {
              title: "Образование отвътре навън",
              body:
                "Работим с училища, университети и други образователни институции, за " +
                "да могат сами да преобразяват своите системи, среди, услуги и " +
                "преживявания чрез дизайн.",
            },
          ],
        },
        {
          title: "Промяната,\nкоято създаваме",
          body:
            "Превръщаме знанието и капацитета в обществена, културна, икономическа и " +
            "екологична стойност. Трансформираме България заедно чрез дизайн.",
          items: [
            {
              title: "България чрез дизайн",
              body:
                "Държавата говори чрез всичко, което създава. Развиваме начина, по " +
                "който България изразява своята идентичност, ценности и увереност, " +
                "защото красивият и достоен облик на институциите, които работят за " +
                "нас, променя и начина, по който се възприемаме като нация.",
              link: { label: "Прочети повече за България чрез дизайн", href: "/initiatives/bulgaria-by-design" },
            },
            {
              title: "Обществени инициативи",
              body:
                "Създаваме възможности дизайнът да бъде прилаган по теми с обществено " +
                "значение заедно с хората и общностите, които те засягат. Работим с " +
                "граждански организации, общности и партньори по реални обществени " +
                "предизвикателства. Използваме дизайна, за да създаваме промяна с " +
                "хората, които тя засяга.",
            },
          ],
        },
      ],
      closing: {
        label: "Регионални представители",
        heading: "Национална мрежа. Местно знание.",
        body:
          "Дизайн екосистемата на България не се събира в един град. Изграждаме " +
          "мрежа от до 28 регионални представители, които свързват местните нужди, " +
          "идеи, инициативи и добри практики с националната работа на Съвета.",
      },
    },

    governance: {
      label: "Управление и отчетност",
      headingLines: ["Независими по форма.", "Отговорни по избор."],
      paragraphs: [
        "Сдружението има неправителствен, неполитически и нерелигиозен характер и " +
          "не разпределя печалба. Имуществото му се използва за постигане на " +
          "целите, определени в устава.",
        "Органите на съвета са Общото събрание, Управителният съвет и " +
          "Учредителният съвет.",
        "Подробна информация за целите, структурата и управлението на " +
          "сдружението ще намерите в устава.",
      ],
      statuteLabel: "Устав",
      managementLabel: "Управление",
      eik: "ЕИК 208377927",
    },

    team: {
      label: "Екипът зад кадър",
      heading: "Управителен съвет",
      subtitle: "Независимият ум, зад националната мисия",
      members: [
        { name: "Добра Славкова", role: "Председател", homeName: "Добра Славкова" },
        { name: "Стефи Пейкова Кришнан", role: "Заместник-председател", homeName: "Стефи Пейкова Кришнан" },
        { name: "Радина Донева", role: "Секретар", homeName: "Радина Донева" },
        { name: "Зинаида Илер", role: "Член на Управителния съвет", homeName: "Зинаида Илер" },
        { name: "Стефан Владимиров", role: "Член на Управителния съвет", homeName: "Стефан Владимиров" },
      ],
    },

    buildWithUs: {
      heading: "Да създадем заедно с(ъ)вета",
      paragraphs: [
        "Идеите намират почва, когато хората се съберат около тях.",
        "Ако разпознаваш своето място в нашата посока, можеш да участваш със " +
          "знание, време, професионален опит, партньорство или подкрепа.",
      ],
      partnerLabel: "Партнирай с нас",
      volunteerLabel: "Стани доброволец",
      credit: ["С ❤️ от екипа на", "Управителния съвет"],
    },

    founding: {
      label: "Учредяване на съвета",
      heading: "Понякога една и съща идея се появява у различни хора, на различни места.",
    },

    photoAlt:
      "Радина Донева, Добра Славкова и Стефи Пейкова Кришнан, съоснователките на " +
      "Български дизайн съвет",
    photoCaption: [
      // The \n is the frame's own break (561:4805): the names sit on their own line.
      { text: "Съоснователките на БДС (от ляво на дясно)\n" },
      { text: "Радина Донева", bold: true },
      { text: ", " },
      { text: "Добра Славкова", bold: true },
      { text: " и " },
      { text: "Стефка Пейкова Кришнан", bold: true },
      { text: " (Стефи)" },
    ],

    story: [
      "Радина, Добра и Стефи работят в различни държави и " +
        "контексти, но разпознават един и същ парадокс. Обществото е изправено пред " +
        "все по-свързани и сложни предизвикателства, а способността на дизайна да ги " +
        "изследва, свързва и преобразява остава недостатъчно използвана.",
      "Дизайнерите отдавна говорим за това. Но говоренето само по себе си не променя " +
        "системите.",
      "Наречете го щастливо стечение на обстоятелствата, синхроничност или просто " +
        "точния момент. Трите се срещат, разпознават една и съща мечта и общата си " +
        "отговорност към нея.",
      "На 25 юни 2025 г. трите учредяват Български дизайн съвет. Български дизайн " +
        "съвет е замислен като споделена инфраструктура за хората, които вярват, че " +
        "дизайнът може да има по-съществена роля в бъдещето на България и са готови " +
        "да участват в създаването му.",
    ],

    quote: {
      text: "България не се нуждае от спасител. Тя носи в себе си следващия си Златен век.",
      author: "— Стефи Пейкова Кришнан",
    },

    identityLabel: "Правен статут",
    identityHeading: "Регистрация и данни",
    identityRows: [
      { label: "Юридическо лице", value: "Сдружение „Български дизайн съвет“" },
      { label: "ЕИК", value: "208377927" },
      {
        label: "Седалище и адрес на управление",
        value: "ул. Винсент ван Гог 1, ап. 7, 1407, кв. Лозенец, гр. София, България",
      },
      { label: "Имейл", value: "info@bulgariandesigncouncil.org" },
    ],
    statuteIntro:
      "Подробна информация за целите, структурата и управлението на сдружението — в устава.",
    statuteLabel: "Устав на сдружението",

    metaTitle: "За нас",
    metaDescription:
      "Български дизайн съвет е независимо сдружение с нестопанска цел, учредено " +
      "през 2025 г. Провеждаме изследвания, създаваме програми и изграждаме " +
      "националния дизайн капацитет на България.",
  },

  en: {
    // ⚠️ Draft translation of the Bulgarian, which is the source of truth.
    // Needs a read by someone who writes the council's English before this
    // page is published — the same caveat the FAQ carries.
    eyebrow: "About us",
    headline: "A country is designed every day",
    lead:
      "We are building and growing Bulgaria's capacity to use design where the " +
      "decisions about our future are made.",
    intro: [
      "The Bulgarian Design Council is an independent non-profit association. " +
        "Together we strengthen the national design capacity and establish design " +
        "as a strategic force for economic, social, cultural and environmental " +
        "development.",
      "We conduct research, create programmes and bring together people, " +
        "organisations and institutions around challenges no sector can solve alone.",
    ],

    capacity: {
      label: "How do we build national design capacity?",
      heading: "There is capacity when good work can be repeated.",
      intro: [
        "Design capacity is the ability to use design systematically for better " +
          "decisions, services, policies and systems.",
        "People develop the skills. Organisations and institutions build the " +
          "capacity to apply them systematically.",
      ],
      items: [
        "Institutions create policies and services around people's needs",
        "Business brings design into strategy",
        "Education develops creative, critical and systemic thinking",
        "The profession rests on shared standards, knowledge and strong representation",
        "People take part in the decisions that shape their lives",
        "Bulgaria's design memory is kept and developed",
        "Success is measured by the effect on people, society and nature.",
      ],
    },

    how: {
      label: "How we work",
      heading: "From knowledge to change.",
      lead:
        "We work so that the capacity remains after us. We build the conditions " +
        "for design to have real impact through three interconnected dimensions. " +
        "Knowledge. Capability. Change.",
      groups: [
        {
          title: "The knowledge\nwe stand on",
          body:
            "We make the value, the gaps and the potential of design in Bulgaria " +
            "visible. We turn data, experience, practice and evidence of impact " +
            "into national design intelligence.",
          items: [
            {
              title: "Research and design intelligence",
              body:
                "We research and document the history, state and impact of design in " +
                "Bulgaria. We map the design ecosystem, keep its memory, and build " +
                "the evidence base for its future development.",
            },
            {
              title: "History of Bulgarian design",
              body:
                "We research, document and connect the people, practices and ideas " +
                "that make up the history of Bulgarian design.",
            },
          ],
        },
        {
          title: "The capability\nwe build",
          body:
            "Through programmes and pilot initiatives we develop in people the " +
            "ability to understand complexity, and in institutions a lasting " +
            "capacity to use the power of strategic design on their own.",
          items: [
            {
              title: "Public sector",
              body:
                "We support public institutions in using design when creating " +
                "policies, services and interactions with citizens. Through the " +
                "Policy Lab we bring together administration, research and " +
                "professional expertise around complex challenges, before " +
                "institutions commit to a particular solution.",
              link: { label: "Read about the Policy Lab", href: "/initiatives/policy-lab" },
            },
            {
              title: "Design maturity",
              body:
                "A national initiative for assessing, developing and raising the " +
                "design maturity of Bulgarian business — building its ability to use " +
                "design as a strategic resource for better decisions, innovation, " +
                "competitiveness and sustainable growth.",
              link: { label: "Read more about Business design maturity", href: "/initiatives/design-maturity-assessment" },
            },
            {
              title: "Future makers",
              body:
                "A living, modular educational system that turns a library of design " +
                "knowledge and practice into flexible labs, reaching schools, " +
                "universities and youth programmes across the country. Our mission " +
                "is to put the power of design in the hands of the generation " +
                "creating our tomorrow.",
              link: { label: "Read about Future makers", href: "/initiatives/future-makers-lab" },
            },
            {
              title: "Education from the inside out",
              body:
                "We work with schools, universities and other educational " +
                "institutions so they can transform their own systems, environments, " +
                "services and experiences through design.",
            },
          ],
        },
        {
          title: "The change\nwe create",
          body:
            "We turn knowledge and capability into social, cultural, economic and " +
            "environmental value. Together we transform Bulgaria through design.",
          items: [
            {
              title: "Bulgaria by Design",
              body:
                "The state speaks through everything it creates. We develop the way " +
                "Bulgaria expresses its identity, values and confidence — because a " +
                "beautiful, dignified face on the institutions that work for us also " +
                "changes how we see ourselves as a nation.",
              link: { label: "Read more about Bulgaria by Design", href: "/initiatives/bulgaria-by-design" },
            },
            {
              title: "Public initiatives",
              body:
                "We create opportunities for design to be applied to matters of " +
                "public importance, together with the people and communities they " +
                "affect. We work with civil organisations, communities and partners " +
                "on real public challenges — using design to create change with the " +
                "people it concerns.",
            },
          ],
        },
      ],
      closing: {
        label: "Regional representatives",
        heading: "A national network. Local knowledge.",
        body:
          "Bulgaria's design ecosystem does not fit in one city. We are building a " +
          "network of up to 28 regional representatives connecting local needs, " +
          "ideas, initiatives and good practice with the council's national work.",
      },
    },

    governance: {
      label: "Governance and accountability",
      headingLines: ["Independent by form.", "Accountable by choice."],
      paragraphs: [
        "The association is non-governmental, non-political and non-religious, and " +
          "distributes no profit. Its assets are used to pursue the aims set out in " +
          "its statute.",
        "The council's bodies are the General Assembly, the Management Board and " +
          "the Founders' Council.",
        "You will find full detail on the association's aims, structure and " +
          "governance in its statute.",
      ],
      statuteLabel: "Statute",
      managementLabel: "Governance",
      eik: "UIC 208377927",
    },

    team: {
      label: "The team behind the scenes",
      heading: "The Management Board",
      subtitle: "The independent mind behind the national mission",
      members: [
        { name: "Dobra Slavkova", role: "Chair", homeName: "Добра Славкова" },
        { name: "Stefi Peykova Krishnan", role: "Deputy Chair", homeName: "Стефи Пейкова Кришнан" },
        { name: "Radina Doneva", role: "Secretary", homeName: "Радина Донева" },
        { name: "Zinaida Iller", role: "Board member", homeName: "Зинаида Илер" },
        { name: "Stefan Vladimirov", role: "Board member", homeName: "Стефан Владимиров" },
      ],
    },

    buildWithUs: {
      heading: "Let's create the council together",
      paragraphs: [
        "Ideas take root when people gather around them.",
        "If you recognise your place in our direction, you can take part with " +
          "knowledge, time, professional experience, partnership or support.",
      ],
      partnerLabel: "Partner with us",
      volunteerLabel: "Become a volunteer",
      credit: ["With ❤️ from", "the Management Board"],
    },

    founding: {
      label: "Founding of the council",
      heading: "Sometimes the same idea appears in different people, in different places.",
    },

    photoAlt:
      "Radina Doneva, Dobra Slavkova and Stefi Peykova Krishnan, the co-founders of " +
      "the Bulgarian Design Council",
    photoCaption: [
      { text: "The co-founders of the BDC (left to right)\n" },
      { text: "Radina Doneva", bold: true },
      { text: ", " },
      { text: "Dobra Slavkova", bold: true },
      { text: " and " },
      { text: "Stefka Peykova Krishnan", bold: true },
      { text: " (Stefi)" },
    ],

    story: [
      "Radina, Dobra and Stefi work in different countries and " +
        "contexts, and recognise the same paradox. Society faces ever more connected " +
        "and complex challenges, while design's ability to investigate, connect and " +
        "transform them remains under-used.",
      "Designers have been saying this for a long time. But saying it does not change " +
        "systems.",
      "Call it a happy coincidence, synchronicity, or simply the right moment. The " +
        "three meet, recognise the same dream and their shared responsibility to it.",
      "On 25 June 2025 the three founded the Bulgarian Design Council. It is " +
        "conceived as shared infrastructure for the people who believe design can " +
        "play a more substantial role in Bulgaria's future and are ready to take " +
        "part in creating it.",
    ],

    quote: {
      text: "Bulgaria does not need a saviour. It carries its next Golden Age within itself.",
      author: "— Stefi Peykova Krishnan",
    },

    identityLabel: "Legal status",
    identityHeading: "Registration and details",
    identityRows: [
      { label: "Registered entity", value: "Bulgarian Design Council Association" },
      { label: "UIC", value: "208377927" },
      {
        label: "Registered address",
        value: "1 Vincent van Gogh St, apt. 7, 1407, Lozenets, Sofia, Bulgaria",
      },
      { label: "Email", value: "info@bulgariandesigncouncil.org" },
    ],
    statuteIntro:
      "Full detail on the association's aims, structure and governance is in its statute.",
    statuteLabel: "Statute of the association",

    metaTitle: "About us",
    metaDescription:
      "The Bulgarian Design Council is an independent non-profit association founded " +
      "in 2025. We conduct research, create programmes and build Bulgaria's national " +
      "design capacity.",
  },
};
