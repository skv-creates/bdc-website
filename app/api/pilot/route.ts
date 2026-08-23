/**
 * The pilot enquiry's endpoint — the sibling of /api/partner, for the
 * "Започни пилот" drawer. Same shape on purpose: validate the fields, mail
 * them to the council via Resend, 303 to /[locale]/partner/thanks (the
 * generic "we received your enquiry" page), and land failures back on
 * /partner?error=1 where the direct address is the fallback. The subject
 * opens with "Пилот", so the inbox tells a pilot from a partnership at a
 * glance.
 *
 * Uses the same RESEND_API_KEY Worker secret /api/partner already needs —
 * nothing new to provision.
 */
import { NextResponse } from "next/server";
import { locales, type Locale } from "@/lib/i18n";
import { PARTNER_TOPICS } from "@/lib/partner";
import { PILOT_AREAS, PILOT_SUPPORT, type PilotArea, type PilotSupport } from "@/lib/pilot";

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
  const thanks = () =>
    NextResponse.redirect(new URL(`/${locale}/partner/thanks`, req.url), 303);
  const back = (q: string) =>
    NextResponse.redirect(new URL(`/${locale}/partner${q}`, req.url), 303);

  // Honeypot: pretend success so the bot learns nothing.
  if (str(form.get("website")) !== "") return thanks();

  const name = str(form.get("name")).slice(0, 200);
  const email = str(form.get("email")).slice(0, 200);
  const organisation = str(form.get("organisation")).slice(0, 200);
  const role = str(form.get("role")).slice(0, 200);
  const problem = str(form.get("problem")).slice(0, 3000);
  const affected = str(form.get("affected")).slice(0, 2000);
  const change = str(form.get("change")).slice(0, 2000);
  const tried = str(form.get("tried")).slice(0, 2000);
  const consent = str(form.get("consent"));

  const initiative = (PARTNER_TOPICS as readonly string[]).includes(str(form.get("initiative")))
    ? str(form.get("initiative"))
    : "general";
  const area: PilotArea | "" = (PILOT_AREAS as readonly string[]).includes(str(form.get("area")))
    ? (str(form.get("area")) as PilotArea)
    : "";
  const support: PilotSupport | "" = (PILOT_SUPPORT as readonly string[]).includes(
    str(form.get("support")),
  )
    ? (str(form.get("support")) as PilotSupport)
    : "";

  // The browser enforces `required`; this catches non-browser posts.
  if (
    !name ||
    !organisation ||
    !role ||
    !problem ||
    !affected ||
    !change ||
    !area ||
    !support ||
    !consent ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return back("?error=1");
  }

  const key = await secret("RESEND_API_KEY");
  if (!key) {
    console.error("pilot form: RESEND_API_KEY is not bound");
    return back("?error=1");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `Пилот / ${initiative}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Organisation: ${organisation}`,
        `Role: ${role}`,
        `Initiative: ${initiative}`,
        `Area: ${area}`,
        `Decision-maker support: ${support}`,
        `Locale: ${locale}`,
        "",
        `What is not working well enough:`,
        problem,
        "",
        `Who it affects:`,
        affected,
        "",
        `The change wanted:`,
        change,
        ...(tried ? ["", "Already tried or researched:", tried] : []),
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("pilot form: Resend refused the send", res.status, await res.text());
    return back("?error=1");
  }

  return thanks();
}
