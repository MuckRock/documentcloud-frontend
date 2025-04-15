#!/usr/bin/env sh

# build
vite build
node embeds.js

# remove _redirects files from static directories
rm build/_redirects
