"use client";

/**
 * The board section of the About page (Figma 574:6470), with the Relume
 * team22 motion: the title is position:sticky, pinned mid-viewport, while
 * the staggered member cards scroll past — and over — it. Below lg the title
 * is static and the cards run two-up, like the home BoardGrid.
 *
 * A client component for one reason: clicking a member opens the same
 * OverlayPanel + MemberOverlayContent modal the home team section uses, and
 * the modal must hand the page back exactly where it was. The overlay is a
 * fixed layer over the document — the page never navigates and never
 * scrolls, so closing it is inherently "return to where I was".
 *
 * The card hover is the home MemberCard's, in CSS: the portrait insets 16px
 * inside the brand box and cross-fades to the alternate frame — same 120ms,
 * same inset-4.
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { OverlayPanel } from "@/components/ui/OverlayPanel";
import { MemberOverlayContent } from "@/components/ui/MemberOverlayContent";
import type { Member } from "@/lib/home-content";
import type { AboutCopy } from "@/lib/about";

export function AboutBoard({
  team,
  photoSource,
  bioPlaceholder,
}: {
  team: AboutCopy["team"];
  /** home-content's board members (BG — photos and bios are locale-free). */
  photoSource: Member[];
  bioPlaceholder: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  /** Hover frames download on first intent — see MemberCard for the why. */
  const [armed, setArmed] = useState<Set<number>>(new Set());
  const arm = (i: number) =>
    setArmed((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  const openMember = openIndex !== null ? photoSource.find((b) => b.name === team.members[openIndex].homeName) : undefined;

  /**
   * While the middle card passes over the pinned title, the two texts sit on
   * top of each other and neither reads. The title fades out completely in
   * proportion to how much of it the card covers — gone at full overlap, so
   * Радина's name and role read clean — a continuous function of scroll, as
   * smooth as the scrolling itself, with a short transition to soften the
   * frame steps. Driven per-frame rather than by a toggle so there is no pop
   * at the crossing point.
   */
  const titleRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const t = titleRef.current, m = middleRef.current;
      if (!t || !m) return;
      const tr = t.getBoundingClientRect(), mr = m.getBoundingClientRect();
      // Clearance between the card (photo AND caption) and the title:
      // positive once they are apart, negative while they intersect. The
      // title is fully hidden the moment they touch and only returns over
      // the 120px after they separate — fading by intersection ratio
      // brought it back while Радина's caption still sat on top of it.
      const clearance = Math.max(tr.top - mr.bottom, mr.top - tr.bottom);
      t.style.opacity = String(Math.max(0, Math.min(1, clearance / 120)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="board" className="bdc-stop-11 pb-16 pt-12 lg:pb-60 lg:pt-[104px]">
      <div className="bdc-grid gap-y-12 lg:[grid-auto-rows:auto]">
        <div
          ref={titleRef}
          className="z-0 col-span-full flex flex-col items-start gap-6 text-left transition-opacity duration-150 ease-linear lg:col-start-4 lg:col-span-5 lg:row-start-1 lg:row-end-4 lg:items-center lg:self-start lg:sticky lg:text-center lg:top-[38vh]"
        >
          {/* The site's section eyebrow — 16×8 tomato accent + caption,
              same as «Управление и отчетност» above. */}
          <p className="flex items-center gap-3">
            <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
            <span className="t-caption">{team.label}</span>
          </p>
          <h2 className="t-h03">{team.heading}</h2>
          <p className="t-body w-full whitespace-pre-line">{team.subtitle}</p>
        </div>

        {team.members.map((m, i) => {
          const home = photoSource.find((b) => b.name === m.homeName);
          // The zigzag (574:6470): pairs on the outer columns, the middle
          // member alone in the centre, passing the sticky title.
          const place = [
            "lg:col-start-1 lg:col-span-3 lg:row-start-1",
            "lg:col-start-9 lg:col-span-3 lg:row-start-1 lg:mt-16",
            "lg:col-start-5 lg:col-span-3 lg:row-start-2",
            "lg:col-start-1 lg:col-span-3 lg:row-start-3 lg:mt-16",
            "lg:col-start-9 lg:col-span-3 lg:row-start-3",
          ][i];
          return (
            <button
              key={m.name}
              ref={i === 2 ? middleRef : undefined}
              type="button"
              onClick={() => setOpenIndex(i)}
              onMouseEnter={() => arm(i)}
              onFocus={() => arm(i)}
              aria-haspopup="dialog"
              className={`z-10 col-span-full flex flex-col gap-3 text-left md:col-span-4 ${place}`}
            >
              <div className="group relative aspect-[304/405] w-full overflow-hidden bg-brand">
                <div className="absolute inset-0 overflow-hidden bg-black/5 transition-all duration-[120ms] ease-out group-hover:inset-4 motion-reduce:transition-none">
                  {home?.photo && (
                    <Image
                      src={home.photo}
                      alt={m.name}
                      fill
                      sizes="(max-width: 1023px) 92vw, 300px"
                      quality={80}
                      className="object-cover"
                    />
                  )}
                  {home?.photoHover && armed.has(i) && (
                    <Image
                      src={home.photoHover}
                      alt=""
                      aria-hidden
                      fill
                      sizes="(max-width: 1023px) 92vw, 300px"
                      quality={80}
                      className="object-cover object-top opacity-0 transition-opacity duration-[120ms] ease-out group-hover:opacity-100 motion-reduce:transition-none"
                    />
                  )}
                </div>
              </div>
              {/* The page ground behind the caption: the middle card passes
                  over the pinned title, and without it the name and the title
                  print through each other. Padding only on the trailing edge
                  so the text keeps sitting flush with the photo's left. */}
              <span className="flex flex-col gap-0.5 self-start pb-1 pe-3 [background:var(--color-page)]">
                <span className="t-body font-bold">{m.name}</span>
                <span className="t-caption">{m.role}</span>
              </span>
            </button>
          );
        })}
      </div>

      {openMember && (
        <OverlayPanel onClose={() => setOpenIndex(null)}>
          <MemberOverlayContent member={openMember} bioPlaceholder={bioPlaceholder} />
        </OverlayPanel>
      )}
    </section>
  );
}
