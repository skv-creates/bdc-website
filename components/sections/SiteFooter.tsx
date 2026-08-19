import { Logo } from "@/components/ui/Logo";
import { CarbonBadge } from "@/components/ui/CarbonBadge";
import { WebsiteCarbonBadge } from "@/components/ui/WebsiteCarbonBadge";
import { Facebook, Instagram, LinkedIn } from "@/components/ui/icons";
import type { Locale, SiteContent } from "@/lib/home-content";

/* Full-width dark footer (Figma 454:2445). Sits above the fixed pattern rail
   (z-30) so the rail visually ends here, matching the Figma frame.

   Three rows on a 12-column grid. Row 1: the identity block at 1–5, contacts
   at 7–9, the policy links at 10–12. Row 2: a hairline. Row 3: copyright at
   1–5, the green-hosting mark at 7–9, the Website Carbon badge at 10–12.

   The sustainability figures sit on the bottom line with the copyright rather
   than up in the columns: they are provenance about the site itself, the same
   kind of thing as the year and the rights notice, not a section of it. */

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
    <>
      {/* Brand strip closing the page, its splits following the page grid — the
          same rule as the overlay's (see .overlay-strip in globals.css).

          It lives here rather than on each page. The initiative route had its
          own copy and every other route simply went without, which is how a
          detail like this goes missing: nothing fails, it is just absent. Part
          of the footer, it arrives wherever the footer does.

          Outside <footer> so it stays full-bleed — the footer element carries
          the page's gutter padding, and a child would be inset by it. */}
      <div className="overlay-strip relative z-30 flex" aria-hidden>
        <div className="strip-1 h-3" />
        <div className="strip-2 h-3" />
        <div className="strip-3 h-3" />
      </div>

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

              {/* Registration code, then the statute it belongs to. They sit
                  together because they answer the same question — is this a
                  real, registered organisation — and the statute was reachable
                  only from the About page until now.

                  The code keeps its 70% opacity; the link does not, because a
                  dimmed link on a dark ground is the one thing here that has to
                  read as clickable. Underline on an inner inline span, the same
                  as the policy links below: on the anchor it is a 2px border on
                  a block box and adds 2px to the column height. */}
              {/* The status in words before the registry code: "non-profit,
                  registered" is what a reader — or an Ad Grants reviewer —
                  actually needs; the ЕИК alone reads as a number. */}
              <p className="t-caption max-w-[46ch]">{footer.legalStatus}</p>

              <p className="t-caption flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center opacity-70">
                  <Bar />
                  {footer.uic}
                </span>
                <span aria-hidden className="opacity-40">
                  ·
                </span>
                <a href={`/${locale}/statute`} className="group">
                  <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                    {footer.statute}
                  </span>
                </a>
                <span aria-hidden className="opacity-40">
                  ·
                </span>
                <a href={`/${locale}/about`} className="group">
                  <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                    {footer.about}
                  </span>
                </a>
              </p>
            </div>

            {/* Source order follows visual order, left to right. It has to:
                grid auto-placement advances a cursor, so a col-start-10 item
                declared first pushes a later col-start-7 onto a new row — which
                is exactly what happened when these two were swapped by changing
                only the column numbers. It is also the order a keyboard user
                tabs through, which should match what they see. */}
            {/* contacts */}
            {/* gap-8, matching the policies column beside it and the Figma's
                32px. The two columns are read across as well as down — the
                heading, then the first item, then the second — so a different
                vertical rhythm in each makes the rows visibly fail to line up
                even though every element is in the right column. */}
            <div className="col-span-4 flex flex-col gap-8 md:col-span-4 lg:col-start-6 lg:col-span-4 xl:col-start-7 xl:col-span-3">
              <p className="t-caption font-bold">{footer.contactHeading}</p>
              {/* The underline lives on an inner inline span, not on the anchor.
                  On the anchor it is a 2px border on a block box and adds 2px to
                  the column's height, which walked everything below it out of
                  line with the policies column beside it. Inline, it draws in the
                  same place and costs no layout. */}
              {/* overflow-wrap:anywhere, because an email address has no spaces
                  to break at. Without it the address simply runs past its column
                  and prints on top of the policies beside it — which is what it
                  did at every width below about 1280px. */}
              <a
                href={`mailto:${footer.email}`}
                className="t-caption group [overflow-wrap:anywhere]"
              >
                <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                  {footer.email}
                </span>
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
                        {/* -mb-0.5 gives back the 2px the border adds. Here the
                            anchor is a flex row, so the span is a flex item and
                            its border does count toward the row height — without
                            this each social row is 26px against the 24px of the
                            policy links opposite. */}
                        {/* No ↗ here. The mark beside the name already says
                            where the link goes, and three arrows in a stack
                            read as clutter rather than as information. The
                            hidden wording stays: a screen-reader user has no
                            logo to look at, so it is the only thing telling
                            them the link leaves the site. */}
                        <span className="t-caption -mb-0.5 border-b-2 border-transparent transition-colors group-hover:border-current">
                          {s.label}
                          <span className="sr-only"> {footer.newWindow} </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            {/* policies (454:2463) */}
            <div className="col-span-4 flex flex-col gap-8 md:col-span-4 lg:col-start-10 lg:col-span-3">
              <p className="t-caption font-bold">{footer.policiesHeading}</p>
              <a href={`/${locale}/privacy`} className="t-caption group self-start">
                <Bar />
                <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                  {footer.privacyShort}
                </span>
              </a>
              <a href={`/${locale}/accessibility`} className="t-caption group self-start">
                <Bar />
                <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                  {footer.accessibilityShort}
                </span>
              </a>
            </div>

          </div>

          {/* hairline (454:2480) */}
          <div className="mt-20 h-px w-full bg-current opacity-30" aria-hidden />

          {/* copyright, then the two sustainability marks (462:1490, 462:1480) */}
          <div className="bdc-grid mt-10 items-start gap-y-8">
            <p className="t-caption col-span-4 md:col-span-8 lg:col-span-5">{footer.copyright}</p>

            <div className="col-span-4 md:col-span-4 lg:col-start-6 lg:col-span-4 xl:col-start-7 xl:col-span-3">
              <CarbonBadge carbon={footer.carbon} newWindow={footer.newWindow} />
            </div>

            {/* The Figma places a screenshot of the badge here; this renders the
                real one, which fills in from Website Carbon's own API. */}
            {/* The badge is a fixed-size widget that wraps into two stacked
                halves the moment its track is narrower than it is, so its size
                is stepped to the track rather than left at the vendor default.
                Measured intrinsic width against measured track width:

                  lg  1024–1279  track 200–254px   11px needs 191px
                  xl  1280–1535  track 255–309px   14px needs 241px
                  2xl 1536+      track 310px+      15px needs 257px

                which is also why 15px was wrong everywhere below 1536: their
                default has never fitted a three-column track on this grid.
                Below lg the column is half the page or more, so the 15px
                fallback in the component stands. */}
            <div className="col-span-4 md:col-span-4 lg:col-start-10 lg:col-span-3 lg:[--wcb-size:11px] xl:[--wcb-size:14px] 2xl:[--wcb-size:15px]">
              <WebsiteCarbonBadge />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
