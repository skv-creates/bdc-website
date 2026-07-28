import { Logo } from "@/components/ui/Logo";
import { Instagram, LinkedIn } from "@/components/ui/icons";
import type { Locale, SiteContent } from "@/lib/home-content";

/* Full-width dark footer. Sits above the fixed pattern rail (z-30) so the rail
   visually ends here, matching the Figma frame. */
export function SiteFooter({
  footer,
  locale,
}: {
  footer: SiteContent["footer"];
  locale: Locale;
}) {
  return (
    <footer
      id="footer"
      className="relative z-30 bg-dark text-text-invert"
      style={{
        // match the page content grid (gutter left, rail+gap right) so the
        // footer columns line up with the rest of the page
        paddingInlineStart: "var(--page-gutter)",
        paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
      }}
    >
      <div className="py-24 md:py-32">
        {/* top row — logo | contacts */}
        <div className="bdc-grid gap-y-20">
          <div className="col-span-4 md:col-span-4 lg:col-span-7">
            <Logo variant="white" locale={locale} className="h-10 w-auto" />
          </div>

          <div className="col-span-4 flex flex-col gap-4 md:col-span-4 lg:col-start-9 lg:col-span-4 lg:items-start">
            <p className="t-caption font-bold">{footer.contactHeading}</p>
            <a href={`mailto:${footer.email}`} className="t-caption hover:opacity-70">
              {footer.email}
            </a>
            <div className="mt-2 flex gap-3">
              <a href={footer.social[0].href} aria-label="Instagram" className="hover:opacity-70">
                <Instagram className="h-6 w-6" />
              </a>
              <a href={footer.social[1].href} aria-label="LinkedIn" className="hover:opacity-70">
                <LinkedIn className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* bottom row — copyright left, privacy link sharing the contacts column
            so the two sit on one baseline (Figma 29:257). */}
        <div className="bdc-grid mt-20 gap-y-4">
          <p className="t-caption col-span-4 max-w-md md:col-span-4 lg:col-span-7">
            {footer.copyright}
          </p>
          <a
            href={`/${locale}/privacy`}
            className="t-caption col-span-4 justify-self-start border-b-2 border-transparent transition-colors hover:border-current md:col-span-4 lg:col-start-9 lg:col-span-4"
          >
            {footer.privacy}
          </a>
        </div>
      </div>
    </footer>
  );
}
