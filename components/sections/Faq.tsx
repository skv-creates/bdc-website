"use client";

import { useState } from "react";
import { Plus, Minus } from "@/components/ui/icons";
import { faq } from "@/lib/home-content";

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-2 border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-[120ms] ease-out hover:bg-brand"
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
        <div className="overflow-hidden" aria-hidden={!open}>
          <p className="t-body pb-5 pl-4 pr-10 opacity-80">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-x-16">
        <div className="max-w-[632px]">
          <h2 className="t-h03">{faq.heading}</h2>
          <p className="t-body mt-6">{faq.subheading}</p>
        </div>
        <div className="lg:pt-1">
          {faq.items.map((it) => (
            <Item key={it.q} q={it.q} a={it.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
