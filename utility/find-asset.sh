#!/usr/bin/env sh

asset=$(basename $1)

ack --ignore-dir public --ignore-dir src/assets --ignore-dir scratch $asset
