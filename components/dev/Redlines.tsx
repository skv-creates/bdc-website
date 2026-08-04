"use client";

/**
 * Redlines — press Shift+R.
 *
 * Draws the page's own measurements over it: the column grid as the stylesheet
 * currently defines it, the type styles with the size, leading and tracking each
 * one is actually painting, the vertical spacing of every section, and a readout
 * of the live breakpoint values.
 *
 * STAGING ONLY. It is rendered from app/[locale]/layout.tsx behind
 * `!IS_PRODUCTION_SITE`, and imported with `next/dynamic` so its chunk is never
 * even requested on the apex. The council publishes a carbon figure; a design
 * tool no visitor asked for should not be in the bytes they download.
 *
 * Nothing here is hardcoded. The class list is read out of the loaded
 * stylesheet, the columns and gutters come from the custom properties, and the
 * sizes are measured from the elements themselves — so this shows what the page
 * IS, never what it was once written to be.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type Layer = "grid" | "type" | "spacing";

type TypeBox = {
  name: string;
  rect: { top: number; left: number; width: number; height: number };
  size: string;
  leading: string;
  tracking: string;
  weight: string;
};

type SpacingBox = {
  rect: { top: number; left: number; width: number; height: number };
  padTop: number;
  padBottom: number;
  marginTop: number;
};

/** Every `.t-*` class the stylesheet actually defines. */
function typeClassNames(): string[] {
  const found = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet
    }
    for (const rule of Array.from(rules)) {
      const selectors =
        rule instanceof CSSStyleRule
          ? [rule.selectorText]
          : rule instanceof CSSMediaRule
            ? Array.from(rule.cssRules)
                .filter((r): r is CSSStyleRule => r instanceof CSSStyleRule)
                .map((r) => r.selectorText)
            : [];
      for (const selectorText of selectors) {
        for (const part of selectorText.split(",")) {
          const match = part.trim().match(/^\.(t-[\w-]+)$/);
          if (match) found.add(match[1]);
        }
      }
    }
  }
  return [...found];
}

const px = (value: string) => Math.round(parseFloat(value) * 10) / 10;

export function Redlines() {
  const [on, setOn] = useState(false);
  const [layers, setLayers] = useState<Record<Layer, boolean>>({
    grid: true,
    type: true,
    spacing: false,
  });
  const [cols, setCols] = useState(12);
  const [readout, setReadout] = useState<Record<string, string>>({});
  const [typeBoxes, setTypeBoxes] = useState<TypeBox[]>([]);
  const [spacingBoxes, setSpacingBoxes] = useState<SpacingBox[]>([]);
  /** Where the page's real content grid sits, measured from it. */
  const [gridBox, setGridBox] = useState<{ left: number; width: number } | null>(null);
  const frame = useRef<number | null>(null);

  /** Re-measure everything from the live document. */
  const measure = useCallback(() => {
    const root = getComputedStyle(document.documentElement);
    const token = (name: string) => root.getPropertyValue(name).trim();

    setCols(Number(token("--grid-cols")) || 12);
    setReadout({
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      columns: token("--grid-cols"),
      gap: token("--grid-gap"),
      // A custom property never evaluates clamp(), so the declared value is a
      // formula. Measure a probe that USES it to get the width in play.
      gutter: usedLength("--page-gutter"),
      rail: usedLength("--rail-w"),
      "root font": root.fontSize,
    });

    /*
     * Viewport coordinates, NOT document ones.
     *
     * The overlay is `position: fixed`, so an absolutely positioned child
     * resolves against the viewport. Adding scrollY here — which the first
     * version did — pushed every label down the page by the scroll amount and
     * off screen, which is why the type layer looked like it was doing nothing.
     * Re-measured on scroll instead.
     */
    const inView = (r: DOMRect) =>
      r.bottom > -80 && r.top < window.innerHeight + 80 && r.width > 0 && r.height > 0;

    const names = typeClassNames();
    const boxes: TypeBox[] = [];
    for (const name of names) {
      for (const el of Array.from(document.querySelectorAll(`.${name}`))) {
        const r = el.getBoundingClientRect();
        if (!inView(r)) continue;
        const cs = getComputedStyle(el);
        boxes.push({
          name,
          rect: { top: r.top, left: r.left, width: r.width, height: r.height },
          size: `${px(cs.fontSize)}`,
          leading: cs.lineHeight === "normal" ? "normal" : `${px(cs.lineHeight)}`,
          tracking: cs.letterSpacing === "normal" ? "0" : `${px(cs.letterSpacing)}`,
          weight: cs.fontWeight,
        });
      }
    }
    setTypeBoxes(boxes);

    /*
     * The columns are read off a real `.bdc-grid` on the page rather than
     * rebuilt from the tokens.
     *
     * The first version drew them across the whole viewport, which ignored the
     * gutter and the rail — so the guides were the right count and the wrong
     * place, and every column edge was a lie. Taking the widest grid element's
     * own box guarantees the guides sit exactly where the page's columns do.
     */
    const grids = Array.from(document.querySelectorAll<HTMLElement>(".bdc-grid"))
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0);
    if (grids.length > 0) {
      const widest = grids.reduce((a, b) => (b.width > a.width ? b : a));
      setGridBox({ left: widest.left, width: widest.width });
    } else {
      setGridBox(null);
    }

    const spacing: SpacingBox[] = [];
    for (const el of Array.from(document.querySelectorAll("section"))) {
      const r = el.getBoundingClientRect();
      if (!inView(r)) continue;
      const cs = getComputedStyle(el);
      spacing.push({
        rect: { top: r.top, left: r.left, width: r.width, height: r.height },
        padTop: parseFloat(cs.paddingTop),
        padBottom: parseFloat(cs.paddingBottom),
        marginTop: parseFloat(cs.marginTop),
      });
    }
    setSpacingBoxes(spacing);
  }, []);

  /** Shift+R toggles, unless the reader is typing. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.shiftKey || event.key.toLowerCase() !== "r") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      event.preventDefault();
      setOn((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Measure while it is open, on the next frame after any scroll or resize.
  useEffect(() => {
    if (!on) return;
    const schedule = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [on, measure]);

  if (!on) return null;

  const toggle = (layer: Layer) =>
    setLayers((value) => ({ ...value, [layer]: !value[layer] }));

  return (
    <div
      // Decoration over the real page: never in the accessibility tree, never
      // in the way of a pointer. The panel re-enables pointer events for itself.
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
      data-redlines
    >
      {layers.grid && gridBox && (
        <div
          className="bdc-grid absolute top-0 h-full"
          style={{ left: gridBox.left, width: gridBox.width }}
        >
          {Array.from({ length: cols }, (_, i) => (
            <div
              key={i}
              className="h-full"
              style={{
                // Light enough to read the page through. The first version put
                // 18% rose over the entire viewport and turned the site pink.
                background: "color-mix(in srgb, var(--bdc-rose) 22%, transparent)",
                outline: "1px solid color-mix(in srgb, var(--bdc-burgundy) 30%, transparent)",
                outlineOffset: -1,
              }}
            />
          ))}
        </div>
      )}

      {layers.spacing &&
        spacingBoxes.map((box, i) => (
          <div key={i} className="absolute" style={{ ...boxStyle(box.rect) }}>
            {box.padTop > 0 && (
              <span
                className="absolute inset-x-0 top-0 block"
                style={{
                  height: box.padTop,
                  background: "color-mix(in srgb, var(--bdc-amber) 30%, transparent)",
                }}
              />
            )}
            {box.padBottom > 0 && (
              <span
                className="absolute inset-x-0 bottom-0 block"
                style={{
                  height: box.padBottom,
                  background: "color-mix(in srgb, var(--bdc-amber) 30%, transparent)",
                }}
              />
            )}
            <span
              className="absolute left-1 top-1 px-1 font-mono text-[10px] leading-tight"
              style={{ background: "var(--bdc-dark)", color: "var(--bdc-white)" }}
            >
              pad {Math.round(box.padTop)}/{Math.round(box.padBottom)}
              {box.marginTop ? ` · mt ${Math.round(box.marginTop)}` : ""}
            </span>
          </div>
        ))}

      {layers.type &&
        typeBoxes.map((box, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              ...boxStyle(box.rect),
              outline: "1px solid color-mix(in srgb, var(--bdc-indigo) 55%, transparent)",
            }}
          >
            <span
              className="absolute -top-[14px] left-0 whitespace-nowrap rounded-t px-1.5 font-mono text-[11px] font-bold leading-[14px]"
              style={{ background: "var(--bdc-indigo)", color: "var(--bdc-white)" }}
            >
              {/* The Figma name first — h01, body-lg — because that is what you
                  go and change. The class is the same string with a t- prefix. */}
              {box.name.replace(/^t-/, "")} · {box.size}/{box.leading} · {box.weight}
              {box.tracking !== "0" ? ` · ${box.tracking}` : ""}
            </span>
          </div>
        ))}

      <div
        className="pointer-events-auto absolute bottom-4 left-4 rounded-lg p-4 font-mono text-[11px] leading-relaxed shadow-lg"
        style={{ background: "var(--bdc-dark)", color: "var(--bdc-white)" }}
      >
        <p className="mb-2 font-bold uppercase tracking-[0.12em]">Redlines · shift+R</p>
        {Object.entries(readout).map(([key, value]) => (
          <p key={key}>
            <span style={{ opacity: 0.65 }}>{key.padEnd(10, " ")}</span> {value}
          </p>
        ))}
        <p className="mt-3 flex gap-2">
          {(["grid", "type", "spacing"] as Layer[]).map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => toggle(layer)}
              className="rounded-full border px-2 py-0.5"
              style={{
                borderColor: layers[layer] ? "var(--bdc-rose)" : "rgba(255,255,255,.35)",
                background: layers[layer] ? "var(--bdc-rose)" : "transparent",
                color: layers[layer] ? "var(--bdc-dark)" : "var(--bdc-white)",
              }}
            >
              {layer}
            </button>
          ))}
        </p>
      </div>
    </div>
  );
}

function boxStyle(rect: TypeBox["rect"]): React.CSSProperties {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * What a token's length actually is right now.
 *
 * `--page-gutter` is a `clamp()`, and a custom property is only substituted,
 * never evaluated — asking for its value returns the formula. Applying it as a
 * width on a throwaway element and reading that back gives a used value.
 */
function usedLength(name: string): string {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;width:var(${name})`;
  document.body.appendChild(probe);
  const used = getComputedStyle(probe).width;
  probe.remove();
  return used;
}
