---
title: Client configuration
description:
  How to configure AI agent clients to work with ToolHive MCP servers.
sidebar_position: 40
---

ToolHive automatically configures supported AI clients to work with MCP servers.
This guide shows you how to set up and manage client configurations.

## Understanding client configuration

Before an AI application can use ToolHive MCP servers, it needs to know where to
find them. You can configure clients in two ways:

1. **Register a supported client**: Register your client with ToolHive so it
   automatically manages and updates the client's configuration as you start,
   stop, and remove MCP servers.
2. **Manual configuration**: For clients that ToolHive doesn't directly support,
   manually configure them to connect to ToolHive-managed MCP servers using the
   SSE or Streamable HTTP protocol.

For a complete list of supported clients and compatibility details, see the
[Client compatibility reference](../reference/client-compatibility.mdx).

## Register clients

The easiest way to register clients is to run the
[setup command](../reference/cli/thv_client_setup.md):

```bash
thv client setup
```

ToolHive discovers supported clients installed on your system and lets you
select which ones to register. ToolHive detects clients based on the presence of
the client's configuration file in its default location. See the
[Client compatibility reference](../reference/client-compatibility.mdx) for
details on which clients ToolHive supports and how it detects them.

To view the current status of detected and configured clients, run:

```bash
thv client status
```

:::note

ToolHive previously included an "auto-discovery" mode. We removed this mode in
v0.1.0 to simplify client configuration and ensure consistent control and
behavior. If you previously enabled client auto-discovery, ToolHive will
explicitly register all detected clients the first time you run v0.1.0 and
higher.

Going forward, use the `thv client setup` command to manage your client
configurations.

:::

## Alternative client registration

If you prefer to register clients manually or in an automated script, use the
`thv config register-client` command:

```bash
thv config register-client <CLIENT_NAME>
```

Replace `<CLIENT_NAME>` with the name of your client. Common client names
include:

- `claude-code` - Claude Code CLI
- `cursor` - Cursor IDE
- `roo-code` - Roo Code extension for Visual Studio Code
- `vscode` - Visual Studio Code (GitHub Copilot)
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
thv config remove-client <CLIENT_NAME>
```

## Other clients or tools

If you have other clients or development libraries that ToolHive doesn't
directly support, you can still configure them to use ToolHive-managed MCP
servers if they support the SSE or Streamable HTTP protocol. Check your client
or library documentation for configuration details.

List your running MCP servers to get the URL:

```bash
thv list
```

Example output (some fields omitted for brevity):

```text
NAME     PACKAGE                                      STATUS    URL                                 PORT
github   ghcr.io/github/github-mcp-server:latest      running   http://127.0.0.1:55264/sse#github   55264
osv      ghcr.io/stackloklabs/osv-mcp/server:latest   running   http://127.0.0.1:22089/mcp          22089
```

In this example, the `github` server uses the SSE transport (URL ends in
`/sse`), and the `osv` server uses Streamable HTTP (URL ends in `/mcp`).

You can also get the list in JSON format, which works with many clients that use
the standard configuration format:

```bash
thv list --format mcpservers
```

Example output:

```json
{
  "mcpServers": {
    "github": {
      "url": "http://127.0.0.1:55264/sse#github"
    },
    "osv": {
      "url": "http://127.0.0.1:22089/mcp"
    }
  }
}
```

Configure your client or library to connect to the MCP server using the URL
ToolHive provides.

## Related information

- [`thv client` command reference](../reference/cli/thv_client.md)
- [`thv config` command reference](../reference/cli/thv_config.md)
- [Client compatibility](../reference/client-compatibility.mdx)
- [Run MCP servers](run-mcp-servers.mdx)

## Troubleshooting

<details>
<summary>Client is not detected by `thv client setup`</summary>

If ToolHive doesn't detect your client:

1. Verify ToolHive supports your client in the
   [Client compatibility reference](../reference/client-compatibility.mdx).

2. Make sure you installed the client in its default location. ToolHive detects
   clients based on their configuration files. If the client isn't in its
   default location, ToolHive can't detect it.

3. Try manually registering the client:

   ```bash
   thv config register-client <CLIENT_NAME>
   ```

</details>

<details>
<summary>Client can't connect to MCP server</summary>

If your client can't connect to the MCP server:

1. Verify the MCP server is running:

   ```bash
   thv list
   ```

2. Check if the client is registered:

   ```bash
   thv client status
   ```

3. Make sure the URL is correct and accessible. Use `curl` to test the
   connection:

   ```bash
   curl <MCP_SERVER_URL>
   ```

4. Restart your client application.

</details>

<details>
<summary>Client can connect but tools aren't available</summary>

If your client connects to the MCP server but tools aren't available:

1. Make sure the MCP server is running and accessible:

   ```bash
   thv list

   curl <MCP_SERVER_URL>
   ```

2. Check the MCP server logs:

   ```bash
   thv logs <SERVER_NAME>
   ```

3. Make sure you properly configured the MCP server in your client.
4. For Visual Studio Code, make sure you started the MCP server in the settings
   (see the VS Code with Copilot section in the
   [Client compatibility reference](../reference/client-compatibility.mdx#vs-code-with-copilot)).
5. If you've implemented authentication for your MCP server, make sure the
   client has the necessary permissions to access the tools.

</details>

<details>
<summary>Containerized client can't connect to MCP server</summary>

If you're running an MCP client inside a container and it can't connect to an
MCP server running on the same host, make sure you use the correct host address.
The ToolHive proxy is a standard OS process, so it listens on the host's network
interface.

For example, on Docker Desktop, use `host.docker.internal` instead of
`localhost`. On Linux Docker environments, you may need to use the host's IP
address or configure the container's network to use `host` mode for proper
connectivity.

Refer to your containerization platform's documentation for details on how to
configure network access between containers and the host.

</details>

<details>
<summary>VS Code can't connect to some streamable-http servers</summary>

You might encounter errors with Visual Studio Code connecting to some
Python-based MCP servers using the Streamable HTTP transport protocol:

```text
[info] Connection state: Error Error sending message to http://localhost:49574/mcp: TypeError: fetch failed
[error] Server exited before responding to `initialize` request.
```

This is a known interaction between VS Code and the FastMCP SDK used by
Python-based MCP servers. If you inspect the HTTP connection, you'll see a
`307 Temporary Redirect` response, which VS Code doesn't handle correctly.

There are two workarounds:

1. Change the URL in your VS Code settings to add a trailing slash to the MCP
   server URL. For example, change `http://localhost:49574/mcp` to
   `http://localhost:49574/mcp/`. You'll need to re-apply this if you stop and
   restart the MCP server.
2. If the MCP server supports SSE, switch to using the SSE transport instead of
   Streamable HTTP.

You can track a proposed fix for this issue in the
[MCP Python SDK repository](https://github.com/modelcontextprotocol/python-sdk/pull/781).

</details>
