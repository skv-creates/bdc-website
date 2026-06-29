/**
 * Home page content — copy + asset references pulled from Figma
 * (file PCN64wGsbMFvHDlwsnN4in, frame "home-desktop" 2082:1654).
 * Centralized so copy edits live in one place. Some names/answers are marked
 * PLACEHOLDER where the Figma content wasn't finalized.
 */

export const nav = {
  links: [
    { label: "Инициативи", href: "#initiatives" },
    { label: "Мисия", href: "#mission" },
    { label: "Екип", href: "#team" },
  ],
  cta: { label: "Стани част от БДС →", href: "https://tally.so/r/81PbQA" },
  lang: { label: "EN", href: "#" },
};

export const hero = {
  heading: "Дизайнът движи нации. Ние го задвижваме в България.",
  subheading:
    "Български Дизайн Съвет обединява дизайн професионалисти, бизнеса, образованието и институциите в една платформа, с една обща мисия: да създаде България бъдещето си, с умисъл.",
  primary: { label: "Стани част от БДС", href: "https://tally.so/r/81PbQA" },
};

export const mission = {
  label: "Нашата Мисия",
  heading:
    "Развиваме национален дизайн капацитет за иновации и устойчиви обществени системи, интегрирайки България в световната екосистема.",
  // v02 mission is label + heading only; stats kept here for later reuse.
  stats: [
    {
      value: "6",
      title: "Регионални клона",
      text: "Свързваме и активираме локалните дизайн общности в цялата страна",
    },
    {
      value: "12",
      title: "Работни групи",
      text: "Безплатни предимства и ресурси за всички наши активни доброволци",
    },
    {
      value: "1",
      title: "Обща мисия",
      text: "Да наложим дизайна като движеща сила за икономиката и обществото у нас",
    },
    {
      value: "100%",
      title: "Кауза",
      text: "Експертни направления, фокусирани върху образование, UX/UI, брандинг и архитектура",
    },
  ],
};

/**
 * Initiatives carousel. Each card has a FIXED pattern (1–4) shown in its
 * thumbnail. Colors come from the pattern rail's active triad — card
 * backgrounds run accent → band → ground by position, and each pattern is
 * inked in a triad color that isn't its background. Card 4 reuses pattern 2.
 */
export type Initiative = {
  label: string;
  title: string;
  text: string;
  pattern: 1 | 2 | 3 | 4;
  cta?: { label: string; href: string };
};

export const initiatives = {
  heading: "Инициативи",
  items: [
    {
      label: "Проект",
      title: "България чрез Дизайн",
      text: "Визуална идентичност на българските институции, която засилва вярата в институциите и националната гордост.",
      pattern: 1,
      cta: { label: "Към проекта →", href: "#" },
    },
    {
      label: "Лаборатория",
      title: "Future Makers Lab",
      text: "Лаборатория за юноши, която развива системно мислене, проблемно рамкиране, изследователска култура, включващ дизайн и отговорна работа с AI.",
      pattern: 2,
    },
    {
      label: "Инструмент",
      title: "Оценка на дизайн зрялост",
      text: "Инструмент за самооценка на дизайн зрелостта на бизнес организации и насоки за повишаването ѝ.",
      pattern: 3,
    },
    {
      label: "Лекция",
      title: "Дизайн отвъд екрана: силата на ко-дизайна в сложни системи",
      text: "Лекция за ролята на дизайна отвъд визуалния аспект – като инструмент за разбиране на хора, системи, последствия и бъдещи сценарии.",
      pattern: 2,
    },
    {
      label: "Награда",
      title: "Дизайн за Добро",
      text: "БДС връчи три награди „Дизайн за добро“ на първия Студентски дизайн маратон в НБУ. Отличаваме идеи, в които дизайнът е инструмент за смислена промяна за хората, общностите и средата ни.",
      pattern: 4,
    },
  ] as Initiative[],
};

export const event = {
  label: "Събитие",
  title:
    "„Дизайнът оформя света. Затова дизайнерите имат огромна сила, а със силата идва и отговорността.”",
  info: "15 юни 2026, НДК София",
  cta: { label: "Запиши се →", href: "#" },
  image: "/figma/event-cover.png",
};

export const about = {
  label: "Нашата Мисия",
  heading: "Изграждаме устойчива и разпознаваема дизайн култура в България",
  paragraphs: [
    "Българският Дизайн Съвет е независима неправителствена организация, създадена от дизайнери за дизайнери.",
    "Целта ни е да изградим устойчива, свързана и силно конкурентна дизайн екосистема в България.",
  ],
};

// `photo` is optional — members awaiting a portrait render a placeholder tile.
export type Member = { name: string; role: string; photo?: string };

export const team = {
  heading: "Екип",
  vision:
    "Oтстояваме силата на дизайна да развива икономиката, да укрепва общностите и да оформя едно устойчиво, проспериращо и културно уверено бъдеще за нацията ни.",
  // Управителен съвет
  board: {
    eyebrow: "— Управителен съвет",
    members: [
      { name: "Добра Славкова", role: "Председател", photo: "/figma/team/dobra-slavkova.png" },
      { name: "Стефи Пейкова-Кришнан", role: "Заместник-председател", photo: "/figma/team/stefi-peykova-krishnan.png" },
      { name: "Радина Донева", role: "Секретар", photo: "/figma/team/radina-doneva.png" },
      { name: "Зинаида Илер", role: "Член на Управителния съвет", photo: "/figma/team/zinaida-iler.png" },
      { name: "Стефан Владимиров", role: "Член на Управителния съвет", photo: "/figma/team/stefan-vladimirov.png" },
    ] as Member[],
  },
  // Консултативен съвет
  advisory: {
    eyebrow: "— Консултативен съвет",
    intro:
      "Експерти от дизайн, образование, бизнес, култура и технологии, които помагат на Българския дизайн съвет да развива инициативи с реална стойност за страната.",
    members: [
      { name: "Ida Persson", role: "Член на Консултативния съвет", photo: "/figma/team/ida-persson.png" },
      { name: "Милен Донев", role: "Член на Консултативния съвет", photo: "/figma/team/milen-donev.png" },
      { name: "Brandon Gien", role: "Член на Консултативния съвет", photo: "/figma/team/brandon-gien.png" },
    ] as Member[],
  },
  // Доброволци
  volunteers: {
    eyebrow: "— Доброволци",
    intro:
      "Съществуваме благодарение на хора, които даряват време, знания и енергия. Доброволците ни не помагат „отстрани“, а участват пряко в изграждането на нова дизайн култура за България.",
    cta: { label: "Стани доброволец", href: "https://tally.so/r/81PbQA" },
    members: [
      { name: "Йоанна Тодорова", role: "Доброволец", photo: "/figma/team/yoanna-todorova.png" },
      { name: "Кая Содева", role: "Доброволец", photo: "/figma/team/kaya-sodeva.png" },
      { name: "Мариана Ташутева", role: "Доброволец", photo: "/figma/team/mariana-tashuteva.png" },
      { name: "Кристин Озанян", role: "Доброволец" }, // photo pending
      { name: "Кирил Велчев", role: "Доброволец", photo: "/figma/team/kiril-velchev.png" },
      { name: "Невена Пеева", role: "Асоцииран член", photo: "/figma/team/nevena-peeva.png" },
      { name: "Моника Велкова", role: "Доброволец" }, // photo pending
    ] as Member[],
  },
};

export const quote = {
  text: "Когато една държава открие дизайнерската си сила, тя открива и своето бъдеще.",
  author: "Стефи Пейкова",
};

export const faq = {
  heading: "Често задавани въпроси",
  subheading:
    "Българският Дизайн Съвет е независима неправителствена организация, създадена от дизайнери за дизайнери, с цел да изгради устойчива, свързана и силно конкурентна дизайн екосистема в България.",
  // Answers are PLACEHOLDER (collapsed in Figma); titles are exact.
  items: [
    "Основна Информация за Съвета",
    "Структура, Управление и Правна рамка",
    "Членство и Управителен съвет (УС)",
    "Вземане на решения и промени",
    "Финансиране",
    "Мисия, Приоритети и Дейност",
    "Дизайн Звена и Структура",
    "Ключови Приоритети и Проекти",
    "Партньорства",
  ].map((q) => ({
    q,
    a: "Българският Дизайн Съвет е независима неправителствена организация, създадена от дизайнери за дизайнери, с цел да изгради устойчива, свързана и силно конкурентна дизайн екосистема в България.",
  })),
};

export const cta = {
  heading: "Бюлетин",
  subheading: "Българският Дизайн Съвет е независима неправителствена организация,",
  inputPlaceholder: "Твоят имейл",
  button: "Запиши се",
  image: "/figma/cta-cover.png",
};

export const footer = {
  copyright: "© 2026 Bulgarian Design Council. All rights reserved.",
  contactHeading: "Контакти",
  phone: "+359 2 123 4567",
  email: "info@bulgariandesigncouncil.bg",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/bulgarian.design.council/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/bulgarian-design-council/posts/?feedView=all" },
  ],
};
