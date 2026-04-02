#!/bin/bash
set -euo pipefail

ENV="${1:-preview}"
ENV_FILE=".env.${ENV}"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# For preview builds, derive APP_URL from the current branch name
if [ "$ENV" = "preview" ] && [ -z "${APP_URL:-}" ]; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  export APP_URL="https://${BRANCH}-documentcloud-frontend.muckrock.workers.dev/"
fi

npm run build
