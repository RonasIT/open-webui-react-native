#!/usr/bin/env bash
# The emulator action runs each `script` line separately, so the test steps live here
set -euo pipefail

adb install -r app-release.apk
mkdir -p maestro-output

maestro test \
  -e APP_ID="$APP_ID" \
  --format html-detailed --output maestro-output/report.html \
  --test-output-dir maestro-output/artifacts \
  --debug-output maestro-output/debug \
  .maestro
