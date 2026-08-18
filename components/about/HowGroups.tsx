"use client";

/**
 * The three dimensions of «Как работим» (Figma 574:5662 / 5433 / 5498).
 *
 * Each group: the dimension's statement on the left, and on the right an
 * accordion of the council's actual activity areas. The rows are the site's
 * FAQ item — same border, same padding, same grid-template-rows collapse,
 * same Plus/Minus swap (see Faq.tsx) — with the frame's t-h05 title and an
 * optional tertiary «Прочети → » link into a programme page.
 *
 * The first row of each group starts open: this page is what an Ad Grants
 * reviewer reads to learn what the council does, and a wall of closed
 * accordions shows nothing. The rest fold, as accordions should.
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Minus } from "@/components/ui/icons";
import type { AboutCopy } from "@/lib/about";

function Row({
  item,
  locale,
  defaultOpen,
}: {
  item: AboutCopy["how"]["groups"][number]["items"][number];
  locale: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b-2 border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-0 py-4 text-left transition-colors duration-[120ms] ease-out hover:bg-brand md:px-4"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="t-h05">{item.title}</span>
        {open ? <Minus className="h-6 w-6 shrink-0" /> : <Plus className="h-6 w-6 shrink-0" />}
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[120ms] ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" aria-hidden={!open}>
          <div className="flex flex-col items-start gap-3 pb-4 md:px-4">
            <p className="t-body">{item.body}</p>
            {item.link && (
              <Button variant="tertiary" href={`/${locale}${item.link.href}`}>
                {item.link.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowGroups({
  groups,
  locale,
}: {
  groups: AboutCopy["how"]["groups"];
  locale: string;
}) {
  return (
    <>
      {/* The rhythm is the initiative pages' own: 80px above and below each
          group at lg — 160 between neighbours — halved below lg. Inside a
          group the frame draws 48 between the title row and the content row,
          and the accordion top-aligns with the BODY text, not the title. */}
      {groups.map((group) => (
        <div key={group.title} className="bdc-grid col-span-full gap-y-6 py-[60px] lg:gap-y-12 lg:py-20">
          <h3 className="t-h03 col-span-full whitespace-pre-line lg:col-span-5 lg:row-start-1">
            {group.title}
          </h3>
          <p className="t-body col-span-full lg:col-span-5 lg:row-start-2">{group.body}</p>
          <div className="col-span-full lg:col-start-6 lg:col-span-6 lg:row-start-2">
            {group.items.map((item, i) => (
              <Row key={item.title} item={item} locale={locale} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
