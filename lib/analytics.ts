/**
 * The GA4 measurement id — the one thing to fill in once the council's GA4
 * property exists (analytics.google.com → Admin → Data streams → Web).
 *
 * Hardcoded, not an env var, for the same reason as GOOGLE_SITE_VERIFICATION
 * in lib/site.ts: it is public by design — it ships in the page source of
 * every site that uses GA — and a constant cannot go missing the way an unset
 * variable can.
 *
 * Empty string = analytics fully off: components/ui/AnalyticsConsent renders
 * nothing, no banner, no script. Nothing else needs to change to enable it.
 */
export const GA4_MEASUREMENT_ID = "";
