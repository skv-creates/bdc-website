/**
 * The brand face, in one place, because two files need it.
 *
 * It lived in app/[locale]/layout.tsx, which was fine while the layout was the
 * only thing that rendered a document. It is not: a 404 renders *outside* that
 * layout — Next wraps not-found in its own bare <html id="__next_error__">,
 * because this app's root layout sits under a dynamic [locale] segment and
 * cannot be composed for an unmatched URL. Without the variable class from
 * here, --font-about-beige is undefined on that page and every heading falls
 * back to system-ui, which is a strange thing for a design council's error
 * page to do.
 *
 * next/font requires the loader to be called at module scope, so exporting the
 * result is the supported way to share it. `variable` is the class name to put
 * on whichever element roots the document.
 */
import localFont from "next/font/local";

/**
 * "About Beige Standard", self-hosted.
 *
 * Three weights, matching the three the type scale actually uses:
 * --weight-regular 400, --weight-medium 500, --weight-bold 700 in base.css.
 * Heavy (800) was declared once and shipped on every page while nothing
 * referenced it — a fourth weight costs ~70KB on first load, so only add one
 * when a type class needs it.
 */
export const aboutBeige = localFont({
  src: [
    { path: "../app/fonts/AboutBeigeStandard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/AboutBeigeStandard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/AboutBeigeStandard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-about-beige",
  display: "swap",
});
