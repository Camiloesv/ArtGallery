#!/usr/bin/env sh
set -eu

if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Node.js is required. Install the version from .nvmrc and retry.' >&2
  exit 1
fi

node_version="$(node -p 'process.versions.node')"
node_major="${node_version%%.*}"
node_minor="$(printf '%s' "$node_version" | cut -d. -f2)"
if [ "$node_major" -lt 22 ] || { [ "$node_major" -eq 22 ] && [ "$node_minor" -lt 12 ]; }; then
  printf '%s\n' 'Node.js >=22.12.0 is required.' >&2
  exit 1
fi

npm ci
