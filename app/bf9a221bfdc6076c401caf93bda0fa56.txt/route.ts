/**
 * The IndexNow ownership file.
 *
 * The protocol proves control of a site by requiring a file at its root whose
 * name is the key and whose body is the key. A route rather than a file in
 * public/ so the key has exactly one definition — lib/indexnow.ts — and the
 * submitter and the proof can never disagree about what it is.
 */
import { INDEXNOW_KEY } from "@/lib/indexnow";

export const dynamic = "force-static";

export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
