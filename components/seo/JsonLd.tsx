/**
 * Renders a schema.org graph as JSON-LD.
 *
 * The `<` escape is not decorative. Every string that reaches here — event
 * descriptions, FAQ answers, team bios — is written by editors in Notion, and
 * a stray "</script>" in any of them would close this tag early and let the
 * rest of the answer run as markup. Escaping the angle bracket to \\u003c is
 * still valid JSON and cannot form a closing tag.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from our own builders, with the one dangerous
      // character neutralised above.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
