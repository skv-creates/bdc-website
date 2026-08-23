/**
 * Copy for the pilot enquiry — the drawer the initiatives' "Започни пилот"
 * button opens, and the /api/pilot endpoint behind it.
 *
 * A pilot is not a partnership: the form asks where a pilot could start —
 * the area, what is not working, who it affects, the change wanted, and
 * whether a decision-maker stands behind it. Values are locale-independent
 * slugs; the labels here are what a visitor reads, and the slugs are what
 * the email carries.
 */

export type Locale = "bg" | "en";

export const PILOT_AREAS = [
  "public-service",
  "digital-service",
  "visual-environment",
  "design-capability",
  "other",
] as const;
export type PilotArea = (typeof PILOT_AREAS)[number];

export const PILOT_SUPPORT = ["yes", "discussing", "not-yet"] as const;
export type PilotSupport = (typeof PILOT_SUPPORT)[number];

type Copy = {
  eyebrow: string;
  title: string;
  lead: string;
  timeNote: string;
  initiative: string;
  about: {
    legend: string;
    name: string;
    email: string;
    organisation: string;
    role: string;
  };
  opportunity: {
    legend: string;
    area: string;
    areaLabels: Record<PilotArea, string>;
    problem: string;
    problemHint: string;
    affected: string;
    affectedHint: string;
    change: string;
    tried: string;
    triedOptional: string;
  };
  readiness: {
    legend: string;
    support: string;
    supportLabels: Record<PilotSupport, string>;
  };
  privacyLabel: string;
  consent: string;
  submit: string;
};

export const PILOT_COPY: Record<Locale, Copy> = {
  bg: {
    eyebrow: "Пилотни програми",
    title: "Започнете пилот",
    lead: "Имате услуга, процес или среда, която може да работи по-добре? Разкажете ни къде виждате възможност за пилот.",
    timeNote: "Около 3 минути",
    initiative: "Инициатива",
    about: {
      legend: "За Вас",
      name: "Име и фамилия",
      email: "Служебен имейл",
      organisation: "Организация",
      role: "Вашата роля",
    },
    opportunity: {
      legend: "Възможност за пилот",
      area: "В коя област виждате възможност за пилот?",
      areaLabels: {
        "public-service": "Публична услуга или процес",
        "digital-service": "Дигитална услуга или интерфейс",
        "visual-environment": "Визуална и информационна среда",
        "design-capability": "Дизайн способност в организацията",
        other: "Друго",
      },
      problem: "Какво не работи достатъчно добре?",
      problemHint:
        "Опишете конкретната ситуация или затруднение. Не е необходимо да имате готово решение.",
      affected: "Кого засяга?",
      affectedHint:
        "Посочете хората или групите, които използват услугата, средата или процеса.",
      change: "Каква промяна искате да постигнете?",
      tried: "Какво вече сте опитали или проучили?",
      triedOptional: "По желание",
    },
    readiness: {
      legend: "Готовност за пилот",
      support: "Има ли подкрепа за пилота от човек с правомощия да взема решения?",
      supportLabels: {
        yes: "Да",
        discussing: "Обсъждаме я",
        "not-yet": "Все още не",
      },
    },
    privacyLabel: "Политика за поверителност",
    consent:
      "Съгласен/на съм БДС да използва предоставените данни, за да разгледа запитването и да се свърже с мен.",
    submit: "Изпратете запитването",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Pilot programmes",
    title: "Start a pilot",
    lead: "Do you have a service, process or environment that could work better? Tell us where you see an opportunity for a pilot.",
    timeNote: "About 3 minutes",
    initiative: "Initiative",
    about: {
      legend: "About you",
      name: "Full name",
      email: "Work email",
      organisation: "Organisation",
      role: "Your role",
    },
    opportunity: {
      legend: "The pilot opportunity",
      area: "Where do you see an opportunity for a pilot?",
      areaLabels: {
        "public-service": "A public service or process",
        "digital-service": "A digital service or interface",
        "visual-environment": "The visual and information environment",
        "design-capability": "Design capability in the organisation",
        other: "Other",
      },
      problem: "What is not working well enough?",
      problemHint:
        "Describe the concrete situation or difficulty. You do not need to have a ready solution.",
      affected: "Who does it affect?",
      affectedHint:
        "Name the people or groups who use the service, environment or process.",
      change: "What change do you want to achieve?",
      tried: "What have you already tried or researched?",
      triedOptional: "Optional",
    },
    readiness: {
      legend: "Readiness for a pilot",
      support: "Is there support for the pilot from someone with decision-making authority?",
      supportLabels: {
        yes: "Yes",
        discussing: "We are discussing it",
        "not-yet": "Not yet",
      },
    },
    privacyLabel: "Privacy Policy",
    consent:
      "I agree that the BDC may use the data provided to review this enquiry and contact me.",
    submit: "Send the enquiry",
  },
};
