import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "small";

const variants: Record<Variant, string> = {
  // bg brand → dark on hover, text inverts
  primary:
    "t-label bg-brand text-text px-12 py-4 hover:bg-brand-hover hover:text-text-invert",
  secondary:
    "t-label border-2 border-border text-text px-8 py-4 hover:bg-brand-hover hover:text-text-invert hover:border-brand-hover",
  // nav button — caption size
  small:
    "t-caption border-2 border-border text-text px-4 py-2 hover:bg-brand-hover hover:text-text-invert hover:border-brand-hover",
};

type Props = {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  type = "button",
  fullWidth = false,
}: Props) {
  const cls = `inline-flex items-center justify-center rounded-full whitespace-nowrap transition-colors duration-200 ${
    variants[variant]
  } ${fullWidth ? "w-full" : ""} ${className}`;

  if (href) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls}>
      {children}
    </button>
  );
}
