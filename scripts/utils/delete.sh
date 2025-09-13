#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "usage: plan.sh <environment-name> <infra-component>"
  exit 1
}

ENVIRONMENT_NAME=${1:-}
if [[ -z "${ENVIRONMENT_NAME}" ]]; then
  usage
fi
INFRA_COMPONENT=${2:-}
if [[ -z "${INFRA_COMPONENT}" ]]; then
  usage
fi
STACK_NAME="${APPLICATION_NAME}-${ENVIRONMENT_NAME}-${INFRA_COMPONENT}"

aws cloudformation delete-stack \
  --stack-name "${STACK_NAME}"

if aws cloudformation describe-stacks --stack-name "${STACK_NAME}" > /dev/null 2>&1; then
  npx cfn-event-tailer "${STACK_NAME}"
fi
