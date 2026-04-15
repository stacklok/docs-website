#!/bin/bash
# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

# Check prerequisites for dry-run documentation validation.
# Only requires kubectl and a cluster with CRDs installed (no operator needed).

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "=== Dry-Run Validation Prerequisites ==="
echo ""

# Check kubectl
if command -v kubectl &>/dev/null; then
    echo -e "${GREEN}[OK]${NC} kubectl available"
else
    echo -e "${RED}[MISSING]${NC} kubectl (required)"
    ERRORS=$((ERRORS + 1))
fi

# Check cluster connectivity
echo ""
echo "--- Kubernetes cluster ---"
if kubectl cluster-info &>/dev/null; then
    CONTEXT=$(kubectl config current-context 2>/dev/null || echo "unknown")
    echo -e "${GREEN}[OK]${NC} Cluster reachable (context: $CONTEXT)"
else
    echo -e "${RED}[MISSING]${NC} No Kubernetes cluster reachable"
    ERRORS=$((ERRORS + 1))
fi

# Check ToolHive CRDs installed
echo ""
echo "--- ToolHive CRDs ---"
CRD_COUNT=$(kubectl get crd 2>/dev/null | grep -c toolhive.stacklok.dev || true)
if [ "$CRD_COUNT" -gt 0 ]; then
    echo -e "${GREEN}[OK]${NC} $CRD_COUNT ToolHive CRDs installed"
else
    echo -e "${RED}[MISSING]${NC} No ToolHive CRDs found"
    echo "       Install with: helm upgrade --install toolhive-operator-crds oci://ghcr.io/stacklok/toolhive/toolhive-operator-crds -n toolhive-system --create-namespace"
    ERRORS=$((ERRORS + 1))
fi

# Check python3 for extraction script
echo ""
echo "--- Tools ---"
if command -v python3 &>/dev/null; then
    echo -e "${GREEN}[OK]${NC} python3 available"
else
    echo -e "${RED}[MISSING]${NC} python3 (required for YAML extraction)"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=== Summary ==="
if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}$ERRORS error(s)${NC}"
    exit 1
else
    echo -e "${GREEN}All prerequisites met${NC}"
    exit 0
fi
