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
import { PARTNER_COPY, PARTNER_TOPICS, type PartnerTopic } from "@/lib/partner";
import { PILOT_COPY, PILOT_SUPPORT, type PilotSupport } from "@/lib/pilot";

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
  const goal = str(form.get("goal")).slice(0, 5000);
  const consent = str(form.get("consent"));

  const initiative: PartnerTopic = (PARTNER_TOPICS as readonly string[]).includes(
    str(form.get("initiative")),
  )
    ? (str(form.get("initiative")) as PartnerTopic)
    : "general";
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
    !goal ||
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

  // The council reads its inbox in Bulgarian — the email carries the
  // Bulgarian labels, whatever language the visitor filled the form in.
  const bg = PILOT_COPY.bg;
  const initiativeLabel = PARTNER_COPY.bg.form.topicLabels[initiative];
  const supportLabel = bg.readiness.supportLabels[support];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `Пилот / ${initiativeLabel}`,
      text: [
        `${bg.about.name}: ${name}`,
        `${bg.about.email}: ${email}`,
        `${bg.about.organisation}: ${organisation}`,
        `${bg.about.role}: ${role}`,
        `${bg.initiative}: ${initiativeLabel}`,
        `${bg.readiness.support} ${supportLabel}`,
        `Locale: ${locale}`,
        "",
        `${bg.opportunity.goal}`,
        goal,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("pilot form: Resend refused the send", res.status, await res.text());
    return back("?error=1");
  }

  return thanks();
}
