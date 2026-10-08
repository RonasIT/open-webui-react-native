#!/usr/bin/env bash
# The emulator action runs each `script` line separately, so the test steps live here
set -euo pipefail

: "${APP_ID:?APP_ID is not set}" "${EMAIL:?E2E_EMAIL is not set}" "${PASSWORD:?E2E_PASSWORD secret is not set}"
: "${ARTIFACT_PASSWORD:?E2E_ARTIFACT_PASSWORD secret is not set}"

adb install -r app-release.apk
# NOTE: Android briefly shows each typed password character, it would get into the screen recording
adb shell settings put system show_password 0

rm -rf maestro-output maestro-output.7z
mkdir -p maestro-output

# NOTE: The repository is public and the report contains the test account data, so only an encrypted archive is uploaded
pack_report() {
  local status=$?

  if ! 7z a -p"$ARTIFACT_PASSWORD" -mhe=on maestro-output.7z maestro-output > /dev/null; then
    echo "::error::Failed to encrypt the Maestro report, it is not uploaded"
    rm -f maestro-output.7z
    status=$((status == 0 ? 1 : status))
  fi

  rm -rf maestro-output
  exit "$status"
}
trap pack_report EXIT

maestro test \
  -e APP_ID="$APP_ID" \
  -e API_URL="${API_URL:-}" \
  -e EMAIL="$EMAIL" \
  -e PASSWORD="$PASSWORD" \
  --format html-detailed --output maestro-output/report.html \
  --test-output-dir maestro-output/artifacts \
  --debug-output maestro-output/debug \
  .maestro
