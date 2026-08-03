import { Logo } from "@/components/ui/Logo";
import { CarbonBadge } from "@/components/ui/CarbonBadge";
import { WebsiteCarbonBadge } from "@/components/ui/WebsiteCarbonBadge";
import { Facebook, Instagram, LinkedIn } from "@/components/ui/icons";
import type { Locale, SiteContent } from "@/lib/home-content";

/* Full-width dark footer (Figma 454:2445). Sits above the fixed pattern rail
   (z-30) so the rail visually ends here, matching the Figma frame.

   Three rows on a 12-column grid: the identity block at 1–5, the sustainability
   figures at 7–9, contacts at 10–12; a hairline; then copyright and the two
   policy links on one baseline. */

/**
 * Icons keyed by the label in `footer.social`, not by array position.
 *
 * The previous version indexed `social[0]` and `social[1]` and hardcoded an
 * Instagram and a LinkedIn glyph beside them, so reordering the content array
 * — or adding a third network, which is exactly what happened — silently put
 * the wrong mark next to the wrong link. Keying by label means content decides
 * both the order and the set, and an unrecognised network renders as a plain
 * text link rather than as somebody else's logo.
 */
const SOCIAL_ICONS: Record<string, typeof LinkedIn | undefined> = {
  LinkedIn,
  Instagram,
  Facebook,
};

/**
 * The "|" that precedes each legal line is a drawn separator in the Figma, not
 * punctuation. aria-hidden so a screen reader does not read "vertical line"
 * before every link. Defined at module scope rather than inside the component:
 * a function created during render is a new component type on every render,
 * which remounts its subtree instead of updating it.
 */
const Bar = () => (
  <span aria-hidden className="mr-2 opacity-40">
    |
  </span>
);

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
        <div className="bdc-grid gap-y-16 md:gap-y-20">
          {/* identity — logo, the heritage statement, the registration code */}
          <div className="col-span-4 flex flex-col gap-8 md:col-span-8 lg:col-span-5">
            {/* self-start is load-bearing: this column is `flex flex-col`, whose
                default align-items is `stretch`, and that overrides `w-auto` on
                an <img> — the mark gets pulled to the full column width and the
                wordmark distorts. */}
            <Logo variant="white" locale={locale} className="h-10 w-auto self-start" />

            <div className="flex flex-col gap-3">
              <p className="t-caption font-bold">{footer.heritage.heading}</p>
              <p className="t-caption max-w-[46ch] opacity-80">{footer.heritage.body}</p>
            </div>

            <p className="t-caption opacity-70">
              <Bar />
              {footer.uic}
            </p>
          </div>

          {/* sustainability — the columns the policy links vacated */}
          <div className="col-span-4 flex flex-col gap-6 md:col-span-4 lg:col-start-7 lg:col-span-3">
            <CarbonBadge carbon={footer.carbon} locale={locale} />
            {/* The vendor's own mark, in its own colours. self-start so the
                flex column does not stretch it across the grid track. */}
            <div className="self-start">
              <WebsiteCarbonBadge />
            </div>
          </div>

          {/* contacts */}
          <div className="col-span-4 flex flex-col gap-6 md:col-span-4 lg:col-start-10 lg:col-span-3">
            <p className="t-caption font-bold">{footer.contactHeading}</p>
            <a
              href={`mailto:${footer.email}`}
              className="t-caption border-b-2 border-transparent transition-colors hover:border-current"
            >
              {footer.email}
            </a>

            <ul className="flex flex-col gap-4">
              {footer.social.map((s) => {
                const Icon = SOCIAL_ICONS[s.label];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2"
                    >
                      {/* Decorative — the label beside it is the accessible
                          name, so announcing the mark too would say it twice. */}
                      {Icon && <Icon aria-hidden className="h-6 w-6 shrink-0" />}
                      <span className="t-caption border-b-2 border-transparent transition-colors group-hover:border-current">
                        {s.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* hairline (454:2480) */}
        <div className="mt-20 h-px w-full bg-current opacity-30" aria-hidden />

        {/* copyright and the policy links on one baseline */}
        <div className="bdc-grid mt-10 gap-y-4">
          <p className="t-caption col-span-4 md:col-span-8 lg:col-span-5">{footer.copyright}</p>

          <a
            href={`/${locale}/accessibility`}
            className="t-caption col-span-4 justify-self-start md:col-span-4 lg:col-start-7 lg:col-span-3"
          >
            <Bar />
            <span className="border-b-2 border-transparent transition-colors hover:border-current">
              {footer.accessibility}
            </span>
          </a>

          <a
            href={`/${locale}/privacy`}
            className="t-caption col-span-4 justify-self-start md:col-span-4 lg:col-start-10 lg:col-span-3"
          >
            <Bar />
            <span className="border-b-2 border-transparent transition-colors hover:border-current">
              {footer.privacy}
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
