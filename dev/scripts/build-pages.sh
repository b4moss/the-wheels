#!/usr/bin/env bash
# Build kitchen-sink + Storybook and assemble a GitHub Pages site (#63).
# Custom domain thewheels.oss.b4m.jp uses base `/` (default).
# Override PAGES_BASE only for local subdirectory experiments.
set -euo pipefail

cd "$(dirname "$0")/.."

export PAGES_BASE="${PAGES_BASE:-/}"
if [[ "${PAGES_BASE}" != */ ]]; then
  PAGES_BASE="${PAGES_BASE}/"
fi
export PAGES_BASE

if [[ -z "${PAGES_BASE_STORYBOOK:-}" ]]; then
  if [[ "${PAGES_BASE}" == "/" ]]; then
    PAGES_BASE_STORYBOOK="/storybook/"
  else
    PAGES_BASE_STORYBOOK="${PAGES_BASE}storybook/"
  fi
fi
export PAGES_BASE_STORYBOOK

echo "PAGES_BASE=${PAGES_BASE}"
echo "PAGES_BASE_STORYBOOK=${PAGES_BASE_STORYBOOK}"

npm run build:style
npm run build:components
npm run build:the-wheels
npm run build:kitchen-sink
npm run build:storybook
node scripts/assemble-pages.mjs
