"use client";

import { useEffect, useSyncExternalStore } from "react";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import type { Locale, SiteContent } from "@/lib/home-content";
import type { NotFoundCopy } from "@/lib/not-found-content";

/** Everything the 404 needs from one locale's content. */
export type NotFoundPayload = {
  nav: SiteContent["nav"];
  ui: SiteContent["ui"];
  footer: SiteContent["footer"];
  initiatives: SiteContent["initiatives"];
  copy: NotFoundCopy;
};

/**
 * The 404 page's body, localized in the browser.
 *
 * A not-found component receives no props and renders outside the [locale]
 * layout (see app/[locale]/not-found.tsx), so the server cannot know which
 * language the dead URL was in. The URL itself can: it starts with /en or it
 * does not. The server renders Bulgarian — the default locale and the
 * sitemap's x-default — and this component re-renders in English after
 * hydration when the path says so, `lang` attribute included. Without
 * JavaScript an English visitor keeps the Bulgarian page with a usable nav,
 * which is exactly what shipped before this component existed.
 */
/** Never fires — the path a 404 rendered for changes only with a new load. */
const subscribeToNothing = () => () => {};

export function NotFoundView({ bg, en }: { bg: NotFoundPayload; en: NotFoundPayload }) {
  // The dead URL's own locale; "bg" during SSR, where there is no URL to read.
  const locale = useSyncExternalStore<Locale>(
    subscribeToNothing,
    () => (window.location.pathname.startsWith("/en") ? "en" : "bg"),
    () => "bg",
  );

  useEffect(() => {
    // The document rendered without the locale layout, so nothing else set
    // this; a screen reader on the English 404 needs it to switch voices.
    document.documentElement.lang = locale;
  }, [locale]);

  const { nav, ui, footer, initiatives, copy } = locale === "en" ? en : bg;
  // nav.cta points at a site path ("/join"); a locale prefix makes it real.
  const ctaHref = nav.cta.href.startsWith("/") ? `/${locale}${nav.cta.href}` : nav.cta.href;

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {ui.skipToContent}
      </a>
      <PatternRail locale={locale} />

      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        {/* `path` is what the language toggle rewrites. There is no locale
            counterpart of a page that does not exist, so it points at the home
            route: switching language from here takes you somewhere real rather
            than to the same 404 in the other language. */}
        <SiteNav nav={nav} ui={ui} locale={locale} path="" initiatives={initiatives} />

        <main id="main" tabIndex={-1} className="bdc-stop-11 flex flex-col justify-center py-24 md:min-h-[64svh] md:py-32">
          <div className="flex max-w-[62ch] flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
              <span className="t-caption">{copy.markLabel}</span>
            </div>

            <h1 className="t-h01">{copy.heading}</h1>

            <p className="t-body max-w-[52ch]">{copy.body}</p>

            {/* The way out is joining, not the home page. Someone who has hit a
                dead end is already looking for a reason to stay, and the one
                thing the council actually wants from a visitor is membership —
                so it gets the button, and the only one. Home is the logo in
                the nav above, which is where anyone looks for it. The href is
                nav.cta's, so the landing page's address lives in one place. */}
            <div className="mt-2 flex flex-col items-start gap-6">
              <p className="t-body-lg max-w-[46ch]">{copy.ctaLead}</p>
              <Button href={ctaHref} variant="primary">
                {nav.cta.label}
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* No brand strip here: <SiteFooter/> draws one across its own top edge
          already, and a second put two 12px bands above the footer. */}
      <SiteFooter footer={footer} locale={locale} />
    </>
  );
}
