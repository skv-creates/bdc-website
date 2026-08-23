"use client";

/**
 * An initiative's action buttons.
 *
 * The primary — Партнирай с нас — is a plain navigation to the /partner
 * page: the indexable landing that Google Ads points at, and the form in
 * its full context. The secondary actions carry a specific ask — Започни
 * пилот, Предложи казус — and open the form as a side drawer instead,
 * with the button's label travelling as the enquiry's intent (it leads
 * the email's subject) and its prompt as the drawer's lead. The hrefs
 * stay what they were: without JavaScript every button is still the link
 * to /partner — the drawer is enhancement, never the only path.
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PartnerDrawer } from "@/components/partner/PartnerDrawer";
import type { Locale } from "@/lib/partner";

type Action = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  prompt?: string;
  form?: "pilot";
};

const PARTNER_HREF = /^\/(bg|en)\/partner(?:\?re=([a-z-]+))?$/;

export function InitiativeActions({ actions }: { actions: Action[] }) {
  const [drawer, setDrawer] = useState<{
    locale: Locale;
    topic?: string;
    intent: string;
    prompt?: string;
    mode?: "partner" | "pilot";
  } | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-6 py-12">
        {actions.map((a) => {
          const partner = a.href.match(PARTNER_HREF);
          const opensDrawer = partner && a.variant === "secondary";
          return (
            <Button
              key={a.href + a.label}
              href={a.href}
              variant={a.variant ?? "primary"}
              onClick={
                opensDrawer
                  ? (e) => {
                      e.preventDefault();
                      setDrawer({
                        locale: partner[1] as Locale,
                        topic: partner[2],
                        intent: a.label,
                        prompt: a.prompt,
                        mode: a.form ?? "partner",
                      });
                      setOpen(true);
                    }
                  : undefined
              }
            >
              {a.label}
            </Button>
          );
        })}
      </div>
      {drawer && (
        <PartnerDrawer
          open={open}
          onClose={() => setOpen(false)}
          locale={drawer.locale}
          topic={drawer.topic}
          intent={drawer.intent}
          prompt={drawer.prompt}
          mode={drawer.mode}
        />
      )}
    </>
  );
}
