#!/bin/bash
# SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

# This script installs the ToolHive CLI (thv) in a portable way that works
# across different environments (dev containers, CI/CD, Vercel, etc.).

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

# Determine installation location based on write permissions
if [[ -w "/usr/local/bin" ]]; then
    # Can write to /usr/local/bin (e.g., CI/CD environments like Vercel)
    INSTALL_DIR="/usr/local/bin"
    echo "Installing to /usr/local/bin"
else
    # Use user-local directory (e.g., dev containers)
    INSTALL_DIR="$HOME/.local/bin"
    echo "Installing to ~/.local/bin"
    
    # Create user bin directory if it doesn't exist
    mkdir -p "$INSTALL_DIR"
    
    # Automatically add ~/.local/bin to PATH in shell profile files
    for profile in ~/.bashrc ~/.zshrc ~/.profile; do
        if [[ -f "$profile" ]]; then
            # Check if the PATH export already exists to avoid duplicates
            if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$profile" 2>/dev/null; then
                echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$profile"
                echo "Added ~/.local/bin to PATH in $profile"
            fi
        fi
    done
    
    # Also set PATH for current session
    export PATH="$HOME/.local/bin:$PATH"
fi

# Download the release tarball and extract the binary
echo "Downloading ToolHive CLI release $RELEASE_VERSION"
curl -s -L "$RELEASE_TARBALL" -o /tmp/toolhive.tar.gz
tar -xzf /tmp/toolhive.tar.gz -C /tmp thv
chmod +x /tmp/thv
cp /tmp/thv "$INSTALL_DIR/thv"
rm -f /tmp/toolhive.tar.gz /tmp/thv

thv version || {
    echo "Installation failed: 'thv' command is not working."
    exit 1
}

echo "ToolHive CLI (thv) installed successfully."
