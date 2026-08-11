"use client";

/**
 * Redlines — press Shift+R.
 *
 * Draws the page's own measurements over it: the column grid as the stylesheet
 * currently defines it, the type styles with the size, leading and tracking each
 * one is actually painting, the vertical spacing of every section, and a readout
 * of the live breakpoint values.
 *
 * STAGING ONLY, in two independent ways. It is rendered from
 * app/[locale]/layout.tsx behind `!IS_PRODUCTION_SITE`, which is what makes it
 * unreachable on the apex; and `next.config.ts` aliases this module to
 * components/dev/DevToolsStub.tsx on a production build, which is what keeps it
 * out of the bytes a visitor downloads. The council publishes a carbon figure;
 * a design tool no visitor asked for should not be in those bytes.
 *
 * `next/dynamic` alone does NOT do the second thing, whatever this comment used
 * to claim. A dynamic import is still a static edge in the module graph, and
 * Turbopack folded this component and EditMode into one shared client chunk
 * that the apex loaded on the home page and on every event page. The alias is
 * the fix; scripts/assert-no-dev-tools.mjs is what proves it, on every
 * production deploy.
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
  /** The HTML element carrying it — h1, h2, p, span. */
  tag: string;
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

/** Everything worth knowing about whatever text is currently selected. */
type Inspected = {
  rect: { top: number; left: number; width: number; height: number };
  tag: string;
  /** The `t-*` style, where the element carries one. */
  style: string | null;
  face: string;
  size: string;
  leading: string;
  weight: string;
  tracking: string;
  colour: string;
  transform: string;
  boxWidth: string;
  margin: string;
  padding: string;
};

/** The `t-*` class on an element, if it has one. */
function styleNameOf(el: Element): string | null {
  for (const cls of Array.from(el.classList)) {
    if (/^t-[\w-]+$/.test(cls)) return cls;
  }
  return null;
}

/** Nearest ancestor carrying a `t-*` style, else the element itself. */
function styledAncestor(node: Node | null): Element | null {
  let el: Element | null =
    node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  while (el && !styleNameOf(el) && el.parentElement) el = el.parentElement;
  return el;
}

/**
 * Every `.t-*` class the stylesheet actually defines.
 *
 * Walks nested rules recursively, which is the whole point: the type styles are
 * declared inside `@layer base { … }`, and a layer block is its own rule type
 * carrying its own `cssRules`. The first version only descended into media
 * rules, so it found none of them — the only style that ever got a label was
 * `caption`, and only because it happens to have a second, unlayered rule in a
 * media query. Every other style was silently missing from the overlay.
 */
function typeClassNames(): string[] {
  const found = new Set<string>();

  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        for (const part of rule.selectorText.split(",")) {
          const match = part.trim().match(/^\.(t-[\w-]+)$/);
          if (match) found.add(match[1]);
        }
      }
      // @layer, @media, @supports, @container — anything that nests.
      const nested = (rule as CSSGroupingRule).cssRules;
      if (nested) walk(nested);
    }
  };

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // cross-origin sheet; nothing readable in it
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
  const [inspected, setInspected] = useState<Inspected | null>(null);
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
          tag: el.tagName.toLowerCase(),
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

  /**
   * Select any text and it reports that element in full.
   *
   * More useful than labelling everything at once: the labels answer "what is
   * this" for the whole page and get crowded, while a selection answers "what
   * exactly is THIS, and what do I change" for the one thing you are looking at.
   * The two work together — labels to scan, selection to inspect.
   *
   * Reads the nearest ancestor carrying a `t-*` style, so selecting a few words
   * inside a heading reports the heading rather than an anonymous inline span.
   */
  useEffect(() => {
    if (!on) return;

    const read = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setInspected(null);
        return;
      }
      const range = selection.getRangeAt(0);
      const el = styledAncestor(range.commonAncestorContainer);
      if (!el) {
        setInspected(null);
        return;
      }
      const r = range.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const box = el.getBoundingClientRect();

      setInspected({
        rect: { top: r.top, left: r.left, width: r.width, height: r.height },
        tag: el.tagName.toLowerCase(),
        style: styleNameOf(el),
        // Just the first family; the stack is long and mostly fallbacks.
        face: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
        size: `${px(cs.fontSize)}px`,
        leading:
          cs.lineHeight === "normal"
            ? "normal"
            : `${px(cs.lineHeight)}px (${(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2)})`,
        weight: cs.fontWeight,
        tracking:
          cs.letterSpacing === "normal"
            ? "0"
            : `${px(cs.letterSpacing)}px (${(parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize)).toFixed(4)}em)`,
        colour: cs.color,
        transform: cs.textTransform,
        boxWidth: `${Math.round(box.width)}px`,
        margin: `${px(cs.marginTop)} ${px(cs.marginRight)} ${px(cs.marginBottom)} ${px(cs.marginLeft)}`,
        padding: `${px(cs.paddingTop)} ${px(cs.paddingRight)} ${px(cs.paddingBottom)} ${px(cs.paddingLeft)}`,
      });
    };

    document.addEventListener("selectionchange", read);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    read();
    return () => {
      document.removeEventListener("selectionchange", read);
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [on]);

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
              className="absolute -top-[15px] left-0 whitespace-nowrap rounded-t px-1.5 font-mono text-[11px] leading-[15px]"
              style={{ background: "var(--bdc-indigo)", color: "var(--bdc-white)" }}
            >
              {/* The HTML element first, then the Figma style name. They are
                  chosen separately on this site and often differ — an h1 carries
                  h02 in three places — so seeing only one of them tells you the
                  wrong half of what to change. */}
              <span style={{ color: "var(--bdc-amber)" }}>{box.tag}</span>
              {" · "}
              <strong>{box.name.replace(/^t-/, "")}</strong>
              {" · "}
              {box.size}/{box.leading} · {box.weight}
              {box.tracking !== "0" ? ` · ${box.tracking}` : ""}
            </span>
          </div>
        ))}

      {inspected && (
        <div
          className="absolute rounded-lg px-3 py-2 font-mono text-[11px] leading-[1.55] shadow-xl"
          style={{
            // Above the selection where there is room, below it otherwise, and
            // never off the left or right edge.
            top:
              inspected.rect.top > 190
                ? inspected.rect.top - 182
                : inspected.rect.top + inspected.rect.height + 10,
            left: Math.min(Math.max(8, inspected.rect.left), window.innerWidth - 268),
            width: 260,
            background: "var(--bdc-indigo)",
            color: "var(--bdc-white)",
          }}
        >
          <p className="mb-1.5 flex items-baseline gap-2 border-b border-white/25 pb-1.5">
            <span className="font-bold" style={{ color: "var(--bdc-amber)" }}>
              {inspected.tag}
            </span>
            <span className="font-bold">{inspected.style?.replace(/^t-/, "") ?? "no t- style"}</span>
          </p>
          {(
            [
              ["face", inspected.face],
              ["size", inspected.size],
              ["leading", inspected.leading],
              ["weight", inspected.weight],
              ["tracking", inspected.tracking],
              ["colour", inspected.colour],
              ["transform", inspected.transform],
              ["box", inspected.boxWidth],
              ["margin", inspected.margin],
              ["padding", inspected.padding],
            ] as const
          ).map(([label, value]) => (
            <p key={label} className="flex gap-2">
              <span className="w-[62px] shrink-0" style={{ opacity: 0.6 }}>
                {label}
              </span>
              <span className="break-all">{value}</span>
            </p>
          ))}
        </div>
      )}

      <div
        className="pointer-events-auto absolute bottom-4 left-4 rounded-lg p-4 font-mono text-[11px] leading-relaxed shadow-lg"
        style={{ background: "var(--bdc-dark)", color: "var(--bdc-white)" }}
      >
        <p className="font-bold uppercase tracking-[0.12em]">Redlines · shift+R</p>
        <p className="mb-2" style={{ opacity: 0.6 }}>
          select any text to inspect it
        </p>
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
