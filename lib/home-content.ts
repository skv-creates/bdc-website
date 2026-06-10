/**
 * Home page content — copy + asset references pulled from Figma
 * (file PCN64wGsbMFvHDlwsnN4in, frame "home-desktop" 2082:1654).
 * Centralized so copy edits live in one place. Some names/answers are marked
 * PLACEHOLDER where the Figma content wasn't finalized.
 */

export const nav = {
  links: [
    { label: "Екип", href: "#team" },
    { label: "Членство", href: "#cta" },
    { label: "Контакт", href: "#footer" },
    { label: "Въпроси", href: "#faq" },
  ],
  cta: { label: "Стани член →", href: "#cta" },
  lang: { label: "EN", href: "#" },
};

export const hero = {
  heading: "Бъди гласа на българския дизайн.",
  subheading:
    "Българският Дизайн Съвет обединява професионалисти, експерти и организации с една обща мисия – да развиваме.",
  primary: { label: "Стани член", href: "#cta" },
  secondary: { label: "Бюлетин", href: "#cta" },
};

export const mission = {
  label: "Нашата Мисия",
  heading: "Изграждаме устойчива и разпознаваема дизайн култура в България",
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

export type Member = { name: string; role: string; photo: string };

export const team = {
  heading: "Екип",
  vision:
    "Визията ни е да отстояваме силата на дизайна да развива икономиката, да укрепва общностите и да оформя едно устойчиво, проспериращо и културно уверено бъдеще за нацията ни.",
  core: {
    heading: "Управителен съвет",
    members: [
      { name: "Добра Славкова", role: "Председател", photo: "/figma/member-1.png" },
      { name: "Радина Донева", role: "Секретар", photo: "/figma/member-2.png" },
      { name: "Стефи Пейкова", role: "Заместник-председател", photo: "/figma/member-3.png" },
      { name: "Зинаида Илер", role: "Член на Управителния съвет", photo: "/figma/member-4.png" },
      { name: "Име Фамилия", role: "Член на Управителния съвет", photo: "/figma/member-5.png" }, // PLACEHOLDER name
    ] as Member[],
  },
  council: {
    heading: "Консултативен съвет",
    // PLACEHOLDER names — Figma used generic "Доброволец" cards
    members: [
      { name: "Име Фамилия", role: "Доброволец", photo: "/figma/member-6.jpg" },
      { name: "Име Фамилия", role: "Доброволец", photo: "/figma/member-7.jpg" },
      { name: "Име Фамилия", role: "Доброволец", photo: "/figma/member-8.png" },
      { name: "Име Фамилия", role: "Доброволец", photo: "/figma/member-9.png" },
      { name: "Име Фамилия", role: "Доброволец", photo: "/figma/member-10.jpg" },
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
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
};
