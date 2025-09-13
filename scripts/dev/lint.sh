#!/usr/bin/env bash

set -euxo pipefail

shellcheck scripts/**/*.sh --format "${FORMAT:-tty}"

cfn-lint

npx sort-package-json package.json './packages/*/package.json' --check

npm run types --workspaces
