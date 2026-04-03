# Per-PR Preview Deployments with Custom Domains

## Context

Migrating off Netlify to Cloudflare Workers. The goal is per-PR preview URLs at `<branch>.staging.documentcloud.org` so reviewers can test changes on a real domain before merging. Main branch will eventually deploy to `www.documentcloud.org` (production).

## Approach

Deploy each PR as a **separate Cloudflare Worker** with its own custom domain route. A GitHub Actions workflow manages the full lifecycle: build → deploy → comment URL → cleanup on close.

**Why separate workers?** Cloudflare Workers doesn't support custom-domain preview URLs natively. Workers Builds generates `.workers.dev` preview URLs, but not custom domain ones. Deploying each PR as its own worker (`dc-preview-<branch>`) with an explicit route is the cleanest way to get `<branch>.staging.documentcloud.org`.

## No existing files need modification

The current code already handles everything:

- `scripts/build.sh` skips `APP_URL` derivation if it's already set (line 14)
- `src/config/staging.js` reads `process.env.APP_URL` at build time (line 3)
- `vite.config.js` injects `APP_URL` via `define` (line 38)
- `wrangler.jsonc` wildcard route `*.staging.documentcloud.org` stays — Cloudflare's most-specific-match routing means explicit subdomain routes from preview workers take priority

## New files

### 1. `scripts/generate-preview-wrangler.sh`

Helper script that takes a worker name and subdomain, outputs `wrangler.preview.jsonc`. Keeps the workflow YAML clean and makes the config generation testable.

Arguments: `<worker-name> <subdomain>`

Generated config includes:

- `name`: the worker name (e.g. `dc-preview-my-branch`)
- `main`, `compatibility_flags`, `compatibility_date`, `assets`, `observability` — same as main `wrangler.jsonc`
- `routes`: `[{ "custom_domain": true, "pattern": "<subdomain>.staging.documentcloud.org" }]`

### 2. `.github/workflows/preview-deploy.yml`

GitHub Actions workflow triggered on `pull_request` events (opened, synchronize, reopened, closed).

**Deploy job** (runs when PR is not closed):

1. Checkout, setup Node 22, `npm ci`
2. Sanitize branch name for subdomain use:
   ```bash
   echo "$BRANCH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-63
   ```
3. Run `scripts/generate-preview-wrangler.sh dc-preview-<branch> <branch>`
4. Build: `APP_URL=https://<branch>.staging.documentcloud.org/ bash scripts/build.sh preview`
5. Deploy: `npx wrangler deploy --config wrangler.preview.jsonc`
6. Comment preview URL on the PR (create or update existing comment)

**Cleanup job** (runs when PR is closed):

1. Delete the preview worker: `npx wrangler delete --name dc-preview-<branch> --force`
2. Comment that preview was removed

Uses `concurrency` group per PR number to prevent parallel deploys.

## Prerequisites (manual steps)

1. **GitHub Secrets**: Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to the repo
   - The API token needs: Workers Scripts (Edit), Workers Routes (Edit), DNS (Edit) permissions
2. **DNS**: Verify a wildcard DNS record exists for `*.staging.documentcloud.org` in the Cloudflare zone (proxied through Cloudflare)

## Things to watch for

- **Auth cookies**: If the staging auth system sets cookies scoped to the exact domain `staging.documentcloud.org` (not `.staging.documentcloud.org`), login won't work on preview subdomains. This is a backend concern.
- **Worker limits**: Cloudflare allows 500 workers per account on paid plans. Fine for normal PR volumes.
- **Stale previews**: If the `closed` event is missed, workers accumulate. A weekly cron cleanup job could be added later as a safety net.
- **Route conflicts with `custom_domain`**: If the first deploy fails because of DNS conflicts with the wildcard, fall back to zone-based routes (`{ "pattern": "<branch>.staging.documentcloud.org/*", "zone_name": "documentcloud.org" }`).

## Verification

1. Open a test PR on a branch like `test-preview`
2. Verify the workflow triggers and deploys successfully
3. Visit `https://test-preview.staging.documentcloud.org` — should load the app pointing at the staging API
4. Push another commit — verify the preview updates
5. Close the PR — verify the worker is deleted
