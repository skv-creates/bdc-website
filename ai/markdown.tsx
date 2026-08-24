import type { ReactNode } from 'react';

/**
 * A small markdown renderer for the AI pages — deliberately not a
 * dependency and deliberately not MDX.
 *
 * MDX has already crashed this Storybook once (see the note at the top of
 * design-system/StartHere.stories.tsx), and pulling in a parser for four
 * documentation pages runs against the repo's page-weight discipline. The
 * skill files use a small, stable dialect — headings, lists, tables,
 * fenced code, bold/italic/inline code, links — and this covers exactly
 * that, in the site's own type classes so the pages read as the site.
 */

/** Frontmatter split: returns {meta, body}; meta is the raw YAML-ish block. */
export function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2];
  }
  return { meta, body: raw.slice(m[0].length) };
}

/** Inline spans: `code`, **bold**, *italic*, [label](url). */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith('`')) {
      out.push(
        <code key={key} className="rounded-sm bg-black/[0.06] px-1 py-0.5 text-[0.9em]">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith('**')) {
      out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('*')) {
      out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    } else {
      const link = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        out.push(
          <a key={key} href={link[2]} className="border-b-2 border-current transition-opacity hover:opacity-70">
            {link[1]}
          </a>,
        );
      } else {
        out.push(tok);
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Block-level pass. `demote` shifts heading levels down (the page already
 * has an h1, so the file's own `#` becomes an h2) — which also keeps the
 * a11y addon's heading-order check green.
 */
export function Markdown({ source, demote = 1 }: { source: string; demote?: number }) {
  const lines = source.split('\n');
  const blocks: ReactNode[] = [];
  let k = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;

    // fenced code
    if (line.startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      blocks.push(
        <pre key={k++} className="my-6 max-w-full overflow-x-auto bg-black/[0.05] p-4 text-[15px] leading-relaxed">
          <code>{buf.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = Math.min(h[1].length + demote, 5);
      const cls = { 2: 't-h04 mt-14', 3: 't-h05 mt-10', 4: 't-label mt-8 font-bold', 5: 't-label mt-8' }[level] ?? 't-label mt-8';
      const Tag = `h${level}` as 'h2';
      blocks.push(
        <Tag key={k++} className={cls}>
          {inline(h[2], `h${k}`)}
        </Tag>,
      );
      continue;
    }

    // tables
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].split('|').slice(1, -1).map((c) => c.trim());
        if (!/^[-: ]+$/.test(cells.join(''))) rows.push(cells);
        i++;
      }
      i--;
      const [head, ...body] = rows;
      blocks.push(
        <div key={k++} className="my-6 max-w-full overflow-x-auto">
          <table className="t-caption w-full max-w-[68ch] border-collapse text-left">
            <thead>
              <tr>
                {head.map((c, ci) => (
                  <th key={ci} className="border-b-2 border-border py-2 pr-6 font-bold">
                    {inline(c, `th${k}-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border-b border-border py-2 pr-6 align-top">
                      {inline(c, `td${k}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // lists (unordered and ordered), with soft-wrapped continuation lines
    const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const ordered = /\d+\./.test(li[2]);
      const items: string[] = [];
      while (i < lines.length) {
        const m2 = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (m2) {
          items.push(m2[3]);
          i++;
        } else if (lines[i].match(/^\s{2,}\S/) && items.length) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        } else break;
      }
      i--;
      const cls = 't-body my-4 max-w-[68ch] space-y-2 ps-5';
      const rows = items.map((it, ii) => <li key={ii}>{inline(it, `li${k}-${ii}`)}</li>);
      blocks.push(
        ordered ? (
          <ol key={k++} className={`${cls} list-decimal`}>{rows}</ol>
        ) : (
          <ul key={k++} className={`${cls} list-disc`}>{rows}</ul>
        ),
      );
      continue;
    }

    // blockquote
    if (line.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      i--;
      blocks.push(
        <blockquote key={k++} className="t-body my-6 max-w-[68ch] border-s-4 border-brand ps-6">
          {inline(buf.join(' '), `bq${k}`)}
        </blockquote>,
      );
      continue;
    }

    // paragraph: gather soft-wrapped lines
    const buf = [line];
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() !== '' &&
      !/^(#{1,4}\s|```|\||>|(\s*)([-*]|\d+\.)\s)/.test(lines[i + 1])
    ) {
      buf.push(lines[++i]);
    }
    blocks.push(
      <p key={k++} className="t-body my-4 max-w-[68ch]">
        {inline(buf.join(' '), `p${k}`)}
      </p>,
    );
  }
  return <div>{blocks}</div>;
}
