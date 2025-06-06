---
title: Client configuration
description:
  How to configure AI agent clients to work with ToolHive MCP servers.
sidebar_position: 40
---

ToolHive can automatically configure supported AI clients to work with MCP
servers. This guide shows you how to set up and manage client configurations.

## Understanding client configuration

AI applications need to know where to find MCP servers before they can use them.
You can configure clients with ToolHive in three ways:

1. **Auto-discovery**: ToolHive automatically finds and configures supported
   clients.
2. **Manual registration**: Register specific clients for ToolHive to manage.
3. **Custom configuration**: For unsupported clients or custom setups, configure
   them to connect to ToolHive-managed MCP servers using the SSE protocol.

With the first two methods, ToolHive automatically updates client configuration
when you start or remove an MCP server. For a complete list of supported clients
and compatibility details, see the
[Client compatibility reference](../reference/client-compatibility.mdx).

## Enable auto-discovery

Auto-discovery is the easiest way to configure supported clients. When enabled,
ToolHive automatically finds and configures supported clients on your system
when you run an MCP server.

Enable auto-discovery with the following command:

```bash
thv config auto-discovery true
```

From now on, any new servers you start with
[`thv run`](../reference/cli/thv_run.md) will be automatically configured in
your client.

:::note

When you enable auto-discovery, ToolHive doesn't add existing MCP servers to
your client configuration. It only configures new servers that you start with
[`thv run`](../reference/cli/thv_run.md). To add existing servers, you can
either:

1. Stop and restart each server with [`thv stop`](../reference/cli/thv_stop.md)
   and [`thv restart`](../reference/cli/thv_restart.md) (see
   [Lifecycle management](./manage-mcp-servers.md#lifecycle-management)), or
2. Manually register your clients with
   [`thv config register-client <client-name>`](../reference/cli/thv_config_register-client.md),
   which adds all existing servers to the client configuration.

:::

To disable auto-discovery:

```bash
thv config auto-discovery false
```

## Manually register clients

If you want more control over client configuration, you can manually register
clients.

Use the following command to register a client:

```bash
thv config register-client <client-name>
```

Replace `<client-name>` with the name of your client. Common client names
include:

- `claude-code` - Claude Code CLI
- `cursor` - Cursor IDE
- `roo-code` - Roo Code extension for VS Code
- `vscode` - VS Code (GitHub Copilot)
- `vscode-insider` - VS Code Insiders edition

Example:

```bash
thv config register-client vscode
```

Run
[`thv config register-client --help`](../reference/cli/thv_config_register-client.md)
for the latest list of supported clients.

To list currently registered clients:

```bash
thv config list-registered-clients
```

Repeat the registration step for any additional clients you want to configure.

You might need to restart your client application for the configuration to take
effect.

To remove a client configuration:

```bash
thv config remove-client <client-name>
```

## Other clients or tools

If you have other clients or development libraries that ToolHive doesn't
directly support, you can still configure them to use ToolHive-managed MCP
servers as long as they support the SSE protocol. Check your client or library
documentation for configuration details.

List your running MCP servers to get the URL:

```bash
thv list
```

Example output:

```text
CONTAINER ID   NAME     IMAGE                                     STATE     TRANSPORT   PORT    URL
c06b6f6c09d7   fetch    mcp/fetch:latest                          running   stdio       43832   http://localhost:43832/sse#fetch
0489fddf7c10   github   ghcr.io/github/github-mcp-server:latest   running   stdio       19046   http://localhost:19046/sse#github
```

You can also get the list in JSON format, which works with many clients that use
the standard configuration format:

```bash
thv list --format mcpservers
```

Example output:

```json
{
  "mcpServers": {
    "fetch": {
      "url": "http://localhost:43832/sse#fetch"
    },
    "github": {
      "url": "http://localhost:19046/sse#github"
    }
  }
}
```

Configure your client or library to connect to the MCP server using the URL that
ToolHive provides.

## Related information

- [`thv config` command reference](../reference/cli/thv_config.md)
- [Client compatibility](../reference/client-compatibility.mdx)
- [Run MCP servers](run-mcp-servers.mdx)

## Troubleshooting

### Client is not auto-discovered

If your client isn't configured automatically:

1. Make sure auto-discovery is enabled:

   ```bash
   thv config auto-discovery true
   ```

2. Check if your client supports auto-discovery in the
   [Client compatibility reference](../reference/client-compatibility.mdx).

3. Try manually registering the client:

   ```bash
   thv config register-client <client-name>
   ```

### Client can't connect to MCP server

If your client can't connect to the MCP server:

1. Verify the MCP server is running:

   ```bash
   thv list
   ```

2. If auto-discovery isn't enabled, check if the client is registered:

   ```bash
   thv config list-registered-clients
   ```

3. Make sure the URL is correct and accessible. Use `curl` to test the
   connection:

   ```bash
   curl <mcp-server-url>
   ```

4. Restart your client application

### Client can connect but tools aren't available

If your client connects to the MCP server but tools aren't available:

1. Make sure the MCP server is running and accessible:

   ```bash
   thv list

   curl <mcp-server-url>
   ```

2. Check the MCP server logs:

   ```bash
   thv logs <server-name>
   ```

3. Make sure the MCP server is properly configured in your client
4. For VS Code, make sure the MCP server is started in the settings (see the VS
   Code with Copilot section in the
   [Client compatibility reference](../reference/client-compatibility.mdx#vs-code-with-copilot))
5. If you've implemented authentication for your MCP server, make sure the
   client has the necessary permissions to access the tools

### Containerized client can't connect to MCP server

If you're running an MCP client inside a container and it can't connect to an
MCP server running on the same host, make sure to use the correct host address.
The ToolHive proxy is a standard OS process, so it listens on the host's network
interface.

For example, on Docker Desktop, use `host.docker.internal` instead of
`localhost`. On Linux Docker environments, you may need to use the host's IP
address or configure the container's network to use `host` mode for proper
connectivity.

Refer to your containerization platform's documentation for details on how to
configure network access between containers and the host.
