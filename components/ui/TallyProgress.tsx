"use client";

/**
 * The application's progress bar, drawn by the page — full width, in the
 * site's own ink — while the form itself stays in its narrow column.
 *
 * Tally draws its bar inside the iframe, where it can only ever be as
 * wide as the form; the apply page wants the bar stretching the whole
 * content column. So the iframe's own bar is cropped out (see the apply
 * page) and this one listens for the events the embed already forwards
 * (formEventsForwarding=1): every Tally.FormPageView carries the page
 * number, and Tally.FormSubmitted fills the bar. Before the first event
 * arrives it shows step one, which is always true.
 */
import { useEffect, useState } from "react";

export function TallyProgress({ formId, pages }: { formId: string; pages: number }) {
  const [page, setPage] = useState(1);

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
        setPage(msg.payload.page);
      }
      if (msg.event === "Tally.FormSubmitted") setPage(pages);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [formId, pages]);

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={pages}
      aria-valuenow={Math.min(page, pages)}
      className="flex w-full gap-4"
    >
      {Array.from({ length: pages }, (_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < page ? "bg-text" : "bg-text/15"
          }`}
        />
      ))}
    </div>
  );
}
