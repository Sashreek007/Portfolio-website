#!/usr/bin/env bash
# Fetch the CC0 human base mesh the asteroid render uses for its figure.
#
# Blender Studio's Human Base Meshes bundle — 17 sculpted human meshes,
# CC0, from the Blender Foundation's own download server. ~48MB, so it is
# gitignored rather than committed; run this once on a fresh checkout.
set -euo pipefail

DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/assets/vendor"
URL="https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip"
TARGET="$DEST/human_base_meshes_bundle.blend"

if [ -f "$TARGET" ]; then
  echo "already present: $TARGET"
  exit 0
fi

mkdir -p "$DEST"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "downloading Human Base Meshes bundle (~48MB)…"
curl -fSL --progress-bar -o "$TMP/hbm.zip" "$URL"
unzip -q -o "$TMP/hbm.zip" -d "$TMP"
find "$TMP" -name 'human_base_meshes_bundle.blend' -exec mv {} "$TARGET" \;
echo "installed: $TARGET"
