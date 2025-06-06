#!/bin/bash

REPO_ROOT=$(git rev-parse --show-toplevel)
cd $REPO_ROOT

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

RELEASE_JSON=$(curl -s https://api.github.com/repos/stacklok/toolhive/releases/latest)
LATEST_RELEASE_TARBALL=$(echo "$RELEASE_JSON" | grep "tarball_url" | cut -d '"' -f 4)
LATEST_RELEASE_VERSION=$(echo "$RELEASE_JSON" | grep '"tag_name"' | cut -d '"' -f 4)

if [ -z "$LATEST_RELEASE_TARBALL" ]; then
    echo "Failed to get the latest release tarball URL for ${LATEST_RELEASE_VERSION}"
    exit 1
fi

# Output the latest release version for use in CI workflows
if [ ! -z "$GITHUB_OUTPUT" ]; then
    echo "version=$LATEST_RELEASE_VERSION" >> "$GITHUB_OUTPUT"
fi

rm -rf ${IMPORT_DIR}/toolhive
mkdir -p ${IMPORT_DIR}/toolhive

echo "Fetching the latest ToolHive release (${LATEST_RELEASE_VERSION}) from: $LATEST_RELEASE_TARBALL"
echo "Importing to: $IMPORT_DIR"

curl -sL "$LATEST_RELEASE_TARBALL" | tar xz --strip-components=1  -C ./imports/toolhive

## CLI reference

echo "Updating ToolHive CLI reference documentation in ${DOCS_DIR}/toolhive/reference/cli"

# Remove existing CLI reference documentation files in case we remove any commands
rm -f ${DOCS_DIR}/toolhive/reference/cli/thv_*.md

cp -r ${IMPORT_DIR}/toolhive/docs/cli/* ${DOCS_DIR}/toolhive/reference/cli

## API reference

echo "Updating ToolHive API reference in ${STATIC_DIR}/api-specs"

cp -r ${IMPORT_DIR}/toolhive/docs/server/swagger.yaml ${STATIC_DIR}/api-specs/toolhive-api.yaml
