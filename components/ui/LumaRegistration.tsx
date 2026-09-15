/**
 * LumaRegistration — the registration card in the slot the cover image
 * would otherwise take, for an event whose Регистрация column is a Luma URL.
 *
 * It replaced Luma's embedded form. That form is Luma's own client-rendered
 * app: even with the connection warmed up front it needed a dozen requests
 * and about 1.5s after the page was ready before a Register button existed,
 * and every placeholder tried in the meantime was a card standing where the
 * form should be. This card is ours, so it is on screen with the rest of the
 * page, and the Register button opens Luma's checkout as a modal only once
 * someone has asked for it — see LumaCheckout. `preconnect` still warms the
 * connection so that modal comes up faster when they do.
 *
 * Date and place are already in the meta line and, for this format, in the
 * Notion body's "Кога и къде" block, so the card does not repeat them.
 */
import { preconnect } from "react-dom";
import { LumaCheckoutButton } from "@/components/ui/LumaCheckout";

export function LumaRegistration({
  eventId,
  href,
  ui,
}: {
  /** The slug or `evt-…` id, as `lumaEventId` reads it from the URL. */
  eventId: string;
  /** The public event page on Luma. */
  href: string;
  ui: { registration: string; register: string; registrationNote: string };
}) {
  preconnect("https://luma.com");
  preconnect("https://images.lumacdn.com");

  return (
    <div className="flex flex-col gap-8 border border-border p-8 lg:p-10">
      <h2 className="t-h04">{ui.registration}</h2>
      <LumaCheckoutButton eventId={eventId} href={href}>
        {ui.register}
      </LumaCheckoutButton>
      <p className="t-caption">{ui.registrationNote}</p>
    </div>
  );
}
