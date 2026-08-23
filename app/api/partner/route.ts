/**
 * The partnership form's endpoint. Runs on BOTH staging and production —
 * unlike /api/staging-edit this is a public-facing feature, not a dev tool.
 *
 * POST — validate the fields, mail them to the council via Resend, and answer
 * with a 303 to /[locale]/partner/thanks so the browser lands on the
 * conversion page. A plain HTML form is the only client; there is no JSON API
 * to speak here.
 *
 * Needs one secret, on each environment that serves the form:
 *
 *     wrangler secret put RESEND_API_KEY --env=""          # staging
 *     wrangler secret put RESEND_API_KEY --env production  # the apex
 *
 * The key comes from resend.com after verifying the sending domain
 * (DNS records in Cloudflare). It sends email FROM the council TO the council
 * — it can read nothing — but it is still a credential: Worker secret only,
 * never in this repo, in CI, or in .env.example (see AGENTS.md).
 *
 * Failure lands the visitor back on the form with ?error=1, where the page
 * shows the direct email address as the fallback — the message is never
 * swallowed silently, which is exactly the mailto: failure this form replaced.
 */
import { NextResponse } from "next/server";
import { locales, type Locale } from "@/lib/i18n";
import { PARTNER_TOPICS, type PartnerTopic } from "@/lib/partner";

const TO = "info@bulgariandesigncouncil.org";
/** Must be on the Resend-verified domain, or Resend refuses to send. */
const FROM = "BDC Website <website@bulgariandesigncouncil.org>";

/** Reads a binding from the Worker env, or undefined outside one. */
async function secret(name: string): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as Record<string, string | undefined>)[name];
  } catch {
    return process.env[name];
  }
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export async function POST(req: Request) {
  const form = await req.formData();

  const locale: Locale = (locales as readonly string[]).includes(str(form.get("locale")))
    ? (str(form.get("locale")) as Locale)
    : "bg";
  const back = (q: string) => NextResponse.redirect(new URL(`/${locale}/partner${q}`, req.url), 303);
  const thanks = () => back("/thanks");

  // Honeypot filled in → a bot. Pretend it worked; give it nothing to learn from.
  if (str(form.get("website")) !== "") return thanks();

  const name = str(form.get("name")).slice(0, 200);
  const organisation = str(form.get("organisation")).slice(0, 200);
  const email = str(form.get("email")).slice(0, 200);
  const message = str(form.get("message")).slice(0, 5000);
  // The specific ask behind the send — "Започни пилот", "Предложи казус" —
  // when the drawer opened from an initiative's own button. It leads the
  // subject so the inbox can tell a pilot from a partnership at a glance.
  const intent = str(form.get("intent")).slice(0, 120);
  const topic: PartnerTopic = (PARTNER_TOPICS as readonly string[]).includes(str(form.get("topic")))
    ? (str(form.get("topic")) as PartnerTopic)
    : "general";

  // The browser enforces `required`; this catches non-browser posts.
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return back("?error=1");

  const key = await secret("RESEND_API_KEY");
  if (!key) {
    console.error("partner form: RESEND_API_KEY is not bound");
    return back("?error=1");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: intent ? `${intent} / ${topic}` : `Partnership / ${topic}`,
      text: [
        `Name: ${name}`,
        `Organisation: ${organisation || "—"}`,
        `Email: ${email}`,
        `Topic: ${topic}`,
        ...(intent ? [`Intent: ${intent}`] : []),
        `Locale: ${locale}`,
        "",
        message,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("partner form: Resend refused the send", res.status, await res.text());
    return back("?error=1");
  }

  return thanks();
}
