#!/usr/bin/env bash
# Helper: скачать Noto Sans Regular + Bold в public/fonts/.
# Используется jsDelivr CDN (mirror of googlefonts/noto-fonts на GitHub),
# т.к. raw.githubusercontent.com иногда блокируется хостерами (Hoster.kz).
#
# Usage: bash scripts/prep-pdf-fonts.sh
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)/public/fonts"
mkdir -p "$DIR"

REG_URL="https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf"
BOLD_URL="https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf"

echo "[prep-pdf-fonts] downloading NotoSans-Regular.ttf..."
curl -sSL --fail --max-time 60 -o "$DIR/NotoSans-Regular.ttf" "$REG_URL"

echo "[prep-pdf-fonts] downloading NotoSans-Bold.ttf..."
curl -sSL --fail --max-time 60 -o "$DIR/NotoSans-Bold.ttf" "$BOLD_URL"

echo "[prep-pdf-fonts] done:"
ls -la "$DIR"
