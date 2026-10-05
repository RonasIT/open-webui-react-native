#!/usr/bin/env bash
# The emulator action runs each `script` line separately, so the test steps live here
set -euo pipefail

adb install -r app-release.apk
mkdir -p maestro-output

maestro test \
  -e APP_ID="$APP_ID" \
  --format JUNIT --output maestro-output/report.xml \
  --debug-output maestro-output \
  .maestro
