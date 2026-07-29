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
- Събития has no Slug column, so slugs are transliterated from the title —
  renaming an event in Notion changes its URL. Add a Slug column and read it in
  `scripts/sync-notion-events.mjs` if that ever matters.

The FAQ (`npm run sync:faq`) is still hand-run: its `--publish` flag writes back
to Notion and so needs a write-capable integration, which is not something to
hand to a scheduled job.

# Deploys run from GitHub Actions, not from Cloudflare

`.github/workflows/deploy.yml` builds and ships the OpenNext Worker to
`staging.bulgariandesigncouncil.org` on every push to `main`. Locally the same
thing is `npm run deploy`.

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
