/* BDC wordmark. Two monochrome SVGs (dark for light bg, white for dark bg). */
/* eslint-disable @next/next/no-img-element */

type Props = { variant?: "dark" | "white"; className?: string };

export function Logo({ variant = "dark", className = "h-8 w-auto" }: Props) {
  const src = variant === "white" ? "/figma/logo-white.svg" : "/figma/logo-dark.svg";
  return (
    <img
      src={src}
      alt="Български Дизайн Съвет"
      className={className}
      width={variant === "white" ? 196 : 187}
      height={variant === "white" ? 42 : 40}
    />
  );
}
