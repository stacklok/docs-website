---
title: Monitor and manage MCP servers
description:
  How to monitor and manage the lifecycle of MCP servers using ToolHive.
sidebar_position: 25
---

## Monitoring

ToolHive provides visibility into the status of your MCP servers. You can check
the status of running servers and view their logs using the ToolHive CLI.

### List running servers

To see all currently running MCP servers:

```bash
thv list
```

This shows the server name, status, transport method, port, and URL.

To include stopped servers in the list:

```bash
thv list --all
```

### View server logs

To view the logs of a running or stopped MCP server, use the
[`thv logs`](../reference/cli/thv_logs.md) command. You can optionally follow
the logs with the `--follow` option, which shows the most recent log entries and
updates in real time.

```bash
thv logs <server-name> [--follow]
```

Logs are stored in the ToolHive application directory. The path depends on your
platform:

- **macOS**: `~/Library/Application Support/toolhive/logs/<server-name>.log`
- **Linux**: `~/.local/share/toolhive/logs/<server-name>.log`

The specific log file path is displayed when you start a server with
[`thv run`](../reference/cli/thv_run.md).

## Lifecycle management

MCP servers can be started, stopped, restarted, and removed using the ToolHive
CLI. The commands are similar to Docker commands, but they're designed to work
with the ToolHive CLI and MCP servers.

### Stop a server

To stop a running MCP server:

```bash
thv stop <server-name>
```

This stops the server and the associated proxy process but keeps the container
for future use.

### Restart a server

To restart a stopped MCP server:

```bash
thv restart <server-name>
```

### Remove a server

To remove a stopped MCP server:

```bash
thv rm <server-name>
```

This removes the container and cleans up the MCP server's entry in your
configured clients.

:::note

If you use `docker rm` to remove an MCP container that ToolHive created, it
won't clean up the MCP server's entry in your configured clients. Use
[`thv rm`](../reference/cli/thv_rm.md) to make sure the entry is removed.

:::

### Stop and remove in one command

To stop and remove a running MCP server in a single command:

```bash
thv rm -f <server-name>
```

## Related information

- [`thv list` command reference](../reference/cli/thv_list.md)
- [`thv logs` command reference](../reference/cli/thv_logs.md)
- [`thv stop` command reference](../reference/cli/thv_stop.md)
- [`thv restart` command reference](../reference/cli/thv_restart.md)
- [`thv rm` command reference](../reference/cli/thv_rm.md)
