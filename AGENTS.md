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

- The sync runs **on a person's machine, never in CI**. The deploy workflow
  builds from the committed JSON and has no Notion token. This is deliberate:
  it keeps the token off GitHub entirely, which matters because the repo is
  public.
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
