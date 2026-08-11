/**
 * Contact — /bg/contact, /en/contact.
 *
 * Four routes in, each labelled with what it is for, then the registration
 * details and the social accounts. There is no form: nothing in this codebase
 * collects submissions, and the membership and volunteering forms are hosted
 * externally — so this page names the right door rather than pretending to be it.
 *
 * Same shell as the other standalone pages.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getContent, hasLocale } from "@/lib/home-content";
import { CONTACT_COPY, CONTACT_EMAIL, PARTNERSHIP_MAILTO } from "@/lib/contact";
import { VOLUNTEER_FORM_URL } from "@/lib/volunteer";

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

  // Which destination each channel's button goes to. Kept here rather than in
  // the copy module so the copy stays translatable text and the URLs stay in
  // one place — the membership form is the same one the nav CTA uses.
  const hrefFor = (kind: "email" | "member" | "volunteer", index: number) => {
    if (kind === "member") return c.nav.cta.href;
    if (kind === "volunteer") return `/${locale}/volunteer`;
    // The second email channel is the partnership one, with its subject line.
    return index === 0 ? `mailto:${CONTACT_EMAIL}` : PARTNERSHIP_MAILTO;
  };

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>
      <PatternRail />

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
          <div className="flex max-w-[1056px] flex-col gap-12">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-band)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.eyebrow}</span>
            </div>

            <h1 className="t-h01 max-w-[732px]">{copy.title}</h1>

            <hr className="border-0 border-t border-border" />

            <p className="t-h05 max-w-[540px]">{copy.lead}</p>
          </div>

          {/* ---- The four doors ---- */}
          <section className="mt-20 flex max-w-[1056px] flex-col gap-8 md:mt-24">
            <h2 className="t-h02">{copy.channelsHeading}</h2>

            <ul className="flex flex-col">
              {copy.channels.map((ch, i) => (
                <li
                  key={ch.label}
                  className="grid gap-4 border-t border-border py-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8"
                >
                  <div className="flex flex-col gap-2">
                    <span className="t-h05">{ch.label}</span>
                    <span className="t-body max-w-[540px]">{ch.detail}</span>
                  </div>
                  <Button href={hrefFor(ch.kind, i)} variant="small">
                    {ch.action}
                  </Button>
                </li>
              ))}
              <li className="border-t border-border" aria-hidden />
            </ul>

            <p className="t-body max-w-[540px]">{copy.responseNote}</p>
          </section>

          {/* ---- Registration details ---- */}
          <section className="mt-20 flex max-w-[1056px] flex-col gap-8 md:mt-24">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-accent)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.detailsLabel}</span>
            </div>
            <h2 className="t-h02">{copy.detailsHeading}</h2>

            <dl className="flex max-w-[732px] flex-col">
              {copy.detailsRows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 border-t border-border py-4 md:grid-cols-[16rem_1fr] md:gap-8"
                >
                  <dt className="t-caption">{row.label}</dt>
                  <dd className="t-body">{row.value}</dd>
                </div>
              ))}
              <div className="border-t border-border" aria-hidden />
            </dl>
          </section>

          {/* ---- Social, from the footer's own list so the two cannot drift ---- */}
          <section className="mt-20 flex max-w-[516px] flex-col items-start gap-6 md:mt-24">
            <h2 className="t-h02">{copy.socialHeading}</h2>
            <ul className="flex flex-wrap gap-4">
              {c.footer.social.map((s) => (
                <li key={s.label}>
                  <Button href={s.href} variant="small">
                    {s.label}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>

      <div className="relative z-30 flex h-3" aria-hidden>
        <span className="w-[8.55%]" style={{ background: "var(--tri-accent)" }} />
        <span className="w-[36.75%]" style={{ background: "var(--tri-band)" }} />
        <span className="flex-1" style={{ background: "var(--tri-ground)" }} />
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
