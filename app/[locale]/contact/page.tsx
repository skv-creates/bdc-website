/**
 * Contact — /bg/contact, /en/contact.
 *
 * The registered organisation in one discoverable place: name, legal status,
 * ЕИК, registered office, mailbox — plus signposts to the three forms that
 * already exist, a plain statement of what to expect after writing, and the
 * social channels. Linked from the header and from the footer's contact
 * column, so it is reachable from every page.
 *
 * There is no form here on purpose: /partner already carries the one form
 * this codebase owns, and duplicating it would mean two submission paths to
 * keep honest. The routes section sends each kind of message to the door
 * that is actually staffed for it.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { getContent, hasLocale } from "@/lib/home-content";
import { CONTACT_COPY } from "@/lib/contact";

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
      <PatternRail locale={locale} />

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

            {/* The registered details and the mailbox, side by side — the two
                things a visitor (or a grants reviewer) comes to verify. */}
            <div className="grid gap-8 md:grid-cols-2">
              <section className="flex flex-col gap-3" aria-label={copy.orgHeading}>
                <h2 className="t-caption font-bold">{copy.orgHeading}</h2>
                <p className="t-body font-bold">{copy.orgName}</p>
                <p className="t-body">
                  {copy.orgStatus} · {copy.orgUic}
                </p>
                <p className="t-body">
                  <span className="block t-caption">{copy.addressLabel}</span>
                  {copy.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </section>

              <section className="flex flex-col gap-3" aria-label={copy.emailLabel}>
                <h2 className="t-caption font-bold">{copy.emailLabel}</h2>
                {/* The address comes from `footer`, so it changes in one place. */}
                <a
                  href={`mailto:${c.footer.email}`}
                  className="t-body group self-start [overflow-wrap:anywhere]"
                >
                  <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                    {c.footer.email}
                  </span>
                </a>
                <p className="t-body">{copy.responseNote}</p>
              </section>
            </div>
          </div>

          {/* What to write about, where — the three doors that already exist. */}
          <div className="mt-20 flex max-w-[1056px] flex-col gap-8">
            <h2 className="t-h02">{copy.routesHeading}</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {copy.routes.map((r) => (
                <div key={r.title} className="flex flex-col gap-3 border-t border-border pt-5">
                  <h3 className="t-body font-bold">{r.title}</h3>
                  <p className="t-body">{r.body}</p>
                  <a href={`/${locale}${r.href}`} className="t-body group mt-auto self-start">
                    <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                      {r.label} →
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy and the social channels close the page. */}
          <div className="mt-20 flex max-w-[516px] flex-col gap-8">
            <p className="t-body">
              {copy.privacyNote}{" "}
              <a href={`/${locale}/privacy`} className="group">
                <span className="border-b-2 border-current transition-colors group-hover:border-transparent">
                  {copy.privacyLabel}
                </span>
              </a>
              .
            </p>
            <section className="flex flex-col gap-4" aria-label={copy.socialHeading}>
              <h2 className="t-caption font-bold">{copy.socialHeading}</h2>
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {c.footer.social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="t-body group">
                      <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                        {s.label}
                      </span>
                      <span className="sr-only"> {c.footer.newWindow}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
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
