/** Minimal inline icons — currentColor so they inherit text color. */
import type { SVGProps } from "react";

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function Plus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Minus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/**
 * The one LinkedIn mark in the system — footer, initiative team panel and the
 * member overlays all use it. A second, filled version used to live here for
 * the overlays alone, which made the same link look like two different things
 * depending on where you met it.
 */
export function LinkedIn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 11v6" />
    </svg>
  );
}


export function Close(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

/** The small triangular accent that precedes the event label. */
export function HighlightDetail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M0 0H20V20L0 0Z" />
    </svg>
  );
}

/**
 * Six-pointed asterisk that replaces the rose bar on a hovered list row
 * (Figma list-wrapper 327:1174 / 353:1554). Its own 14×15 box, not a text
 * glyph — "✲" renders differently across the fallback fonts.
 */
export function ListPointer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={14} height={15} viewBox="0 0 14 15" fill="currentColor" {...props}>
      <path d="M5.72047 5.27992V-7.89165e-05H8.04047V5.27992H5.72047ZM4.56047 7.27992L0.000468805 4.63992L1.16047 2.63992L5.70047 5.27992L4.56047 7.27992ZM9.16047 7.27992L8.04047 5.29992L12.6005 2.63992L13.7605 4.63992L9.16047 7.27992ZM12.6005 11.9199L8.00047 9.27992L9.16047 7.29992L13.7605 9.91992L12.6005 11.9199ZM1.16047 11.9199L0.000468805 9.91992L4.56047 7.29992L5.72047 9.27992L1.16047 11.9199ZM5.72047 14.5599V9.29992H8.00047V14.5599H5.72047Z" />
    </svg>
  );
}
