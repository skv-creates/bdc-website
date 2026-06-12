import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { GridOverlay } from "@/components/GridOverlay";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteNav } from "@/components/sections/SiteNav";
import { Hero } from "@/components/sections/Hero";
import { Initiatives } from "@/components/initiatives/Initiatives";
import { Mission } from "@/components/sections/Mission";
import { Team } from "@/components/sections/Team";
import { Quote } from "@/components/sections/Quote";
import { SiteFooter } from "@/components/sections/SiteFooter";
// Temporarily hidden — kept for later reuse:
// import { Events } from "@/components/sections/Events";
// import { About } from "@/components/sections/About";
// import { Faq } from "@/components/sections/Faq";
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
        <main>
          <Hero />
          <Initiatives />
          <Mission />
          <Team />
          <Quote />
          {/* Temporarily hidden — to be reused later:
          <Events /> <About /> <Faq /> <Cta /> */}
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
