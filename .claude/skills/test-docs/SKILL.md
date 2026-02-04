---
name: test-docs
description: >
  Test ToolHive documentation by executing the steps in tutorials and guides
  against a real environment, verifying that examples are correct and ToolHive
  has not regressed. Use when the user asks to test, validate, or verify
  documentation such as: "test the vault integration tutorial",
  "verify the K8s quickstart", "check the CLI install docs",
  "test toolhive vault integration in kubernetes", or any request to run
  through a doc's instructions to confirm they work. Supports both
  Kubernetes-based docs (tutorials, K8s guides) and CLI-based docs.
---

# Test Docs

Test ToolHive documentation by running each step against a live environment,
reporting pass/fail with evidence, and recommending fixes for failures.

## Workflow

1. **Find the documentation** - launch an Explore agent to locate the
   relevant doc file
2. **Read and parse** - extract testable steps (bash code blocks, YAML
   manifests, expected outputs)
3. **Check prerequisites** - run `scripts/check-prereqs.sh`; confirm the
   `thv` version with the user
4. **Prepare the environment** - create a dedicated test namespace unless
   the doc specifies otherwise
5. **Execute steps** - run each step sequentially, capture output
6. **Report results** - pass/fail per step with evidence
7. **Clean up** - delete all resources created during testing
8. **Recommend fixes** - classify failures as doc issues or ToolHive bugs

## Step 1: Find the documentation

If the user provides a **file path** to the doc, use it directly. Assume
you are running in the repository that contains the file.

Otherwise, use the Task tool with `subagent_type=Explore` to search the
docs directory for the page matching the user's request. Documentation
lives under:

- `docs/toolhive/tutorials/` - step-by-step tutorials
- `docs/toolhive/guides-cli/` - CLI how-to guides
- `docs/toolhive/guides-k8s/` - Kubernetes how-to guides
- `docs/toolhive/guides-mcp/` - MCP server guides
- `docs/toolhive/guides-vmcp/` - Virtual MCP Server guides
- `docs/toolhive/guides-registry/` - registry guides

All doc files use the `.mdx` extension. Search by keywords from the user's
request. If multiple docs match, ask the user which one to test.

## Step 2: Read and parse the doc

Read the full doc file. Extract an ordered list of **testable steps**:

- **Bash code blocks** (`\`\`\`bash`) - commands to execute
- **YAML code blocks** with `title="*.yaml"` - manifests to apply with
  `kubectl apply`
- **Expected outputs** - text code blocks (`\`\`\`text`) that follow a
  command, or prose describing expected behavior ("You should see...")

Build a test plan: a numbered list of steps, each with:

- The command(s) to run
- What constitutes a pass (expected output, exit code 0, resource created)
- Any dependencies on previous steps (variables, resources)

Present the test plan to the user for approval before executing.

### Handling placeholders

Docs often contain placeholder values like `ghp_your_github_token_here` or
`your-org`. Before executing, scan for obvious placeholders (ALL_CAPS
patterns, "your-\*", "example-\*", "replace-\*") and ask the user for real
values. If a step requires a secret that the user cannot provide, mark it
as **skipped** with a note explaining why.

## Step 3: Check prerequisites

Run the prerequisites checker:

```bash
bash <skill-path>/scripts/check-prereqs.sh
```

Where `<skill-path>` is the absolute path to this skill's directory.

If the script reports errors, inform the user and stop. For K8s docs, the
script checks for a kind cluster named "toolhive". For CLI docs, confirm
with the user that the installed `thv` version matches what the doc expects.

## Step 4: Prepare the environment

For Kubernetes docs, ask the user about existing infrastructure before
deploying anything:

- **Operator CRDs and operator**: if the doc includes steps to install
  CRDs or the ToolHive operator, ask the user whether these are already
  installed. If so, skip those installation steps and proceed to the
  doc-specific content. Use `AskUserQuestion` with options like
  "Already installed", "Install fresh", "Reinstall (upgrade)".
- **Namespaces**: create a dedicated namespace `test-docs-<timestamp>`
  (e.g., `test-docs-1706886400`) unless the doc explicitly uses a
  specific namespace (like `toolhive-system`). If the doc requires
  `toolhive-system`, use it but track all resources created for cleanup.

For CLI docs:

- Use a temporary directory for any files created
- Note the state of running MCP servers before testing (`thv list`)
- **Use unique server names**: when running `thv run <server>`, always use
  `--name <server>-test` to avoid conflicts with existing servers. The
  default name is derived from the registry entry, which may already be
  running. Example: `thv run --name osv-test osv`
- **Verify registry configuration**: if a registry server isn't found,
  confirm with the user that they're using the default registry (not a
  custom registry configuration)

## Step 5: Execute steps

Run each step sequentially. For each step:

1. Print the step number and a short description
2. Run the command(s)
3. Capture stdout, stderr, and exit code
4. Compare against expected output or success criteria
5. Record pass/fail with evidence

### Execution rules

- **Wait for readiness**: when a step deploys resources, wait for them
  (e.g., `kubectl wait --for=condition=ready`) before proceeding. If the
  doc includes a wait command, use it. Otherwise add a reasonable wait
  (up to 120s for pods).
- **Variable propagation**: some steps set shell variables used by later
  steps (e.g., `VAULT_POD=$(kubectl get pods ...)`). Maintain these
  across steps by running in the same shell session.
- **Skip non-testable steps**: informational code blocks (showing file
  contents, expected output) are not commands to run. Use them as
  verification targets instead.
- **Timeout**: if any command hangs for more than 5 minutes, kill it and
  mark the step as failed with a timeout note.

### Known pitfalls

- **Server name conflicts**: `thv run <server>` uses the registry entry
  name by default, which may already exist. Always use
  `thv run --name <server>-test <server>` to create a uniquely-named
  instance. This avoids "workload with name already exists" errors.
- **Port-forward needs time**: when testing via `kubectl port-forward`,
  wait at least 5 seconds before issuing `curl`. Start the port-forward
  in the background, sleep 5, then curl. Kill the port-forward PID
  after the check.
- **MCPServer status field**: the MCPServer CRD uses `.status.phase`
  (not `.status.state`) for the running state. When polling for
  readiness, use:
  `kubectl get mcpservers <name> -n <ns> -o jsonpath='{.status.phase}'`
  or simply poll `kubectl get mcpservers` and check the STATUS column.
- **MCPServer readiness polling**: after `kubectl apply` for an
  MCPServer, it may take 30-60 seconds to reach `Running`. Poll with
  5-second intervals up to 120 seconds before declaring a timeout.

## Step 6: Report results

After all steps complete, produce a summary table:

```text
## Test Results: <doc title>

| Step | Description          | Result | Notes                    |
|------|----------------------|--------|--------------------------|
| 1    | Install Vault        | PASS   |                          |
| 2    | Configure auth       | PASS   |                          |
| 3    | Store secrets        | PASS   |                          |
| 4    | Deploy MCPServer     | FAIL   | Pod CrashLoopBackOff    |
| 5    | Verify integration   | SKIP   | Depends on step 4       |
```

For each **FAIL**, include:

- The command that failed
- Actual output vs expected output
- A classification:
  - **Doc issue**: the command or example in the doc is wrong or outdated
    (e.g., wrong image tag, deprecated flag, missing step)
  - **ToolHive bug**: the doc appears correct but ToolHive behaves
    unexpectedly (e.g., crash, wrong output from a correct command)
  - **Environment issue**: missing prerequisite, network problem, or
    transient error
- A specific recommendation (e.g., "Update image tag from `v0.7.0` to
  `v0.8.2`" or "File a bug: MCPServer pods fail to start when Vault
  annotations are present")

## Step 7: Clean up

Always clean up after testing:

- Delete test namespaces: `kubectl delete namespace <test-namespace>`
- Remove Helm releases installed during testing
- Delete any temporary files or directories
- If resources were created in `toolhive-system`, delete them individually
  by name

If cleanup fails, report what could not be cleaned up so the user can
handle it manually.

## Example session

User: "test the vault integration tutorial"

1. Explore agent finds `docs/toolhive/tutorials/vault-integration.mdx`
2. Parse the doc: 5 major steps with 12 bash commands and 1 YAML manifest
3. Run `check-prereqs.sh` - kind cluster "toolhive" exists, thv v0.8.2
4. Ask user: "The doc uses a placeholder GitHub token
   `ghp_your_github_token_here`. Provide a real token or skip step 2?"
5. Present test plan, user approves
6. Execute steps 1-5, report results
7. Clean up: delete vault namespace, remove MCPServer resource
8. Summary: 4/5 PASS, 1 FAIL with recommendation
