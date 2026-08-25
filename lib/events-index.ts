/**
 * Copy for the events index (/[locale]/events).
 *
 * The event data itself comes from lib/events.ts (synced from Notion) and the
 * rows render through the same ActivitiesList the home page uses; this file
 * only holds the page's own strings.
 */

export type Locale = "bg" | "en";

export const EVENTS_INDEX_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  bg: {
    eyebrow: "Какво правим",
    title: "Събития",
    lead: "Документираме развитието на Български дизайн съвет: събитията, които организираме и в които участваме, новите партньорства, ключовите постижения и какво следва.",
    metaTitle: "Събития — Български Дизайн Съвет",
    metaDescription:
      "Събитията на Български дизайн съвет — срещи, лекции и работилници, с дати, описания и снимки. Най-новите най-отгоре.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "What we do",
    title: "Events",
    lead: "We document the development of the Bulgarian Design Council: the events we organise and take part in, new partnerships, key milestones and what comes next.",
    metaTitle: "Events — Bulgarian Design Council",
    metaDescription:
      "Events of the Bulgarian Design Council — meetings, lectures and workshops, with dates, descriptions and photographs. Newest first.",
  },
};
