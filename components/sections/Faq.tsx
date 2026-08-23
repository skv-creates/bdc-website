"use client";

import { useState } from "react";
import { Plus, Minus } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import type { FaqBlock, SiteContent } from "@/lib/home-content";

function Answer({ blocks }: { blocks: FaqBlock[] }) {
  return (
    <div className="pb-6 pt-4 md:pl-4 md:pr-10">
      {blocks.map((b, i) => {
        if ("h" in b) {
          return (
            <p key={i} className="t-body font-medium mt-5 first:mt-0">
              {b.h}
            </p>
          );
        }
        if ("link" in b) {
          return (
            <p key={i} className="mt-4 first:mt-0">
              <Button variant="tertiary" href={b.link.href}>
                {b.link.label}
              </Button>
            </p>
          );
        }
        if ("ul" in b) {
          return (
            <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5">
              {b.ul.map((li, j) => (
                <li key={j} className="t-body">
                  {li}
                </li>
              ))}
            </ul>
          );
        }
        if ("ol" in b) {
          return (
            <ol key={i} className="mt-3 list-decimal space-y-1.5 pl-5">
              {b.ol.map((li, j) => (
                <li key={j} className="t-body">
                  {li}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="t-body mt-3 first:mt-0">
            {b.p}
          </p>
        );
      })}
    </div>
  );
}

/** One accordion row — exported for pages that build their own lists
    (the membership page's obligations and Q&A use exactly this row). */
export function FaqItem({ q, a }: { q: string; a: FaqBlock[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-2 border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-0 py-4 text-left transition-colors duration-[120ms] ease-out hover:bg-brand md:px-4"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="t-body">{q}</span>
        {open ? <Minus className="h-6 w-6 shrink-0" /> : <Plus className="h-6 w-6 shrink-0" />}
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[120ms] ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        {/* inert, not just aria-hidden: the answers carry real links, and a
            hidden-but-focusable link is an axe violation (aria-hidden-focus)
            and a keyboard trap into invisible content. */}
        <div className="overflow-hidden" inert={!open || undefined}>
          <Answer blocks={a} />
        </div>
      </div>
    </div>
  );
}

export function Faq({ faq }: { faq: SiteContent["faq"] }) {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="max-w-[632px]">
        <h2 className="t-h03">{faq.heading}</h2>
        <p className="t-body mt-6">{faq.subheading}</p>
      </div>

      {/* list: 80px below the intro, spanning cols 5–10 on desktop */}
      <div className="bdc-grid mt-20">
        <div className="col-span-4 md:col-span-8 lg:col-start-5 lg:col-span-6">
          {faq.groups.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? "mt-14" : undefined}>
              <h3 className="t-h04">{group.title}</h3>
              <div className="mt-6 border-t-2 border-border">
                {group.items.map((it) => (
                  <FaqItem key={it.q} q={it.q} a={it.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
