import { Logo } from "@/components/ui/Logo";
import { Instagram, LinkedIn } from "@/components/ui/icons";
import { footer } from "@/lib/home-content";

/* Full-width dark footer. Sits above the fixed pattern rail (z-30) so the rail
   visually ends here, matching the Figma frame. */
export function SiteFooter() {
  return (
    <footer
      id="footer"
      className="relative z-30 bg-dark text-text-invert"
      style={{ paddingInline: "var(--page-gutter)" }}
    >
      <div className="bdc-grid gap-y-20 py-24 md:py-32">
        <div className="col-span-4 md:col-span-4 lg:col-span-7">
          <Logo variant="white" className="h-10 w-auto" />
          <p className="t-caption mt-20 max-w-md">{footer.copyright}</p>
        </div>

        <div className="col-span-4 flex flex-col gap-4 md:col-span-4 lg:col-span-4 lg:items-start">
          <p className="t-caption font-bold">{footer.contactHeading}</p>
          <a href={`tel:${footer.phone.replace(/\s/g, "")}`} className="t-caption hover:opacity-70">
            {footer.phone}
          </a>
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
    </footer>
  );
}
