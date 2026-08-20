/**
 * About — /bg/about, /en/about.
 *
 * Built to Figma `500:1894` ("about us"), the August rewrite, section for
 * section: mission → design capacity (with its two-column definition) →
 * "Как работим" (three dimensions) → the founding line → photograph with
 * caption → the founders' story → quote.
 *
 * One departure from the frame, deliberate:
 *
 * - The registration block at the end is not in the frame. It is kept from the
 *   previous version of this page because Google's Ad Grants refusal cited
 *   having nowhere prominent stating the non-profit status, and dropping it
 *   would undo that. Remove it only with that in mind.
 *
 * The type maps onto the site's own scale rather than Figma's raw sizes:
 * h01 → .t-h01, h02 → .t-h02, quote → .t-quote, body-medium Bold →
 * .t-body-lg font-bold, body-default → .t-body, caption → .t-caption,
 * the checklist rows → .t-h05 (inside ChecklistRows). The "Как работим"
 * column headers are the initiative nav-item's rules: 4px brand on the
 * first, 1px border on the rest.
 *
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { HowGroups } from "@/components/about/HowGroups";
import { AboutBoard } from "@/components/about/AboutBoard";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Button } from "@/components/ui/Button";
import { HoverRevealImage } from "@/components/ui/HoverRevealImage";
import { ChecklistRows } from "@/components/ui/ChecklistRows";
import { getContent, hasLocale } from "@/lib/home-content";
import { ABOUT_COPY, STATUTE_PATH } from "@/lib/about";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = ABOUT_COPY[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/about"),
    openGraph: openGraphBase(
      locale,
      "/about",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

/** The 16×8 accent block and its label — the site's section eyebrow. */
function Eyebrow({ text, tone = "band" }: { text: string; tone?: "band" | "accent" }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-2 w-4 shrink-0"
        style={{ background: `var(--tri-${tone})` }}
        aria-hidden
      />
      <span className="t-caption">{text}</span>
    </div>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = ABOUT_COPY[locale];
  // Photos are keyed by the members' Bulgarian names and identical in both
  // locales — the EN content spells the names in Latin, so a lookup in
  // getContent(locale) finds nothing on /en and every card showed the
  // placeholder ground.
  const photoSource = getContent("bg").team.board.members;

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
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="/about" initiatives={c.initiatives} />

        <main id="main" tabIndex={-1} className="pt-16 lg:pt-[120px]">
          {/* ── Mission (500:1903) — eyebrow, then the headline. ── */}
            <section className="bdc-stop-11 bdc-grid gap-y-12 pb-12 lg:pb-[104px]">
              <div className="col-span-full">
                <Eyebrow text={copy.eyebrow} />
              </div>

              <h1 className="t-h01 col-span-full lg:col-span-10">{copy.headline}</h1>

              {/* body-medium Bold in the frame (561:4799) — not h05. */}
              <p className="t-body-lg col-span-full font-bold lg:col-span-6">{copy.lead}</p>

              {/* col-start-1 is load-bearing: without it the grid cursor sits
                  after the lead (col 6) and floats this up beside it, which is
                  exactly the layout bug the design review caught. */}
              <p className="t-body col-span-full lg:col-start-1 lg:col-span-5">
                {copy.intro[0]}
              </p>
              <p className="t-body col-span-full lg:col-start-7 lg:col-span-5">
                {copy.intro[1]}
              </p>
            </section>

          {/* ── Design capacity (518:2419) ── */}
            <section className="bdc-stop-11 bdc-grid gap-y-12 py-12 lg:py-[104px]">
              <div className="col-span-full flex flex-col gap-8 lg:col-span-7">
                <Eyebrow text={copy.capacity.label} />
                <h2 className="t-h02">{copy.capacity.heading}</h2>
              </div>

              {/* The two-column definition (561:4854): two halves of the row. */}
              <p className="t-body col-span-full lg:col-span-5">{copy.capacity.intro[0]}</p>
              <p className="t-body col-span-full lg:col-start-7 lg:col-span-5">
                {copy.capacity.intro[1]}
              </p>

              {/* Indented one column (523:3010 starts at col 2), as drawn. */}
              <ChecklistRows
                rows={copy.capacity.items}
                className="col-span-full border-b border-border lg:col-start-2 lg:col-span-10"
                markerVar="--color-brand"
              />
            </section>

          {/* ── Как работим (525:3532) — the three dimensions, each with its
              activity accordion, closing on the regional network. ── */}
            <section className="bdc-stop-11 bdc-grid py-12 lg:py-[104px]">
              {/* Label→heading 32 (gap-8), heading→lead 48 (gap-12): the
                  frame's own steps (574:5689 / 574:5427). */}
              <div className="col-span-full flex flex-col gap-12 pb-[60px] lg:col-start-2 lg:col-span-5 lg:pb-20">
                <div className="flex flex-col gap-8">
                  <Eyebrow text={copy.how.label} />
                  <h2 className="t-h02">{copy.how.heading}</h2>
                </div>
                <p className="t-body">{copy.how.lead}</p>
              </div>

              <HowGroups groups={copy.how.groups} locale={locale} />

              {/* The closing block (574:5897): 160 above (the group's 80 +
                  this 80), 48 steps inside, buttons 48 under the text. */}
              {/* 240 above (the group's 80 + this 160), per the design
                  redline: the eyebrow opens a sub-section, not another group,
                  so it takes three 80-steps rather than the group rhythm. */}
              <div className="col-span-full flex flex-col items-start gap-12 pt-[60px] lg:col-start-2 lg:col-span-8 lg:pt-40">
                <div className="flex flex-col gap-8">
                  <Eyebrow text={copy.how.closing.label} />
                  <h2 className="t-h02">{copy.how.closing.heading}</h2>
                </div>
                <p className="t-body lg:max-w-[62%]">{copy.how.closing.body}</p>
                <div className="flex flex-wrap gap-6">
                  <Button href={`/${locale}/volunteer`}>{copy.buildWithUs.volunteerLabel}</Button>
                  <Button href={c.hero.primary.href} variant="secondary">
                    {copy.buildWithUs.partnerLabel}
                  </Button>
                </div>
              </div>
            </section>

          {/* ── The founding line (524:3506) ── */}
          <section className="bdc-stop-11 bdc-grid gap-y-8 py-12 lg:py-[104px]">
            <div className="col-span-full">
              <Eyebrow text={copy.founding.label} />
            </div>
            <h2 className="t-h02 col-span-full lg:col-span-6">{copy.founding.heading}</h2>
          </section>

          {/* ── The photograph (500:1917 / hover 518:2577), with its caption ── */}
            <section className="bdc-stop-11 bdc-grid gap-y-2 py-12 lg:py-16">
              <div className="col-span-full">
                <HoverRevealImage
                  src="/figma/about/founders.jpg"
                  hoverSrc="/figma/about/founders-hover.jpg"
                  alt={copy.photoAlt}
                  aspect="1092/600"
                  focal="50% 12%"
                />
              </div>
              <p className="t-caption col-span-full whitespace-pre-line lg:col-span-7">
                {copy.photoCaption.map((seg, i) =>
                  seg.bold ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>,
                )}
              </p>
            </section>

          {/* ── The founders' story (500:1920) ── */}
            <section className="bdc-stop-11 bdc-grid pb-12 pt-8">
              <div className="col-span-full flex flex-col gap-5 lg:col-span-6">
                {copy.story.map((para) => (
                  <p key={para} className="t-body">
                    {para}
                  </p>
                ))}
              </div>
            </section>

          {/* ── Quote (506:2412) — the page's closing thought. ── */}
            <section className="bdc-stop-11 bdc-grid gap-y-12 py-12 lg:gap-y-20 lg:py-[104px]">
              <Image
                src="/figma/about/quote-mark.svg"
                alt=""
                width={73}
                height={60}
                className="col-span-full block rotate-180"
              />
              <figure className="col-span-full flex flex-col gap-10 lg:col-span-10 lg:gap-20">
                <blockquote>
                  <p className="t-quote">{copy.quote.text}</p>
                </blockquote>
                <figcaption className="t-body">{copy.quote.author}</figcaption>
              </figure>
            </section>

          {/* ── Управление и отчетност (574:5716) ── */}
            <section className="bdc-stop-11 bdc-grid gap-y-8 py-12 lg:py-[104px]">
              <div className="col-span-full">
                <Eyebrow text={copy.governance.label} />
              </div>
              <h2 className="t-h02 col-span-full lg:col-span-8">
                {copy.governance.headingLines[0]}
                <br />
                {copy.governance.headingLines[1]}
              </h2>
              <div className="t-body col-span-full flex flex-col gap-5 lg:col-span-6">
                {copy.governance.paragraphs.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
              {/* The document rail (574:5797): the frame's «|»-prefixed rows. */}
              <div className="t-body col-span-full flex flex-col gap-4 lg:col-start-10 lg:col-span-2">
                <Link href={`/${locale}${STATUTE_PATH}`} className="group">
                  <span aria-hidden>|&nbsp;&nbsp;&nbsp;</span>
                  <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                    {copy.governance.statuteLabel}
                  </span>
                </Link>
                <a href="#board" className="group">
                  <span aria-hidden>|&nbsp;&nbsp;&nbsp;</span>
                  <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                    {copy.governance.managementLabel}
                  </span>
                </a>
              </div>
            </section>

          {/* ── Registration — kept at the user's request; the address and
              email live nowhere else on this page. ── */}
            <section className="bdc-stop-11 bdc-grid gap-y-8 pb-12 lg:pb-[104px]">
              <dl className="col-span-full flex flex-col lg:col-span-8">
                {copy.identityRows.map((row) => (
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

          {/* ── The board (574:6470) — Relume team22's motion: the title is
              position:sticky, pinned mid-viewport, while the staggered member
              cards scroll past — and over — it. Pure CSS; below lg the title
              is static and the cards stack. ── */}
          <AboutBoard
            team={copy.team}
            photoSource={photoSource}
            bioPlaceholder={c.team.bioPlaceholder}
          />

          {/* ── Да създадем заедно с(ъ)вета (574:5961) — full-bleed grey band;
              the wrapper's gutters are cancelled and re-applied as padding so
              the ground runs edge to rail like the frame draws it. ── */}
            <section
              className="py-16 lg:py-[104px]"
              style={{
                background: "rgba(21, 21, 21, 0.05)",
                marginInlineStart: "calc(-1 * var(--page-gutter))",
                paddingInlineStart: "var(--page-gutter)",
                marginInlineEnd: "calc(-1 * (var(--rail-w) + var(--rail-clear)))",
                paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
              }}
            >
              <div className="bdc-stop-11 bdc-grid gap-y-12">
                <div className="col-span-full flex flex-col items-start gap-8 lg:col-span-5">
                  <h2 className="t-h02">{copy.buildWithUs.heading}</h2>
                  <div className="t-body flex flex-col gap-5">
                    {copy.buildWithUs.paragraphs.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
                  <Button href={c.hero.primary.href}>{copy.buildWithUs.partnerLabel}</Button>
                  <Button variant="tertiary" href={`/${locale}/volunteer`}>
                    {copy.buildWithUs.volunteerLabel}
                  </Button>
                </div>
                <div className="col-span-full flex flex-col items-start gap-8 self-end lg:col-start-8 lg:col-span-4 lg:items-end lg:pb-14">
                  <p className="t-caption lg:text-right">
                    {copy.buildWithUs.credit[0]}
                    <br />
                    {copy.buildWithUs.credit[1]}
                  </p>
                  <ul className="flex items-center">
                    <AvatarGroup
                      members={copy.team.members
                        .map((m) => photoSource.find((b) => b.name === m.homeName))
                        .filter((m): m is NonNullable<typeof m> => Boolean(m))}
                    />
                  </ul>
                </div>
              </div>
            </section>

        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
