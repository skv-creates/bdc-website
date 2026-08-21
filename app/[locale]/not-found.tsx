/**
 * 404 — shown for any address under /bg or /en that does not resolve, and for
 * every `notFound()` a page throws: an unknown event slug, an unpublished
 * initiative, a locale that is neither bg nor en.
 *
 * ── Locale, and how it is known ───────────────────────────────────────────
 *
 * A not-found component receives no props (the Next docs are explicit that
 * neither it nor global-not-found does), and it does not render inside
 * app/[locale]/layout.tsx either: this app's root layout sits under a dynamic
 * [locale] segment, so for an unmatched URL Next has no layout to compose and
 * falls back to a bare <html id="__next_error__"> of its own. `headers()`
 * would make the route dynamic, and every page here is prerendered on
 * purpose.
 *
 * So the server renders Bulgarian — the default locale, the sitemap's
 * x-default — and NotFoundView switches itself (and the document's lang) to
 * English after hydration when the path starts with /en. Without JavaScript
 * an English visitor keeps the Bulgarian page with a usable nav, which is
 * what always shipped; with it, the 404 finally answers in the language the
 * dead URL was in.
 *
 * Both locales' content therefore travel to the client, trimmed: the
 * initiative details are the bulk of `initiatives` and nothing in the nav or
 * the mega menu reads them.
 *
 * Because the layout is not in play, this file supplies what the layout
 * normally would: the font variable class (see lib/fonts.ts). Next injects
 * <meta name="robots" content="noindex"> on 404s itself.
 */
import { aboutBeige } from "@/lib/fonts";
import { getContent, type Locale, type SiteContent } from "@/lib/home-content";
import { NOT_FOUND } from "@/lib/not-found-content";
import { NotFoundView, type NotFoundPayload } from "@/components/NotFoundView";

/** One locale's slice of content, with the initiative details left behind. */
function payload(locale: Locale): NotFoundPayload {
  const c = getContent(locale);
  const initiatives: SiteContent["initiatives"] = {
    ...c.initiatives,
    items: c.initiatives.items.map(({ detail: _detail, ...rest }) => rest),
  };
  return { nav: c.nav, ui: c.ui, footer: c.footer, initiatives, copy: NOT_FOUND[locale] };
}

export default function NotFound() {
  return (
    <div className={aboutBeige.variable}>
      <NotFoundView bg={payload("bg")} en={payload("en")} />
    </div>
  );
}
