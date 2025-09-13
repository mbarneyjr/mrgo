#!/usr/bin/env bash

set -euxo pipefail

npx prettier . --write

npx biome check --write

npx sort-package-json package.json './packages/*/package.json'
