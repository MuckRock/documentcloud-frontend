#!/usr/bin/env sh

curl --request POST \
  --url "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ID}/purge_cache" \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${CLOUDFLARE_TOKEN}" \
  --data '{"purge_everything": true}'
