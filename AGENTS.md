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
