"use client";

/**
 * GA4, behind explicit consent — the strict (ePrivacy) reading, not the
 * "cookieless ping" one: until the visitor presses accept, NOTHING loads.
 * No gtag script, no requests to Google, no cookies. Decline stores the
 * choice and keeps it that way. A persistent settings control makes consent
 * as easy to withdraw as it was to give.
 *
 * The choice lives in localStorage rather than a cookie — a cookie set to
 * remember "no analytics cookies" is its own small irony, and this one is
 * read only by this component, never sent anywhere.
 *
 * Renders nothing at all while GA4_MEASUREMENT_ID is empty (see
 * lib/analytics.ts). Staging renders the same controls once an id exists, but
 * `collect={false}` prevents it from loading Google or writing GA cookies.
 *
 * Consent Mode: analytics_storage is granted by the click that loads the
 * script; the ad_* signals stay denied — the council runs analytics, not ad
 * personalisation, and Ad Grants conversion goals imported from GA4 key
 * events work off analytics consent alone.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "bdc-analytics-consent";

/* localStorage as an external store, not copied into state — no setState in
   an effect (the repo's lint forbids it), and no hydration mismatch: the
   server snapshot is a sentinel that renders nothing, so a visitor who has
   already decided never sees the banner flash before hydration. */
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
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
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

function loadGa(measurementId: string) {
  if (!measurementId) return;
  const disableKey: `ga-disable-${string}` = `ga-disable-${measurementId}`;
  window[disableKey] = false;
  if (window.gtag) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
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
  window.gtag("config", measurementId);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

function disableGa(measurementId: string) {
  if (!measurementId) return;
  const disableKey: `ga-disable-${string}` = `ga-disable-${measurementId}`;
  window[disableKey] = true;
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  // GA4 normally writes _ga and _ga_<stream>. Expire any legacy GA cookie too
  // so withdrawing consent takes effect on this browser immediately.
  const names = document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => /^_(?:ga|gid|gat)(?:_|$)/.test(name));
  const hostParts = window.location.hostname.split(".");
  const domains = hostParts.length > 1
    ? [window.location.hostname, `.${hostParts.slice(-2).join(".")}`]
    : [window.location.hostname];

  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
    }
  }
}

export function AnalyticsConsent({
  consent,
  collect,
  locale,
  measurementId,
}: {
  consent: {
    label: string;
    text: string;
    accept: string;
    decline: string;
    settings: string;
    close: string;
    privacy: string;
  };
  /** False on staging: exercise the UI without contacting Google. */
  collect: boolean;
  locale: string;
  measurementId: string;
}) {
  /** "ssr" while server-rendering, null while undecided, else the choice. */
  const choice = useSyncExternalStore(subscribe, readChoice, serverChoice);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!collect) {
      disableGa(measurementId);
      return;
    }
    if (choice === "granted") loadGa(measurementId);
    if (choice === "denied") disableGa(measurementId);
  }, [choice, collect, measurementId]);

  /* The gtag config call reports the first page automatically; App Router
     client-side navigations repaint without a document load, so those are
     reported here. The ref skips the pathname the page mounted on. */
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (collect && choice === "granted" && window.gtag) {
      window.gtag("event", "page_view", {
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, choice, collect]);

  if (!measurementId || choice === "ssr") return null;

  const panelOpen = choice === null || settingsOpen;

  if (!panelOpen) {
    return (
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="t-caption fixed bottom-4 left-4 z-50 rounded-full border-2 border-dark bg-page px-4 py-2 font-medium text-text shadow-md transition-colors hover:bg-dark hover:text-text-invert"
      >
        {consent.settings}
      </button>
    );
  }

  return (
    <aside
      role="region"
      aria-label={consent.label}
      // Above the footer (z-30) and the nav (z-40) both — a consent choice
      // should not be coverable by anything it is asking about.
      className="fixed bottom-4 left-4 z-50 max-w-[380px] rounded-2xl bg-dark p-5 text-text-invert shadow-lg"
    >
      <p className="t-caption">{consent.text}</p>
      <a
        href={`/${locale}/privacy`}
        className="t-caption mt-2 inline-block underline underline-offset-4"
      >
        {consent.privacy}
      </a>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            writeChoice("granted");
            setSettingsOpen(false);
          }}
          aria-pressed={choice === "granted"}
          className="t-caption inline-flex items-center justify-center rounded-full bg-brand px-6 py-2 font-medium text-text transition-colors hover:bg-page"
        >
          {consent.accept}
        </button>
        <button
          type="button"
          onClick={() => {
            writeChoice("denied");
            setSettingsOpen(false);
          }}
          aria-pressed={choice === "denied"}
          className="t-caption inline-flex items-center justify-center rounded-full border-2 border-current px-6 py-2 font-medium transition-colors hover:bg-page hover:text-text hover:border-page"
        >
          {consent.decline}
        </button>
        {choice !== null && (
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="t-caption px-2 py-2 underline underline-offset-4"
          >
            {consent.close}
          </button>
        )}
      </div>
    </aside>
  );
}
