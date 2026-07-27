/**
 * Full initiative page — the target of a hard navigation (shared link, refresh,
 * or no-JS). Soft navigation from the home carousel is intercepted by the
 * sibling @modal/(.)initiatives/[slug] route and shown as an overlay instead.
 *
 * Unlike the event page, this one carries site chrome (rail + nav + footer),
 * following app/[locale]/privacy/page.tsx rather than wrapping the body in
 * <OverlayPanel/>. Long-form initiative copy is something people land on cold
 * from a link, and a bare panel leaves them with no way into the rest of the
 * site. Events still use the panel-only convention — see the note in
 * app/[locale]/events/[slug]/page.tsx if the two are ever reconciled.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatternRail } from "@/components/pattern-rail/PatternRail";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { InitiativeOverlayContent } from "@/components/ui/InitiativeOverlayContent";
import { InitiativeTeamPanel } from "@/components/ui/InitiativeTeamPanel";
import { Initiatives } from "@/components/initiatives/Initiatives";
import { getContent, getInitiative, getInitiativeSlugs, hasLocale } from "@/lib/home-content";
import type { Member } from "@/lib/home-content";

export async function generateStaticParams() {
  return getInitiativeSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};
  const initiative = getInitiative(locale, slug);
  if (!initiative) return {};
  return {
    title: initiative.title,
    // The standfirst reads better as a description than the card blurb, when
    // long-form copy exists.
    description: initiative.detail?.lead ?? initiative.text,
  };
}

export default async function InitiativePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const initiative = getInitiative(locale, slug);
  if (!initiative) notFound();
  const c = getContent(locale);

  // Resolve the team panel's member slugs against every group, keeping the
  // authored order. Slug = photo filename stem, the same key the Notion merge
  // uses, so the two stay consistent.
  const allMembers: Member[] = [
    ...c.team.board.members,
    ...c.team.advisory.members,
    ...c.team.volunteers.members,
  ];
  const slugOf = (m: Member) => m.photo?.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
  const teamMembers =
    initiative.detail?.team?.members
      .map((s) => allMembers.find((m) => slugOf(m) === s))
      .filter((m): m is Member => Boolean(m)) ?? [];

  // Related carousel: every other initiative, current one excluded.
  const related = c.initiatives.items.filter((i) => i.slug !== slug);

  return (
    <>
      <a href="#main" className="skip-link t-caption font-bold">
        {c.ui.skipToContent}
      </a>
      <PatternRail />

      {/* Long-form reading column. The end inset clears the rail by a full
          --page-gutter rather than the 24px --rail-gap the home page uses, so
          the text is inset from the rail by the same amount as from the page
          edge — matching Figma 327:1137, where the copy stops ~120px short of
          the pattern stripe. It scales with the gutter's own clamp, so narrow
          viewports don't lose the column to padding. */}
      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--page-gutter))",
        }}
      >
        {/* `path` keeps the nav's "#..." links pointing back at the home route
            and holds the language toggle on this initiative — which only works
            because slugs are locale-neutral. */}
        <SiteNav nav={c.nav} ui={c.ui} locale={locale} path={`/initiatives/${slug}`} />

        <main id="main" tabIndex={-1} className="py-16 md:py-20">
          <InitiativeOverlayContent initiative={initiative} variant="page" />

          {initiative.detail?.team && (
            <div className="py-12">
              <InitiativeTeamPanel team={initiative.detail.team} members={teamMembers} />
            </div>
          )}

          {related.length > 0 && (
            <Initiatives
              initiatives={{ ...c.initiatives, items: related }}
              ui={c.ui}
              locale={locale}
            />
          )}
        </main>
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
