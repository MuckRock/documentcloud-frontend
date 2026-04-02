#!/bin/bash
set -euo pipefail

ENV="${1:-preview}"
ENV_FILE=".env.${ENV}"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# Debug: show available branch/build info
echo "=== Build environment ==="
echo "CF_PAGES_BRANCH=${CF_PAGES_BRANCH:-unset}"
echo "CF_PAGES_URL=${CF_PAGES_URL:-unset}"
echo "WORKERS_ENV=${WORKERS_ENV:-unset}"
echo "CF_WORKER_NAME=${CF_WORKER_NAME:-unset}"
echo "git rev-parse --abbrev-ref HEAD: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'failed')"
echo "git branch --show-current: $(git branch --show-current 2>/dev/null || echo 'failed')"
echo "git name-rev --name-only HEAD: $(git name-rev --name-only HEAD 2>/dev/null || echo 'failed')"
env | grep -iE 'CF_|WORKER|BRANCH|BUILD|DEPLOY' || true
echo "========================="

npm run build
