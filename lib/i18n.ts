/**
 * Locale primitives — deliberately tiny and content-free so `proxy.ts` can
 * import them without pulling the whole content dictionary into the edge/proxy
 * bundle. `home-content.ts` re-exports these for app code.
 */
export const locales = ["bg", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bg";

/** Narrows an arbitrary string to a supported Locale. */
export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
