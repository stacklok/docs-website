# Summary of changes

- Added `docs/toolhive/guides-vmcp/local-cli.mdx`: a new guide for running vMCP
  locally via `thv vmcp serve/validate/init`, covering quick mode vs.
  config-file mode, optimizer tiers 0-3, `--enable-audit`, full flag tables, and
  a comparison to the Kubernetes `VirtualMCPServer` CRD path.
- Updated `docs/toolhive/guides-vmcp/intro.mdx` and
  `docs/toolhive/guides-vmcp/index.mdx` so the entry points surface the new
  local CLI option alongside the existing Kubernetes deployment.
- Updated `docs/toolhive/concepts/vmcp.mdx` so the concept page acknowledges
  both delivery modes (operator CRD and CLI) and links to the local guide.
- Updated `sidebars.ts` to list the new `local-cli` guide under **Virtual MCP
  Server**, immediately after the Kubernetes quickstart.
