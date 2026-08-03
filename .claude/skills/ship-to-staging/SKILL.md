---
name: ship-to-staging
description: Staging-first release flow for this site. Use whenever asked to deploy, publish, preview, "push it live", promote to production, start new site work, or tidy up branches. Enforces that work reaches staging.bulgariandesigncouncil.org only, and that the live apex is never deployed without an explicit, current instruction naming production.
---

# Ship to staging, never to live

## The one rule

**"Deploy", "ship it", "publish", "push it up" mean STAGING.** Nothing else.

The live apex `bulgariandesigncouncil.org` is deployed only when the user says
so in that turn, in words that name production or the live site explicitly.
Approval to deploy production once does **not** carry to the next change, the
next commit, or the rest of the session. If there is any doubt about which
environment is meant, deploy staging and say that is what you did.

Never run `npm run deploy:production`, and never dispatch
`deploy-production.yml`, on your own initiative — not to "finish the job", not
because the change looks safe, not because staging looked fine.

## The topology

| Ref | Lands on | How |
|---|---|---|
| `staging` branch | staging | `gh workflow run deploy.yml --ref staging` |
| `main` | staging | automatic, every push |
| `main` | **live apex** | `deploy-production.yml`, manual, types `publish` |

Two separate Workers — `bdc-website` and `bdc-website-production`. Merging to
`main` cannot reach the live site. That is the review gate; do not collapse it.

## Standard flow

### 1. Orient before touching anything

```bash
git fetch --prune
git status
git log --oneline -5
gh run list --workflow=deploy-production.yml --limit 1 --json headSha,createdAt
```

The last production run's `headSha` **is the live site**. Compare it to `main`
and to `staging` so you know what the user is actually looking at. Say which
commit is live if it differs from what they think.

### 2. Work on `staging`

```bash
git switch staging
git merge --ff-only main      # pick up scheduled event syncs; see gotchas
```

Branch from `staging`, not `main`, for anything substantial. Small edits can go
straight on `staging`.

### 3. Pre-flight, every time, before pushing

```bash
npm run lint
npm run build
```

A broken build reaches staging as a broken deploy — the workflow does not gate
on anything. Fix it locally first. `npm run preview` renders the real Worker
locally if the change touches routing, headers, or anything OpenNext handles.

Also confirm you are not committing a secret: no `.env*` file, no token-shaped
string. The `pre-commit` hook blocks these, but do not rely on it.

### 4. Deploy to staging

```bash
git push origin staging
gh workflow run deploy.yml --ref staging
gh run list --workflow=deploy.yml --limit 1
```

Pushing `staging` does **not** deploy by itself — only `main` pushes do. The
dispatch is the deploy. Wait for it to finish, then check it succeeded.

### 5. Verify staging before saying it is done

```bash
curl -sSI https://staging.bulgariandesigncouncil.org | head -5
curl -sS https://staging.bulgariandesigncouncil.org/bg -o /dev/null -w "%{http_code}\n"
curl -sS https://staging.bulgariandesigncouncil.org/en -o /dev/null -w "%{http_code}\n"
```

Check both locales, and check any page the change actually touched. Report the
staging URL and what you verified. Then **stop** and hand it to the user to look
at. Reviewing staging is their job, not yours.

### 6. Promote — only when told to

When, and only when, the user explicitly approves shipping to the live site:

```bash
git switch main && git merge --ff-only staging && git push origin main
gh workflow run deploy-production.yml -f confirm=publish
```

Merge to `main` first so live and `main` stay in step — production builds from
`main`. Afterwards, verify the apex the same way as step 5, and fold `main` back
into `staging` so they do not drift.

## Branch hygiene

Run this when starting a work session, or whenever asked to tidy up:

```bash
git fetch --prune
git branch --merged main | grep -vE '^\*|main$|staging$'      # safe to delete
git branch -r --no-merged main                                # needs a look
gh pr list --state open
```

- Delete merged branches (`git branch -d`, `git push origin --delete`) freely.
- **Never delete an unmerged branch without asking.** Print its SHA first so it
  can be recovered, say what unique work it carries, and let the user decide.
- Never delete `main` or `staging`.
- Never `push --force` to `main` or `staging`.
- Keep at most one long-lived branch besides these two.

## Repo gotchas that bite during a deploy

- **The events sync deploys staging on its own.** `sync-events.yml` runs every
  8 hours on `main` and, when Notion has new events, commits and runs the same
  staging deploy. It will overwrite a `staging`-branch deploy with `main`'s
  build. If staging suddenly looks like it lost your work, check
  `gh run list --workflow=sync-events.yml` before debugging anything else —
  then merge `main` into `staging` and re-dispatch.
- **`SITE_ORIGIN` is baked at build time**, on the npm script, not in
  `wrangler.jsonc`. Unset it defaults to staging, which means noindex. Do not
  move it into `vars` — `opennextjs-cloudflare build` never passes those to
  `next build`.
- **`lib/events.generated.json` and `lib/team-bios.generated.json` are marked
  `-merge`.** Never hand-resolve a conflict in them. Take either side and re-run
  the sync:
  `git checkout --ours <file> && npm run sync:events` (or `sync:bios`).
- **Bios and FAQ sync from a laptop, not CI.** Only events run scheduled.
- **This repo is public and permanent.** No credential ever goes in a file, a
  commit, or a transcript. If one leaks, rotating it is the fix, not a revert.

## Commit style

Match the log: a subject naming the area, a colon, then a lower-case clause that
says what actually changed. Not conventional-commits.

```
Carbon sync: the percentile was never a fraction
Images: serve them at the size they are actually displayed
Event cover: let the frame take the photograph's proportions
```

## Reporting back

Say plainly: which commit is on staging, which is live, what you verified, and
what is waiting for approval. If the build failed or a check was skipped, say so
with the output — never round a partial deploy up to "done".
