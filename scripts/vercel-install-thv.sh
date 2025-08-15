#!/bin/bash
# SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

# This script installs the ToolHive CLI (thv) for Vercel deployments.

set -euo pipefail

# Check if jq is installed
if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' is required but not installed. Please install jq and try again."
    exit 1
fi

API_ENDPOINT="https://api.github.com/repos/stacklok/toolhive/releases/latest"

# Fetch release information
RELEASE_JSON=$(curl -sf "$API_ENDPOINT" || {
    echo "Failed to fetch release information from GitHub API"
    exit 1
})
RELEASE_VERSION=$(echo "$RELEASE_JSON" | jq -r '.tag_name // empty' | sed 's/^v//')
RELEASE_TARBALL=$(echo "$RELEASE_JSON" | jq -r \
    --arg version "$RELEASE_VERSION" \
    '.assets[] | select(.name == "toolhive_" + $version + "_linux_amd64.tar.gz") | .browser_download_url // empty')

if [ -z "$RELEASE_TARBALL" ]; then
    echo "Failed to get release tarball URL for release: ${RELEASE_VERSION}"
    echo "Please check if the tag exists in the repository"
    exit 1
fi

# Download the release tarball and extract the binary
echo "Downloading ToolHive CLI release $RELEASE_VERSION"
curl -s -L "$RELEASE_TARBALL" -o /tmp/toolhive.tar.gz
tar -xzf /tmp/toolhive.tar.gz -C /tmp thv
chmod +x /tmp/thv
cp /tmp/thv /usr/local/bin/thv
rm -f /tmp/toolhive.tar.gz /tmp/thv

echo "ToolHive CLI (thv) installed successfully. Version: $RELEASE_VERSION"
