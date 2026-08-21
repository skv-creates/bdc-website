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
    eyebrow: "Какво правим — на живо и онлайн",
    title: "Събития",
    lead: "Срещи, лекции и работилници, които събират дизайн общността и я свързват с институциите, бизнеса и образованието. Най-новото е най-отгоре.",
    metaTitle: "Събития — Български Дизайн Съвет",
    metaDescription:
      "Събитията на Български дизайн съвет — срещи, лекции и работилници, с дати, описания и снимки. Най-новите най-отгоре.",
  },
  en: {
    // Translated from the Bulgarian, which is the source of truth here.
    eyebrow: "What we do — in person and online",
    title: "Events",
    lead: "Meetings, lectures and workshops that bring the design community together and connect it with institutions, business and education. Newest first.",
    metaTitle: "Events — Bulgarian Design Council",
    metaDescription:
      "Events of the Bulgarian Design Council — meetings, lectures and workshops, with dates, descriptions and photographs. Newest first.",
  },
};
