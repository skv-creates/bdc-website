# Bulgarian Design Council website

Bilingual public website for the Bulgarian Design Council, built with Next.js
16 and deployed as two separate OpenNext Workers on Cloudflare.

- Staging: <https://staging.bulgariandesigncouncil.org>
- Production: <https://bulgariandesigncouncil.org>
- Bulgarian is the default locale (`/bg`); English lives at `/en`.

The repository is public. Never commit credentials or copy them into issues,
chat, terminal transcripts or shared documents. Put local read-only Notion
credentials in `.env.local`; put deployed secrets in the appropriate
Cloudflare Worker environment.

## Local development

Requires Node.js 24 for parity with GitHub Actions.

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. The bare root redirects by locale; use `/bg` or
`/en` when testing a specific language.

Before committing:

```bash
npm run lint
npm test
npm run build
```

`npm test` runs the Storybook interaction and accessibility suite in Chromium.
Install its browser once on a development machine with:

```bash
npx playwright install chromium
```

The component and foundation catalogue runs with `npm run storybook` and builds
with `npm run build-storybook`.

## Content ownership

The source of truth depends on the content:

- Initiatives, names, roles, photographs and ordering are maintained in
  `lib/home-content.ts`.
- Published event rows are synced from Notion into
  `lib/events.generated.json`; event photographs are downloaded into
  `public/figma/events/`.
- Published board biographies are synced into
  `lib/team-bios.generated.json`.
- Published FAQ content is synced into `lib/faq.generated.json`.
- Legal, statute and accessibility pages are maintained in their corresponding
  files under `lib/`.

Copy `.env.example` to `.env.local`, add your own read-only Notion integration,
then run the required sync:

```bash
npm run sync:bios
npm run sync:events
npm run sync:faq
```

These commands are deliberate, human-requested operations. Events are not on a
schedule. Generated JSON is committed so deployment never needs a Notion token.
Never hand-merge generated biography or event JSON; take one side and rerun the
corresponding sync. Approved privacy-policy wording must be changed in Notion
first, then copied into `lib/legal-content.ts`.

## Deployment

Staging and production are different Workers:

- `bdc-website` serves staging.
- `bdc-website-production` serves the live apex.

Every push to `main` runs `.github/workflows/deploy.yml` and updates staging
only. Production is promoted from `main` by manually running
`.github/workflows/deploy-production.yml` and entering `publish`.

Local equivalents exist, but GitHub Actions is the normal release path:

```bash
npm run deploy             # staging
npm run deploy:production  # live; explicit approval only
```

`SITE_ORIGIN` is required at both build time and Worker runtime. The npm scripts
supply the build value; `wrangler.jsonc` supplies each Worker's runtime value.
Do not collapse the two Workers or remove either half.

Storybook and the Shift+R/Shift+E tools are staging-only. Production builds
alias the dev tools to a stub and run a bundle assertion before deployment.
The `DRAFTS` KV binding and Notion write token exist only on staging.

## Public endpoints and integrations

- `/api/partner` sends partnership enquiries through Resend. `RESEND_API_KEY`
  is a Worker secret in each environment, never a repository value.
- `/api/staging-edit` writes event copy to Notion and staging KV; it returns 404
  on production.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt` and
  `/.well-known/tdmrep.json` describe indexing and text/data-mining policy.
- Production allows search and citation while Cloudflare blocks training
  crawlers. See `AGENTS.md` before changing crawler controls.

## Operating notes

`AGENTS.md` is the detailed operational record: Notion data-source rules,
event carousel conventions, indexing safeguards, production gates, Shift+E
security, and the separation from the private prioritisation Worker. Read the
relevant section before changing those systems.
