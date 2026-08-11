/**
 * About — /bg/about, /en/about.
 *
 * The page that answers "who is this organisation?" in its first screen: legal
 * form and non-profit status first, then mission, then what the council actually
 * does, then its registration details. Nothing here is new information — it is
 * material that existed only inside a home-page section, an FAQ answer and the
 * privacy policy, which is not somewhere a first-time reader will find it.
 *
 * Same shell as the other standalone pages (volunteer, privacy, accessibility):
 * fixed pattern rail, padded content column, full-bleed footer.
 *
 * The initiative links are plain <a>, not next/link, for the same reason as the
 * ones in SiteNav's drawer: a soft navigation to /[locale]/initiatives/[slug]
 * gets caught by the @modal/(.)initiatives interceptor and opens the overlay
 * instead of the page. From an About page the reader has asked for the page.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getContent, hasLocale } from "@/lib/home-content";
import { ABOUT_COPY, STATUTE_URL } from "@/lib/about";

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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = ABOUT_COPY[locale];
  // applyCms() has already dropped `published: false` initiatives (see the
  // filter in lib/home-content.ts) — deliberately at that one place rather than
  // at each call site, so this list cannot link to a page that 404s.
  const initiatives = c.initiatives.items;

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
          path="/about"
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

            {/* The status line is the whole point of the page's first screen.
                It sits above the lead, not in a footer or an FAQ answer. */}
            <p className="t-h05 max-w-[732px]">{copy.status}</p>
            <p className="t-body max-w-[540px]">{copy.lead}</p>
          </div>

          {/* ---- Mission ---- */}
          <section className="mt-20 flex max-w-[1056px] flex-col gap-8 md:mt-24">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-accent)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.missionLabel}</span>
            </div>
            <h2 className="t-h02 max-w-[900px]">{copy.missionHeading}</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {copy.missionBody.map((p) => (
                <p key={p} className="t-body">
                  {p}
                </p>
              ))}
            </div>
          </section>

          {/* ---- What we do: the initiatives, named and linked ---- */}
          <section className="mt-20 flex max-w-[1056px] flex-col gap-8 md:mt-24">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-band)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.doingLabel}</span>
            </div>
            <h2 className="t-h02">{copy.doingHeading}</h2>
            <p className="t-body max-w-[540px]">{copy.doingIntro}</p>

            <ul className="flex flex-col">
              {initiatives.map((item) => (
                <li
                  key={item.slug}
                  className="group border-t border-border transition-colors duration-[120ms] ease-out hover:border-t-transparent hover:bg-brand [&:hover+li]:border-t-transparent"
                >
                  <a href={`/${locale}/initiatives/${item.slug}`} className="block py-5">
                    <span className="t-h05 block">{item.title}</span>
                    <span className="t-body mt-2 block max-w-[640px]">{item.text}</span>
                  </a>
                </li>
              ))}
              <li className="border-t border-border" aria-hidden />
            </ul>
          </section>

          {/* ---- Governance: who actually runs it ----
              Names and roles come from the `team` content, which is where they
              are already maintained — the home page's team section renders the
              same list with photographs and bios. Repeating just name and role
              here means an About page that answers "is this a real
              organisation with real officers?" without the reader scrolling a
              different page, and without a second copy of the names to keep in
              step. */}
          <section className="mt-20 flex max-w-[1056px] flex-col gap-8 md:mt-24">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-band)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.governanceLabel}</span>
            </div>
            <h2 className="t-h02">{copy.governanceHeading}</h2>
            <p className="t-body max-w-[540px]">{copy.governanceIntro}</p>

            <div className="grid gap-12 md:grid-cols-2">
              {[
                { label: copy.boardLabel, members: c.team.board.members },
                { label: copy.advisoryLabel, members: c.team.advisory.members },
              ].map((group) => (
                <div key={group.label} className="flex flex-col gap-4">
                  <h3 className="t-caption">{group.label}</h3>
                  <ul className="flex flex-col">
                    {group.members.map((m) => (
                      <li
                        key={m.name}
                        className="grid gap-0.5 border-t border-border py-3 md:grid-cols-[1fr_auto] md:gap-4"
                      >
                        <span className="t-body font-bold">{m.name}</span>
                        <span className="t-caption">{m.role}</span>
                      </li>
                    ))}
                    <li className="border-t border-border" aria-hidden />
                  </ul>
                </div>
              ))}
            </div>

            <Button href={`/${locale}#team`} variant="tertiary">
              {copy.teamLinkLabel}
            </Button>
          </section>

          {/* ---- Legal status: the reviewer's checklist, in one table ---- */}
          <section className="mt-20 flex max-w-[1056px] flex-col gap-8 md:mt-24">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-4 shrink-0"
                style={{ background: "var(--tri-accent)" }}
                aria-hidden
              />
              <span className="t-caption">{copy.identityLabel}</span>
            </div>
            <h2 className="t-h02">{copy.identityHeading}</h2>

            <dl className="flex max-w-[732px] flex-col">
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

            <div className="flex max-w-[540px] flex-col items-start gap-5">
              <p className="t-body">{copy.statuteIntro}</p>
              <Button href={STATUTE_URL} variant="tertiary">
                {copy.statuteLabel}
              </Button>
            </div>
          </section>

          {/* ---- Close: the two things a reader can do next ---- */}
          <section className="mt-20 flex max-w-[516px] flex-col items-start gap-8 md:mt-24">
            <h2 className="t-h02">{copy.ctaTitle}</h2>
            <p className="t-body">{copy.ctaBody}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button href={`/${locale}/contact`} variant="primary">
                {copy.ctaContact}
              </Button>
              <Button href={c.nav.cta.href} variant="secondary">
                {copy.ctaMember}
              </Button>
            </div>
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
