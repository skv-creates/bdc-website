/**
 * Contact — /bg/contact, /en/contact (Figma 643:3969).
 *
 * Three movements, per the frame: the invitation — «Контакт», "Идеите
 * започват с разговор.", the lead on the left and the mailbox block on the
 * right, headed "Най-прекият път до нас" with the pointer mark; the three
 * directions under «Избери посока» — partnership, membership,
 * volunteering — each a bordered column closing with a row CTA; and the
 * Council's official details in ruled rows, the privacy note beside them.
 *
 * There is no form here on purpose: /partner carries the one form this
 * codebase owns, and membership applies on its own page. The pattern rail
 * renders after the content, as on the other conversion-adjacent pages.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getContent, hasLocale } from "@/lib/home-content";
import { CONTACT_COPY } from "@/lib/contact";

/** The corner triangle prefixing the mailbox label — the site's LabelMark. */
function LabelMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <polygon points="1,3 15,3 1,17" fill="currentColor" />
    </svg>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = CONTACT_COPY[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/contact"),
    openGraph: openGraphBase(
      locale,
      "/contact",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = CONTACT_COPY[locale];

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>

      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        <SiteNav
          nav={c.nav}
          ui={c.ui}
          locale={locale}
          path="/contact"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[72px] md:pt-[120px]">
          {/* The invitation (643:3976): eyebrow, the two-line display title,
              the lead left and the mailbox block right. */}
          <section className="bdc-grid gap-y-12">
            <div className="col-span-full flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--bdc-tomato)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.eyebrow}</span>
            </div>

            <h1 className="t-h01 col-span-full lg:col-span-8">{copy.title}</h1>

            <p className="t-body col-span-full lg:col-span-6">{copy.lead}</p>

            {/* The mailbox (643:4065): pointer label, the address, the
                promise — a ruled block in the right columns. */}
            <div className="col-span-full flex flex-col gap-4 border-t border-border pt-3 lg:col-span-5 lg:col-start-7 lg:row-start-3">
              <span className="t-label inline-flex items-center gap-3 font-bold">
                <LabelMark />
                {copy.reach.label}
              </span>
              {/* mailto is silent on a machine with no mail app configured —
                  the copy button beside it is the path that always works. */}
              <span className="t-body inline-flex items-center gap-2 self-start">
                <a href={`mailto:${c.footer.email}`} className="group [overflow-wrap:anywhere]">
                  <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                    {c.footer.email}
                  </span>
                </a>
                <CopyEmail
                  email={c.footer.email}
                  label={c.ui.copyEmail}
                  copiedLabel={c.ui.copied}
                />
              </span>
              <p className="t-body">{copy.reach.note}</p>
            </div>
          </section>

          {/* The three directions (643:3984). */}
          <section className="mt-20 flex flex-col gap-12 md:mt-24">
            <div className="flex max-w-[684px] flex-col gap-8">
              <div className="flex items-center gap-3">
                <span
                  className="h-2 w-4 shrink-0"
                  style={{ background: "var(--bdc-tomato)" }}
                  aria-hidden
                />
                <span className="t-caption">{copy.routesEyebrow}</span>
              </div>
              <h2 className="t-h02">{copy.routesHeading}</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {copy.routes.map((r) => {
                const href = `/${locale}${r.href}`;
                return (
                  <div key={r.title} className="flex flex-col gap-4 border-t border-border pt-3">
                    <h3 className="t-h04">
                      <a
                        href={href}
                        className="border-b-2 border-transparent transition-colors hover:border-current"
                      >
                        {r.title}
                      </a>
                    </h3>
                    <p className="t-body">{r.body}</p>
                    {/* The tertiary button closes each column — quiet at
                        rest, the full-row underline on hover, like every
                        tertiary across the site. */}
                    <div className="mt-auto pt-4">
                      <Button variant="tertiary" href={href} fullWidth>
                        {r.label}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* The official details (643:4020): the privacy note beside the
              registration in ruled rows. */}
          <section className="mt-20 flex flex-col gap-12 md:mt-24">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--bdc-tomato)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.legalEyebrow}</span>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
              <div className="flex flex-col gap-4 lg:w-[330px] lg:shrink-0">
                <p className="t-body font-bold">{copy.privacyNote}</p>
                <Button variant="tertiary" href={`/${locale}/privacy`} className="self-start">
                  {copy.privacyLabel}
                </Button>
              </div>

              <div className="flex max-w-[704px] flex-1 flex-col gap-5">
                <p className="t-h05 font-bold">{copy.orgName}</p>
                {/* Halves, not a fixed label column: a 360px label inside a
                    column that narrows with the viewport left the value a
                    sliver and broke the address one word per line. */}
                <div className="grid gap-2 border-y border-border py-3 md:grid-cols-2 md:items-center md:gap-8">
                  <p className="t-body">{copy.orgStatus}</p>
                  <p className="t-body">{copy.orgUic}</p>
                </div>
                <div className="grid gap-2 md:grid-cols-2 md:gap-8">
                  <p className="t-label">{copy.addressLabel}</p>
                  <p className="t-body">
                    {copy.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* After the content on purpose — see the membership pages. */}
      <PatternRail locale={locale} />

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
