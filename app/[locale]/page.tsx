import { notFound } from "next/navigation";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { GridOverlay } from "@/components/GridOverlay";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteNav } from "@/components/sections/SiteNav";
import { Hero } from "@/components/sections/Hero";
import { Initiatives } from "@/components/initiatives/Initiatives";
import { Activities } from "@/components/sections/Activities";
import { Mission } from "@/components/sections/Mission";
import { Team } from "@/components/sections/Team";
import { Quote } from "@/components/sections/Quote";
import { Faq } from "@/components/sections/Faq";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { getContent, hasLocale } from "@/lib/home-content";
// Temporarily hidden — kept for later reuse:
// import { Events } from "@/components/sections/Events";
// import { About } from "@/components/sections/About";
// import { Cta } from "@/components/sections/Cta";

/**
 * Home page. Two layers:
 *   1. <PatternRail/> — fixed, full-height, parallaxing rail on the right.
 *   2. content column — padded on the end so it clears the rail; the
 *      full-width footer paints above the rail (z-30) so the rail ends there.
 *
 * All copy is resolved once here (server-side) from the active locale and
 * threaded into each section as props — so the client bundle never ships both
 * languages, and server/client sections share one mechanism.
 */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>
      <SmoothScroll />
      {process.env.NODE_ENV !== "production" && <GridOverlay />}
      <PatternRail />

      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} />
        <main id="main" tabIndex={-1}>
          <Hero hero={c.hero} />
          {/* Mission reads as the second half of the opening statement, so it
              sits directly under the hero rather than further down the page. */}
          <Mission mission={c.mission} />
          <Initiatives initiatives={c.initiatives} ui={c.ui} locale={locale} />
          <Activities locale={locale} heading={c.activities.heading} />
          <Team team={c.team} />
          <Quote quote={c.quote} />
          <Faq faq={c.faq} />
          {/* Temporarily hidden — to be reused later:
          <Events /> <About /> <Cta /> */}
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
