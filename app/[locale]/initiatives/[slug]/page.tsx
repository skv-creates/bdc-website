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

      {/* Same symmetric shell as every other page: gutter left, rail right. The
          clearance Figma 327:1137 shows between the copy and the pattern stripe
          comes from .bdc-stop-11 on <main> below, not from extra padding here —
          padding would push the column off centre again. */}
      <div
        style={{
          paddingInlineStart: "var(--page-gutter)",
          paddingInlineEnd: "calc(var(--rail-w) + var(--rail-clear))",
        }}
      >
        {/* `path` keeps the nav's "#..." links pointing back at the home route
            and holds the language toggle on this initiative — which only works
            because slugs are locale-neutral. */}
        <SiteNav
          nav={c.nav}
          ui={c.ui}
          locale={locale}
          path={`/initiatives/${slug}`}
          initiatives={c.initiatives}
        />

        {/* No padding of its own: each section below carries the vertical
            rhythm from Figma 327:1137, so adding some here shifts all of it.

            The column stays fluid — the design's 1056 is one artboard width, not
            a cap; the proportions (11 columns, 24px gutters, the 50/50 rows)
            are what carry over. */}
        {/* No .bdc-stop-11 here. Each section applies it itself — nesting it
            inside another one narrows the column twice, which is what was
            pulling the initiatives carousel short of every other container. It
            also has to stay off <main> so the tinted band below can reach the
            page edges. */}
        <main id="main" tabIndex={-1}>
          <InitiativeOverlayContent initiative={initiative} variant="page" />

          {initiative.detail?.team && (
            // The band carries its own 80px of vertical padding (329:2122), so
            // wrapping it in more would double the space around it.
            <InitiativeTeamPanel team={initiative.detail.team} members={teamMembers} />
          )}

          {related.length > 0 && (
            <Initiatives
              initiatives={{ ...c.initiatives, items: related }}
              ui={c.ui}
              locale={locale}
              inside
            />
          )}
        </main>
      </div>

      {/* Brand strip closing the page above the footer, its splits following the
          page grid — same rule as the overlay's (see .overlay-strip). */}
      <div className="overlay-strip relative z-30 flex" aria-hidden>
        <div className="strip-1 h-3" />
        <div className="strip-2 h-3" />
        <div className="strip-3 h-3" />
      </div>

      <SiteFooter footer={c.footer} locale={locale} />
    </>
  );
}
