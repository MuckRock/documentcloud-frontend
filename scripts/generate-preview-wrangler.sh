#!/bin/bash
set -euo pipefail

# Generate a wrangler config for PR preview deployments.
# Usage: generate-preview-wrangler.sh <worker-name> <subdomain>
# Output: writes wrangler.preview.jsonc to the repo root

WORKER_NAME="${1:?Usage: generate-preview-wrangler.sh <worker-name> <subdomain>}"
SUBDOMAIN="${2:?Usage: generate-preview-wrangler.sh <worker-name> <subdomain>}"

cat > wrangler.preview.jsonc <<EOF
{
  "name": "${WORKER_NAME}",
  "\$schema": "./node_modules/wrangler/config-schema.json",
  "main": ".svelte-kit/cloudflare/_worker.js",
  "compatibility_flags": ["nodejs_als", "nodejs_compat"],
  "compatibility_date": "2026-03-31",
  "send_metrics": false,
  "assets": {
    "binding": "ASSETS",
    "directory": ".svelte-kit/cloudflare"
  },
  "routes": [
    { "custom_domain": true, "pattern": "${SUBDOMAIN}.staging.documentcloud.org" }
  ],
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1,
    "logs": {
      "enabled": true,
      "head_sampling_rate": 1,
      "persist": true,
      "invocation_logs": true
    },
    "traces": {
      "enabled": true,
      "persist": true,
      "head_sampling_rate": 1
    }
  }
}
EOF

echo "Generated wrangler.preview.jsonc for ${WORKER_NAME} at ${SUBDOMAIN}.staging.documentcloud.org"
