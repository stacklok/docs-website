---
name: update-vmcp-yaml-example
description: Updates vMCP YAML examples in documentation, verifies against toolhive source, and creates e2e tests
---

# Update vMCP YAML Examples

This skill guides you through updating VirtualMCPServer YAML examples in the documentation, ensuring they match the canonical examples in the ToolHive repository and are verified through tests.

## Overview

When updating vMCP documentation examples, you must:

1. Make the described changes to the relevant code examples in docs-website
2. Ensure changes match the documentation in the ToolHive repo (the source of truth)
3. Verify the documentation by creating a Ginkgo test OR running a manual test (depending on the feature)
4. Run a manual test verifying the documented API using the `deploying-vmcp-locally` skill

## Instructions

### Step 1: Sync ToolHive to latest

Ensure ToolHive has the latest changes from main:

```bash
cd ../toolhive
git checkout main
git pull
```

### Step 2: Identify affected files

Find all files containing vMCP YAML examples:

**In docs-website:**

- `docs/toolhive/guides-vmcp/*.mdx` - vMCP how-to guides
- `docs/toolhive/tutorials/quickstart-vmcp.mdx` - vMCP tutorial
- `docs/toolhive/concepts/vmcp.mdx` - vMCP concepts

**In ToolHive (source of truth):**

- `examples/operator/virtual-mcps/` - Canonical YAML examples
- `examples/vmcp-config.yaml` - CLI configuration example

Reference the following ToolHive example files:

| Documentation Topic        | ToolHive Example                        |
| -------------------------- | --------------------------------------- |
| Basic vMCP setup           | `vmcp_simple_discovered.yaml`           |
| Conflict resolution        | `vmcp_conflict_resolution.yaml`         |
| Authentication             | `vmcp_inline_incoming_auth.yaml`        |
| Production config          | `vmcp_production_full.yaml`             |
| Simple composite tools     | `composite_tool_simple.yaml`            |
| Complex composite tools    | `composite_tool_complex.yaml`           |
| Composite with elicitation | `composite_tool_with_elicitations.yaml` |

### Step 3: Update documentation examples

Make the requested changes to the YAML examples in the documentation to match ToolHive.

**Important guidelines:**

- Documentation examples should be simplified versions focused on the specific feature being documented
- Always include comments explaining key configuration options
- Use realistic but simple values (e.g., `my-group`, `my-vmcp`)
- Follow the existing documentation style (see `/CLAUDE.md` for style guide)

### Step 4: Verify the changes

Choose the appropriate verification method based on the feature type:

#### Option A: Ginkgo e2e test (for features that can be automated)

Use this for features like tool aggregation, conflict resolution, composite tools, etc.

Create a Ginkgo test in `../toolhive/test/e2e/thv-operator/virtualmcp/` that verifies the documented configuration works as expected.

**Test structure pattern:**

```go
var _ = Describe("VirtualMCPServer <Feature Name>", Ordered, func() {
    var (
        testNamespace   = "default"
        mcpGroupName    = "test-<feature>-group"
        vmcpServerName  = "test-vmcp-<feature>"
        timeout         = 3 * time.Minute
        pollingInterval = 1 * time.Second
    )

    BeforeAll(func() {
        By("Creating MCPGroup")
        CreateMCPGroupAndWait(ctx, k8sClient, mcpGroupName, testNamespace,
            "Test MCP Group for <feature> E2E tests", timeout, pollingInterval)

        By("Creating backend MCPServer")
        // Create backend servers...

        By("Creating VirtualMCPServer with <feature> configuration")
        // Create VirtualMCPServer matching the documented configuration...
    })

    It("should <expected behavior>", func() {
        // Verify the feature works as documented
    })

    AfterAll(func() {
        // Cleanup resources
    })
})
```

Use helper functions from `helpers.go`:

- `CreateMCPGroupAndWait()` - Create and wait for MCPGroup
- `WaitForVMCPReady()` - Wait for VirtualMCPServer to be ready
- `GetVMCPNodePort()` - Get the NodePort for testing

**Run only the new test:**

```bash
cd ../toolhive
KUBECONFIG="kconfig.yaml" ginkgo -v --focus="<Feature Name>" ./test/e2e/thv-operator/virtualmcp/
```

#### Option B: Manual testing only (for features that cannot be automated)

Use this for features like telemetry/OTEL exports, external integrations (Zipkin, Jaeger), or UI-dependent verification.

Use the `deploying-vmcp-locally` skill from the ToolHive repository:

```bash
cd ../toolhive
# Follow the deploying-vmcp-locally skill instructions
```

Manual verification steps:

1. Deploy the configuration to a local Kind cluster
2. Verify the VirtualMCPServer reaches Ready state
3. Test the specific feature manually (e.g., check Zipkin UI for traces)
4. Document the manual verification steps performed

### Step 5: Validate documentation builds

Ensure the documentation builds without errors:

```bash
npm run build
```

### Step 6: Create commits

Create separate commits for:

1. Documentation changes (in docs-website)
2. E2E test additions (in ToolHive, if applicable)

## Checklist

Before completing this skill, verify:

- [ ] ToolHive main is checked out and up to date
- [ ] Documentation YAML examples are syntactically correct
- [ ] Examples match the structure in `toolhive/examples/operator/virtual-mcps/`
- [ ] Verification completed (Ginkgo test OR manual testing, as appropriate)
- [ ] Documentation builds successfully (`npm run build`)
- [ ] Code formatting is correct (`npm run prettier:fix && npm run eslint:fix`)
