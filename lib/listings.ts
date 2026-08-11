/**
 * Copy for the two listing pages — /[locale]/events and /[locale]/initiatives.
 *
 * Both routes existed only as `[slug]` children, so /bg/events and
 * /bg/initiatives returned 404 while eight event pages were reachable from
 * nowhere but the home page and four initiative pages from nowhere but a
 * mega-menu. That is the "clear and logical navigation" half of the Ad Grants
 * refusal, and it is also just a dead end for anyone who edits the URL.
 *
 * The lists themselves are derived — getEvents() and the published initiatives —
 * so nothing here needs updating when an event is synced from Notion.
 */

export type Locale = "bg" | "en";

export const LISTING_COPY: Record<
  Locale,
  {
    events: {
      eyebrow: string;
      title: string;
      lead: string;
      /** Column heads above the list. */
      colDate: string;
      colName: string;
      empty: string;
      metaTitle: string;
      metaDescription: string;
    };
    initiatives: {
      eyebrow: string;
      title: string;
      lead: string;
      metaTitle: string;
      metaDescription: string;
    };
  }
> = {
  bg: {
    events: {
      eyebrow: "Събития",
      title: "Събития",
      lead: "Срещи, лекции и работни сесии на Българския дизайн съвет и на общността около него.",
      colDate: "Дата",
      colName: "Събитие",
      empty: "Няма публикувани събития.",
      metaTitle: "Събития",
      metaDescription:
        "Срещи, лекции и работни сесии на Сдружение „Български дизайн съвет“ и на общността около него.",
    },
    initiatives: {
      eyebrow: "Инициативи",
      title: "Инициативи",
      lead: "Дългосрочни направления, всяко от които събира институции, експерти и общности около конкретен проблем.",
      metaTitle: "Инициативи",
      metaDescription:
        "Дългосрочните направления на Сдружение „Български дизайн съвет“ — от политики за публичния сектор до дизайн зрялост на бизнеса.",
    },
  },
  en: {
    events: {
      eyebrow: "Events",
      title: "Events",
      lead: "Meetings, talks and working sessions of the Bulgarian Design Council and the community around it.",
      colDate: "Date",
      colName: "Event",
      empty: "No published events.",
      metaTitle: "Events",
      metaDescription:
        "Meetings, talks and working sessions of the Bulgarian Design Council Association and the community around it.",
    },
    initiatives: {
      eyebrow: "Initiatives",
      title: "Initiatives",
      lead: "Long-running strands, each gathering institutions, experts and communities around one concrete problem.",
      metaTitle: "Initiatives",
      metaDescription:
        "The Bulgarian Design Council's long-running strands — from public-sector policy work to design maturity in business.",
    },
  },
};
