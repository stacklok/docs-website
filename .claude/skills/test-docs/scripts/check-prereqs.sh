#!/usr/bin/env bash
# Check prerequisites for ToolHive documentation testing.
# Exits with non-zero status if critical prerequisites are missing.
# Outputs a summary of what's available.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

check_command() {
    local cmd="$1"
    local required="$2" # "required" or "optional"
    if command -v "$cmd" &>/dev/null; then
        local version
        version=$("$cmd" version 2>/dev/null | head -1 || "$cmd" --version 2>/dev/null | head -1 || echo "unknown")
        echo -e "${GREEN}[OK]${NC} $cmd: $version"
    elif [ "$required" = "required" ]; then
        echo -e "${RED}[MISSING]${NC} $cmd (required)"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${YELLOW}[MISSING]${NC} $cmd (optional)"
        WARNINGS=$((WARNINGS + 1))
    fi
}

check_kind_cluster() {
    local cluster_name="${1:-toolhive}"
    if ! command -v kind &>/dev/null; then
        echo -e "${RED}[MISSING]${NC} kind CLI not found"
        ERRORS=$((ERRORS + 1))
        return
    fi

    if kind get clusters 2>/dev/null | grep -q "^${cluster_name}$"; then
        echo -e "${GREEN}[OK]${NC} kind cluster '$cluster_name' exists"

        # Check if kubectl context is set to this cluster
        local current_context
        current_context=$(kubectl config current-context 2>/dev/null || echo "none")
        local expected_context="kind-${cluster_name}"
        if [ "$current_context" = "$expected_context" ]; then
            echo -e "${GREEN}[OK]${NC} kubectl context set to '$expected_context'"
        else
            echo -e "${YELLOW}[WARN]${NC} kubectl context is '$current_context', expected '$expected_context'"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}[MISSING]${NC} kind cluster '$cluster_name' not found"
        echo "       Available clusters: $(kind get clusters 2>/dev/null | tr '\n' ' ')"
        ERRORS=$((ERRORS + 1))
    fi
}

check_thv_version() {
    if ! command -v thv &>/dev/null; then
        echo -e "${RED}[MISSING]${NC} thv CLI not found"
        ERRORS=$((ERRORS + 1))
        return
    fi

    local version
    version=$(thv version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}[OK]${NC} thv: $version"
}

echo "=== ToolHive Documentation Test Prerequisites ==="
echo ""

echo "--- Required tools ---"
check_command kubectl required
check_thv_version
check_command helm required

echo ""
echo "--- Optional tools ---"
check_command kind optional
check_command jq optional
check_command curl optional

echo ""
echo "--- Kubernetes cluster ---"
check_kind_cluster "${1:-toolhive}"

echo ""
echo "=== Summary ==="
if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}$ERRORS error(s)${NC}, $WARNINGS warning(s)"
    echo "Fix the errors above before running documentation tests."
    exit 1
else
    echo -e "${GREEN}All prerequisites met${NC} ($WARNINGS warning(s))"
    exit 0
fi
