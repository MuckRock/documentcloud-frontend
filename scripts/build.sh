#!/bin/bash
set -euo pipefail

ENV="${1:-preview}"
ENV_FILE=".env.${ENV}"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# For preview builds, derive APP_URL from the current branch name if not already set.
# In CI, APP_URL is set by the workflow to a custom domain (e.g. preview-1234.staging.documentcloud.org).
# This fallback is for local builds only.
if [ "$ENV" = "preview" ] && [ -z "${APP_URL:-}" ]; then
  BRANCH="${WORKERS_CI_BRANCH:-$(git branch --show-current 2>/dev/null)}"
  if [ -n "$BRANCH" ]; then
    export APP_URL="https://${BRANCH}-documentcloud-frontend.muckrock.workers.dev/"
  fi
fi

npm run build
