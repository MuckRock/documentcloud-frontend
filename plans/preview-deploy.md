# Cloudflare Workers Deployment

## Environments

Three deployment environments, all using Cloudflare Workers:

| Environment | Domain                                    | `NODE_ENV`   | `PUBLIC_ENV` | Branch    | Deployed by                                             |
| ----------- | ----------------------------------------- | ------------ | ------------ | --------- | ------------------------------------------------------- |
| Production  | `www.documentcloud.org`                   | `production` | `production` | `main`    | Workers Builds (`wrangler.production.jsonc`)            |
| Staging     | `staging.documentcloud.org`               | `staging`    | `staging`    | `main`    | Workers Builds (`wrangler.staging.jsonc`)               |
| Preview     | `preview-<PR#>.staging.documentcloud.org` | `staging`    | `staging`    | PR branch | GitHub Actions (`.github/workflows/preview-deploy.yml`) |

## Preview Deploys

Each PR gets its own Cloudflare Worker with a custom domain route. A GitHub Actions workflow manages the full lifecycle: build → deploy → comment URL → cleanup on close.

**Naming scheme:** Preview URLs use the PR number: `preview-<number>.staging.documentcloud.org` (e.g. `preview-1311.staging.documentcloud.org`). Worker names follow the same pattern: `dc-preview-<number>`.

**Why separate workers?** Cloudflare Workers doesn't support custom-domain preview URLs natively. Workers Builds generates `.workers.dev` preview URLs, but not custom domain ones. Deploying each PR as its own worker with an explicit route is the cleanest way to get custom domain previews.

### How it works

**Deploy job** (on PR open/sync/reopen):

1. Checkout, setup Node 22, `npm ci`
2. Generate `wrangler.preview.jsonc` via `scripts/generate-preview-wrangler.sh`
3. Build with `APP_URL` set to the preview domain
4. Deploy with `wrangler deploy --config wrangler.preview.jsonc`
5. Comment preview URL on the PR (create or update)

**Cleanup job** (on PR close):

1. Delete the preview worker: `wrangler delete --name dc-preview-<number> --force`
2. Update PR comment to note preview was removed

### Key files

- `wrangler.production.jsonc` — production Workers Builds config
- `wrangler.staging.jsonc` — staging Workers Builds config
- `wrangler.preview.jsonc` — generated at CI time, not checked in
- `scripts/generate-preview-wrangler.sh` — generates preview config from PR number
- `.github/workflows/preview-deploy.yml` — GitHub Actions workflow for preview lifecycle

### Prerequisites

1. **GitHub Secrets**: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
   - Token needs: Workers Scripts (Edit), Workers Routes (Edit), DNS (Edit) permissions on the MuckRock account
2. **DNS**: Wildcard record for `*.staging.documentcloud.org` in the Cloudflare zone (proxied)

### Things to watch for

- **Auth cookies**: If the staging auth system sets cookies scoped to the exact domain `staging.documentcloud.org` (not `.staging.documentcloud.org`), login won't work on preview subdomains.
- **Worker limits**: Cloudflare allows 500 workers per account on paid plans.
- **Stale previews**: If the `closed` event is missed, workers accumulate. A weekly cron cleanup job could be added later.
- **Route conflicts**: Cloudflare's most-specific-match routing means explicit preview subdomain routes take priority over any wildcard on the main staging worker.
