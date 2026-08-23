import type { MouseEvent, ReactNode } from "react";

type Variant = "primary" | "secondary" | "small" | "tertiary";

/** Shared by the three pill variants. Tertiary is not a pill — see below. */
const pill = "inline-flex items-center justify-center rounded-full whitespace-nowrap";

const variants: Record<Variant, string> = {
  // bg brand → dark on hover, text inverts
  primary: `${pill} t-label bg-brand text-text px-12 py-4 hover:bg-brand-hover hover:text-text-invert`,
  secondary: `${pill} t-label border-2 border-border text-text px-8 py-4 hover:bg-brand-hover hover:text-text-invert hover:border-brand-hover`,
  // nav button — caption size
  small: `${pill} t-caption border-2 border-border text-text px-4 py-2 hover:bg-brand-hover hover:text-text-invert hover:border-brand-hover`,
  /**
   * Tertiary (Figma 176:1339) — no chrome at rest: caption-size label on the
   * left, ↗ pushed to the right, and on hover a 2px rule appears under the
   * whole row, 2px below the text.
   *
   * The rule is a transparent border at rest rather than being added on hover,
   * so the row doesn't grow by 4px and shove the following content down the
   * moment the pointer touches it. `justify-between` only bites once the button
   * has a width to fill, which is what `fullWidth` is for; on its own it sits at
   * content width with the gap between label and arrow.
   */
  tertiary:
    "inline-flex items-center justify-between gap-6 t-caption text-text pb-0.5 border-b-2 border-transparent hover:border-current",
};

type Props = {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
  /** On the button form it is the action; on a link it can intercept the
      navigation (e.g. to open the same destination as a drawer). */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Open in a new tab even for an internal href — for links offered while
      a visitor is mid-form, where navigating away would lose their input. */
  newTab?: boolean;
};

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  type = "button",
  fullWidth = false,
  onClick,
  newTab = false,
}: Props) {
  // The two pill CTAs span the full width on phones and shrink to content from
  // sm up. `small` (the nav button) and `tertiary` (a text link) are excluded —
  // stretching either reads as a mistake rather than a button.
  const stretchOnMobile = variant === "primary" || variant === "secondary";
  const width = fullWidth ? "w-full" : stretchOnMobile ? "w-full sm:w-auto" : "";
  const cls = `transition-colors duration-200 ${variants[variant]} ${width} ${className}`;

  const external = href ? /^https?:\/\//.test(href) : false;

  // The arrow belongs to the tertiary component itself, so callers pass only a
  // label. aria-hidden because it is decoration — the label already says where
  // the link goes. Two arrows for two meanings, the site-wide rule: ↗ leaves
  // the site, → stays on it.
  const content =
    variant === "tertiary" ? (
      <>
        <span>{children}</span>
        <span aria-hidden>{external ? "↗" : "→"}</span>
      </>
    ) : (
      children
    );

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        onClick={onClick}
        {...(external || newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick}>
      {content}
    </button>
  );
}
