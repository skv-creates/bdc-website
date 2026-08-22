/**
 * Tally's widget script, loaded on demand.
 *
 * The script is never in the initial payload: TallyEmbed pulls it after
 * hydration on the one page that carries a form, so an ordinary page view
 * costs no third-party JavaScript.
 */

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

const EMBED_SCRIPT = "https://tally.so/widgets/embed.js";

/** Run `ready` once window.Tally exists, loading the script if needed. */
export function withTally(ready: () => void): void {
  if (window.Tally) {
    ready();
    return;
  }
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SCRIPT}"]`);
  if (existing) {
    existing.addEventListener("load", ready, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = EMBED_SCRIPT;
  script.async = true;
  script.onload = ready;
  document.body.appendChild(script);
}

/** The membership application — embedded full-screen on /membership/apply. */
export const MEMBERSHIP_FORM_ID = "81PbQA";

/**
 * The fallback page count for the application's progress bar. The real
 * total is counted from the form itself at build time — see
 * lib/tally-pages.ts — and this value steps in only when that fetch
 * fails. Keep it roughly right, not sacred.
 */
export const MEMBERSHIP_FORM_PAGES = 5;
