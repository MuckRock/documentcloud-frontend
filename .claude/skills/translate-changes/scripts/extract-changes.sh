#!/bin/bash

# Extract git diff for en.json and show modified keys
# This script identifies keys that were added or modified in the current branch
# Detects both committed changes and uncommitted working directory changes

set -euo pipefail

LANG_FILE="src/langs/json/en.json"
BASE_BRANCH="${1:-main}"

echo "=== Changes to en.json ===" >&2
echo "" >&2

# Combine uncommitted changes and committed branch changes
# First, get uncommitted changes (working directory + staged)
uncommitted_diff=$(git diff HEAD -- "$LANG_FILE" 2>/dev/null || true)

# Then, get committed changes in branch
committed_diff=$(git diff "$BASE_BRANCH"...HEAD -- "$LANG_FILE" 2>/dev/null || true)

# Combine both diffs and extract modified lines
# Only lines starting with + that contain key definitions (not just commas or context)
{
  if [ -n "$uncommitted_diff" ]; then
    echo "$uncommitted_diff"
  fi
  if [ -n "$committed_diff" ]; then
    echo "$committed_diff"
  fi
} | \
  grep -E '^\+[^+]' | \
  grep -E '^\+\s*"[^"]+"\s*:' | \
  sed 's/^+\s*//' | \
  sort -u | \
  head -30

echo "" >&2
echo "Note: Showing up to 30 modified lines (uncommitted + committed)." >&2
echo "Uncommitted: 'git diff HEAD -- $LANG_FILE'" >&2
echo "Committed: 'git diff $BASE_BRANCH...HEAD -- $LANG_FILE'" >&2
