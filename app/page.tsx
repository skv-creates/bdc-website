import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteNav } from "@/components/sections/SiteNav";
import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { Events } from "@/components/sections/Events";
import { About } from "@/components/sections/About";
import { Team } from "@/components/sections/Team";
import { Quote } from "@/components/sections/Quote";
import { Faq } from "@/components/sections/Faq";
import { Cta } from "@/components/sections/Cta";
import { SiteFooter } from "@/components/sections/SiteFooter";

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
          <Mission />
          <Events />
          <About />
          <Team />
          <Quote />
          <Faq />
          <Cta />
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
