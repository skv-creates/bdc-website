import { ListPointer } from "@/components/ui/icons";

/**
 * The ruled list whose marker swaps for a ✲ on hover.
 *
 * Lived inside InitiativeOverlayContent, which is where the design first
 * called for it (the "when is this model most valuable?" checklist). The About
 * page's "Тази способност се проявява, когато:" list is the same component in
 * Figma and had to be the same component here — a second copy would have drifted
 * on the first change, which is exactly how EventOverlayContent's two meta
 * lines ended up differing by a class.
 *
 * Why the marker swaps rather than just tinting: the rose fill is the same
 * colour as the marker, so on a hovered row the marker would disappear into
 * the background. Both markers sit in the same fixed 16px slot, so nothing
 * shifts when they trade places.
 */
export function ChecklistRows({
  rows,
  className = "",
  /** Colour of the resting marker. Rose on About, per Figma 518:2541. */
  markerVar = "--tri-accent",
}: {
  rows: string[];
  className?: string;
  markerVar?: string;
}) {
  return (
    <ul className={`flex flex-col ${className}`}>
      {rows.map((row) => (
        <li
          key={row}
          // A hovered row loses its own rule and the one under it — the rose
          // fill is the separator at that point, and leaving the rules in cuts
          // the block in two. The sibling selector is why this can't be a plain
          // hover: utility on the row, effect on the next one.
          className="group border-t border-border transition-colors duration-[120ms] ease-out hover:border-t-transparent hover:bg-brand [&:hover+li]:border-t-transparent"
        >
          {/* items-start, not items-center: the marker aligns to the first
              line, so a row that wraps — which is most of them once the column
              narrows — keeps its marker at the top rather than floating to the
              middle. The 14px/3px offsets are the design's. */}
          <div className="flex items-start gap-3 py-3">
            <span className="relative w-4 shrink-0" aria-hidden>
              <span
                className="mt-[14px] block h-2 w-4 transition-opacity duration-[120ms] group-hover:opacity-0"
                style={{ background: `var(${markerVar})` }}
              />
              <ListPointer className="absolute left-1/2 top-[3px] -translate-x-1/2 opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100" />
            </span>
            <p className="t-h05">{row}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
