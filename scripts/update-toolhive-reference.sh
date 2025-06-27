#!/bin/bash

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

IMPORT_DIR="./imports"
DOCS_DIR="./docs"
STATIC_DIR="./static"

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

# Determine release type and process accordingly
if [[ "$RELEASE_VERSION" =~ ^v.* ]]; then
    echo "Processing main CLI release: $RELEASE_VERSION"
    
    ## CLI reference
    echo "Updating ToolHive CLI reference documentation in ${DOCS_DIR}/toolhive/reference/cli"
    
    # Remove existing CLI reference documentation files in case we remove any commands
    rm -f ${DOCS_DIR}/toolhive/reference/cli/thv_*.md
    
    # Copy CLI documentation
    if [ -d "${IMPORT_DIR}/toolhive/docs/cli" ]; then
        cp -r ${IMPORT_DIR}/toolhive/docs/cli/* ${DOCS_DIR}/toolhive/reference/cli
        echo "CLI reference documentation updated successfully"
    else
        echo "Warning: CLI documentation not found in ${IMPORT_DIR}/toolhive/docs/cli"
    fi
    
    ## API reference
    echo "Updating ToolHive API reference in ${STATIC_DIR}/api-specs"
    
    # Copy API specification
    if [ -f "${IMPORT_DIR}/toolhive/docs/server/swagger.yaml" ]; then
        cp ${IMPORT_DIR}/toolhive/docs/server/swagger.yaml ${STATIC_DIR}/api-specs/toolhive-api.yaml
        echo "API reference updated successfully"
    else
        echo "Warning: API specification not found in ${IMPORT_DIR}/toolhive/docs/server/swagger.yaml"
    fi
    
    elif [[ "$RELEASE_VERSION" =~ ^toolhive-operator-crds-.* ]]; then
    echo "Processing operator CRD release: $RELEASE_VERSION"
    
    ## CRD API reference
    echo "Updating ToolHive CRD API reference in ${STATIC_DIR}/api-specs"
    
    # Copy CRD API documentation
    if [ -f "${IMPORT_DIR}/toolhive/docs/operator/crd-api.md" ]; then
        # Remove h1 title from the CRD API documentation, Docusaurus will use the title from the front matter
        sed '1{/^# /d;}' ${IMPORT_DIR}/toolhive/docs/operator/crd-api.md > ${STATIC_DIR}/api-specs/crd-api.md
        echo "CRD API reference updated successfully"
    else
        echo "Warning: CRD API documentation not found in ${IMPORT_DIR}/toolhive/docs/operator/crd-api.md"
    fi
    
    elif [[ "$RELEASE_VERSION" =~ ^toolhive-operator- ]]; then
    echo "Processing main operator release: $RELEASE_VERSION"
    echo "Placeholder: No specific processing implemented for this release type yet"
    
else
    echo "Unknown release type for tag: $RELEASE_VERSION"
    echo "Supported release types:"
    echo "  - v* (main CLI releases)"
    echo "  - toolhive-operator-crds-* (CRD releases)"
    echo "  - toolhive-operator-* (other operator releases)"
    exit 1
fi

echo "Release processing completed for: $RELEASE_VERSION"
