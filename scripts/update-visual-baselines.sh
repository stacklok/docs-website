#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

# Regenerates visual baselines against whatever is currently checked out
# and, if anything changed, commits and pushes onto <head-ref>.
#
# Always fetches and switches to <head-ref> before committing — a no-op
# when the caller already has that branch checked out (the manual
# /update-snapshots path), but load-bearing for the automatic on-failure
# path: that caller inherits the pull_request event's default checkout,
# which is the MERGE commit (branch + base's current tip), not the
# branch's own tip. Regenerating against that merged tree is correct (view
# it as "does this branch's own tip, once merged, still validate images
# rendered correctly?"), but the branch itself isn't pushable to at that
# ref — so the regenerated PNGs are saved as raw bytes, the branch tip is
# checked out for real, and just those files are restored onto it before
# committing. This keeps the regeneration accurate against the merged
# tree while keeping the pushed commit free of any of main's other
# changes.
#
# Deliberately much simpler than a stateful-app equivalent might need:
# no project sharding, no orphan pruning, no functional-vs-visual
# distinction (this repo has neither).
#
# Usage: update-visual-baselines.sh <head-ref> <trigger-sha>
#   head-ref:    the PR's own branch name to fetch, switch to, and push.
#   trigger-sha: the commit this regeneration is reacting to — recorded
#                in the commit message only.
#
# Writes updated=true|false to $GITHUB_OUTPUT when running inside a
# GitHub Actions step (guarded so this script stays runnable standalone).

set -euo pipefail

HEAD_REF="$1"
TRIGGER_SHA="$2"

# actions/checkout marks the repo safe in the RUNNER's git config, but a
# run: step inside `container:` executes via `docker exec` into a
# separate environment that never got that exception.
git config --global --add safe.directory '*'

# Tolerate a nonzero exit here: a non-snapshot assertion failing (e.g. the
# MCP metadata panel showing an error instead of real data) means that
# one test's screenshot is never reached and its baseline is correctly
# left untouched — that's a real, unresolved failure this script can't
# fix, not a reason to abort before checking whether OTHER tests' PNGs
# still changed.
npm run test:visual:update || true

if git status --porcelain --untracked-files=all -- 'tests/visual/*.spec.ts-snapshots/*' | grep -q .; then
  # Save the regenerated files' raw bytes before switching refs — a git
  # stash/patch approach doesn't apply cleanly to binary PNGs whose
  # "before" content differs between the tree we're on now (possibly a
  # main-merged tree) and head-ref's own committed tree; a plain file
  # copy sidesteps that. Paths with a delete status have nothing to copy
  # here (--update-snapshots only adds/changes, never deletes on its own).
  STAGING_DIR="$(mktemp -d)"
  git status --porcelain --untracked-files=all -- 'tests/visual/*.spec.ts-snapshots/*' \
    | awk '{print $2}' > "$STAGING_DIR/paths"
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    mkdir -p "$STAGING_DIR/tree/$(dirname "$f")"
    cp "$f" "$STAGING_DIR/tree/$f"
  done < "$STAGING_DIR/paths"

  git fetch origin "$HEAD_REF" --quiet
  git checkout -B "$HEAD_REF" "origin/$HEAD_REF" --quiet

  while IFS= read -r f; do
    mkdir -p "$(dirname "$f")"
    cp "$STAGING_DIR/tree/$f" "$f"
  done < "$STAGING_DIR/paths"

  git config user.name "github-actions[bot]"
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  git add --pathspec-from-file="$STAGING_DIR/paths"
  rm -rf "$STAGING_DIR"
  git commit -m "chore: update visual baselines for ${TRIGGER_SHA:0:12}"
  git push origin "HEAD:$HEAD_REF"
  echo "Pushed updated baselines to $HEAD_REF."
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "updated=true" >> "$GITHUB_OUTPUT"
  fi
else
  echo "No snapshot diff reproduced against this branch's current state — nothing to update." >&2
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "updated=false" >> "$GITHUB_OUTPUT"
  fi
fi
