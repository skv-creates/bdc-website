"use client";

/**
 * A small copy-to-clipboard button that sits beside an email address.
 *
 * The mailto link opens whatever mail app the browser knows about — which
 * for plenty of people is nothing at all. This is the escape hatch: one
 * click puts the address on the clipboard for pasting wherever mail
 * actually gets written. The icon flips to a check for a moment as
 * confirmation, and an aria-live region says so for a screen reader.
 */
import { useEffect, useRef, useState } from "react";

export function CopyEmail({
  email,
  label,
  copiedLabel,
}: {
  email: string;
  /** The button's accessible name, e.g. "Копирай имейла". */
  label: string;
  /** Announced and shown briefly after a successful copy. */
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const confirm = () => {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      confirm();
    } catch {
      // The async API can be walled off (permissions policy, older
      // browsers); the selection-based path still works everywhere.
      const scratch = document.createElement("textarea");
      scratch.value = email;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      try {
        if (document.execCommand("copy")) confirm();
      } finally {
        scratch.remove();
      }
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className="inline-flex size-6 shrink-0 items-center justify-center align-middle transition-colors hover:text-text/60"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M2.5 8.5 6 12l7.5-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <rect
            x="5.5"
            y="5.5"
            width="9"
            height="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10.5 3.5v-2h-9v9h2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}
