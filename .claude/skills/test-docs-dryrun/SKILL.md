---
name: test-docs-dryrun
description: >
  Fast CRD schema validation for ToolHive documentation. Extracts all YAML blocks from K8s and vMCP docs, runs kubectl apply --dry-run=server to catch field name errors, type mismatches, and schema drift. No cluster resources are created. Use for: "dry-run the docs", "validate the YAML", "check for schema issues", "run a quick doc check", or after any CRD/API change to catch doc rot. Requires a Kubernetes cluster with ToolHive CRDs installed.
---

# Test Docs - Dry Run

Fast CRD schema validation for all ToolHive documentation YAML blocks. Extracts every YAML block containing `toolhive.stacklok.dev` resources, runs `kubectl apply --dry-run=server` on each, and reports pass/fail in a per-doc table. No resources are created. Under 5 minutes for all docs.

## Workflow

Follow these steps in order. Each step references a procedure file in the `procedures/` directory - read that file and follow its instructions exactly. Do NOT improvise inline bash when a procedure exists.

### 1. Determine scope

Ask what to validate:

- **Kubernetes Operator** - all `.mdx` in `docs/toolhive/guides-k8s/`
- **Virtual MCP Server** - all `.mdx` in `docs/toolhive/guides-vmcp/`
- **All** - both sections

### 2. Cluster setup

Follow `procedures/cluster-setup.md`. Key points:

- Check for existing `toolhive` kind cluster FIRST
- Only create if missing
- Only CRDs needed, not the operator
- Default to KEEPING the cluster after the run

### 3. Extract YAML

Follow `procedures/extract.md`. Key points:

- Always use `scripts/extract-yaml.py` with the `--prefix` flag
- Use `--prefix k8s` for K8s docs, `--prefix vmcp` for vMCP docs
- This prevents filename collisions between sections

### 4. Validate

Follow `procedures/validate.md`. Key points:

- Write results to a CSV file (not bash variables)
- Classify as pass/fail/expected/skip per the procedure
- One CSV line per YAML block

### 5. Report

Follow `procedures/report.md`. Key points:

- Always output the per-doc breakdown table to the user
- The table is the PRIMARY output of this skill
- Bold non-zero fail counts
- List real failures with error messages and fix suggestions
- Write results to `TEST_DRYRUN_*.md`
