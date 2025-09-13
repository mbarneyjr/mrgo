#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "usage: load-shared-environment.sh <shared-environment-name>"
  exit 1
}

SHARED_ENVIRONMENT_NAME=${1:-}
if [[ -z "${SHARED_ENVIRONMENT_NAME}" ]]; then
  usage
fi

if [[ "${SHARED_API:-}" == "true" ]]; then
  export API_ENVIRONMENT_NAME="${SHARED_ENVIRONMENT_NAME}"
fi
if [[ -n "${API_ENVIRONMENT_NAME:-}" || "${SHARED_DATABASE:-}" == "true" ]]; then
  export DATABASE_ENVIRONMENT_NAME="${SHARED_ENVIRONMENT_NAME}"
fi
if [[ -n "${API_ENVIRONMENT_NAME:-}" || "${SHARED_AUTH:-}" == "true" ]]; then
  export AUTH_ENVIRONMENT_NAME="${SHARED_ENVIRONMENT_NAME}"
fi
