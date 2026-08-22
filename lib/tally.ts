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
 * How many pages the application has — drives the page's own progress bar
 * (TallyProgress), since Tally's events carry the current page but not the
 * total. Update alongside the form if steps are added or removed in Tally.
 */
export const MEMBERSHIP_FORM_PAGES = 5;
