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

# Events sync runs when asked, and there is no token on GitHub

`.github/workflows/sync-events.yml` runs `npm run sync:events`, commits
`lib/events.generated.json` when it changed, and deploys. It is
**`workflow_dispatch` only** — there is no schedule.

There was one, every eight hours, and it failed all 23 times it ever ran because
`NOTION_TOKEN` was never set. The council's decision is that the Notion
credential lives in Cloudflare — where the Shift+E editor uses it — and not in
this public repository, so there is nothing for a schedule to authenticate with.
Events reach the site when somebody asks. For a handful of events a month that
is the better trade: nothing publishes itself unlooked-at.

Everything below about tokens, variables and the deploy-itself behaviour still
applies to a manual run, and is what you need if the schedule is ever restored.

If the schedule is ever restored, the token would be a **repository secret**,
not a file in the repo: Actions never hands secrets to workflows triggered by
forked pull requests, so a public repo does not leak it. It needs only **Read
content** — nothing in CI writes to Notion, and it must be a *different*
integration from the write-capable one in Cloudflare. To set that up:

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
**`SITE_ORIGIN`**. It must be set in two places: the npm command supplies it to
`next build`, while each environment's `vars` block in `wrangler.jsonc`
supplies it when OpenNext renders through the Worker. Wrangler variables do not
reach `next build`, and a build-only value disappears before request-time
rendering. Staging and production therefore repeat the value deliberately.

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

One consequence worth remembering: a manually requested events sync deploys *staging*
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

# Editing copy on staging — Shift+E

`components/dev/EditMode.tsx` turns an event page on staging into something you
can type into: click a paragraph to edit it, and every photograph shows its alt
text. Save writes to **Notion first** and only then anywhere else, so the CMS
stays the source of truth. Staging only, gated exactly like the Shift+R
redlines and mounted next to them in `app/[locale]/layout.tsx`.

Three things have to be set up once, and none of them live in this repo:

    wrangler kv namespace create DRAFTS     # put the id in wrangler.jsonc
    wrangler secret put EDIT_PASSPHRASE --env=""
    wrangler secret put NOTION_WRITE_TOKEN --env=""

`NOTION_WRITE_TOKEN` is the **only write-capable Notion integration in this
repository**. Everything else here — the manual events sync, the bios sync on
a laptop — is deliberately read-only. It is a Worker secret on staging and must
never be added to the production environment, to CI, or to `.env.example`.

There is a second write-capable integration, `NOTION_PRIORITISATION_TOKEN`, but
it belongs to a different system in a different repository — see the last
section. **The two must stay separate**: one bug should not be able to reach
both the public site's content and the council's internal prioritisation data.
Neither is ever a substitute for the other, and neither belongs in this repo, in
`.env.example`, or in CI.

What you edit is Notion's own source, brackets and all: `[label](url)`, because
that is what the sync writes into `lib/events.generated.json` and what
`EventOverlayContent` parses back into anchors. `toRichText` in
`lib/notion-write.ts` turns it back into real Notion links on the way in —
without it, a save would flatten every link in the paragraph into literal
square brackets and the next sync would read them back that way.

Four things that will bite:

- **Event pages are prerendered, and they stay that way.** A save shows up on
  your screen because the editor rewrites the paragraphs in place; it is *not*
  the server re-rendering. Everyone else sees the change when the events sync
  next runs and redeploys staging. Making the route read drafts per request was
  tried and reverted: importing `next/headers` turns the route dynamic in the
  *production* build too — `/[locale]/events/[slug]` went from ● to ƒ — which
  costs the public site its prerendering. Not a trade worth making for a tool
  no visitor uses.
- **Not rendering and not shipping are two different jobs.** `!IS_PRODUCTION_SITE`
  in `app/[locale]/layout.tsx` is what makes Shift+E and Shift+R unreachable on
  the apex. It does nothing about whether they are *bundled*, and for months they
  were: `next/dynamic` is still a static edge in the module graph, so Turbopack
  put both components in one shared client chunk that the apex loaded as an async
  script on the home page and on every event page. Three comments claimed the
  opposite. What actually keeps them out is `turbopack.resolveAlias` in
  `next.config.ts`, which swaps both specifiers for
  `components/dev/DevToolsStub.tsx` when `SITE_ORIGIN` is the apex, and
  `scripts/assert-no-dev-tools.mjs`, which greps the built client assets and
  fails between the production build and the production deploy. Add a third dev
  tool and it needs an alias entry and a fingerprint, or the guard will not know
  to look for it. Rename a specifier in the layout and it silently un-aliases —
  which is the case the guard exists for.
- **`DRAFTS` is bound on staging and nowhere else.** Bindings are not inherited
  into a named environment, so its absence under `env.production` is the
  structural guarantee that the apex cannot serve a draft. The
  `IS_PRODUCTION_SITE` checks are the second lock, not the only one.
- **Paragraphs are matched to the page by their text**, not by an attribute.
  That is what keeps every editing hook out of `EventOverlayContent` and
  therefore off production's render path. It also means a paragraph the editor
  cannot find is one it will not offer to edit — which is the safe failure.
- **Videos, bookmarks and embeds are read as body lines but never written.**
  They occupy a slot in the description so the indices line up, and
  `pushEventCopy` reports them as skipped rather than writing a sentence over a
  player.

Initiatives are **not** editable this way, and cannot be: they are hand-written
in `lib/home-content.ts` and have no Notion rows to write back to. Only bios,
FAQ and events come from Notion.

# The prioritisation Worker lives in another repository

`bdc-prioritisation` is a **second Cloudflare Worker** automating the council's
internal Notion board `Приоритет на инициативи` — assigning an initiative to a
звено, and taking it off the ballot when its epic is deleted. It has nothing to
do with the public site: no shared code, no shared build, no shared deploy path.

Its source, its design record and the `wire-zveno-to-board` procedure live in
the private repo **`autotelicbydesign/bdc-prioritisation`**, which is where any
question about it belongs. Both used to sit here and were moved out on
2026-08-09; nothing in this repository ever built, tested or deployed the Worker
itself.

Two things a person working *here* still needs to know:

- **`NOTION_PRIORITISATION_TOKEN` and `NOTION_WRITE_TOKEN` are different
  integrations and must stay separate** — see the Shift+E section above. That
  rule is about *this* repo's blast radius, which is why it is stated here and
  not only there.
- **Do not rebuild any of it here.** If board automation needs work, it happens
  in the other repo. Adding a `workers/` directory to the website is how two
  deliberately separate blast radii get welded back together.
