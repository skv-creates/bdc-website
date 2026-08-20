/**
 * schema.org builders.
 *
 * Pure data, no JSX — the same split the rest of the repo uses, where `lib/`
 * owns content and `components/` renders it. <JsonLd/> does the rendering.
 *
 * Everything is scoped per locale: each node's `@id` includes the locale URL
 * and carries `inLanguage`. Without that, the Bulgarian and English pages
 * describe one organisation twice with different names, and a consumer
 * reconciling them has to pick a winner.
 *
 * Nothing here invents data. There is no phone number anywhere — the council
 * has none to publish, and a wrong phone number in machine-readable form is
 * worse than none — it is exactly the kind of thing an assistant will read
 * out as fact.
 */
import type { FaqBlock, SiteContent, Locale } from "./home-content";
import type { BdcEvent } from "./events";
import { absoluteUrl, localePath, plainText } from "./seo";

/** Stable per-locale ids so nodes can reference each other. */
const orgId = (locale: Locale) => `${absoluteUrl(localePath(locale))}#organization`;
const siteId = (locale: Locale) => `${absoluteUrl(localePath(locale))}#website`;

/**
 * The organisation, the site, and the FAQ, as one @graph for the home page.
 *
 * NGO rather than plain Organization: it is the accurate type, and it is what
 * makes "is this a charity or a company" answerable without reading the prose.
 */
export function homeGraph(c: SiteContent, locale: Locale) {
  const home = absoluteUrl(localePath(locale));

  const members = [c.team.board, c.team.advisory, c.team.volunteers]
    .flatMap((group) => group?.members ?? [])
    .map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      ...(m.photo ? { image: absoluteUrl(m.photo) } : {}),
      // LinkedIn comes from the Notion merge and is the only external identity
      // we hold for a person.
      ...(m.linkedin ? { sameAs: [m.linkedin] } : {}),
    }));

  const organization = {
    "@type": "NGO",
    "@id": orgId(locale),
    name: c.meta.title,
    // The registry facts, machine-readable: an Ad Grants (or any) reviewer
    // asking "is this a real registered non-profit" can be answered by a
    // parser. All four values are published prose on /about and /statute.
    legalName: "Сдружение „Български дизайн съвет“",
    identifier: {
      "@type": "PropertyValue",
      propertyID: "UIC (ЕИК — Bulgarian registry Unified Identification Code)",
      value: "208377927",
    },
    foundingDate: "2025-06-25",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Винсент ван Гог 1, ап. 7",
      addressLocality: "София",
      postalCode: "1407",
      addressCountry: "BG",
    },
    description: c.meta.description,
    url: home,
    email: c.footer.email,
    logo: absoluteUrl("/icon.png"),
    inLanguage: locale,
    sameAs: c.footer.social.map((s) => s.href),
    ...(members.length ? { member: members } : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": siteId(locale),
    url: home,
    name: c.meta.title,
    inLanguage: locale,
    publisher: { "@id": orgId(locale) },
  };

  /**
   * The FAQ no longer earns rich results for a site like this — Google
   * restricted them to government and health domains in 2023. It is here
   * anyway: it is the densest block of plain fact on the site, and this brief
   * is as much about what an assistant can answer as what Google will draw.
   */
  const faq = {
    "@type": "FAQPage",
    "@id": `${home}#faq`,
    inLanguage: locale,
    mainEntity: c.faq.groups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        // Answers are FaqBlock[]; joining them directly serialised every
        // block as "[object Object]", which is literally what Google was
        // being handed as the answer text.
        acceptedAnswer: { "@type": "Answer", text: faqBlockText(item.a) },
      })),
    ),
  };

  return { "@context": "https://schema.org", "@graph": [organization, website, faq] };
}

/** FaqBlock[] → the plain prose a rich-results parser should read. */
function faqBlockText(blocks: FaqBlock[]): string {
  return blocks
    .map((b) => {
      if ("p" in b) return b.p;
      if ("h" in b) return b.h;
      if ("ul" in b) return b.ul.map((li) => `• ${li}`).join("\n");
      return b.link.label;
    })
    .join("\n\n");
}

/** One event. */
export function eventNode(event: BdcEvent, locale: Locale, siteName: string) {
  const url = absoluteUrl(localePath(locale, `/events/${event.slug}`));

  // Derived from the format Notion already records, rather than a second field
  // that could disagree with the label on screen.
  const online = event.type.label.toLowerCase().includes("онлайн") ||
    event.type.label.toLowerCase().includes("online");

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": url,
    name: event.name,
    // Cleaned, not shortened: a consumer reading schema.org/Event wants the
    // whole description, but not the sync's `[label](url)` runs.
    description: plainText(event.description),
    // Date only, no time: the CMS holds no start time, and inventing 00:00
    // would claim a midnight event.
    startDate: event.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    // Omitted entirely when unknown — a Place with an empty name is worse than
    // no location at all.
    ...(event.location
      ? { location: { "@type": "Place", name: event.location } }
      : online
        ? { location: { "@type": "VirtualLocation", url } }
        : {}),
    ...(event.covers.length ? { image: event.covers.map((c) => absoluteUrl(c.src)) } : {}),
    organizer: { "@id": orgId(locale), name: siteName },
    inLanguage: locale,
    url,
  };
}

/** One initiative — a project the organisation runs, not an article about one. */
export function initiativeNode(
  initiative: { slug: string; title: string; text: string; detail?: { lead: string } },
  locale: Locale,
) {
  const url = absoluteUrl(localePath(locale, `/initiatives/${initiative.slug}`));
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: initiative.title,
    inLanguage: locale,
    isPartOf: { "@id": siteId(locale) },
    mainEntity: {
      "@type": "Project",
      name: initiative.title,
      description: initiative.detail?.lead ?? initiative.text,
      parentOrganization: { "@id": orgId(locale) },
    },
  };
}
