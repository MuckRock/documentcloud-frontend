#!/bin/bash
BROWSER=firefox node tests/functional/suites/noindex.js
#BROWSER=chromium node tests/functional/suites/noindex.js
BROWSER=webkit node tests/functional/suites/noindex.js
