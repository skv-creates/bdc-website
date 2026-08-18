/**
 * 404 — shown for any address under /bg or /en that does not resolve, and for
 * every `notFound()` a page throws: an unknown event slug, an unpublished
 * initiative, a locale that is neither bg nor en.
 *
 * Until now this was Next's own default — white page, "404 This page could not
 * be found", no brand, no way onward. On a site whose most-shared URLs are
 * event pages, which get mistyped, truncated by mail clients and outlive their
 * slugs, that is a page real visitors land on.
 *
 * ── One language, and why ─────────────────────────────────────────────────
 *
 * It renders `defaultLocale`. Not a preference — the page cannot know the
 * locale. A not-found component receives no props (the Next docs are explicit
 * that neither it nor global-not-found does), and it does not render inside
 * app/[locale]/layout.tsx either: this app's root layout sits under a dynamic
 * [locale] segment, so for an unmatched URL Next has no layout to compose and
 * falls back to a bare <html id="__next_error__"> of its own. Verified rather
 * than assumed — /bg/nope, /bg/events/does-not-exist and /bg/initiatives/nope
 * all render that way, with no lang attribute on the document.
 *
 * That rules out the rest. `headers()` would make the route dynamic, and every
 * page here is prerendered on purpose. `usePathname()` needs a client
 * component and shows the wrong language without JavaScript. Keying off <html
 * lang> in CSS was built and thrown away, because there is no lang to key off.
 *
 * So: Bulgarian, which is the default locale and the sitemap's x-default. An
 * English visitor on a dead URL gets a Bulgarian 404 with a nav they can use —
 * a good deal better than Next's untranslated default, which is what they got
 * before.
 *
 * Because the layout is not in play, this file supplies what the layout
 * normally would: the font variable class (see lib/fonts.ts) and the nav and
 * footer, which are ordinary components and only need a locale to render.
 *
 * Next injects <meta name="robots" content="noindex"> on 404s itself.
 */
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { aboutBeige } from "@/lib/fonts";
import { getContent, defaultLocale } from "@/lib/home-content";
import { NOT_FOUND } from "@/lib/not-found-content";

export default function NotFound() {
  const locale = defaultLocale;
  const c = getContent(locale);
  const copy = NOT_FOUND[locale];

  return (
    <div className={aboutBeige.variable}>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>
      <PatternRail />

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
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="" initiatives={c.initiatives} />

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
                nav.cta's, so the form's address lives in one place. */}
            <div className="mt-2 flex flex-col items-start gap-6">
              <p className="t-body-lg max-w-[46ch]">{copy.ctaLead}</p>
              <Button href={c.nav.cta.href} variant="primary">
                {c.nav.cta.label}
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* No brand strip here: <SiteFooter/> draws one across its own top edge
          already, and a second put two 12px bands above the footer. */}
      <SiteFooter footer={c.footer} locale={locale} />
    </div>
  );
}
