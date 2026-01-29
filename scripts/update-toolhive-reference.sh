#!/bin/bash
# SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

IMPORT_DIR="./imports"
DOCS_DIR="./docs"
STATIC_DIR="./static"

CLI_DOCS_SRC="${IMPORT_DIR}/toolhive/docs/cli"
CLI_DOCS_DST="${DOCS_DIR}/toolhive/reference/cli"

API_SPEC_SRC="${IMPORT_DIR}/toolhive/docs/server/swagger.yaml"
API_SPEC_DST="${STATIC_DIR}/api-specs/toolhive-api.yaml"

REGISTRY_SCHEMA_SRC="${IMPORT_DIR}/toolhive/pkg/registry/data/toolhive-legacy-registry.schema.json"
REGISTRY_SCHEMA_DST="${STATIC_DIR}/api-specs/toolhive-legacy-registry.schema.json"
UPSTREAM_REGISTRY_SCHEMA_SRC="${IMPORT_DIR}/toolhive/pkg/registry/data/upstream-registry.schema.json"
UPSTREAM_REGISTRY_SCHEMA_DST="${STATIC_DIR}/api-specs/upstream-registry.schema.json"

CRD_API_SRC="${IMPORT_DIR}/toolhive/docs/operator/crd-api.md"
CRD_API_DST="${STATIC_DIR}/api-specs/toolhive-crd-api.md"

# Test the required directories exist
if [ ! -d "$IMPORT_DIR" ]; then
    mkdir -p "$IMPORT_DIR"
fi
if [ ! -d "$DOCS_DIR" ]; then
    echo "Docs directory does not exist: $DOCS_DIR"
    exit 1
fi
if [ ! -d "$STATIC_DIR" ]; then
    echo "Static directory does not exist: $STATIC_DIR"
    exit 1
fi

# Check if jq is installed
if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' is required but not installed. Please install jq and try again."
    exit 1
fi

VERSION=$(echo "${1:-}" | tr -cd '[:alnum:].-')

# Handle tag name parameter - default to "latest" if not provided
if [ -z "$VERSION" ] || [ "$VERSION" = "latest" ]; then
    API_ENDPOINT="https://api.github.com/repos/stacklok/toolhive/releases/latest"
    echo "No tag specified or 'latest' specified, using latest release"
else
    TAG_NAME="$VERSION"
    API_ENDPOINT="https://api.github.com/repos/stacklok/toolhive/releases/tags/$TAG_NAME"
    echo "Using specified tag: $TAG_NAME"
fi

# Fetch release information
RELEASE_JSON=$(curl -sf "$API_ENDPOINT" || {
    echo "Failed to fetch release information from GitHub API"
    exit 1
})
RELEASE_TARBALL=$(echo "$RELEASE_JSON" | jq -r '.tarball_url // empty')
RELEASE_VERSION=$(echo "$RELEASE_JSON" | jq -r '.tag_name // empty')

if [ -z "$RELEASE_TARBALL" ]; then
    echo "Failed to get release tarball URL for release: ${RELEASE_VERSION}"
    echo "Please check if the tag exists in the repository"
    exit 1
fi

# Output the release version for use in CI workflows (if running in GitHub Actions)
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "version=$RELEASE_VERSION" >> "$GITHUB_OUTPUT"
fi

# Clean up and prepare import directory
rm -rf ${IMPORT_DIR}/toolhive
mkdir -p ${IMPORT_DIR}/toolhive

echo "Fetching ToolHive release (${RELEASE_VERSION}) from: $RELEASE_TARBALL"
echo "Importing to: $IMPORT_DIR"

# Download and extract the release tarball
curl -sfL "$RELEASE_TARBALL" | tar xz --strip-components=1 -C ./imports/toolhive

## CLI reference
echo "Updating ToolHive CLI reference documentation in ${CLI_DOCS_DST}"

# Remove existing CLI reference documentation files in case we remove any commands
rm -f ${CLI_DOCS_DST}/thv_*.md

# Copy CLI documentation
if [ -d "${CLI_DOCS_SRC}" ]; then
    cp -r ${CLI_DOCS_SRC}/* ${CLI_DOCS_DST}
    echo "CLI reference documentation updated successfully"
else
    echo "Warning: CLI documentation not found in ${CLI_DOCS_SRC}"
fi

## API reference
echo "Updating ToolHive API reference at ${API_SPEC_DST}"

# Copy API specification
if [ -f "${API_SPEC_SRC}" ]; then
    cp ${API_SPEC_SRC} ${API_SPEC_DST}
    echo "API reference updated successfully"
else
    echo "Warning: API specification not found at ${API_SPEC_SRC}"
fi

## Registry schemas
echo "Updating ToolHive registry JSON schema at ${REGISTRY_SCHEMA_DST}"

if [ -f "${REGISTRY_SCHEMA_SRC}" ]; then
    cp ${REGISTRY_SCHEMA_SRC} ${REGISTRY_SCHEMA_DST}
    echo "Registry JSON schema updated successfully"
else
    echo "Warning: Registry schema not found at ${REGISTRY_SCHEMA_SRC}"
fi

echo "Updating upstream registry JSON schema at ${UPSTREAM_REGISTRY_SCHEMA_DST}"

if [ -f "${UPSTREAM_REGISTRY_SCHEMA_SRC}" ]; then
    cp ${UPSTREAM_REGISTRY_SCHEMA_SRC} ${UPSTREAM_REGISTRY_SCHEMA_DST}
    echo "Upstream registry JSON schema updated successfully"
    
    # Bundle the upstream schema to resolve remote $ref references
    echo "Bundling upstream registry schema (resolving remote references)..."
    node "${REPO_ROOT}/scripts/bundle-upstream-schema.mjs"
else
    echo "Warning: Registry schema not found at ${UPSTREAM_REGISTRY_SCHEMA_SRC}"
fi

## CRD API reference
echo "Updating ToolHive CRD API reference in ${STATIC_DIR}/api-specs"

# Copy CRD API documentation
if [ -f "${CRD_API_SRC}" ]; then
    # Remove h1 title from the CRD API documentation, Docusaurus will use the title from the front matter
    sed '1{/^# /d;}' ${CRD_API_SRC} > ${CRD_API_DST}
    echo "CRD API reference updated successfully"
else
    echo "Warning: CRD API documentation not found at ${CRD_API_SRC}"
fi

echo "Release processing completed for: $RELEASE_VERSION"
