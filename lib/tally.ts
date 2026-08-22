/**
 * Tally's widget script, loaded on demand.
 *
 * Both Tally surfaces — the inline membership application on /contact and
 * the Членувай popup in the header — ride the same script. It is never in
 * the initial payload: the embed pulls it after hydration, the popup pulls
 * it on first click, so a page view costs no third-party JavaScript unless
 * a form is actually on screen or asked for.
 */

type TallyPopupOptions = {
  layout?: "default" | "modal";
  width?: number;
  alignLeft?: boolean;
  hideTitle?: boolean;
  overlay?: boolean;
  emoji?: { text: string; animation: string };
  autoClose?: number;
};

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
      openPopup: (formId: string, options?: TallyPopupOptions) => void;
      closePopup: (formId: string) => void;
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

/** The membership application — the form the contact page embeds inline. */
export const MEMBERSHIP_FORM_ID = "81PbQA";

/**
 * The popup configuration from the form's own share page — width,
 * alignment, no duplicate title, auto-close after submission. No emoji:
 * the share page's sample 🌻 is not the council's voice.
 */
export function openMembershipPopup(): void {
  withTally(() =>
    window.Tally?.openPopup(MEMBERSHIP_FORM_ID, {
      width: 380,
      alignLeft: true,
      hideTitle: true,
      autoClose: 5000,
    }),
  );
}
