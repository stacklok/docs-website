#!/bin/bash
# SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

DOCS_DIR="./docs"
STATIC_DIR="./static"

CLI_DOCS_DST="${DOCS_DIR}/toolhive/reference/cli"
API_SPEC_DST="${STATIC_DIR}/api-specs/toolhive-api.yaml"
REGISTRY_SCHEMA_DST="${STATIC_DIR}/api-specs/toolhive-legacy-registry.schema.json"
UPSTREAM_REGISTRY_SCHEMA_DST="${STATIC_DIR}/api-specs/upstream-registry.schema.json"
REGISTRY_META_SCHEMA_DST="${STATIC_DIR}/api-specs/publisher-provided.schema.json"
CRD_API_DST="${DOCS_DIR}/toolhive/reference/crd-spec.md"
CRD_API_FRONTMATTER="${REPO_ROOT}/scripts/crd-ref-frontmatter.txt"

if [ ! -d "$DOCS_DIR" ]; then
    echo "Docs directory does not exist: $DOCS_DIR"
    exit 1
fi
if [ ! -d "$STATIC_DIR" ]; then
    echo "Static directory does not exist: $STATIC_DIR"
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh >/dev/null 2>&1; then
    echo "Error: 'gh' is required but not installed."
    exit 1
fi

VERSION=$(echo "${1:-}" | tr -cd '[:alnum:].-')

# Resolve to actual tag if "latest" or unset
if [ -z "$VERSION" ] || [ "$VERSION" = "latest" ]; then
    echo "No tag specified or 'latest' specified, resolving latest release..."
    VERSION=$(gh release view --repo stacklok/toolhive --json tagName --jq '.tagName')
    echo "Resolved to: $VERSION"
else
    echo "Using specified tag: $VERSION"
fi

# Output the release version for use in CI workflows (if running in GitHub Actions)
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "version=$VERSION" >> "$GITHUB_OUTPUT"
fi

DOWNLOAD_DIR=$(mktemp -d)
trap 'rm -rf "$DOWNLOAD_DIR"' EXIT

## ToolHive assets
echo "Downloading ToolHive release assets for ${VERSION}..."

gh release download "$VERSION" \
    --repo stacklok/toolhive \
    --pattern "thv-cli-docs.tar.gz" \
    --pattern "swagger.yaml" \
    --pattern "crd-api.md" \
    --dir "$DOWNLOAD_DIR"

## CLI reference
echo "Updating ToolHive CLI reference documentation in ${CLI_DOCS_DST}"
# Remove existing CLI reference documentation files in case we remove any commands
rm -f "${CLI_DOCS_DST}"/thv_*.md
tar -xzf "${DOWNLOAD_DIR}/thv-cli-docs.tar.gz" -C "${CLI_DOCS_DST}"
echo "CLI reference documentation updated successfully"

## API reference
echo "Updating ToolHive API reference at ${API_SPEC_DST}"
cp "${DOWNLOAD_DIR}/swagger.yaml" "${API_SPEC_DST}"
echo "API reference updated successfully"

## CRD API reference
echo "Updating ToolHive CRD API reference at ${CRD_API_DST}"
# Prepend frontmatter and strip the h1 title (Docusaurus uses title from front matter)
{ cat "${CRD_API_FRONTMATTER}"; sed '1{/^# /d;}' "${DOWNLOAD_DIR}/crd-api.md"; } > "${CRD_API_DST}"
echo "CRD API reference updated successfully"

## Derive toolhive-core version from go.mod at the tagged commit
echo "Determining toolhive-core version from go.mod at tag ${VERSION}..."
CORE_VERSION=$(gh api "repos/stacklok/toolhive/contents/go.mod?ref=${VERSION}" \
    --jq '.content' | base64 -d | grep 'github.com/stacklok/toolhive-core' | awk '{print $2}' | head -1)

if [ -z "$CORE_VERSION" ]; then
    echo "Warning: Could not determine toolhive-core version from go.mod; falling back to latest release"
    CORE_VERSION=$(gh release view --repo stacklok/toolhive-core --json tagName --jq '.tagName')
fi
echo "Using toolhive-core version: ${CORE_VERSION}"

## toolhive-core schema assets
echo "Downloading toolhive-core schema assets for ${CORE_VERSION}..."

gh release download "$CORE_VERSION" \
    --repo stacklok/toolhive-core \
    --pattern "toolhive-legacy-registry.schema.json" \
    --pattern "upstream-registry.schema.json" \
    --pattern "publisher-provided.schema.json" \
    --dir "$DOWNLOAD_DIR"

cp "${DOWNLOAD_DIR}/toolhive-legacy-registry.schema.json" "${REGISTRY_SCHEMA_DST}"
echo "Registry JSON schema updated successfully"

cp "${DOWNLOAD_DIR}/upstream-registry.schema.json" "${UPSTREAM_REGISTRY_SCHEMA_DST}"
echo "Upstream registry JSON schema updated successfully"

# Bundle the upstream schema to resolve remote $ref references
echo "Bundling upstream registry schema (resolving remote references)..."
node "${REPO_ROOT}/scripts/bundle-upstream-schema.mjs"

cp "${DOWNLOAD_DIR}/publisher-provided.schema.json" "${REGISTRY_META_SCHEMA_DST}"
echo "Registry extensions JSON schema updated successfully"

echo "Release processing completed for: $VERSION (toolhive-core: $CORE_VERSION)"