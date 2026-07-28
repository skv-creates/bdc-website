/* BDC wordmark. Four monochrome SVGs: dark for light backgrounds and white for
   dark ones, each in a Bulgarian and an English cut (Figma 29:224 — the English
   cut is variant=full-en, 29:227).

   The wordmark spells the council's name out, so it is type as much as it is a
   mark and has to follow the language toggle. The white files are the dark ones
   with the fill swapped, which is how the Bulgarian pair was already made —
   Figma carries no white variants. */
/* eslint-disable @next/next/no-img-element */

import type { Locale } from "@/lib/home-content";

type Props = { variant?: "dark" | "white"; locale: Locale; className?: string };

/* Intrinsic sizes, so the reserved box matches the file and the logo doesn't
   jump as it loads. The four are not one ratio: the English cut is narrower
   than the Bulgarian, and the two Bulgarian files were exported at slightly
   different sizes. */
const ART = {
  "dark-bg": { src: "/figma/logo-dark.svg", width: 187, height: 40 },
  "white-bg": { src: "/figma/logo-white.svg", width: 196, height: 42 },
  "dark-en": { src: "/figma/logo-dark-en.svg", width: 128, height: 28 },
  "white-en": { src: "/figma/logo-white-en.svg", width: 128, height: 28 },
} as const;

/** The mark reads as the council's name, so the alt text is that name in the
    language the mark is set in — not a description of the logo. */
const NAME: Record<Locale, string> = {
  bg: "Български Дизайн Съвет",
  en: "Bulgarian Design Council",
};

export function Logo({ variant = "dark", locale, className = "h-8 w-auto" }: Props) {
  const art = ART[`${variant}-${locale}` as keyof typeof ART];
  return (
    <img
      src={art.src}
      alt={NAME[locale]}
      className={className}
      width={art.width}
      height={art.height}
    />
  );
}
