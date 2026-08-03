<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# This repository is public

Anything committed here is world-readable, permanently. A secret pushed by
mistake is not fixed by a later commit — it stays in the history and in
GitHub's API. Rotate the credential instead.

Never write a real credential into a file in this repo, and never paste one
into a chat or terminal transcript. If someone supplies a token, direct them to
put it in `.env.local` themselves.

`npm install` points `core.hooksPath` at `.githooks`, whose `pre-commit` blocks
`.env` files (including force-added ones) and credential-shaped strings.

More than one person works on this repo. Nobody shares a Notion token: each
person creates their own read-only integration (see `.env.example`). A token is
never sent over chat, email or a shared document.

# Team bios come from Notion

Bios live in the **Екип** tab of the *Website CMS: Съдържание* database, not in
`home-content.ts`. To refresh them:

    cp .env.example .env.local     # then paste your Notion token into it
    npm run sync:bios              # writes lib/team-bios.generated.json
    # commit the regenerated JSON

Only rows marked **Готово за публикуване** are pulled. Members without a
published bio fall back to `team.bioPlaceholder`, which is per-locale.

Two things that are easy to get wrong:

- The bios sync runs **on a person's machine, not in CI**. The deploy workflow
  builds from the committed JSON and has no Notion token. Events are the one
  exception — see below.
- `NOTION_TEAM_DATA_SOURCE_ID` is a **data source** id, not a database id. The
  CMS database has six data sources, and current Notion API versions cannot
  query those by database id.

Rows are matched to members by a slug derived from the photo filename, not by
name — so renaming a person on either side cannot silently orphan their bio.
`home-content.ts` merges only `bio`; names, roles, photos and ordering stay
hand-edited in that file.

Because the generated JSON is committed and several people sync, two branches
can both regenerate it. `.gitattributes` marks it `-merge` so git refuses to
splice two versions together. Never hand-resolve it — take either side and
re-run the sync:

    git checkout --ours lib/team-bios.generated.json
    npm run sync:bios
    git add lib/team-bios.generated.json

The output is deterministic (keys sorted), so whoever runs it last simply
reproduces the current state of Notion.

# Events sync on a schedule — the one token on GitHub

`.github/workflows/sync-events.yml` runs `npm run sync:events` every 8 hours on
`main`, commits `lib/events.generated.json` when it changed, and deploys.

This is the only place a Notion token lives outside a laptop. It is a
**repository secret**, not a file in the repo: Actions never hands secrets to
workflows triggered by forked pull requests, so a public repo does not leak it.
The token still only needs **Read content** — nothing in CI writes to Notion.
To set it up once:

    gh secret set NOTION_TOKEN                          # your read-only secret
    gh variable set NOTION_EVENTS_DATA_SOURCE_ID --body b51c7693-aa03-8324-9099-87dd784391f9
    gh variable set NOTION_EVENTS_STATUS --body 'Готово за публикуване'

The data source id and the status are **variables**, not secrets — neither is
sensitive, and keeping the status out of the workflow file means moving the site
to a different Notion column (say `Обявено`) is a settings change, not a commit.

Three things worth knowing before you touch it:

- The scheduled job pushes with `GITHUB_TOKEN`, and GitHub deliberately does not
  start other workflows from such a push. `deploy.yml` would never see the
  commit, so the sync job deploys itself with the same command and secrets.
- A sync that finds no publishable rows **fails instead of writing an empty
  list**. Blanking the section on the live site is a worse outcome than a red
  run, and the committed JSON is left alone.
- The URL comes from the **Slug** column, and only from there. Titles are
  per-language — Bulgarian on `/bg`, English on `/en` — so a URL cannot follow
  either without moving every time a translation is edited. Two events proved
  it before the column existed: renaming them to Bulgarian titles moved both
  pages and 404'd the old addresses. Leave a Slug empty and the sync falls back
  to transliterating the Bulgarian title, and warns while it does.

## Event with photo carousel

An event whose Notion page has an **`## Images to be used:`** section with two
or more pictures under it renders as an *event with photo carousel*: the intro
in a narrow column, the photographs as a slowly gliding strip across the width,
and the rest of the body in two columns below. One picture keeps the ordinary
side-by-side layout; most events have none and are text only.

Снимките се слагат в тялото на страницата под заглавие `## Images to be used:`
— две или повече превръщат събитието в „събитие с фото карусел".

Worth knowing:

- The pictures come from that section, **not** from the `Hero-image` property.
  A block image gives the sync a real download URL; the property only ever
  yielded attachment ids nothing could fetch.
- Only images *after* the heading count. One sitting up in the prose is
  illustrating a paragraph, not queueing for the carousel.
- Side-by-side images are wrapped in a `column_list` by Notion; the sync
  descends into it, so laying them out in columns is safe.
- The sync re-encodes everything to 2400px JPEG. Originals are routinely 40MB
  PNGs off a camera, and this repository is public and permanent.
- A paragraph that is nothing but a YouTube link becomes a player. A link
  inside a sentence stays a link.

The FAQ (`npm run sync:faq`) is still hand-run: its `--publish` flag writes back
to Notion and so needs a write-capable integration, which is not something to
hand to a scheduled job.

# Indexing, canonicals and machine-readability

`app/sitemap.ts` and `app/robots.ts` are generated, and both depend on
**`SITE_ORIGIN`**, which is set on the npm script — `npm run deploy` says
staging, `npm run deploy:production` says the apex. It is read at **build**
time on purpose: every page here is prerendered, so by the time a request
reaches the Worker the canonical tags are already written.

It cannot come from `vars` in `wrangler.jsonc`, which is the obvious place to
reach for. `opennextjs-cloudflare build` never passes those to `next build` —
a var there looks right and does nothing.

Unset, it defaults to **staging**, never production. Staging deploys on every
push and production only by hand, so a forgotten variable on staging would
publish a second indexable copy of the site, while the same mistake on
production makes it noindex — loud, and one commit to fix. `deploy-production.yml`
asserts it before deploying.

Three things that will bite if changed carelessly:

- **`alternates` must never move to `app/[locale]/layout.tsx`.** Metadata is
  inherited wholesale, so one canonical there points all fifteen pages of a
  locale at its home page.
- **The sitemap derives slugs** from `getEventSlugs()` and
  `getInitiativeSlugs()`. The second reads content *after* `applyCms()` filters
  `published !== false`, which is what keeps unpublished initiatives — which
  correctly 404 — out of it. A hardcoded list loses that.
- **No `lastModified`.** The only date an event carries is when it happens, not
  when it was edited. Google discounts a whole sitemap's `lastmod` once it
  catches one lie. `scripts/sync-notion-events.mjs` can supply a real one:
  Notion's `last_edited_time` is already on every row it fetches.

# Readable and citable, but not training data

This is a decision of the council's, not a technical default, and it is easy to
undo by accident because the two halves live in different places.

**The position: an AI system may read the site, index it, and cite it when
answering a question about who we are and what we argue for. It may not use it
to train a model.** That covers the writing, the photographs, and the people
described in them — the team publish their names, faces and career histories
here because they agreed to appear on the council's website, which is not the
same as agreeing to be in a training corpus. That is a consent nobody here can
give on their behalf, and unlike a page it cannot be taken back down.

Do not conflate the two, which is the mistake the previous version of this
section made. Cloudflare sorts crawlers into categories and they are not
interchangeable:

- **Search engine** (Googlebot, BingBot, Baidu) and **AI Search**
  (Claude-SearchBot, OAI-SearchBot, PerplexityBot, Applebot) and
  **AI Assistant** (ChatGPT-User, Perplexity-User) — **allowed, deliberately.**
  These are what get the site found and cited, with a link back. Indexing and
  discoverability do not depend on anything in the paragraph below.
- **AI Crawler** (GPTBot, ClaudeBot, CCBot, Amazonbot, Meta-ExternalAgent,
  Bytespider) — **blocked.** These collect training corpora. Blocking them
  costs no search visibility whatsoever.

Because of that split, `app/llms.txt/route.ts` is **not** decorative: the AI
Search and Assistant crawlers that read it are the allowed ones.

The reservation is stated in three places, on purpose, because each fails
differently:

- **Cloudflare AI Crawl Control** (dashboard, zone-level — it is under the
  *domain*, not the account, and 404s if you look for it under the account).
  `Block AI Bots` is a single master switch over the whole AI-Crawler category;
  while it is on the per-crawler toggles are greyed out. It is also what
  publishes the managed `robots.txt` and the `Content-Signal:` line. **Leave it
  on.** Turning it off to allow one crawler converts a self-updating block into
  a hand-maintained list, and every AI crawler invented afterwards defaults to
  allowed. Nobody will remember to keep it current.
- **`app/.well-known/tdmrep.json`** — the W3C TDM Reservation Protocol form,
  which is what makes the reservation effective under Article 4 of the EU DSM
  Directive. This one is in the repo, so it survives the site moving off
  Cloudflare, which the dashboard setting would not.
- **`<meta name="tdm-reservation" content="1">`** from `app/[locale]/layout.tsx`
  — the per-document half, which survives a page being quoted, mirrored or
  archived away from the origin that served it.

No file in this repo can *unblock* a crawler: Cloudflare's managed robots.txt
is injected above ours, and by the spec an agent-specific group beats our
`User-agent: *`. `app/robots.ts` cannot override it.

**Declaring is not enforcing.** GPTBot, ClaudeBot and Meta-ExternalAgent have
all been observed requesting paths their own `Disallow: /` forbids, with bytes
actually transferred — Cloudflare's own Signals → *Robots.txt violations* panel
counts them. robots.txt is a request; AI Crawl Control is the part that says
no. If someone reports that the site is being trained on anyway, that panel is
where to look, not at this file.

# Deploys run from GitHub Actions, not from Cloudflare

`.github/workflows/deploy.yml` builds and ships the OpenNext Worker to
`staging.bulgariandesigncouncil.org` on every push to `main`. Locally the same
thing is `npm run deploy`.

**Staging is the gate — `main` never reaches the live site by itself.** The apex
`bulgariandesigncouncil.org` is a *separate Worker*, `bdc-website-production`,
defined as the `production` environment in `wrangler.jsonc` and shipped only by
`.github/workflows/deploy-production.yml`, which is `workflow_dispatch` only and
asks you to type `publish` to confirm. Locally that is
`npm run deploy:production`.

Two Workers, not two custom domains on one, and that distinction is the whole
point: routing both hostnames at a single Worker would make staging an alias for
production, publishing to the apex on every merge. If you ever collapse them,
you have silently deleted the review step.

Because named environments exist, an unqualified `wrangler deploy` is ambiguous
and warns. Both npm scripts therefore pass `--env` explicitly — staging as
`--env=""` (the top-level config), production as `--env production`. Keep them
explicit.

One consequence worth remembering: the scheduled events sync deploys *staging*
when it commits new events. Fresh events sit on staging until someone runs the
production workflow, which is the intended trade — nothing reaches the apex
unlooked-at.

Cloudflare's own **Workers Builds** Git integration is deliberately *not*
connected. It targets the same `bdc-website` Worker, so leaving it on means two
systems deploying one Worker from the same push and racing each other — and its
default build never worked here anyway, because `wrangler.jsonc` points `main`
at `.open-next/worker.js`, which `next build` does not produce. It sat red on
every commit for months and opened a config PR (#2) that would have reverted the
site.

If you connect a repo to a Worker in the Cloudflare dashboard, it turns that
integration back on. Don't — or if you do, delete `deploy.yml` in the same
change so only one of them ships.
