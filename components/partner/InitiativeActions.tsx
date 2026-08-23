"use client";

/**
 * An initiative's action buttons — with the partner ones opening the form
 * as a side drawer instead of leaving the page.
 *
 * The hrefs in the content stay exactly what they were
 * ("/bg/partner?re=<topic>"): with JavaScript, a click intercepts and
 * opens PartnerDrawer with that topic preselected; without it, the link
 * navigates to the /partner page as before — the drawer is enhancement,
 * never the only path. Locale and topic are read from the href itself, so
 * the content stays the single source of truth.
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PartnerDrawer } from "@/components/partner/PartnerDrawer";
import type { Locale } from "@/lib/partner";

type Action = { label: string; href: string; variant?: "primary" | "secondary" };

const PARTNER_HREF = /^\/(bg|en)\/partner(?:\?re=([a-z-]+))?$/;

export function InitiativeActions({ actions }: { actions: Action[] }) {
  const [drawer, setDrawer] = useState<{ locale: Locale; topic?: string } | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-6 py-12">
        {actions.map((a) => {
          const partner = a.href.match(PARTNER_HREF);
          return (
            <Button
              key={a.href + a.label}
              href={a.href}
              variant={a.variant ?? "primary"}
              onClick={
                partner
                  ? (e) => {
                      e.preventDefault();
                      setDrawer({ locale: partner[1] as Locale, topic: partner[2] });
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
        />
      )}
    </>
  );
}
