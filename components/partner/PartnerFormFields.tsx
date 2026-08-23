/**
 * The partner form itself — shared by the /partner page and the side
 * drawer the initiative buttons open (PartnerDrawer).
 *
 * A native HTML <form> POSTing to /api/partner, no client JavaScript
 * required: it works identically from the page, from the drawer, and with
 * scripts off. The honeypot, the ruled fields and the select's corner-mark
 * arrow all travel with it so the two hosts cannot drift apart.
 */
import { Button } from "@/components/ui/Button";
import { PARTNER_COPY, PARTNER_TOPICS, type Locale } from "@/lib/partner";

const field =
  "t-body w-full rounded-none border-0 border-b-2 border-border bg-transparent px-0 py-2 outline-none transition-colors focus:border-current";

export function PartnerFormFields({
  locale,
  defaultTopic,
  selectId,
}: {
  locale: Locale;
  /** Preselects the topic — the drawer passes the initiative's own. */
  defaultTopic?: string;
  /** The /partner page names its select so its ?re= script can find it. */
  selectId?: string;
}) {
  const f = PARTNER_COPY[locale].form;

  return (
    <form method="post" action="/api/partner" className="flex max-w-[540px] flex-col gap-8">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: invisible to people, filled in by naive bots. The API
          pretends success when it arrives non-empty. aria-hidden + tabIndex
          so no real visitor — screen reader or keyboard — ever lands in it. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="t-caption font-bold">{f.name}</span>
        <input type="text" name="name" required autoComplete="name" className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="t-caption font-bold">
          {f.organisation} <span className="font-normal opacity-70">{f.organisationOptional}</span>
        </span>
        <input type="text" name="organisation" autoComplete="organization" className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="t-caption font-bold">{f.email}</span>
        <input type="email" name="email" required autoComplete="email" className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="t-caption font-bold">{f.topic}</span>
        {/* appearance-none + rounded-none strip the OS's own pill and glyph
            so the select reads as another ruled field; the solid triangle is
            the site's corner-mark family, not the UA's. */}
        <span className="relative block">
          <select
            id={selectId}
            name="topic"
            defaultValue={defaultTopic}
            className={`${field} cursor-pointer appearance-none rounded-none pr-10`}
          >
            {PARTNER_TOPICS.map((t) => (
              <option key={t} value={t}>
                {f.topicLabels[t]}
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

      <label className="flex flex-col gap-2">
        <span className="t-caption font-bold">{f.message}</span>
        <textarea name="message" required rows={6} maxLength={5000} className={field} />
      </label>

      <p className="t-caption max-w-[52ch]">
        {f.privacyNotice}{" "}
        <a
          href={`/${locale}/privacy`}
          className="border-b-2 border-current transition-opacity hover:opacity-70"
        >
          {f.privacyLink}
        </a>
      </p>

      <div className="sm:self-start">
        <Button type="submit">{f.submit}</Button>
      </div>
    </form>
  );
}
