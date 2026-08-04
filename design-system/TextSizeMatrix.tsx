import { useState } from 'react';
import {
  fontSizeAt,
  REFERENCE_WIDTHS,
  respondsToTextSize,
  ROOT_PX,
  TEXT_SIZE_STEPS,
  typeStyles,
} from './tokens';

/**
 * Every style against every text-size setting — the web's Dynamic Type table.
 *
 * Apple publishes exactly this shape: a style down one axis, the reader's
 * content size category across the other, and a concrete point size in each
 * cell. The axis here is the browser's default font size, which is what every
 * `rem` in the stylesheet is measured against.
 *
 * One difference is worth understanding rather than glossing. Apple's values are
 * *designed* — somebody chose 31pt for xSmall and 38pt for xxLarge, so the ramp
 * can be tuned per style. These are *computed*: they are whatever the rem maths
 * produces. You cannot hand-pick a cell on the web without writing a query for
 * it, so the only lever is the declared size itself. That makes the "responds"
 * column the important one — it says whether the reader's preference reaches
 * this style at all.
 */
export function TextSizeMatrix() {
  const [width, setWidth] = useState<number>(1512);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="t-caption uppercase tracking-[0.08em] opacity-50">
          At viewport
        </span>
        {REFERENCE_WIDTHS.map((reference) => (
          <button
            key={reference.width}
            type="button"
            onClick={() => setWidth(reference.width)}
            aria-pressed={width === reference.width}
            className={`t-caption rounded-full border-2 px-4 py-1.5 transition-colors ${
              width === reference.width
                ? 'border-brand bg-brand'
                : 'border-border hover:bg-brand-hover hover:text-text-invert'
            }`}
          >
            {reference.label} · {reference.width}
          </button>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-black/20">
              <th className="t-caption pb-3 pe-6 uppercase tracking-[0.08em] opacity-50">
                Style
              </th>
              {TEXT_SIZE_STEPS.map((step) => (
                <th key={step.label} className="pb-3 pe-6 text-right">
                  <span className="t-caption block uppercase tracking-[0.08em] opacity-50">
                    {step.label.replace(' (default)', '')}
                  </span>
                  <span className="t-caption block font-mono opacity-40">
                    {step.rootPx}px root
                  </span>
                </th>
              ))}
              <th className="t-caption pb-3 uppercase tracking-[0.08em] opacity-50">
                Responds
              </th>
            </tr>
          </thead>
          <tbody>
            {typeStyles.map((style) => {
              const behaviour = respondsToTextSize(style, width);
              return (
                <tr key={style.name} className="border-b border-black/10">
                  <td className="t-caption py-3 pe-6 font-bold">.{style.name}</td>
                  {TEXT_SIZE_STEPS.map((step) => {
                    const px = fontSizeAt(style, width, step.rootPx);
                    const isDefault = step.rootPx === ROOT_PX;
                    return (
                      <td
                        key={step.label}
                        className={`t-caption py-3 pe-6 text-right font-mono ${
                          isDefault ? 'font-bold' : 'opacity-70'
                        }`}
                      >
                        {px === null ? '—' : `${Math.round(px * 10) / 10}px`}
                      </td>
                    );
                  })}
                  <td className="t-caption py-3 font-mono">
                    {behaviour === null && '—'}
                    {behaviour?.verdict === 'full' && (
                      <span className="opacity-60">fully</span>
                    )}
                    {behaviour?.verdict === 'partial' && (
                      <span className="font-bold">flat from {behaviour.flatFrom} ⚠</span>
                    )}
                    {behaviour?.verdict === 'none' && (
                      <span className="font-bold">never ⚠</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
