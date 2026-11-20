#!/usr/bin/env bash
# Works out which services a workflow run should act on and writes the result
# to $GITHUB_OUTPUT.
#
# Inputs (environment variables):
#   EVENT_NAME        github.event_name
#   BASE_SHA          commit to diff from (pull_request base / push before)
#   HEAD_SHA          commit to diff to
#   SELECTED_SERVICE  service name or "all" (workflow_dispatch / schedule only)
#
# Outputs:
#   services       JSON array of the config objects for the selected services
#   names          JSON array of the selected service names
#   node-services  subset of "services" with "node": true
#   container-services  subset of "services" with "container": true
#   oas-drift-services  subset of "services" with an "oas-drift" block
set -euo pipefail

CONFIG_FILE=".github/config/services.json"
ZERO_SHA="0000000000000000000000000000000000000000"

# Changes to these paths affect every service
SHARED_PATTERN='^(\.github/(workflows/_reusable-.*|workflows/(pull-request-checks|push-to-main|dev-deploy|check-oas-for-drift)\.yml|config/services\.json|scripts/detect-services\.sh))$'

select_all() {
  jq -c '.' "$CONFIG_FILE"
}

select_by_name() {
  jq -c --arg name "$1" '[.[] | select(.name == $name)]' "$CONFIG_FILE"
}

select_by_changed_files() {
  local changed="$1"
  if grep -Eq "$SHARED_PATTERN" <<<"$changed"; then
    select_all
    return
  fi
  jq -c --arg changed "$changed" '
    ($changed | split("\n") | map(select(length > 0))) as $files
    | [.[] | . as $svc | select($files | any(startswith($svc.directory + "/")))]
  ' "$CONFIG_FILE"
}

case "$EVENT_NAME" in
  workflow_dispatch | schedule)
    if [[ -z "${SELECTED_SERVICE:-}" || "$SELECTED_SERVICE" == "all" ]]; then
      services=$(select_all)
    else
      services=$(select_by_name "$SELECTED_SERVICE")
    fi
    ;;
  pull_request | push)
    if [[ -z "${BASE_SHA:-}" || "$BASE_SHA" == "$ZERO_SHA" ]] || ! git cat-file -e "${BASE_SHA}^{commit}" 2>/dev/null; then
      echo "No usable base commit, selecting all services"
      services=$(select_all)
    else
      changed=$(git diff --name-only "${BASE_SHA}...${HEAD_SHA}" 2>/dev/null || git diff --name-only "${BASE_SHA}" "${HEAD_SHA}")
      echo "Changed files:"
      echo "$changed"
      services=$(select_by_changed_files "$changed")
    fi
    ;;
  *)
    echo "Unsupported event: $EVENT_NAME" >&2
    exit 1
    ;;
esac

names=$(jq -c '[.[].name]' <<<"$services")
node_services=$(jq -c '[.[] | select(.node)]' <<<"$services")
container_services=$(jq -c '[.[] | select(.container)]' <<<"$services")
oas_drift_services=$(jq -c '[.[] | select(."oas-drift")]' <<<"$services")

echo "Selected services: $names"

{
  echo "services=$services"
  echo "names=$names"
  echo "node-services=$node_services"
  echo "container-services=$container_services"
  echo "oas-drift-services=$oas_drift_services"
} >>"$GITHUB_OUTPUT"
