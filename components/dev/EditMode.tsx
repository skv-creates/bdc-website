"use client";

/**
 * Edit mode — press Shift+E. STAGING ONLY.
 *
 * Turns an event page into something you can type into. Each paragraph gets an
 * outline; clicking one opens it in place, holding the text as Notion stores
 * it. Every picture shows its alt text, or says it hasn't got any. Save writes
 * to Notion and to the staging draft store, and the page reloads showing what
 * you wrote.
 *
 * Mounted from app/[locale]/layout.tsx behind `!IS_PRODUCTION_SITE`, which is
 * what makes it unreachable on the apex, and aliased away by `next.config.ts` on
 * a production build, which is what keeps it out of the bundle. `next/dynamic`
 * was doing only the first of those, despite this comment once saying otherwise:
 * the apex was downloading this file's code, including the passphrase cookie
 * name and the editing endpoint's path, on every event page. See
 * components/dev/Redlines.tsx and components/dev/DevToolsStub.tsx.
 *
 * **What you edit is source, not rendered text.** A description arrives from
 * Notion as `[European Design Awards Festival](https://…)`, and the page turns
 * that into a link; a lone YouTube link on its own line becomes a player. Edit
 * the rendered words and those would be flattened into literal brackets on the
 * way back. So clicking a paragraph opens the source line behind it, brackets
 * and all — which is also the only form Notion can be handed back losslessly.
 *
 * **Nothing here needs the page to cooperate.** There are no data-edit
 * attributes in EventOverlayContent and no editing-shaped props threaded
 * through it. Paragraphs are matched to their source by comparing text, and
 * pictures by the filename inside next/image's `src`. That keeps the editor
 * entirely inside this file and off the apex's render path — a page component
 * that carried editor hooks would ship them to production whether or not
 * anything used them.
 */
import { useCallback, useEffect, useState } from "react";

/** Where the passphrase lives once entered. Per tab, gone when it closes. */
const PASS_KEY = "bdc-edit-pass";

type Cover = { src: string; width: number; height: number; alt: string };
type Loaded = {
  slug: string;
  locale: string;
  name: string;
  description: string;
  covers: Cover[];
  draft: { savedAt: string; by?: string } | null;
};

/** `[label](url)` → `label`, so a source line can be matched to rendered text. */
const plain = (s: string) => s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1");

/** Collapse whitespace — the DOM re-wraps, the source does not. */
const norm = (s: string) => s.replace(/\s+/g, " ").trim();

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * A source paragraph as the HTML the page would have rendered for it.
 *
 * Only used to update what is already on screen after a save, so it covers the
 * one construct these paragraphs contain: `[label](url)`. Everything else is
 * escaped — the text is going in via innerHTML and it came out of a textarea,
 * so treating it as markup would be an XSS hole in the one tool that holds a
 * write token.
 *
 * The anchor deliberately does not reproduce ExternalLink's icon and screen
 * reader text. This is a preview of an edit, not a re-render of the page; the
 * next build produces the real thing.
 */
function asHtml(source: string): string {
  return escapeHtml(source).replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_m, label: string, href: string) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`,
  );
}

/**
 * Which element on the page is rendering each source paragraph.
 *
 * By text, not by an attribute: see the note at the top of the file. Matches
 * are consumed as they are found, so a page that repeats a sentence — the two
 * talk links on PechaKucha nearly do — pairs them up in document order instead
 * of pointing both source lines at the first element.
 *
 * A plain function rather than state holding DOM nodes. React state is meant to
 * be treated as immutable and these get written to after a save; keeping them
 * out of it means the read is always current, which for the DOM it has to be.
 */
function matchParagraphs(paras: string[]): (HTMLElement | null)[] {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("p.t-body"));
  const used = new Set<HTMLElement>();
  return paras.map((p) => {
    const want = norm(plain(p));
    const hit = candidates.find((el) => !used.has(el) && norm(el.textContent ?? "") === want);
    if (hit) used.add(hit);
    return hit ?? null;
  });
}

/** Cover `src` → the <img> showing it. */
function matchImages(covers: Cover[]): Record<string, HTMLImageElement> {
  const map: Record<string, HTMLImageElement> = {};
  for (const img of Array.from(document.querySelectorAll("img"))) {
    // next/image rewrites src to /_next/image?url=<encoded>&w=…, so the
    // original path is inside it rather than equal to it.
    const raw = decodeURIComponent(img.currentSrc || img.src);
    const cover = covers.find((c) => raw.includes(c.src));
    // The carousel renders every picture twice for the seamless loop; the
    // first match is the real one, the second is the aria-hidden copy.
    if (cover && !map[cover.src]) map[cover.src] = img;
  }
  return map;
}

/** `/bg/events/some-slug` → { locale: 'bg', slug: 'some-slug' }. */
function targetFromPath(path: string): { locale: string; slug: string } | null {
  const m = path.match(/^\/(bg|en)\/events\/([^/]+)\/?$/);
  return m ? { locale: m[1], slug: m[2] } : null;
}

export function EditMode() {
  const [on, setOn] = useState(false);
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Working copy: source paragraphs, and cover src → alt. */
  const [paras, setParas] = useState<string[]>([]);
  const [alts, setAlts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Read at render rather than memoised: the path cannot change while the
  // overlay is open without a navigation, and a navigation re-renders this.
  const target =
    on && typeof window !== "undefined" ? targetFromPath(window.location.pathname) : null;

  const pass = useCallback((): string | null => {
    const held = sessionStorage.getItem(PASS_KEY);
    if (held) return held;
    const asked = window.prompt("Edit passphrase");
    if (!asked) return null;
    sessionStorage.setItem(PASS_KEY, asked);
    return asked;
  }, []);

  /* ---- Shift+E ---------------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore the shortcut while typing, or Shift+E would toggle the editor
      // off in the middle of writing a capital E.
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        // Asked for here rather than in the load effect. Prompting from an
        // effect means turning the overlay back off from inside one when it is
        // declined, and a setState in an effect body is a cascading render —
        // the lint rule that catches it is right, and the fix is to make the
        // decision at the point the person actually made it.
        if (on) setOn(false);
        else if (pass()) {
          setError(null);
          setNote(null);
          setOn(true);
        }
      }
      if (e.key === "Escape") setEditing(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on, pass]);

  /* ---- Load on open ------------------------------------------------------ */
  useEffect(() => {
    if (!on || !target) return;
    // Already established by the toggle; this only reads it back.
    const key = sessionStorage.getItem(PASS_KEY);
    if (!key) return;

    let cancelled = false;
    fetch(`/api/staging-edit?slug=${encodeURIComponent(target.slug)}&locale=${target.locale}`, {
      headers: { "x-bdc-edit": key },
    })
      .then(async (r) => {
        if (r.status === 401) {
          // A wrong passphrase should not be sticky — clear it so the next
          // open asks again rather than failing forever.
          sessionStorage.removeItem(PASS_KEY);
          throw new Error("Passphrase not accepted.");
        }
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`);
        return r.json() as Promise<Loaded>;
      })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setParas(d.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean));
        setAlts(Object.fromEntries(d.covers.map((c) => [c.src, c.alt])));
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [on, target, pass]);

  /* ---- Find the element rendering each paragraph -------------------------- */
  const anchors = on ? matchParagraphs(paras) : [];
  const imgAnchors = on && data ? matchImages(data.covers) : {};

  /* ---- Keep the boxes on the text ----------------------------------------- */
  /**
   * Every overlay is positioned from a fresh getBoundingClientRect at render
   * time, and those are viewport coordinates — so without re-rendering on
   * scroll the outlines stay where the text used to be. A counter is enough:
   * the rects are read during render, so all this has to do is cause one.
   *
   * rAF-throttled because scroll fires far more often than frames, and this
   * runs on a page that is already animating a carousel.
   */
  const [, tick] = useState(0);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const bump = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick((n) => n + 1);
      });
    };
    window.addEventListener("scroll", bump, { passive: true, capture: true });
    window.addEventListener("resize", bump);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", bump, { capture: true });
      window.removeEventListener("resize", bump);
    };
  }, [on]);

  /* ---- Save --------------------------------------------------------------- */
  const save = async () => {
    if (!data || !target) return;
    const key = pass();
    if (!key) return;
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/staging-edit", {
        method: "POST",
        headers: { "content-type": "application/json", "x-bdc-edit": key },
        body: JSON.stringify({
          slug: data.slug,
          locale: data.locale,
          description: paras.join("\n\n"),
          alts,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);

      if (body.staging === false) {
        setNote("Saved to Notion, but staging has no draft store bound — the page will not change until the next sync.");
        setBusy(false);
        return;
      }
      if (body.notion?.skipped?.length) {
        setNote(`Saved. Left alone in Notion: ${body.notion.skipped.join("; ")}`);
        setBusy(false);
        return;
      }
      // Show it on the page at once.
      //
      // A reload would be cleaner and was the first version, but it does not
      // work: event pages are prerendered, so the server hands back the
      // committed copy no matter what is in the draft store. Making the route
      // dynamic would have fixed that and did — for the apex too, which turned
      // /[locale]/events/[slug] from ● to ƒ in the production build and cost
      // the public site its prerendering. Not a trade worth making for an
      // editing tool no visitor uses.
      //
      // So the paragraph elements are rewritten in place. The mapping is
      // already known — `anchors[i]` is the element rendering source paragraph
      // i — and `[label](url)` is turned back into a real anchor so a link
      // edited here looks like a link immediately rather than like brackets.
      const els = matchParagraphs(data.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean));
      for (let i = 0; i < paras.length; i++) {
        const el = els[i];
        if (el) el.innerHTML = asHtml(paras[i]);
      }
      const imgs = matchImages(data.covers);
      for (const [src, text] of Object.entries(alts)) {
        const img = imgs[src];
        if (img) img.alt = text;
      }
      // Re-baseline, so the Save button goes back to disabled and a second
      // save does not re-send what Notion already has.
      setData({
        ...data,
        description: paras.join("\n\n"),
        covers: data.covers.map((c) => ({ ...c, alt: alts[c.src] ?? c.alt })),
      });
      setNote(
        "Saved to Notion. This page now shows it; everyone else sees it once the events sync next runs.",
      );
      setBusy(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setBusy(false);
    }
  };

  const dirty =
    !!data &&
    (paras.join("\n\n") !== data.description ||
      data.covers.some((c) => (alts[c.src] ?? "") !== c.alt));

  if (!on) return null;

  return (
    <>
      {/* Outlines + click targets over each paragraph */}
      {anchors.map((el, i) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return editing === i ? (
          <div
            key={i}
            style={{
              position: "fixed",
              top: r.top - 6,
              left: r.left - 8,
              width: Math.max(r.width + 16, 320),
              zIndex: 100000,
            }}
          >
            <textarea
              autoFocus
              value={paras[i]}
              onChange={(e) =>
                setParas((prev) => prev.map((p, n) => (n === i ? e.target.value : p)))
              }
              onBlur={() => setEditing(null)}
              rows={Math.max(3, Math.ceil(paras[i].length / 60))}
              style={{
                width: "100%",
                font: "400 16px/1.5 ui-monospace, monospace",
                padding: 8,
                border: "2px solid var(--bdc-burgundy, #7b1e3a)",
                background: "#fff",
                color: "#111",
                borderRadius: 4,
                resize: "vertical",
              }}
            />
          </div>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => setEditing(i)}
            aria-label={`Edit paragraph ${i + 1}`}
            style={{
              position: "fixed",
              top: r.top - 4,
              left: r.left - 6,
              width: r.width + 12,
              height: r.height + 8,
              border: "1px dashed rgba(123,30,58,.7)",
              background: "rgba(123,30,58,.05)",
              borderRadius: 3,
              cursor: "text",
              zIndex: 99998,
            }}
          />
        );
      })}

      {/* Alt-text badge on each picture */}
      {data?.covers.map((c) => {
        const el = imgAnchors[c.src];
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width < 40) return null;
        const value = alts[c.src] ?? "";
        return (
          <div
            key={c.src}
            style={{
              position: "fixed",
              top: r.bottom - 76,
              left: r.left + 8,
              width: Math.min(r.width - 16, 380),
              zIndex: 99999,
              background: "rgba(17,17,17,.92)",
              padding: 8,
              borderRadius: 4,
            }}
          >
            <label
              style={{
                display: "block",
                font: "600 10px/1.4 ui-monospace, monospace",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: value ? "#9fe0a8" : "#ffb4a8",
                marginBottom: 4,
              }}
            >
              {value ? "Alt text" : "No alt text"}
            </label>
            <input
              value={value}
              placeholder="Describe this photograph"
              onChange={(e) => setAlts((prev) => ({ ...prev, [c.src]: e.target.value }))}
              style={{
                width: "100%",
                font: "400 13px/1.4 system-ui, sans-serif",
                padding: "5px 6px",
                border: "1px solid #555",
                borderRadius: 3,
                background: "#fff",
                color: "#111",
              }}
            />
          </div>
        );
      })}

      {/* The bar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100001,
          background: "#111",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          font: "400 13px/1.4 system-ui, sans-serif",
        }}
      >
        <strong style={{ font: "700 12px/1.4 ui-monospace, monospace", letterSpacing: ".08em" }}>
          EDIT · SHIFT+E
        </strong>

        {!target && <span>Open an event page to edit it. Initiatives are not in Notion yet.</span>}
        {target && !data && !error && <span>Loading…</span>}
        {data && (
          <span>
            {data.name} · {data.locale.toUpperCase()} · {paras.length} paragraphs ·{" "}
            {data.covers.length} images
            {data.covers.filter((c) => !(alts[c.src] ?? "").trim()).length > 0 && (
              <span style={{ color: "#ffb4a8" }}>
                {" "}
                · {data.covers.filter((c) => !(alts[c.src] ?? "").trim()).length} without alt
              </span>
            )}
          </span>
        )}
        {data?.draft && (
          <span style={{ color: "#9fb8e0" }}>
            draft saved {new Date(data.draft.savedAt).toLocaleString()}
          </span>
        )}
        {error && <span style={{ color: "#ffb4a8" }}>{error}</span>}
        {note && <span style={{ color: "#ffe08a" }}>{note}</span>}

        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setOn(false)}
            style={{ padding: "7px 14px", background: "transparent", color: "#fff", border: "1px solid #555", borderRadius: 3 }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || busy}
            style={{
              padding: "7px 14px",
              background: dirty && !busy ? "#7b1e3a" : "#333",
              color: "#fff",
              border: 0,
              borderRadius: 3,
              cursor: dirty && !busy ? "pointer" : "default",
            }}
          >
            {busy ? "Saving…" : "Save to Notion + staging"}
          </button>
        </span>
      </div>
    </>
  );
}
