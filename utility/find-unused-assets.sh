#!/usr/bin/env sh

ASSETS=$(find src/assets -name '*.svg' | xargs basename)

for asset in $ASSETS; do
    grep --quiet -r $asset src
    code=$?
    if [ 0 -ne $code ]; then
        echo $asset
    fi
done
