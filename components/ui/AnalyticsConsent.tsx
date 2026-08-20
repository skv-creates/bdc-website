"use client";

/**
 * GA4, behind explicit consent — the strict (ePrivacy) reading, not the
 * "cookieless ping" one: until the visitor presses accept, NOTHING loads.
 * No gtag script, no requests to Google, no cookies. Decline stores the
 * choice and keeps it that way; the banner never returns either way.
 *
 * The choice lives in localStorage rather than a cookie — a cookie set to
 * remember "no analytics cookies" is its own small irony, and this one is
 * read only by this component, never sent anywhere.
 *
 * Renders nothing at all while GA4_MEASUREMENT_ID is empty (see
 * lib/analytics.ts), and is mounted only on the production build — staging
 * visits are the team's own and would pollute the property.
 *
 * Consent Mode: analytics_storage is granted by the click that loads the
 * script; the ad_* signals stay denied — the council runs analytics, not ad
 * personalisation, and Ad Grants conversion goals imported from GA4 key
 * events work off analytics consent alone.
 */
import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { GA4_MEASUREMENT_ID } from "@/lib/analytics";

const STORAGE_KEY = "bdc-analytics-consent";

/* localStorage as an external store, not copied into state — no setState in
   an effect (the repo's lint forbids it), and no hydration mismatch: the
   server snapshot is a sentinel that renders nothing, so a visitor who has
   already decided never sees the banner flash before hydration. */
let listeners: (() => void)[] = [];
const subscribe = (l: () => void) => {
  listeners.push(l);
  return () => {
    listeners = listeners.filter((x) => x !== l);
  };
};
const readChoice = () => localStorage.getItem(STORAGE_KEY);
const serverChoice = () => "ssr";
const writeChoice = (value: "granted" | "denied") => {
  localStorage.setItem(STORAGE_KEY, value);
  for (const l of listeners) l();
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadGa() {
  if (!GA4_MEASUREMENT_ID || window.gtag) return;
  window.dataLayer = window.dataLayer ?? [];
  // gtag processes the arguments object itself; pushing a rest-array instead
  // is the classic silent breakage — config calls simply stop applying.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function AnalyticsConsent({
  consent,
}: {
  consent: { label: string; text: string; accept: string; decline: string };
}) {
  /** "ssr" while server-rendering, null while undecided, else the choice. */
  const choice = useSyncExternalStore(subscribe, readChoice, serverChoice);

  useEffect(() => {
    if (choice === "granted") loadGa();
  }, [choice]);

  /* The gtag config call reports the first page automatically; App Router
     client-side navigations repaint without a document load, so those are
     reported here. The ref skips the pathname the page mounted on. */
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (choice === "granted" && window.gtag) {
      window.gtag("event", "page_view", {
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, choice]);

  if (!GA4_MEASUREMENT_ID || choice !== null) return null;

  return (
    <aside
      role="region"
      aria-label={consent.label}
      // Above the footer (z-30) and the nav (z-40) both — a consent choice
      // should not be coverable by anything it is asking about.
      className="fixed bottom-4 left-4 z-50 max-w-[380px] rounded-2xl bg-dark p-5 text-text-invert shadow-lg"
    >
      <p className="t-caption">{consent.text}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => writeChoice("granted")}
          className="t-caption inline-flex items-center justify-center rounded-full bg-brand px-6 py-2 font-medium text-text transition-colors hover:bg-page"
        >
          {consent.accept}
        </button>
        <button
          type="button"
          onClick={() => writeChoice("denied")}
          className="t-caption inline-flex items-center justify-center rounded-full border-2 border-current px-6 py-2 font-medium transition-colors hover:bg-page hover:text-text hover:border-page"
        >
          {consent.decline}
        </button>
      </div>
    </aside>
  );
}
