"use client";

/**
 * The application's progress bar, drawn by the page — full width, in the
 * site's own ink — while the form itself stays in its narrow column.
 *
 * Tally draws its bar inside the iframe, where it can only ever be as
 * wide as the form; the apply page wants the bar stretching the whole
 * content column. So the iframe's own bar is cropped out (see the apply
 * page) and this one listens for the events the embed already forwards
 * (formEventsForwarding=1).
 *
 * The step is the visitor's own count of pages, not Tally's page number:
 * the form branches, and Tally reports the PHYSICAL page index — the
 * individual path lands on page 2 where the organisation path lands on
 * page 3, yet both are the visitor's second step. A stack of visited
 * pages keeps the ordinal honest in both directions: forward pushes,
 * Обратно pops back to the page returned to.
 */
import { useEffect, useRef, useState } from "react";

export function TallyProgress({ formId, pages }: { formId: string; pages: number }) {
  const [step, setStep] = useState(1);
  const visited = useRef<number[]>([1]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      let data: unknown = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      const msg = data as { event?: string; payload?: { formId?: string; page?: number } };
      if (msg?.payload?.formId !== formId) return;
      if (msg.event === "Tally.FormPageView" && typeof msg.payload.page === "number") {
        const page = msg.payload.page;
        const v = visited.current;
        if (page > v[v.length - 1]) {
          v.push(page);
        } else {
          while (v.length > 1 && v[v.length - 1] > page) v.pop();
          if (v[v.length - 1] !== page) v.push(page);
        }
        setStep(Math.min(v.length, pages));
      }
      if (msg.event === "Tally.FormSubmitted") setStep(pages);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [formId, pages]);

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={pages}
      aria-valuenow={step}
      className="flex w-full gap-4"
    >
      {Array.from({ length: pages }, (_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < step ? "bg-text" : "bg-text/15"
          }`}
        />
      ))}
    </div>
  );
}
