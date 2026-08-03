import type { ReactNode } from 'react';

/**
 * The layout language of the Foundations pages.
 *
 * These pages are documentation, but they are also the first thing anyone sees
 * of the council's design work, and a system documented in a cramped list of
 * key–value pairs argues against itself. The shape here is the one Apple's HIG
 * and Material both settle on, for the same reason: **the specimen is the hero**
 * — a colour field or a line of type at the size it really paints, given room —
 * and the numbers sit underneath it, quiet and secondary. You should be able to
 * judge the thing by looking, and check the value if you need it.
 *
 * Three rules hold it together:
 *
 * - Prose is capped near 68 characters. Specimens are not capped at all, because
 *   a type scale shown in a narrow column is not being shown.
 * - One vertical rhythm, set here, so no page invents its own spacing.
 * - The page is drawn with the site's own tokens. If the design system looks
 *   wrong here, that is information, not a styling bug to paper over.
 */

export function Page({
  title,
  lede,
  children,
}: {
  title: string;
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="min-h-screen px-8 pb-32 pt-16 md:px-16">
      <header className="max-w-[68ch]">
        <p className="t-caption uppercase tracking-[0.12em] opacity-50">Foundations</p>
        <h1 className="t-h02 mt-3">{title}</h1>
        <div className="t-body-lg mt-6 opacity-80">{lede}</div>
      </header>
      {children}
    </article>
  );
}

export function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-24">
      <div className="max-w-[68ch]">
        <h2 className="t-h04">{title}</h2>
        {intro && <div className="t-body mt-4 opacity-80">{intro}</div>}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}

/**
 * A short aside for the thing that will bite someone.
 *
 * Deliberately rare. If every paragraph is marked important, none of them is.
 */
export function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="mt-10 max-w-[68ch] border-s-4 border-brand ps-6">
      <p className="t-label">{title}</p>
      <div className="t-body mt-2 opacity-80">{children}</div>
    </aside>
  );
}

/** Label / value pair, used under specimens. Monospaced values, quiet labels. */
export function Spec({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="t-caption uppercase tracking-[0.08em] opacity-40">{label}</dt>
      <dd className="t-caption font-mono">{value}</dd>
    </div>
  );
}
