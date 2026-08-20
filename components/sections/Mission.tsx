import type { SiteContent } from "@/lib/home-content";

/**
 * Mission — Figma 332:3279, the band directly under the hero.
 *
 * Accent + label, the statement at h02, then one short paragraph at 24px. The
 * three blocks are 32px apart. The whole section is indented to start at column
 * 2; the statement spans 9 columns and the paragraph is held to 5 — the same
 * wide/narrow contrast the hero above it uses, so the two read as one opening.
 */
export function Mission({ mission }: { mission: SiteContent["mission"] }) {
  return (
    // bdc-stop-11 for the same reason as the hero: the spans are Figma's own
    // 11-column ones, and a 56px statement running into the rail reads badly.
    <section id="mission" className="bdc-stop-11 bdc-grid gap-y-8 py-20">
      <div className="col-span-full flex items-center gap-2.5">
        {/* 16×8 mark, recoloured with the pattern rail like every other accent. */}
        <span className="h-2 w-4 shrink-0" style={{ background: "var(--tri-band)" }} aria-hidden />
        <p className="t-label">{mission.label}</p>
      </div>

      {/* The design sets the statement at 80% black rather than full ink, which
          is what keeps it from competing with the hero heading above it. */}
      <h2 className="t-h02 col-span-full text-[rgba(0,0,0,0.8)] lg:col-span-9">
        {mission.heading}
      </h2>

      <div className="col-span-full flex flex-col gap-6 lg:col-span-6">
        {mission.body.map((p) => (
          <p key={p} className="t-body-lg">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
