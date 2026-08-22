/**
 * Copy for the membership page (/[locale]/membership).
 *
 * The statute, translated from legal into plain public language — not
 * copied from it: who can join, the two categories side by side, what
 * membership commits you to, how admission works — and the application
 * itself embedded at the foot of the page, where every membership button
 * on the site lands (/membership#apply).
 *
 * Deliberately NOT here: the association's full list of aims, the
 * management board's powers, property and contracts, the legal text on
 * termination. Those belong to the statute, which this page links as the
 * single official source — the closing line under the form says exactly
 * that. No links to Notion: the page explains itself.
 */

export type Locale = "bg" | "en";

type Copy = {
  eyebrow: string;
  /** Beside the eyebrow: how long the application takes. */
  timeNote: string;
  title: string;
  lead: string;
  body: string;
  /** Jumps to the application at the foot of the page. */
  applyCta: string;
  who: { heading: string; groups: { title: string; paras: string[] }[] };
  ways: { heading: string; options: { title: string; body: string }[] };
  meaning: {
    heading: string;
    intro: string;
    commitmentsIntro: string;
    commitments: string[];
    statuteNote: string;
    statuteLabel: string;
  };
  admission: { heading: string; steps: string[]; reapply: string };
  decisions: { heading: string; paras: string[]; statuteCta: string };
  apply: {
    heading: string;
    intro: string;
    languageNote: string;
    beforeLabel: string;
    statuteLabel: string;
    privacyLabel: string;
    dataUse: string;
    disclaimer: string;
  };
  formTitle: string;
  metaTitle: string;
  metaDescription: string;
};

export const MEMBERSHIP_COPY: Record<Locale, Copy> = {
  bg: {
    eyebrow: "Членство в Български дизайн съвет",
    timeNote: "Попълването отнема 3–5 минути.",
    title: "Членство в БДС",
    lead: "Обединяваме хора и организации, които искат да участват в развитието на дизайна в България и в работата, която превръща дизайна в национален капацитет.",
    body: "Членството е доброволно. Можете да кандидатствате като физическо лице или организация, за пълноправно или асоциирано членство.",
    applyCta: "Кандидатствайте за членство",
    who: {
      heading: "Кой може да членува?",
      groups: [
        {
          title: "Физически лица",
          paras: [
            "Дизайн професионалисти и хора от други области, които приемат целите на БДС и искат да допринасят за тяхното осъществяване.",
          ],
        },
        {
          title: "Организации и юридически лица",
          paras: [
            "Компании, образователни и научни институции, неправителствени организации и други юридически лица, чиято дейност или интереси са свързани с дизайна.",
            "За да членува, организацията трябва да има поне един професионално ангажиран дизайнер в екипа си.",
          ],
        },
      ],
    },
    ways: {
      heading: "Два начина за участие",
      options: [
        {
          title: "Пълноправно членство",
          body: "Пълноправните членове участват в Общото събрание с право на глас. Те могат да бъдат избирани в органите на управление, да участват в инициативите и официалните позиции на БДС и да упражняват контрол върху работата на сдружението.",
        },
        {
          title: "Асоциирано членство",
          body: "Асоциираните членове участват в дейността, инициативите, срещите и изготвянето на позиции и документи на БДС. Те могат да участват в Общото събрание със съвещателен глас, но нямат право да гласуват или да бъдат избирани в органите на управление.",
        },
      ],
    },
    meaning: {
      heading: "Какво означава членството?",
      intro:
        "Всички членове могат да участват в работата на БДС, да бъдат информирани за дейността му и да допринасят към инициативите и официалните позиции на сдружението.",
      commitmentsIntro: "С членството поемате ангажимент да:",
      commitments: [
        "спазвате Устава и вътрешните правила на БДС;",
        "подкрепяте целите на сдружението;",
        "участвате отговорно в работата, с която сте се ангажирали;",
        "заплащате членски внос, когато такъв е определен с решение на Общото събрание.",
      ],
      statuteNote: "Подробните права и задължения на членовете са описани в",
      statuteLabel: "Устава на БДС",
    },
    admission: {
      heading: "Как се приемат нови членове?",
      steps: [
        "Попълвате онлайн заявлението и избирате категория членство.",
        "Потвърждавате, че приемате Устава на БДС.",
        "Управителният съвет разглежда заявлението.",
        "Решението се взема с мнозинство от две трети от членовете на Управителния съвет.",
        "Свързваме се с Вас по имейл с резултата и следващите стъпки.",
      ],
      reapply:
        "При неприето заявление можете да кандидатствате отново за същата категория след изтичането на три месеца.",
    },
    decisions: {
      heading: "Как се вземат решенията?",
      paras: [
        "Общото събрание е върховният орган на БДС. В него участват всички пълноправни членове с право на глас. Асоциираните членове могат да участват със съвещателен глас.",
        "Управителният съвет организира работата на сдружението, изпълнява решенията на Общото събрание и приема новите членове.",
      ],
      statuteCta: "Прочетете Устава на БДС",
    },
    apply: {
      heading: "Кандидатствайте за членство",
      intro:
        "Разкажете ни накратко за Вас или Вашата организация, с какво се занимавате и защо искате да станете част от БДС.",
      languageNote:
        "Формата е на български, защото това е работният език на сдружението и Общото събрание.",
      beforeLabel: "Преди да кандидатствате:",
      statuteLabel: "Устав на БДС",
      privacyLabel: "Политика за поверителност",
      dataUse:
        "Използваме предоставените данни единствено за разглеждане на заявлението и свързаната с него комуникация.",
      disclaimer:
        "Информацията на тази страница обобщава основните условия за членство и не заменя Устава на сдружението.",
    },
    formTitle: "Заявление за членство в БДС",
    metaTitle: "Членство — Български Дизайн Съвет",
    metaDescription:
      "Членство в Български дизайн съвет — кой може да членува, пълноправно и асоциирано членство, как се приемат нови членове. Кандидатствайте онлайн.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Membership in the Bulgarian Design Council",
    timeNote: "Filling it in takes 3–5 minutes.",
    title: "Membership in the BDC",
    lead: "We bring together people and organisations who want to take part in the development of design in Bulgaria and in the work that turns design into a national capability.",
    body: "Membership is voluntary. You can apply as an individual or an organisation, for full or associate membership.",
    applyCta: "Apply for membership",
    who: {
      heading: "Who can become a member?",
      groups: [
        {
          title: "Individuals",
          paras: [
            "Design professionals and people from other fields who accept the aims of the BDC and want to contribute to achieving them.",
          ],
        },
        {
          title: "Organisations and legal entities",
          paras: [
            "Companies, educational and research institutions, non-governmental organisations and other legal entities whose work or interests relate to design.",
            "To become a member, an organisation must have at least one professionally engaged designer on its team.",
          ],
        },
      ],
    },
    ways: {
      heading: "Two ways to take part",
      options: [
        {
          title: "Full membership",
          body: "Full members take part in the General Assembly with the right to vote. They can be elected to the governing bodies, take part in the BDC's initiatives and official positions, and exercise oversight of the association's work.",
        },
        {
          title: "Associate membership",
          body: "Associate members take part in the BDC's activities, initiatives, meetings and the drafting of positions and documents. They can attend the General Assembly in an advisory capacity, but cannot vote or be elected to the governing bodies.",
        },
      ],
    },
    meaning: {
      heading: "What does membership mean?",
      intro:
        "All members can take part in the work of the BDC, stay informed about its activities, and contribute to the association's initiatives and official positions.",
      commitmentsIntro: "Membership commits you to:",
      commitments: [
        "observing the Statute and the internal rules of the BDC;",
        "supporting the aims of the association;",
        "taking responsible part in the work you have committed to;",
        "paying a membership fee, where one has been set by decision of the General Assembly.",
      ],
      statuteNote: "The members' rights and obligations in detail are set out in the",
      statuteLabel: "Statute of the BDC",
    },
    admission: {
      heading: "How are new members admitted?",
      steps: [
        "You fill in the online application and choose a membership category.",
        "You confirm that you accept the Statute of the BDC.",
        "The Management Board reviews the application.",
        "The decision is taken by a two-thirds majority of the Management Board.",
        "We contact you by email with the outcome and the next steps.",
      ],
      reapply:
        "If an application is not accepted, you can apply again for the same category after three months have passed.",
    },
    decisions: {
      heading: "How are decisions made?",
      paras: [
        "The General Assembly is the supreme body of the BDC. All full members take part in it with the right to vote. Associate members can take part in an advisory capacity.",
        "The Management Board organises the association's work, carries out the decisions of the General Assembly, and admits new members.",
      ],
      statuteCta: "Read the Statute of the BDC",
    },
    apply: {
      heading: "Apply for membership",
      intro:
        "Tell us briefly about yourself or your organisation, what you do, and why you want to become part of the BDC.",
      languageNote:
        "The form is in Bulgarian, because that is the working language of the association and its General Assembly.",
      beforeLabel: "Before you apply:",
      statuteLabel: "Statute of the BDC",
      privacyLabel: "Privacy Policy",
      dataUse:
        "We use the data you provide solely to review the application and for the communication related to it.",
      disclaimer:
        "The information on this page summarises the main terms of membership and does not replace the Statute of the association.",
    },
    formTitle: "BDC membership application",
    metaTitle: "Membership — Bulgarian Design Council",
    metaDescription:
      "Membership in the Bulgarian Design Council — who can join, full and associate membership, how new members are admitted. Apply online.",
  },
};
