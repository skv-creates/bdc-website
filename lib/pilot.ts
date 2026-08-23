/**
 * Copy for the pilot enquiry — the drawer the initiatives' "Започни пилот"
 * button opens, and the /api/pilot endpoint behind it.
 *
 * A pilot is not a partnership: the form asks only what starting one
 * needs — who is asking, what is not working (and for whom), the change
 * wanted, and whether a decision-maker stands behind it. Choice values are
 * locale-independent slugs; the visitor reads these labels, and the email
 * carries the Bulgarian ones.
 */

export type Locale = "bg" | "en";

export const PILOT_SUPPORT = ["yes", "discussing", "not-yet"] as const;
export type PilotSupport = (typeof PILOT_SUPPORT)[number];

type Copy = {
  eyebrow: string;
  title: string;
  lead: string;
  initiative: string;
  /** The dropdown's extra option for a pilot outside the four initiatives. */
  initiativeOther: string;
  about: {
    legend: string;
    name: string;
    email: string;
    organisation: string;
    role: string;
  };
  opportunity: {
    legend: string;
    goal: string;
    goalHint: string;
  };
  readiness: {
    legend: string;
    support: string;
    supportLabels: Record<PilotSupport, string>;
  };
  /** Sentence before the consent box; `privacyLink` is its linked tail. */
  privacyPrefix: string;
  privacyLink: string;
  consent: string;
  submit: string;
};

export const PILOT_COPY: Record<Locale, Copy> = {
  bg: {
    eyebrow: "Пилотни програми",
    title: "Започнете пилот",
    lead: "Имате услуга, процес или среда, която може да работи по-добре? Разкажете ни къде виждате възможност за пилот.",
    initiative: "Пилотът е свързан с:",
    initiativeOther: "Нова идея извън тези инициативи",
    about: {
      legend: "За Вас",
      name: "Име и фамилия",
      email: "Служебен имейл",
      organisation: "Организация",
      role: "Вашата роля",
    },
    opportunity: {
      legend: "Възможност за пилот",
      goal: "Какво искате да постигнете чрез пилота?",
      goalHint:
        "Опишете настоящата ситуация, защо искате да започнете пилот и какво трябва да бъде различно след него. Не е необходимо да имате готово решение.",
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
    privacyPrefix: "Прочетете как обработваме личните Ви данни в нашата",
    privacyLink: "Политика за поверителност",
    consent:
      "Съгласявам се БДС да използва предоставените данни, за да разгледа запитването и да се свърже с мен.",
    submit: "Изпратете запитването",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "Pilot programmes",
    title: "Start a pilot",
    lead: "Do you have a service, process or environment that could work better? Tell us where you see an opportunity for a pilot.",
    initiative: "The pilot relates to:",
    initiativeOther: "A new idea outside these initiatives",
    about: {
      legend: "About you",
      name: "Full name",
      email: "Work email",
      organisation: "Organisation",
      role: "Your role",
    },
    opportunity: {
      legend: "The pilot opportunity",
      goal: "What do you want to achieve through the pilot?",
      goalHint:
        "Describe the current situation, why you want to start a pilot, and what should be different after it. You do not need to have a ready solution.",
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
    privacyPrefix: "Read how we process your personal data in our",
    privacyLink: "Privacy Policy",
    consent:
      "I agree that the BDC may use the data provided to review this enquiry and contact me.",
    submit: "Send the enquiry",
  },
};
