import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { GridOverlay } from "@/components/GridOverlay";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteNav } from "@/components/sections/SiteNav";
import { Hero } from "@/components/sections/Hero";
import { Initiatives } from "@/components/initiatives/Initiatives";
import { Mission } from "@/components/sections/Mission";
import { Team } from "@/components/sections/Team";
import { Quote } from "@/components/sections/Quote";
import { Faq } from "@/components/sections/Faq";
import { SiteFooter } from "@/components/sections/SiteFooter";
// Temporarily hidden — kept for later reuse:
// import { Events } from "@/components/sections/Events";
// import { About } from "@/components/sections/About";
// import { Cta } from "@/components/sections/Cta";

/**
 * Home page. Two layers:
 *   1. <PatternRail/> — fixed, full-height, parallaxing rail on the right.
 *   2. content column — padded on the end so it clears the rail; the
 *      full-width footer paints above the rail (z-30) so the rail ends there.
 */
export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        Прескочи към съдържанието
      </a>
      {/* iOS: paint the status-bar safe area white, anchored to the true viewport
          top, so page content never peeks above the sticky nav. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 bg-page"
        style={{ height: "env(safe-area-inset-top)" }}
      />
      <SmoothScroll />
      {process.env.NODE_ENV !== "production" && <GridOverlay />}
      <PatternRail />

      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-gap))",
        }}
      >
        <SiteNav />
        <main id="main" tabIndex={-1}>
          <Hero />
          <Initiatives />
          <Mission />
          <Team />
          <Quote />
          <Faq />
          {/* Temporarily hidden — to be reused later:
          <Events /> <About /> <Cta /> */}
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
