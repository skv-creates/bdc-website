/**
 * Full initiative page — the target of a hard navigation (shared link, refresh,
 * or no-JS). Soft navigation from the home carousel is intercepted by the
 * sibling @modal/(.)initiatives/[slug] route and shown as an overlay instead.
 *
 * Unlike the event page, this one carries site chrome (rail + nav + footer),
 * following app/[locale]/privacy/page.tsx rather than wrapping the body in
 * <OverlayPanel/>. Long-form initiative copy is something people land on cold
 * from a link, and a bare panel leaves them with no way into the rest of the
 * site. Events still use the panel-only convention — see the note in
 * app/[locale]/events/[slug]/page.tsx if the two are ever reconciled.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { InitiativeOverlayContent } from "@/components/ui/InitiativeOverlayContent";
import { getContent, getInitiative, getInitiativeSlugs, hasLocale } from "@/lib/home-content";

export async function generateStaticParams() {
  return getInitiativeSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};
  const initiative = getInitiative(locale, slug);
  if (!initiative) return {};
  return {
    title: initiative.title,
    // The standfirst reads better as a description than the card blurb, when
    // long-form copy exists.
    description: initiative.detail?.lead ?? initiative.text,
  };
}

export default async function InitiativePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const initiative = getInitiative(locale, slug);
  if (!initiative) notFound();
  const c = getContent(locale);

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>
      <PatternRail />

      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))",
        }}
      >
        {/* `path` keeps the nav's "#..." links pointing back at the home route
            and holds the language toggle on this initiative — which only works
            because slugs are locale-neutral. */}
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path={`/initiatives/${slug}`} />

        <main id="main" tabIndex={-1} className="py-16 md:py-20">
          <InitiativeOverlayContent initiative={initiative} variant="page" />
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
