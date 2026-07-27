/**
 * Intercepted initiative route → renders the initiative inside <OverlayPanel/>
 * as a modal over the home page (soft navigation from the carousel). The
 * matching full page lives at app/[locale]/initiatives/[slug]/page.tsx for hard
 * nav and shareable URLs, and carries site chrome instead of the panel.
 *
 * `(.)initiatives` intercepts the sibling `initiatives` segment; @modal is a
 * slot, not a segment, so it doesn't count toward the interception level.
 */
import { notFound } from "next/navigation";
import { OverlayPanel } from "@/components/ui/OverlayPanel";
import { InitiativeOverlayContent } from "@/components/ui/InitiativeOverlayContent";
import { getInitiative, getInitiativeSlugs, hasLocale } from "@/lib/home-content";

export async function generateStaticParams() {
  return getInitiativeSlugs();
}

export default async function InterceptedInitiativeModal({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const initiative = getInitiative(locale, slug);
  if (!initiative) notFound();

  return (
    <OverlayPanel homeHref={`/${locale}`} intercepted>
      <InitiativeOverlayContent initiative={initiative} />
    </OverlayPanel>
  );
}
