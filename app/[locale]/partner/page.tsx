/**
 * /[locale]/partner — the partnership enquiry form.
 *
 * A native HTML <form> POSTing to /api/partner, no client JavaScript required:
 * the page stays prerendered like everything else, the browser enforces
 * `required`, and the API route answers with a 303 to /partner/thanks — the
 * URL the Ad Grants conversion goal hangs on. See lib/partner.ts for why this
 * replaced the mailto: buttons.
 *
 * The one script on the page is progressive enhancement only: it preselects
 * the topic from ?re=<topic> (the initiative pages link here with it) and
 * unhides the error note after a failed send (?error=1). Reading searchParams
 * server-side would make the route dynamic, which no page here is.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeAlternates, openGraphBase } from "@/lib/seo";
import { PartnerFormFields } from "@/components/partner/PartnerFormFields";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { getContent, hasLocale, locales } from "@/lib/home-content";
import { PARTNER_COPY, PARTNER_TOPICS } from "@/lib/partner";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const copy = PARTNER_COPY[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates(locale, "/partner"),
    openGraph: openGraphBase(
      locale,
      "/partner",
      { title: copy.metaTitle, description: copy.metaDescription },
      getContent(locale).meta.title,
    ),
  };
}

/** Shared look for the text inputs — a ruled underline field, not a boxed one,
    so the form reads in the site's own voice. */

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const c = getContent(locale);
  const copy = PARTNER_COPY[locale];
  const f = copy.form;

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
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path="/partner" initiatives={c.initiatives} />

        <main id="main" tabIndex={-1} className="bdc-stop-11 pb-20 pt-20 md:pb-[120px] md:pt-[120px]">
          <div className="flex max-w-[1056px] flex-col gap-12">
            <div className="flex items-center gap-3">
              <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
              <span className="t-caption">{copy.eyebrow}</span>
            </div>

            <h1 className="t-h01 max-w-[732px]">{copy.title}</h1>

            <hr className="border-0 border-t border-border" />

            <p className="t-body max-w-[540px]">{copy.lead}</p>

            {/* hidden until ?error=1 — see the script at the foot. */}
            <p id="form-error" role="alert" hidden className="t-body max-w-[540px] font-bold">
              {f.error}
            </p>

            <PartnerFormFields locale={locale} selectId="topic" />
          </div>

          {/* Progressive enhancement only — the form works without it. */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "var q=new URLSearchParams(location.search);" +
                "var re=q.get('re');var s=document.getElementById('topic');" +
                "if(re&&s&&[].some.call(s.options,function(o){return o.value===re}))s.value=re;" +
                "if(q.get('error'))document.getElementById('form-error').hidden=false;",
            }}
          />
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
