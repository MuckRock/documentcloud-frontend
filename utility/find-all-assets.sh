#!/usr/bin/env sh

ASSETS=$(find src/assets -name '*.svg' | xargs basename)

for asset in $ASSETS; do
    ack --ignore-dir public --ignore-dir src/assets --ignore-dir scratch $asset
done
