"use client";

/**
 * A select in the site's own clothes.
 *
 * The native <select> posts perfectly but its popup is drawn by the OS and
 * cannot wear the brand. This is the same control rebuilt on the ARIA
 * combobox/listbox pattern: closed, it is the ruled field with the
 * corner-mark triangle; open, a bordered panel of options on the page's
 * own ground, the brand band on the hovered row. Keyboard first-class —
 * Arrow keys move, Enter/Space choose, Escape closes, Home/End jump —
 * with aria-activedescendant carrying the highlight to a screen reader.
 * A hidden input holds the value, so the surrounding native form POSTs
 * exactly as it would with a real <select>.
 */
import { useEffect, useId, useRef, useState } from "react";

export function SelectField({
  name,
  options,
  defaultValue,
  label,
}: {
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  /** The visible field label, rendered above the control. */
  label: string;
}) {
  const initial = Math.max(
    0,
    options.findIndex((o) => o.value === defaultValue),
  );
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(initial);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const labelId = useId();

  // A click outside closes without choosing.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const choose = (i: number) => {
    setSelected(i);
    setActive(i);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setActive(selected);
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={root} className="flex flex-col gap-2">
      <span id={labelId} className="t-caption font-bold">
        {label}
      </span>
      <input type="hidden" name={name} value={options[selected]?.value ?? ""} />
      <div className="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-activedescendant={open ? `${listId}-${active}` : undefined}
          onClick={() => {
            setActive(selected);
            setOpen((v) => !v);
          }}
          onKeyDown={onKeyDown}
          className="t-body flex w-full cursor-pointer items-center justify-between gap-4 border-b-2 border-border bg-transparent px-0 py-2 text-left outline-none transition-colors focus:border-current"
        >
          <span>{options[selected]?.label}</span>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            aria-hidden
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polygon points="0,0 12,0 6,8" fill="currentColor" />
          </svg>
        </button>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute inset-x-0 top-full z-20 mt-1 border-2 border-border bg-page py-1"
          >
            {options.map((o, i) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === selected}
                onPointerMove={() => setActive(i)}
                onClick={() => choose(i)}
                className={`t-body cursor-pointer px-4 py-2.5 ${
                  i === active ? "bg-brand" : ""
                } ${i === selected ? "font-bold" : ""}`}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
