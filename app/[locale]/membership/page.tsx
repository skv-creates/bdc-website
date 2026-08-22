/**
 * Membership — /bg/membership, /en/membership.
 *
 * The membership explainer and the application on one page: who can join,
 * the two categories side by side, what membership commits you to, how
 * admission works, how decisions are made — the statute in plain public
 * language — and the Tally form embedded at the foot, where every
 * membership button on the site lands (#apply). The statute itself is the
 * only official source the page points to; the closing line under the
 * form says the page summarises and does not replace it.
 *
 * The form sits last on purpose: TallyEmbed grows downward as its steps
 * need room, and at the end of the document that growth extends the page
 * below the visitor's hands instead of reflowing anything they can see.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { TallyEmbed } from "@/components/ui/TallyEmbed";
import { getContent, hasLocale } from "@/lib/home-content";
import { MEMBERSHIP_FORM_ID } from "@/lib/tally";
import { MEMBERSHIP_COPY } from "@/lib/membership";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = MEMBERSHIP_COPY[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/membership"),
    openGraph: openGraphBase(
      locale,
      "/membership",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = MEMBERSHIP_COPY[locale];
  const statuteHref = `/${locale}/statute`;

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
          path="/membership"
          initiatives={c.initiatives}
        />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[72px] md:pt-[120px]">
          {/* The head: eyebrow, title, the invitation, the one action. */}
          <div className="flex max-w-[1056px] flex-col gap-12">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-band)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.eyebrow}</span>
              <span aria-hidden className="opacity-40">
                ·
              </span>
              <span className="t-caption font-bold">{copy.timeNote}</span>
            </div>

            <h1 className="t-h01 max-w-[732px]">{copy.title}</h1>

            <hr className="border-0 border-t border-border" />

            <p className="t-h05 max-w-[620px]">{copy.lead}</p>

            <p className="t-body max-w-[540px]">{copy.body}</p>

            {/* ↓ because the application is on this page, at the foot. */}
            <Button href="#apply" variant="primary" className="self-start">
              {copy.applyCta} ↓
            </Button>
          </div>

          {/* Who can join — the two kinds of member, side by side. */}
          <section className="mt-20 flex max-w-[1056px] flex-col gap-8 md:mt-24">
            <h2 className="t-h02">{copy.who.heading}</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {copy.who.groups.map((g) => (
                <div key={g.title} className="flex flex-col gap-3 border-t border-border pt-5">
                  <h3 className="t-h05">{g.title}</h3>
                  {g.paras.map((p) => (
                    <p key={p} className="t-body">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* The two categories, compared plainly. */}
          <section className="mt-20 flex max-w-[1056px] flex-col gap-8 md:mt-24">
            <h2 className="t-h02">{copy.ways.heading}</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {copy.ways.options.map((o) => (
                <div key={o.title} className="flex flex-col gap-3 border-t border-border pt-5">
                  <h3 className="t-h05">{o.title}</h3>
                  <p className="t-body">{o.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What membership means — and commits you to. */}
          <section className="mt-20 flex max-w-[732px] flex-col gap-6 md:mt-24">
            <h2 className="t-h02">{copy.meaning.heading}</h2>
            <p className="t-body">{copy.meaning.intro}</p>
            <p className="t-body">{copy.meaning.commitmentsIntro}</p>
            <ul className="flex list-disc flex-col gap-2 pl-6">
              {copy.meaning.commitments.map((item) => (
                <li key={item} className="t-body">
                  {item}
                </li>
              ))}
            </ul>
            <p className="t-body">
              {copy.meaning.statuteNote}{" "}
              <a href={statuteHref} className="group">
                <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                  {copy.meaning.statuteLabel}
                </span>
              </a>
              .
            </p>
          </section>

          {/* Admission, step by step. */}
          <section className="mt-20 flex max-w-[732px] flex-col gap-6 md:mt-24">
            <h2 className="t-h02">{copy.admission.heading}</h2>
            <ol className="flex list-decimal flex-col gap-3 pl-6">
              {copy.admission.steps.map((step) => (
                <li key={step} className="t-body">
                  {step}
                </li>
              ))}
            </ol>
            <p className="t-body">{copy.admission.reapply}</p>
          </section>

          {/* How decisions are made — assembly and board, and the statute. */}
          <section className="mt-20 flex max-w-[732px] flex-col gap-6 md:mt-24">
            <h2 className="t-h02">{copy.decisions.heading}</h2>
            {copy.decisions.paras.map((p) => (
              <p key={p} className="t-body">
                {p}
              </p>
            ))}
            <a href={statuteHref} className="t-caption group inline-flex items-center gap-3 self-start font-medium">
              {copy.decisions.statuteCta}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </section>

          {/* The application. scroll-mt keeps the heading clear of the
              sticky header when the #apply links land here. */}
          <section id="apply" className="mt-20 flex max-w-[800px] scroll-mt-32 flex-col gap-6 md:mt-24">
            <h2 className="t-h02">{copy.apply.heading}</h2>
            <p className="t-body">{copy.apply.intro}</p>
            <p className="t-body">{copy.apply.languageNote}</p>
            <p className="t-body">
              <span className="font-bold">{copy.apply.beforeLabel}</span>{" "}
              <a href={statuteHref} className="group">
                <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                  {copy.apply.statuteLabel}
                </span>
              </a>{" "}
              ·{" "}
              <a href={`/${locale}/privacy`} className="group">
                <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                  {copy.apply.privacyLabel}
                </span>
              </a>
            </p>

            <TallyEmbed formId={MEMBERSHIP_FORM_ID} title={copy.formTitle} />

            <p className="t-caption">{copy.apply.dataUse}</p>
            <p className="t-caption">{copy.apply.disclaimer}</p>
          </section>
        </main>
      </div>

      {/* After the content on purpose — see /contact. */}
      <PatternRail locale={locale} />

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
