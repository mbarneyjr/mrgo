#!/usr/bin/env bash

set -euo pipefail

ENVIRONMENT_NAME=${1:-$(whoami)}

# load config
source ./scripts/utils/load-config.sh "${ENVIRONMENT_NAME}"

echo "[${APPLICATION_NAME}] building"
./scripts/utils/build.sh

# plan database, ask for approval, apply database
if [[ "${DATABASE_ENVIRONMENT_NAME:-${ENVIRONMENT_NAME}}" == "${ENVIRONMENT_NAME}" ]]; then
  ./scripts/utils/plan.sh "${ENVIRONMENT_NAME}" database
  DATABASE_CHANGESET_PATH="artifacts/changesets/${ENVIRONMENT_NAME}-database.changeset.json"
  if [[ -f "${DATABASE_CHANGESET_PATH}" && $(jq .Status -r "${DATABASE_CHANGESET_PATH}") != "FAILED" ]]; then
    echo -n "do you want to proceed with the execution? (y/n): "
    read -r user_input
    if [[ "${user_input}" != "y" ]]; then
      echo "execution aborted by the user"
      exit 1
    fi
  fi
  ./scripts/utils/apply.sh "${ENVIRONMENT_NAME}" database
else
  if [[ "$(./scripts/utils/check.sh "${ENVIRONMENT_NAME}" database)" ]]; then
    echo -n "database stack exists, but you requested to use ${DATABASE_ENVIRONMENT_NAME}'s database, do you want to delete ${ENVIRONMENT_NAME}'s database stack? (y/n): "
    read -r user_input
    if [[ "${user_input}" != "y" ]]; then
      echo "execution aborted by the user"
      exit 1
    fi
    ./scripts/utils/delete.sh "${ENVIRONMENT_NAME}" database
  fi
fi

# # plan and apply auth
# ./scripts/utils/plan.sh "${ENVIRONMENT_NAME}" auth
# ./scripts/utils/apply.sh "${ENVIRONMENT_NAME}" auth

# plan and apply api
./scripts/utils/plan.sh "${ENVIRONMENT_NAME}" api
./scripts/utils/apply.sh "${ENVIRONMENT_NAME}" api

# # plan and apply frontend
# ./scripts/utils/plan.sh "${ENVIRONMENT_NAME}" frontend
# ./scripts/utils/apply.sh "${ENVIRONMENT_NAME}" frontend
