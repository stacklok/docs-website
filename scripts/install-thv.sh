#!/bin/bash
# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

# This script installs the ToolHive CLI (thv) in a portable way that works
# across different environments (dev containers, CI/CD, Vercel, etc.).

set -euo pipefail

# Check if jq is installed
if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' is required but not installed. Please install jq and try again."
    exit 1
fi

if [[ -n "${TOOLHIVE_VERSION:-}" ]]; then
    API_ENDPOINT="https://api.github.com/repos/stacklok/toolhive/releases/tags/v${TOOLHIVE_VERSION#v}"
else
    API_ENDPOINT="https://api.github.com/repos/stacklok/toolhive/releases/latest"
fi

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
            # Keep the variables literal for the profile to expand at login.
            # shellcheck disable=SC2016
            if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$profile" 2>/dev/null; then
                # shellcheck disable=SC2016
                echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$profile"
                echo "Added ~/.local/bin to PATH in $profile"
            fi
        fi
    done
    
    # Also set PATH for current session
    export PATH="$HOME/.local/bin:$PATH"
fi

# Keep downloads isolated, and verify before extracting or executing the CLI.
DOWNLOAD_DIR=$(mktemp -d)
trap 'rm -rf "$DOWNLOAD_DIR"' EXIT

echo "Downloading ToolHive CLI release $RELEASE_VERSION"
curl -fsSL "$RELEASE_TARBALL" -o "$DOWNLOAD_DIR/toolhive.tar.gz"

if [[ "${TOOLHIVE_VERIFY_SIGNATURE:-false}" == "true" ]]; then
    command -v cosign >/dev/null 2>&1 || {
        echo "Error: cosign is required for signature verification"
        exit 1
    }
    BUNDLE_URL=$(echo "$RELEASE_JSON" | jq -r \
        --arg version "$RELEASE_VERSION" \
        '.assets[] | select(.name == "toolhive_" + $version + "_linux_amd64.tar.gz.sigstore.json") | .browser_download_url // empty')
    if [[ -z "$BUNDLE_URL" ]]; then
        echo "Error: signature bundle missing for release $RELEASE_VERSION"
        exit 1
    fi
    curl -fsSL "$BUNDLE_URL" -o "$DOWNLOAD_DIR/toolhive.sigstore.json"
    cosign verify-blob "$DOWNLOAD_DIR/toolhive.tar.gz" \
        --bundle "$DOWNLOAD_DIR/toolhive.sigstore.json" \
        --certificate-identity "https://github.com/stacklok/toolhive/.github/workflows/releaser.yml@refs/tags/v$RELEASE_VERSION" \
        --certificate-oidc-issuer "https://token.actions.githubusercontent.com"
fi

tar -xzf "$DOWNLOAD_DIR/toolhive.tar.gz" -C "$DOWNLOAD_DIR" thv
chmod +x "$DOWNLOAD_DIR/thv"
cp "$DOWNLOAD_DIR/thv" "$INSTALL_DIR/thv"

thv version || {
    echo "Installation failed: 'thv' command is not working."
    exit 1
}

echo "ToolHive CLI (thv) installed successfully."
