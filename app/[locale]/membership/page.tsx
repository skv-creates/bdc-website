/**
 * Membership — /bg/membership, /en/membership (Figma 636:3607).
 *
 * The frame's movements, in order: the head — eyebrow with the time note,
 * "Дизайнът има нужда от общ глас.", rule, the bold lede and the
 * supporting paragraph side by side with the primary CTA; three
 * heading-left/content-right sections (the two kinds of membership, who
 * can join, the responsibility section closing with the statute link and
 * the obligations accordion); the amber-marked "Готов си да
 * кандидатстваш?" block; the Q&A accordion; and the closing photograph.
 *
 * Both CTAs lead to the full-screen application at /membership/apply.
 * The accordion rows are the site's own FaqItem — the same component the
 * home page's FAQ uses — so the two cannot drift apart. Link hrefs in the
 * copy are site paths without a locale; localizeBlocks prefixes them.
 */
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { FaqItem } from "@/components/sections/Faq";
import { Button } from "@/components/ui/Button";
import { getContent, hasLocale, type FaqBlock } from "@/lib/home-content";
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

/** Copy stores link hrefs as bare site paths; the locale goes on here. */
function localizeBlocks(blocks: FaqBlock[], locale: string): FaqBlock[] {
  return blocks.map((b) =>
    "link" in b && b.link.href.startsWith("/")
      ? { link: { ...b.link, href: `/${locale}${b.link.href}` } }
      : b,
  );
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
  const applyHref = `/${locale}/membership/apply`;
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

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-12 pt-20 md:pt-[120px]">
          <div className="flex max-w-[1056px] flex-col gap-12">
            {/* The head (636:3618). */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--bdc-tomato)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.eyebrow}</span>
              <span aria-hidden className="opacity-40">
                ·
              </span>
              <span className="t-caption font-bold">{copy.timeNote}</span>
            </div>

            <h1 className="t-h01 max-w-[800px]">{copy.title}</h1>

            <hr className="border-0 border-t border-border" />

            {/* The lede pair (636:3627): the bold claim and the CTA on the
                left, the supporting paragraph on the right. */}
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
              <div className="flex flex-col gap-12 lg:max-w-[516px]">
                <p className="t-h05 font-bold">{copy.ledeBold}</p>
                <Button href={applyHref} variant="primary" className="self-start">
                  {copy.applyCta} →
                </Button>
              </div>
              <p className="t-body lg:max-w-[508px]">{copy.ledeBody}</p>
            </div>

            {/* Two kinds of membership (641:3939): heading in the left
                columns, the categories stacked in the right. */}
            <section className="bdc-grid gap-y-12 py-12">
              <h2 className="t-h02 col-span-full lg:col-span-5">{copy.kinds.heading}</h2>
              <div className="col-span-full flex flex-col gap-12 lg:col-span-6 lg:col-start-7 lg:row-span-2">
                {copy.kinds.options.map((o) => (
                  <div key={o.title} className="flex flex-col gap-5">
                    <h3 className="t-h04">{o.title}</h3>
                    {o.paras.map((p) => (
                      <p key={p} className="t-body">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* For people and organisations (638:3866). */}
            <section className="bdc-grid gap-y-12 py-12">
              <h2 className="t-h02 col-span-full lg:col-span-5">{copy.people.heading}</h2>
              <div className="col-span-full flex flex-col gap-12 opacity-80 lg:col-span-6 lg:col-start-7 lg:max-w-[516px]">
                {copy.people.paras.map((p) => (
                  <p key={p} className="t-body">
                    {p}
                  </p>
                ))}
              </div>
            </section>

            {/* Responsibility (638:3845): the agreement, the statute, and
                the obligations as accordion rows. */}
            <section className="bdc-grid gap-y-12 py-12">
              <h2 className="t-h02 col-span-full lg:col-span-6">{copy.duties.heading}</h2>
              <div className="col-span-full flex flex-col gap-5 lg:col-span-6 lg:col-start-7">
                <p className="t-body">{copy.duties.body}</p>
                <a href={statuteHref} className="t-body group inline-flex items-center gap-3 self-start font-bold">
                  <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                    {copy.duties.statuteLabel}
                  </span>
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
              <div className="col-span-full border-t-2 border-border lg:col-span-6 lg:col-start-7">
                {copy.duties.faq.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={localizeBlocks(item.a, locale)} />
                ))}
              </div>
            </section>

            {/* Ready to apply (636:3630). The amber never touches the
                heading — as on the volunteer page, the mark belongs to the
                time sentence in the body. */}
            <section className="flex max-w-[516px] flex-col gap-8 pt-8">
              <h2 className="t-h02">{copy.ready.heading}</h2>
              <p className="t-body">
                <mark
                  className="text-text"
                  style={{ background: "var(--bdc-amber)", boxDecorationBreak: "clone" }}
                >
                  {copy.ready.bodyHighlight}
                </mark>{" "}
                {copy.ready.body}
              </p>
              <Button href={applyHref} variant="primary" className="self-start">
                {copy.applyCta} →
              </Button>
            </section>

            {/* Questions? Answers. (637:3788) */}
            <section className="bdc-grid gap-y-12 py-12 lg:py-20">
              <h2 className="t-h02 col-span-full lg:col-span-5">{copy.questions.heading}</h2>
              <div className="col-span-full border-t-2 border-border lg:col-span-10 lg:col-start-3 lg:row-start-2">
                {copy.questions.faq.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={localizeBlocks(item.a, locale)} />
                ))}
              </div>
            </section>
          </div>

          {/* The closing photograph (636:3636). */}
          <div className="relative mt-8 aspect-square w-full overflow-hidden md:aspect-[1092/522]">
            <Image
              src="/figma/membership-cover.jpg"
              alt={copy.photoAlt}
              fill
              sizes="(max-width: 1023px) 90vw, 80vw"
              className="object-cover"
            />
          </div>
        </main>
      </div>

      {/* After the content on purpose — see /contact. */}
      <PatternRail locale={locale} />

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
