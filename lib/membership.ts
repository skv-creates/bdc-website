/**
 * Copy for the membership page (/[locale]/membership), per Figma 636:3607.
 *
 * The frame's own text, with its drafting glitches repaired: the duplicated
 * time sentence in the CTA block, "физическо лица", "Бългаски", and the
 * confidentiality answer's link to Notion — which points at the statute
 * page here, the only official source this page is allowed to lead to.
 * Link hrefs are site paths without a locale; the page prefixes them.
 *
 * The application itself runs full-screen at /membership/apply — both
 * primary buttons lead there.
 */
import type { FaqBlock } from "@/lib/home-content";

export type Locale = "bg" | "en";

type Copy = {
  eyebrow: string;
  timeNote: string;
  /** On the apply page's eyebrow row: back to the membership explainer. */
  aboutLabel: string;
  /** The privacy policy link beside it — opens a new tab over the form. */
  privacyLabel: string;
  title: string;
  ledeBold: string;
  ledeBody: string;
  applyCta: string;
  kinds: { heading: string; options: { title: string; paras: string[] }[] };
  people: { heading: string; paras: string[] };
  duties: {
    heading: string;
    body: string;
    statuteLabel: string;
    faq: { q: string; a: FaqBlock[] }[];
  };
  ready: {
    heading: string;
    /** Rendered highlighted in amber, as the volunteer page draws it. */
    bodyHighlight: string;
    body: string;
  };
  questions: { heading: string; faq: { q: string; a: FaqBlock[] }[] };
  photoAlt: string;
  formTitle: string;
  /** The council's own success screen at /membership/thanks. */
  thanks: {
    metaTitle: string;
    title: string;
    body: string;
    /** The помощ line; the email itself comes from footer.email. */
    help: string;
    backLabel: string;
  };
  metaTitle: string;
  metaDescription: string;
};

export const MEMBERSHIP_COPY: Record<Locale, Copy> = {
  bg: {
    eyebrow: "Членство в Български дизайн съвет",
    timeNote: "Попълването отнема 3–5 минути.",
    aboutLabel: "Научете повече за членството",
    privacyLabel: "Политика за поверителност",
    title: "Дизайнът има нужда от общ глас.",
    ledeBold:
      "Един дизайнер може да промени проект. Една организация може да промени практика. Заедно можем да променим средата, в която дизайнът се развива в България.",
    ledeBody:
      "Членството Ви дава формална роля в посоката, която поемаме. Участвате в изграждането на общи позиции и получавате достъп до знанието, което събираме.",
    applyCta: "Членувай",
    kinds: {
      heading: "Два вида членство",
      options: [
        {
          title: "Пълноправно",
          paras: [
            "Участвате в Общото събрание с право на глас, избирате и можете да бъдете избирани в управлението на БДС.",
            "Участвате в официалните позиции на Съвета, получавате достъп до събраната информация и посещавате безплатно обученията, семинарите и конференциите, които организираме.",
          ],
        },
        {
          title: "Асоциирано",
          paras: [
            "Участвате в официалните позиции на БДС и получавате достъп до събраната от Съвета информация.",
            "Можете да участвате в Общото събрание със съвещателен глас, но нямате право да гласувате или да бъдете избирани в управлението.",
          ],
        },
      ],
    },
    people: {
      heading: "За хора и организации",
      paras: [
        "Можете да кандидатствате от свое име, като физическо лице, и да участвате лично.",
        "Организации и други юридически лица могат да членуват чрез свой законен или упълномощен представител, ако поне един човек от екипа им работи професионално в областта на дизайна.",
      ],
    },
    duties: {
      heading: "Членството носи и отговорност",
      body: "Като член приемате и се съгласявате да спазвате Устава ни, подкрепяте целите на Съвета и изпълнявате ангажиментите, които поемате.",
      statuteLabel: "Прочетете Устава ни",
      faq: [
        {
          q: "Какви са задълженията на пълноправните ни членове?",
          a: [
            { p: "Всеки пълноправен член на Сдружението е длъжен:" },
            {
              ol: [
                "Да спазва Устава на Сдружението, вътрешните актове и закона;",
                "Да участва активно в работата на Сдружението и помага за успешното изпълнение на целите му;",
                "Да изпълнява възложените му задължения по установения ред;",
                "Да позволява имената и адресът му да се публикуват в официално издаваните списъци на Сдружението;",
                "Да заплаща членски внос, доколкото такъв е предвиден съгласно решение на Общото събрание.",
              ],
            },
          ],
        },
        {
          q: "Какви са задълженията на асоциираните ни членове?",
          a: [
            { p: "Всеки асоцииран член на Сдружението е длъжен:" },
            {
              ol: [
                "Да спазва Устава на Сдружението, вътрешните актове и закона;",
                "Да помага за успешното изпълнение на целите на Сдружението;",
                "Да изпълнява възложените му задължения по установения ред;",
                "Да позволява имената и адресът му да се публикуват в официално издаваните списъци на Сдружението;",
                "Да заплаща членски внос, доколкото такъв е предвиден съгласно решение на Общото събрание.",
              ],
            },
          ],
        },
        {
          q: "Какво означава задължението за конфиденциалност?",
          a: [
            {
              p: "Като член може да получите достъп до непублична информация за работата, проектите, партньорите и членовете на БДС. Тя се използва само за дейността на Съвета и не се споделя с трети лица без писмено съгласие на Управителния съвет.",
            },
            {
              p: "Задължението важи по време на членството и пет години след неговото прекратяване. Подробностите са в чл. 40 от Устава на БДС.",
            },
            { link: { label: "Устав на БДС", href: "/statute" } },
          ],
        },
      ],
    },
    ready: {
      heading: "Готов си да кандидатстваш?",
      bodyHighlight: "Попълването отнема около 3–5 минути.",
      body: "Формата е на български. Не е необходимо да си дизайнер, за да членуваш.",
    },
    questions: {
      heading: "Въпроси? Отговори.",
      faq: [
        {
          q: "Какви са целите на Българския дизайн съвет?",
          a: [
            {
              ol: [
                "Създаване на обществена осведоменост относно качествения дизайн и неговата ефективност: използване на дизайна като стратегически инструмент за бизнес високи постижения и като ключов фактор за иновации, за подобряване на качеството на живот на хората;",
                "Предоставяне на платформа за взаимодействие между членове на дизайнерската екосистема — дизайнери, образователни институции, бизнес среди, държавни органи и неправителствени организации, с цел насърчаване на иновации и обмен на добри практики;",
                "Популяризиране на дизайна като начин за справяне със социални предизвикателства и насърчаване прилагането на дизайнерско мислене, мултидисциплинарност и сътрудничество като инструменти за постигане на устойчиво развитие на обществото — икономически, социално и екологично;",
                "Подпомагане и развитие на професионалното образование в областта на дизайна с най-съвременни методи и разширяване на обхвата на потребителите на образователния продукт в областта на дизайна от деца до възрастни;",
                "Обучение на бъдещи и настоящи млади и/или начинаещи дизайнери и професионалисти от други сфери за прилагане на добри и утвърдени практики в областта на дизайна;",
                "Привличане и обединяване на усилията на сродни международни сдружения за осъществяване на общи проекти, събития и културни каузи.",
              ],
            },
          ],
        },
        {
          q: "Как постигаме тези цели?",
          a: [
            {
              ol: [
                "Организиране на семинари, срещи, курсове, конференции, работилници, обучения, изложби и други събития, чрез които участниците получават по-задълбочено разбиране за потенциала на дизайнерските методики и подходи като инструмент за иновации;",
                "Провеждане на събития, които информират и събират компании, дизайнери, крайни потребители и политици, както и участие в и иницииране на сътрудничество и стратегически партньорства с други дизайнерски организации и образователни институции;",
                "Предлагане на консултантски и съветнически услуги, подготовка на семинари и лекции по различни въпроси на дизайна в България, сътрудничество с чуждестранни институции и професионалисти;",
                "Акредитация — признаване, възнаграждаване и популяризиране стойността на дизайна за принос към положителното развитие на местно, национално и международно ниво чрез награди за Добър Дизайн;",
                "Създаване на партньорства с международни дизайн организации (например Световната Дизайн Организация (WDO) и други съвети по света) и участие в глобални дизайн събития и инициативи;",
                "Организиране на ко-дизайн работилници с правителствени и неправителствени организации по реални проблеми и програми за учене чрез правене и приобщаване на малцинства и хора с различни възможности.",
              ],
            },
          ],
        },
        {
          q: "Създатели на бъдещето",
          a: [
            {
              p: "Жива, модулна образователна система, превръщаща библиотека от дизайн знания и практики в гъвкави лаборатории. Модулният ѝ модел позволява да достига до училища, университети и младежки програми в цялата страна. Мисията ни е да поставим силата на дизайна в ръцете на поколението, което създава нашето утре.",
            },
            {
              link: {
                label: "Прочети за Създатели на бъдещето",
                href: "/initiatives/future-makers-lab",
              },
            },
          ],
        },
        {
          q: "Органи на Български дизайн съвет",
          a: [
            { p: "Върховен орган на Сдружението е Общото събрание." },
            { p: "Управителен орган на Сдружението е Управителният съвет." },
            {
              p: "В Общото събрание участват всички пълноправни членове на Сдружението. Асоциираните членове могат да участват в Общото събрание по тяхно желание със съвещателен глас.",
            },
            {
              p: "Управителният съвет се състои от не по-малко от 3 (три) и не повече от 7 (седем) лица, които трябва да бъдат членове на Сдружението.",
            },
            {
              p: "Членовете на Управителния съвет се избират от Общото събрание с мандат за срок от 5 (пет) години и са длъжни да участват активно в неговата работа.",
            },
            { h: "Компетентност" },
            { p: "Управителният съвет:" },
            {
              ol: [
                "Приема членове на Сдружението;",
                "Приема основните насоки и програма за дейността на Сдружението;",
                "Осигурява изпълнението на решенията на Общото събрание;",
                "Разпорежда се с имуществото на Сдружението при спазване изискванията на устава и ЗЮЛНЦ;",
                "Взема решение за сключване на договори и/или поемане на задължения от Сдружението на стойност над 1 000 евро;",
                "Подготвя и внася в Общото събрание проект за бюджет;",
                "Подготвя и внася в Общото събрание годишен финансов отчет и отчет за дейността на Сдружението;",
                "Определя реда и организира извършването на дейността на Сдружението и носи отговорност за това;",
                "Констатира отпадане на членове поради невнасяне на членски внос и поради други причини, извън изключването на член;",
                "Решава други въпроси, които са му възложени от Общото събрание, както и всички въпроси, които по закон или съгласно този Устав не са от компетентността на друг орган.",
              ],
            },
          ],
        },
      ],
    },
    photoAlt: "Членове на Български дизайн съвет работят заедно",
    formTitle: "Заявление за членство в БДС",
    thanks: {
      metaTitle: "Благодарим — Български Дизайн Съвет",
      title: "Благодарим за заявеното членство",
      body: "Управителният съвет ще разгледа заявлението Ви за членство и ще се свържем с Вас на посочения имейл.",
      help: "При нужда от съдействие или възникнали въпроси ни пишете на",
      backLabel: "Разгледайте инициативите ни",
    },
    metaTitle: "Членство — Български Дизайн Съвет",
    metaDescription:
      "Дизайнът има нужда от общ глас. Пълноправно и асоциирано членство в Български дизайн съвет — за хора и организации. Кандидатствайте онлайн.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Membership in the Bulgarian Design Council",
    timeNote: "Filling it in takes 3–5 minutes.",
    aboutLabel: "Learn more about membership",
    privacyLabel: "Privacy Policy",
    title: "Design needs a common voice.",
    ledeBold:
      "One designer can change a project. One organisation can change a practice. Together we can change the environment design develops in across Bulgaria.",
    ledeBody:
      "Membership gives you a formal role in the direction we take. You take part in building common positions and gain access to the knowledge we gather.",
    applyCta: "Become a member",
    kinds: {
      heading: "Two kinds of membership",
      options: [
        {
          title: "Full",
          paras: [
            "You take part in the General Assembly with the right to vote, elect, and can be elected to the governance of the BDC.",
            "You take part in the Council's official positions, gain access to the gathered knowledge, and attend free of charge the trainings, seminars and conferences we organise.",
          ],
        },
        {
          title: "Associate",
          paras: [
            "You take part in the BDC's official positions and gain access to the information the Council gathers.",
            "You can attend the General Assembly in an advisory capacity, but cannot vote or be elected to the governing bodies.",
          ],
        },
      ],
    },
    people: {
      heading: "For people and organisations",
      paras: [
        "You can apply in your own name, as an individual, and take part personally.",
        "Organisations and other legal entities can hold membership through their legal or authorised representative, if at least one person on their team works professionally in the field of design.",
      ],
    },
    duties: {
      heading: "Membership also carries responsibility",
      body: "As a member you accept and agree to observe our Statute, support the Council's aims, and carry out the commitments you take on.",
      statuteLabel: "Read our Statute",
      faq: [
        {
          q: "What are the obligations of our full members?",
          a: [
            { p: "Every full member of the Association is obliged:" },
            {
              ol: [
                "To observe the Statute of the Association, its internal acts and the law;",
                "To take active part in the work of the Association and help the successful achievement of its aims;",
                "To carry out the duties assigned to them by the established order;",
                "To allow their name and address to be published in the officially issued lists of the Association;",
                "To pay a membership fee, insofar as one is provided for by decision of the General Assembly.",
              ],
            },
          ],
        },
        {
          q: "What are the obligations of our associate members?",
          a: [
            { p: "Every associate member of the Association is obliged:" },
            {
              ol: [
                "To observe the Statute of the Association, its internal acts and the law;",
                "To help the successful achievement of the Association's aims;",
                "To carry out the duties assigned to them by the established order;",
                "To allow their name and address to be published in the officially issued lists of the Association;",
                "To pay a membership fee, insofar as one is provided for by decision of the General Assembly.",
              ],
            },
          ],
        },
        {
          q: "What does the confidentiality obligation mean?",
          a: [
            {
              p: "As a member you may gain access to non-public information about the work, projects, partners and members of the BDC. It is used only for the Council's activities and is not shared with third parties without the written consent of the Management Board.",
            },
            {
              p: "The obligation applies during membership and for five years after it ends. The details are in Art. 40 of the Statute of the BDC.",
            },
            { link: { label: "Statute of the BDC", href: "/statute" } },
          ],
        },
      ],
    },
    ready: {
      heading: "Ready to apply?",
      bodyHighlight: "Filling in the form takes about 3–5 minutes.",
      body: "The form is in Bulgarian. You do not need to be a designer to become a member.",
    },
    questions: {
      heading: "Questions? Answers.",
      faq: [
        {
          q: "What are the aims of the Bulgarian Design Council?",
          a: [
            {
              ol: [
                "Building public awareness of good design and its effectiveness: using design as a strategic instrument for business excellence and as a key factor for innovation and for improving people's quality of life;",
                "Providing a platform for interaction between members of the design ecosystem — designers, educational institutions, business, state bodies and non-governmental organisations — to encourage innovation and the exchange of good practices;",
                "Promoting design as a way of addressing social challenges, and encouraging the application of design thinking, multidisciplinarity and collaboration as instruments for the sustainable development of society — economically, socially and environmentally;",
                "Supporting and developing professional design education with the most modern methods, and widening the reach of design education from children to adults;",
                "Training future and current young and/or early-career designers and professionals from other fields in good, established design practices;",
                "Attracting and joining forces with kindred international associations for common projects, events and cultural causes.",
              ],
            },
          ],
        },
        {
          q: "How do we achieve these aims?",
          a: [
            {
              ol: [
                "Organising seminars, meetings, courses, conferences, workshops, trainings, exhibitions and other events through which participants gain a deeper understanding of the potential of design methods and approaches as an instrument for innovation;",
                "Holding events that inform and bring together companies, designers, end users and policymakers, and taking part in and initiating collaboration and strategic partnerships with other design organisations and educational institutions;",
                "Offering consultancy and advisory services, preparing seminars and lectures on questions of design in Bulgaria, and collaborating with foreign institutions and professionals;",
                "Accreditation — recognising, rewarding and promoting the value of design's contribution to positive development locally, nationally and internationally through Good Design awards;",
                "Building partnerships with international design organisations (for example the World Design Organization (WDO) and other councils around the world) and taking part in global design events and initiatives;",
                "Organising co-design workshops with governmental and non-governmental organisations on real problems, and learning-by-doing programmes that include minorities and people of all abilities.",
              ],
            },
          ],
        },
        {
          q: "Future Makers Lab",
          a: [
            {
              p: "A living, modular educational system turning a library of design knowledge and practices into flexible labs. Its modular model lets it reach schools, universities and youth programmes across the country. Our mission is to put the power of design in the hands of the generation creating our tomorrow.",
            },
            {
              link: {
                label: "Read about Future Makers Lab",
                href: "/initiatives/future-makers-lab",
              },
            },
          ],
        },
        {
          q: "Bodies of the Bulgarian Design Council",
          a: [
            { p: "The supreme body of the Association is the General Assembly." },
            { p: "The governing body of the Association is the Management Board." },
            {
              p: "All full members of the Association take part in the General Assembly. Associate members may take part in the General Assembly at their own wish, in an advisory capacity.",
            },
            {
              p: "The Management Board consists of no fewer than 3 (three) and no more than 7 (seven) persons, who must be members of the Association.",
            },
            {
              p: "The members of the Management Board are elected by the General Assembly for a term of 5 (five) years and are obliged to take active part in its work.",
            },
            { h: "Competence" },
            { p: "The Management Board:" },
            {
              ol: [
                "Admits members of the Association;",
                "Adopts the main directions and programme for the Association's activities;",
                "Ensures the implementation of the decisions of the General Assembly;",
                "Manages the property of the Association in observance of the Statute and the law on non-profit legal entities;",
                "Decides on entering into contracts and/or undertaking obligations of the Association worth more than EUR 1,000;",
                "Prepares and submits a draft budget to the General Assembly;",
                "Prepares and submits to the General Assembly an annual financial report and a report on the Association's activities;",
                "Determines the order of and organises the carrying out of the Association's activities, and bears responsibility for this;",
                "Establishes the lapse of members for non-payment of the membership fee and for other reasons apart from expulsion;",
                "Decides other questions assigned to it by the General Assembly, and all questions which by law or under this Statute are not within the competence of another body.",
              ],
            },
          ],
        },
      ],
    },
    photoAlt: "Members of the Bulgarian Design Council working together",
    formTitle: "BDC membership application",
    thanks: {
      metaTitle: "Thank you — Bulgarian Design Council",
      title: "Thank you for applying for membership",
      body: "The Management Board will review your membership application, and we will contact you at the email you provided.",
      help: "If you need assistance or have any questions, write to us at",
      backLabel: "Explore our initiatives",
    },
    metaTitle: "Membership — Bulgarian Design Council",
    metaDescription:
      "Design needs a common voice. Full and associate membership in the Bulgarian Design Council — for people and organisations. Apply online.",
  },
};
