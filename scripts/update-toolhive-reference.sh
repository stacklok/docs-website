#!/bin/bash
# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

# Generates the toolhive-specific reference artifacts that don't fit
# the declarative `assets:` schema in .github/upstream-projects.yaml:
#
#   - Per-CRD MDX reference pages (from toolhive's operator Helm chart)
#   - Per-CRD JSON schemas + examples + index
#   - toolhive-core JSON schemas (derived from toolhive's go.mod pin)
#
# The simpler asset handling (CLI help tarball + Swagger) now lives in
# .github/upstream-projects.yaml under assets: and is handled by
# scripts/upstream-release/sync-assets.mjs.
#
# Usage:
#   scripts/update-toolhive-reference.sh <version>
#
# Env:
#   TOOLHIVE_CLONE_DIR  Path to an already-checked-out toolhive repo at
#                       the target tag. If unset, the script clones into
#                       a temp directory (backward compat for ad-hoc runs).

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

STATIC_DIR="./static"

REGISTRY_SCHEMA_DST="${STATIC_DIR}/api-specs/toolhive-legacy-registry.schema.json"
UPSTREAM_REGISTRY_SCHEMA_DST="${STATIC_DIR}/api-specs/upstream-registry.schema.json"
REGISTRY_META_SCHEMA_DST="${STATIC_DIR}/api-specs/publisher-provided.schema.json"
SKILL_SCHEMA_DST="${STATIC_DIR}/api-specs/skill.schema.json"

if [ ! -d "$STATIC_DIR" ]; then
    echo "Static directory does not exist: $STATIC_DIR"
    exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
    echo "Error: 'gh' is required but not installed."
    exit 1
fi

VERSION=$(echo "${1:-}" | tr -cd '[:alnum:].-')

if [ -z "$VERSION" ] || [ "$VERSION" = "latest" ]; then
    echo "No tag specified or 'latest' specified, resolving latest release..."
    VERSION=$(gh release view --repo stacklok/toolhive --json tagName --jq '.tagName')
    echo "Resolved to: $VERSION"
else
    echo "Using specified tag: $VERSION"
fi

DOWNLOAD_DIR=$(mktemp -d)
trap 'rm -rf "$DOWNLOAD_DIR"' EXIT

## Clone toolhive at the tag (or reuse the one the caller already has)
if [ -n "${TOOLHIVE_CLONE_DIR:-}" ] && [ -d "$TOOLHIVE_CLONE_DIR" ]; then
    echo "Reusing caller-provided toolhive clone: $TOOLHIVE_CLONE_DIR"
else
    TOOLHIVE_CLONE_DIR="${DOWNLOAD_DIR}/toolhive"
    echo "Cloning ToolHive at ${VERSION} into ${TOOLHIVE_CLONE_DIR}..."
    git clone --depth 1 --branch "$VERSION" \
        https://github.com/stacklok/toolhive.git \
        "$TOOLHIVE_CLONE_DIR"
fi

## CRD API reference
CRD_SRC="${TOOLHIVE_CLONE_DIR}/deploy/charts/operator-crds/files/crds"

echo "Extracting CRD schemas and examples..."
TOOLHIVE_CRD_DIR="$CRD_SRC" node "${REPO_ROOT}/scripts/extract-crd-schemas.mjs"

echo "Generating CRD reference pages..."
node "${REPO_ROOT}/scripts/generate-crd-pages.mjs"
echo "CRD API reference updated successfully"

## toolhive-core version + schemas
echo "Determining toolhive-core version from go.mod at tag ${VERSION}..."
CORE_VERSION=$(grep 'github.com/stacklok/toolhive-core' "${TOOLHIVE_CLONE_DIR}/go.mod" \
    | awk '{print $2}' | head -1)

if [ -z "$CORE_VERSION" ]; then
    echo "Warning: Could not determine toolhive-core version from go.mod; falling back to latest release"
    CORE_VERSION=$(gh release view --repo stacklok/toolhive-core --json tagName --jq '.tagName')
fi
echo "Using toolhive-core version: ${CORE_VERSION}"

echo "Downloading toolhive-core schema assets for ${CORE_VERSION}..."
gh release download "$CORE_VERSION" \
    --repo stacklok/toolhive-core \
    --pattern "toolhive-legacy-registry.schema.json" \
    --pattern "upstream-registry.schema.json" \
    --pattern "publisher-provided.schema.json" \
    --pattern "skill.schema.json" \
    --dir "$DOWNLOAD_DIR"

cp "${DOWNLOAD_DIR}/toolhive-legacy-registry.schema.json" "${REGISTRY_SCHEMA_DST}"
cp "${DOWNLOAD_DIR}/upstream-registry.schema.json" "${UPSTREAM_REGISTRY_SCHEMA_DST}"
cp "${DOWNLOAD_DIR}/publisher-provided.schema.json" "${REGISTRY_META_SCHEMA_DST}"
cp "${DOWNLOAD_DIR}/skill.schema.json" "${SKILL_SCHEMA_DST}"
echo "toolhive-core JSON schemas updated successfully"

# Bundle the upstream schema to resolve remote $ref references
echo "Bundling upstream registry schema (resolving remote references)..."
node "${REPO_ROOT}/scripts/bundle-upstream-schema.mjs"

echo "Release processing completed for: $VERSION (toolhive-core: $CORE_VERSION)"
