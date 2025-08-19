---
title: Group MCP servers
description:
  How to organize MCP servers into logical groups and configure client access.
---

This guide explains how to organize your MCP servers into logical groups and
configure which groups your MCP clients can access. Groups help you organize
servers by project, environment, or team, and control which tools are available
to different clients.

## Why use groups?

Groups let you organize MCP servers and control client access:

- **Project isolation**: Keep development and production servers separate
- **Environment management**: Organize servers by development stage
- **Client customization**: Configure different tool sets for different clients

:::info What's the default behavior?

All MCP servers are automatically assigned to the `default` group unless you
specify otherwise. MCP clients configured without a specific group can access
all servers in the `default` group.

:::

## Create and organize groups

### Create a group

```bash
thv group create <GROUP_NAME>
```

For example, to create separate groups for different environments:

```bash
thv group create development
thv group create production
```

### Run servers in a group

When running an MCP server, specify the group using the `--group` flag:

```bash
thv run --group development fetch
thv run --group production filesystem --volume /prod/repo:/workspace:ro
```

:::info What's happening?

When you specify a group:

1. The server is assigned to that group and labeled accordingly
2. The server can only be accessed by clients configured for that group

:::

## Configure client access to groups

You can configure MCP clients to access specific groups, giving you control over
which tools are available in different contexts.

### Configure a client for a specific group

When registering a client, you can specify which group it should access:

```bash
thv client register --group development
```

This configures the client to only access servers in the `development` group.

## Example workflows

### Project-based organization

```bash
# Create groups for different projects
thv group create webapp-frontend
thv group create webapp-backend

# Run project-specific servers
thv run --group webapp-frontend mcp-react-tools
thv run --group webapp-backend mcp-database-tools

# Configure clients with appropriate access
thv client register --client vscode --group webapp-frontend
thv client register --client cursor --group webapp-backend
```

## Manage groups

### Remove a group

Remove a group and move its servers to the default group:

```bash
thv group rm development
```

Remove a group and delete all its servers:

```bash
thv group rm development --with-workloads
```

:::warning

Using `--with-workloads` permanently deletes all servers in the group.

:::

## Related information

- [Client configuration](client-configuration.mdx)
- [Run MCP servers](run-mcp-servers.mdx)
- [`thv group` command reference](../reference/cli/thv_group.md)
- [`thv client` command reference](../reference/cli/thv_client.md)
