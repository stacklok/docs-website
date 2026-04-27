## Summary of changes

- Removed `docs/toolhive/guides-ui/mcp-optimizer.mdx` — toolhive-studio
  v0.32.0 ([PR #2086](https://github.com/stacklok/toolhive-studio/pull/2086))
  removed the desktop MCP Optimizer feature (route, settings toggle, sunset
  banner, and the entire `features/meta-mcp` module). The page's deprecation
  notice flagged removal for 2026-04-22; v0.32.0 shipped 2026-04-24.
- Updated `sidebars.ts` to drop the deleted page from the ToolHive UI sidebar.
- Updated `vercel.json` with a permanent redirect from
  `/toolhive/guides-ui/mcp-optimizer` to the vMCP optimizer guide so existing
  links keep working.
- Updated `docs/toolhive/tutorials/mcp-optimizer.mdx` to remove the dangling
  "Related information" link to the removed UI guide.
- Updated `docs/toolhive/guides-ui/playground.mdx` to swap the
  `meta-mcp server` example prompt for a generic `fetch MCP server` example,
  since `meta-mcp` is no longer a workload that ships with the desktop app.
