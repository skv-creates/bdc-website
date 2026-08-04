import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import {
  desktopPx,
  lineHeightPct,
  liveMeta,
  parityCounts,
  parityRows,
  type ParityRow,
} from './parity';
import { DESIGN_WIDTH, fontSizeAt } from './tokens';
import { Note, Page, Section } from './Page';
import { claimCounts, claims } from './claims';

const meta = {
  title: 'Foundations/Figma and live parity',
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Badge({ row }: { row: ParityRow }) {
  if (row.issues.some((issue) => issue.severity === 'error')) {
    return (
      <span className="t-caption rounded-full bg-[var(--bdc-burgundy)] px-3 py-1 font-bold text-[var(--bdc-white)]">
        Differs
      </span>
    );
  }
  if (row.issues.length > 0) {
    return (
      <span className="t-caption rounded-full border-2 border-border px-3 py-1 font-bold">
        Check
      </span>
    );
  }
  return <span className="t-caption px-3 py-1 ds-muted">Matches</span>;
}

function Row({ row }: { row: ParityRow }) {
  const figmaSize = row.figma ? `${row.figma.sizePx}px` : '—';
  const figmaLh = row.figma ? `${row.figma.lineHeightPct}%` : '—';

  // Evaluated at the design width: sizes resolve per band through var(), so
  // there is no literal maximum written on the rule to read.
  const branchRaw = row.branch ? fontSizeAt(row.branch, DESIGN_WIDTH) : null;
  const branchSize = branchRaw === null ? null : Math.round(branchRaw * 100) / 100;
  const branchLh = row.branch ? lineHeightPct(row.branch.lineHeight) : null;
  const liveSize = row.live ? desktopPx(row.live.fontSize) : null;
  const liveLh = row.live ? lineHeightPct(row.live.lineHeight) : null;

  const mismatch = (a: number | null, b: number | undefined) =>
    a !== null && b !== undefined && a !== b ? 'font-bold' : 'ds-muted';

  return (
    <tr className="border-b border-black/10 align-top">
      <td className="t-caption py-4 pe-6">
        <span className="font-bold">{row.figma?.name ?? '—'}</span>
        {row.figma?.group && (
          <span className="ms-2 ds-muted">{row.figma.group}</span>
        )}
      </td>
      <td className="t-caption py-4 pe-6 font-mono ds-muted">
        {figmaSize} / {figmaLh}
      </td>
      <td className="t-caption py-4 pe-6 font-bold">
        {row.branch ? `.${row.branch.name}` : <span className="ds-muted">none</span>}
      </td>
      <td
        className={`t-caption py-4 pe-6 font-mono ${mismatch(branchSize, row.figma?.sizePx)}`}
      >
        {branchSize === null ? '—' : `${branchSize}px`} /{' '}
        {branchLh === null ? '—' : `${branchLh}%`}
      </td>
      <td
        className={`t-caption py-4 pe-6 font-mono ${mismatch(liveSize, row.figma?.sizePx)}`}
      >
        {liveSize === null ? '—' : `${liveSize}px`} /{' '}
        {liveLh === null ? '—' : `${liveLh}%`}
      </td>
      <td className="py-4">
        <Badge row={row} />
        {row.issues.length > 0 && (
          <ul className="t-caption mt-2 flex flex-col gap-1 ds-muted">
            {row.issues.map((issue) => (
              <li key={issue.label}>{issue.detail}</li>
            ))}
          </ul>
        )}
      </td>
    </tr>
  );
}

export const Audit: Story = {
  render: () => (
    <Page
      title="Figma and live parity"
      lede={
        <>
          Every text style compared three ways: the Figma library, this branch,
          and the CSS the live site is serving. Live values were read from{' '}
          <code>{liveMeta.fetchedFrom}</code> on {liveMeta.fetchedOn} — refresh
          them with <code>npm run sync:live-type</code>.
        </>
      }
    >
      <Section title="Summary">
        <div className="flex flex-wrap gap-10">
          <div>
            <p className="t-digit leading-none">{parityCounts.errors}</p>
            <p className="t-caption mt-2 uppercase tracking-[0.08em] ds-muted">
              Differ from Figma
            </p>
          </div>
          <div>
            <p className="t-digit leading-none">{parityCounts.warnings}</p>
            <p className="t-caption mt-2 uppercase tracking-[0.08em] ds-muted">
              Worth checking
            </p>
          </div>
          <div>
            <p className="t-digit leading-none">{parityCounts.clean}</p>
            <p className="t-caption mt-2 uppercase tracking-[0.08em] ds-muted">
              Match
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Every style"
        intro="Sizes shown are the desktop values — the size each style settles at once its fluid range is exhausted."
      >
        <div
          className="overflow-x-auto"
          role="region"
          aria-label="Every text style compared across Figma, this branch and the live site"
          tabIndex={0}
        >
          <table className="w-full min-w-[64rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black/20">
                {['Figma style', 'Figma', 'CSS class', 'This branch', 'Live site', 'Status'].map(
                  (head) => (
                    <th
                      key={head}
                      className="t-caption pb-3 pe-6 uppercase tracking-[0.08em] ds-muted"
                    >
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {parityRows.map((row) => (
                <Row key={row.key} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Statements checked against the published site"
        intro="Everything asserted about this scale while it was being built, re-derived from the live CSS and markup each time this page renders."
      >
        <ul className="flex flex-col gap-6">
          {claims.map((claim) => (
            <li key={claim.statement} className="border-t border-black/10 pt-5">
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span
                  className={`t-caption rounded-full px-3 py-1 font-bold ${
                    claim.verdict === 'wrong'
                      ? 'bg-[var(--bdc-burgundy)] text-[var(--bdc-white)]'
                      : claim.verdict === 'pending'
                        ? 'border-2 border-border'
                        : 'ds-muted'
                  }`}
                >
                  {claim.verdict === 'wrong'
                    ? 'Wrong'
                    : claim.verdict === 'pending'
                      ? 'Not published'
                      : 'Confirmed'}
                </span>
                <p className="t-body flex-1">{claim.statement}</p>
              </div>
              <p className="t-caption mt-2 ds-muted">{claim.evidence}</p>
              {claim.correction && (
                <p className="t-caption mt-2 font-bold">{claim.correction}</p>
              )}
            </li>
          ))}
        </ul>

        <p className="t-caption mt-8 ds-muted">
          {claimCounts.confirmed} confirmed · {claimCounts.wrong} wrong ·{' '}
          {claimCounts.pending} awaiting publication.
        </p>
      </Section>

      <Note title="Reading the three columns">
        <p>
          <strong>Figma vs this branch</strong> — the library and the code have
          drifted apart. These are the ones to resolve.
        </p>
        <p className="mt-3">
          <strong>This branch vs live site</strong> — merged but not published.
          The live site only updates when the production deploy is run by hand, so
          a gap here is expected rather than wrong.
        </p>
        <p className="mt-3">
          Figma values are the one hand-entered part of this system, taken from
          the library panel. Connecting the Figma file would remove the
          transcription.
        </p>
      </Note>
    </Page>
  ),
  play: async ({ canvas }) => {
    // The audit must actually find the known drift. If someone "fixes" the
    // comparison by loosening it, this fails.
    const byKey = (key: string) => parityRows.find((row) => row.key === key)!;

    // h04 and h05 now match Figma at the design width. They used to be a step
    // larger — 40px against 32, and 32px against 24.
    await expect(fontSizeAt(byKey('t-h04')!.branch!, DESIGN_WIDTH)).toBeCloseTo(32, 2);
    await expect(byKey('t-h04').figma!.sizePx).toBe(32);
    await expect(fontSizeAt(byKey('t-h05')!.branch!, DESIGN_WIDTH)).toBeCloseTo(24, 2);
    await expect(byKey('t-h05').figma!.sizePx).toBe(24);

    // Two Figma styles have no implementation at all.
    await expect(byKey('body-large').branch).toBeUndefined();
    await expect(byKey('body-small').branch).toBeUndefined();

    // And one class has no Figma style behind it.
    await expect(byKey('t-digit').figma).toBeUndefined();

    await expect(parityCounts.errors).toBeGreaterThan(0);
    await expect(canvas.getByText('Figma and live parity')).toBeVisible();
  },
};
