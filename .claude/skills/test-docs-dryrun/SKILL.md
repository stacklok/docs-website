---
name: test-docs-dryrun
description: >
  Fast CRD schema validation for ToolHive documentation. Extracts all YAML blocks from K8s and vMCP docs, runs kubectl apply --dry-run=server to catch field name errors, type mismatches, and schema drift. No cluster resources are created. Use for: "dry-run the docs", "validate the YAML", "check for schema issues", "run a quick doc check", or after any CRD/API change to catch doc rot. Requires a Kubernetes cluster with ToolHive CRDs installed.
---

# Test Docs - Dry Run

Fast CRD schema validation for all ToolHive documentation YAML blocks. Extracts every YAML block containing `toolhive.stacklok.dev` resources from the docs, runs `kubectl apply --dry-run=server` on each, and reports pass/fail. No resources are created. Typically completes in under 5 minutes for all docs.

## When to use

- After a ToolHive release (CRD fields may have changed)
- After docs changes that touch YAML examples
- As a quick regression check before a full execution test
- In CI to validate docs against the current CRD schema

## Workflow

1. **Determine scope** - which docs to validate
2. **Check prerequisites** - cluster with CRDs must exist
3. **Extract YAML** - pull all ToolHive CRD YAML blocks from docs
4. **Validate** - dry-run each block against the K8s API server
5. **Report** - pass/fail per block, grouped by doc

## Step 1: Determine scope

The user can request validation at three levels:

- **Single page** - validate YAML from one doc file
- **Section** - validate all YAML from a section
- **All** - validate all YAML across all sections

### Section definitions

**Kubernetes Operator** (`docs/toolhive/guides-k8s/`): all `.mdx` files

**Virtual MCP Server** (`docs/toolhive/guides-vmcp/`): all `.mdx` files

When the user says "all", "everything", or "dry-run the docs", validate both sections.

### Asking the user

When invoked without specifying scope, ask:

- **Kubernetes Operator** - all pages in `guides-k8s/`
- **Virtual MCP Server** - all pages in `guides-vmcp/`
- **All** - both sections

## Step 2: Check prerequisites

A Kubernetes cluster with ToolHive CRDs installed is required. The cluster does NOT need the operator running - only the CRDs for schema validation.

Run the prerequisites checker:

```bash
bash <skill-path>/scripts/check-prereqs.sh
```

If no cluster exists, offer to create one:

1. `kind create cluster --name toolhive`
2. `helm upgrade --install toolhive-operator-crds oci://ghcr.io/stacklok/toolhive/toolhive-operator-crds -n toolhive-system --create-namespace`

The operator itself is NOT needed for dry-run validation.

## Step 3: Extract YAML

Use the extraction script to pull all YAML blocks from the target docs:

```bash
python3 <skill-path>/scripts/extract-yaml.py <doc-file> <output-dir>
```

Run this for every `.mdx` file in scope. The script:

- Finds all ` ```yaml ` / ` ```yml ` fenced code blocks
- Splits multi-document blocks on `---`
- Keeps only documents containing `toolhive.stacklok.dev`
- Writes each as a separate `.yaml` file named `<doc-basename>_<index>.yaml`

## Step 4: Validate

For each extracted YAML file, run:

```bash
kubectl apply --dry-run=server -f <file>
```

Classify results:

- **PASS**: dry-run succeeds (exit 0)
- **PASS (namespace missing)**: fails only because namespace doesn't exist (`namespaces "..." not found`) - schema is valid
- **EXPECTED FAIL**: placeholder names like `<SERVER_NAME>` or missing required fields on intentionally partial snippets (`spec.incomingAuth: Required value`)
- **REAL FAIL**: schema validation error (unknown field, wrong type, etc.)

## Step 5: Report

Always output a per-doc breakdown table to the user showing every doc that had YAML blocks extracted. This table is the primary output of the skill and must always be displayed, not just written to a file.

```text
## Dry-Run Results

| Doc | Section | Blocks | Pass | Fail | Expected | Skip |
|-----|---------|--------|------|------|----------|------|
| auth-k8s | K8s | 10 | 10 | 0 | 0 | 0 |
| connect-clients | K8s | 3 | 1 | 0 | 0 | 2 |
| customize-tools | K8s | 8 | 8 | 0 | 0 | 0 |
| ... | ... | ... | ... | ... | ... | ... |
| authentication | vMCP | 7 | 7 | 0 | 0 | 0 |
| quickstart | vMCP | 4 | 4 | 0 | 0 | 0 |
| ... | ... | ... | ... | ... | ... | ... |
| **TOTAL** | | **N** | **N** | **N** | **N** | **N** |
```

Rules for the table:

- Include EVERY doc that had at least 1 YAML block extracted
- Omit docs with 0 blocks (intro, index, deploy-operator, etc.)
- Group K8s docs first, then vMCP docs
- Sort alphabetically within each section
- Bold the TOTAL row
- Bold any non-zero Fail count to draw attention

After the table, list each REAL FAIL with:

- The file and block index
- The error message
- The likely fix (field rename, type change, etc.)

### Write results to file

- Single page: `TEST_DRYRUN_<PAGE_NAME>.md`
- Section: `TEST_DRYRUN_<SECTION_NAME>.md`
- All: `TEST_DRYRUN_ALL.md`

## Example session

User: "dry-run the docs"

1. Check cluster exists, CRDs installed
2. Extract 108 YAML blocks from 26 docs
3. Dry-run validate all blocks (~2 minutes)
4. Report: 97 PASS, 4 EXPECTED FAIL, 7 REAL FAIL
5. List each real failure with the fix needed
6. Write `TEST_DRYRUN_ALL.md`
