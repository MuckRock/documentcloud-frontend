#!/bin/bash
set -euo pipefail

ENV="${1:-preview}"
ENV_FILE=".env.${ENV}"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

npm run build
