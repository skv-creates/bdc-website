import type { LegalBlock } from "@/lib/legal-content";

/**
 * Renders a run of legal prose blocks. Same block vocabulary as the FAQ answer
 * ({p} / {h} / {ul}), plus {a} for a standalone link (contact email, KZLD).
 * Server component — this page has no interactivity.
 */
export function LegalProse({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("h" in b) {
          return (
            <p key={i} className="t-body font-medium mt-8 first:mt-0">
              {b.h}
            </p>
          );
        }
        if ("ul" in b) {
          return (
            <ul key={i} className="mt-4 list-disc space-y-2 pl-5">
              {b.ul.map((li, j) => (
                <li key={j} className="t-body">
                  {li}
                </li>
              ))}
            </ul>
          );
        }
        if ("ol" in b) {
          return (
            <ol key={i} className="mt-4 list-decimal space-y-2 pl-5">
              {b.ol.map((li, j) => (
                <li key={j} className="t-body">
                  {li}
                </li>
              ))}
            </ol>
          );
        }
        if ("a" in b) {
          return (
            <p key={i} className="mt-4 first:mt-0">
              <a
                href={b.a.href}
                className="t-body border-b-2 border-current transition-opacity hover:opacity-70"
              >
                {b.a.text}
              </a>
            </p>
          );
        }
        return (
          <p key={i} className="t-body mt-4 first:mt-0">
            {b.p}
          </p>
        );
      })}
    </>
  );
}
