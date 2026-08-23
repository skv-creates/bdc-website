/**
 * The pilot enquiry form — what the "Започни пилот" drawer holds.
 *
 * Tailored to what starting a pilot actually needs — and no more: the
 * initiative, who is asking, what is not working (and for whom), the
 * change wanted, and whether a decision-maker stands behind it. A
 * native HTML <form> POSTing to /api/pilot, no client JavaScript required;
 * the sections are real <fieldset>s with <legend>s, the choices real
 * radios, so a screen reader hears the same structure a sighted visitor
 * scans.
 */
import { Button } from "@/components/ui/Button";
import { PARTNER_COPY, PARTNER_TOPICS, type Locale } from "@/lib/partner";
import { PILOT_COPY, PILOT_SUPPORT } from "@/lib/pilot";

const field =
  "t-body w-full rounded-none border-0 border-b-2 border-border bg-transparent px-0 py-2 outline-none transition-colors focus:border-current";

export function PilotFormFields({
  locale,
  defaultInitiative,
}: {
  locale: Locale;
  /** Preselected from the page the drawer opened on. */
  defaultInitiative?: string;
}) {
  const f = PILOT_COPY[locale];
  // The initiative names already live with the partner form's topics —
  // one source, minus "general", which is not an initiative.
  const initiatives = PARTNER_TOPICS.filter((t) => t !== "general");
  const topicLabels = PARTNER_COPY[locale].form.topicLabels;

  return (
    <form method="post" action="/api/pilot" className="flex max-w-[540px] flex-col gap-10">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: invisible to people, filled in by naive bots. The API
          pretends success when it arrives non-empty. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="t-caption font-bold">{f.initiative}</span>
        <span className="relative block">
          <select
            name="initiative"
            required
            defaultValue={defaultInitiative}
            className={`${field} cursor-pointer appearance-none rounded-none pr-10`}
          >
            {initiatives.map((t) => (
              <option key={t} value={t}>
                {topicLabels[t]}
              </option>
            ))}
          </select>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            aria-hidden
            className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2"
          >
            <polygon points="0,0 12,0 6,8" fill="currentColor" />
          </svg>
        </span>
      </label>

      <fieldset className="flex flex-col gap-8 border-0 p-0">
        <legend className="t-h05 mb-6 font-bold">{f.about.legend}</legend>
        <label className="flex flex-col gap-2">
          <span className="t-caption font-bold">{f.about.name}</span>
          <input type="text" name="name" required autoComplete="name" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="t-caption font-bold">{f.about.email}</span>
          <input type="email" name="email" required autoComplete="email" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="t-caption font-bold">{f.about.organisation}</span>
          <input
            type="text"
            name="organisation"
            required
            autoComplete="organization"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="t-caption font-bold">{f.about.role}</span>
          <input
            type="text"
            name="role"
            required
            autoComplete="organization-title"
            className={field}
          />
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-8 border-0 p-0">
        <legend className="t-h05 mb-6 font-bold">{f.opportunity.legend}</legend>

        <label className="flex flex-col gap-2">
          <span className="t-caption font-bold">{f.opportunity.problem}</span>
          <span className="t-caption opacity-70">{f.opportunity.problemHint}</span>
          <textarea name="problem" required rows={4} maxLength={3000} className={field} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="t-caption font-bold">{f.opportunity.change}</span>
          <textarea name="change" required rows={3} maxLength={2000} className={field} />
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="t-h05 mb-6 font-bold">{f.readiness.legend}</legend>
        <p className="t-caption font-bold">{f.readiness.support}</p>
        {PILOT_SUPPORT.map((sVal) => (
          <label key={sVal} className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="support"
              value={sVal}
              required
              className="size-5 shrink-0 accent-current"
            />
            <span className="t-body">{f.readiness.supportLabels[sVal]}</span>
          </label>
        ))}
      </fieldset>

      <p className="t-caption">
        <a
          href={`/${locale}/privacy`}
          className="border-b-2 border-current transition-opacity hover:opacity-70"
        >
          {f.privacyLabel}
        </a>
      </p>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 size-5 shrink-0 accent-current"
        />
        <span className="t-caption">{f.consent}</span>
      </label>

      <div className="sm:self-start">
        <Button type="submit">
          {f.submit} <span aria-hidden>→</span>
        </Button>
      </div>
    </form>
  );
}
