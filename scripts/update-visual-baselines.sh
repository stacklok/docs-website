#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

# Regenerates visual baselines against whatever is currently checked out
# and, if anything changed, commits and pushes.
#
# Deliberately much simpler than a stateful-app equivalent might be: this
# always runs against the PR branch's own tip directly (no merge-ref, no
# project sharding, no orphan pruning) — the calling workflow
# (.github/workflows/update-visual-baselines.yaml) already checked that
# branch out before invoking this script.
#
# Usage: update-visual-baselines.sh <trigger-sha>
#   trigger-sha: the commit whose /update-snapshots request this is
#                reacting to — recorded in the commit message only.
#
# Writes updated=true|false to $GITHUB_OUTPUT when running inside a
# GitHub Actions step (guarded so this script stays runnable standalone).

set -euo pipefail

TRIGGER_SHA="$1"

# actions/checkout marks the repo safe in the RUNNER's git config, but a
# run: step inside `container:` executes via `docker exec` into a
# separate environment that never got that exception.
git config --global --add safe.directory '*'

npm run test:visual:update

if git status --porcelain --untracked-files=all -- 'tests/visual/**/*.spec.ts-snapshots/**' | grep -q .; then
  git config user.name "github-actions[bot]"
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  git add -- 'tests/visual/**/*.spec.ts-snapshots/**'
  git commit -m "chore: update visual baselines for ${TRIGGER_SHA:0:12}"
  git push
  echo "Pushed updated baselines."
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "updated=true" >> "$GITHUB_OUTPUT"
  fi
else
  echo "No snapshot diff reproduced against this branch's current state — nothing to update." >&2
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "updated=false" >> "$GITHUB_OUTPUT"
  fi
fi
