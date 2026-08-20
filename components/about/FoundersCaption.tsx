"use client";

/**
 * Interactive caption under the founders' photograph.
 *
 * Only the three names are buttons. Their profiles come from the same
 * locale-specific, Notion-enriched Member objects as the team section, so
 * this caption never becomes a second source of truth for a biography.
 */
import { useCallback, useState } from "react";
import type { AboutCopy } from "@/lib/about";
import type { Member } from "@/lib/home-content";
import { MemberOverlayContent } from "@/components/ui/MemberOverlayContent";
import { OverlayPanel } from "@/components/ui/OverlayPanel";

type FounderProfile = {
  /** Matches AboutCopy.photoCaption[].memberHomeName. */
  homeName: string;
  member: Member;
};

export function FoundersCaption({
  caption,
  founders,
  bioPlaceholder,
  closeLabel,
}: {
  caption: AboutCopy["photoCaption"];
  founders: FounderProfile[];
  bioPlaceholder: string;
  closeLabel: string;
}) {
  const [openHomeName, setOpenHomeName] = useState<string | null>(null);
  const close = useCallback(() => setOpenHomeName(null), []);
  const openMember = founders.find(({ homeName }) => homeName === openHomeName)?.member;

  return (
    <>
      <p className="t-caption col-span-full whitespace-pre-line lg:col-span-7">
        {caption.map((segment, index) => {
          if (!segment.memberHomeName) {
            return segment.bold ? (
              <strong key={index}>{segment.text}</strong>
            ) : (
              <span key={index}>{segment.text}</span>
            );
          }

          const profile = founders.find(
            ({ homeName }) => homeName === segment.memberHomeName,
          );
          if (!profile) return <strong key={index}>{segment.text}</strong>;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setOpenHomeName(profile.homeName)}
              aria-haspopup="dialog"
              aria-expanded={openHomeName === profile.homeName}
              className="font-bold underline decoration-transparent underline-offset-2 transition-[text-decoration-color] hover:decoration-current focus-visible:rounded-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {segment.text}
            </button>
          );
        })}
      </p>

      {openMember && (
        <OverlayPanel
          intercepted
          onClose={close}
          closeLabel={closeLabel}
          dialogLabel={openMember.name}
        >
          <MemberOverlayContent member={openMember} bioPlaceholder={bioPlaceholder} />
        </OverlayPanel>
      )}
    </>
  );
}
