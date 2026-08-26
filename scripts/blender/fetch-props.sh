#!/usr/bin/env bash
# Fetch the CC0 Poly Haven props desk.py uses (assets/vendor/ is gitignored).
# ~20MB total, 2k textures each.
set -euo pipefail
cd "$(dirname "$0")/../.."

for asset in metal_office_desk dining_chair_02 plastic_thermos; do
  python3 - "$asset" <<'PY'
import json, os, sys, urllib.request

asset = sys.argv[1]
base = os.path.join("assets", "vendor", "polyhaven", asset)
with urllib.request.urlopen(f"https://api.polyhaven.com/files/{asset}") as r:
    entry = json.load(r)["blend"]["2k"]["blend"]

def get(url, dest):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if not os.path.exists(dest):
        urllib.request.urlretrieve(url, dest)
    print(f"  {dest} ({os.path.getsize(dest)/1e6:.1f}MB)")

get(entry["url"], os.path.join(base, f"{asset}_2k.blend"))
for rel, inc in entry.get("include", {}).items():
    get(inc["url"], os.path.join(base, rel))
PY
done
echo "[fetch-props] done"
