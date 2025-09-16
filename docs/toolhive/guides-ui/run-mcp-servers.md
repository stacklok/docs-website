---
title: Run MCP servers
description: How to install and run MCP servers in the ToolHive UI.
---

ToolHive makes it easy to run and manage Model Context Protocol (MCP) servers.
This guide walks you through installing MCP servers from the registry, using
Docker images, or from source packages.

## Install from the registry

ToolHive includes a built-in registry of MCP servers that meet a
[minimum quality standard](../concepts/registry-criteria.md), allowing you to
discover and deploy high-quality tools effortlessly. Simply select one from the
list to run it securely with just a few clicks.

### Select an MCP server

To install an MCP server from the registry:

1. Open the **Registry** page from the menu bar.
2. Browse or search for the MCP server you want to install.
3. Click on the desired MCP server to open its details page. Here you can review
   more information about the server like its:
   - Description
   - Available tools
   - Tier (community or official)
   - Popularity (GitHub stars)
   - A link to the GitHub repository for more details and usage documentation
4. Click the **Install server** button to start the installation process.

### Configure the server

On the configuration form, enter the following details:

1. **Server name**: A unique name for the MCP server.\
   This defaults to the MCP server's name in the registry. If you want to run
   multiple instances of the same MCP server, give each instance a unique name.

2. **Command arguments** (optional):\
   Enter any command-line arguments needed to run the MCP server. These might be
   needed to pass application-specific parameters to the MCP server. Refer to
   the MCP server's documentation for details.

   :::info

   We've made every effort to include sensible defaults in the registry for a
   one-click experience, but some servers may require additional command-line
   arguments to function correctly.

   :::

3. To give the MCP server **access to the file system**, use the
   [Volume mount](#volumes) feature. [Optional]

4. **Secrets** and **environment variables** expected by the server are
   populated from the registry automatically. Required values are marked with an
   asterisk (\*).
   1. **Secrets**: Enter a value to create a new secret or select an existing
      secret to map to the environment variable. Secrets are stored securely and
      can be used by the MCP server without exposing them in plaintext.
   2. **Environment variables**: Enter the value in the input field alongside
      the variable name. These are typically used for configuration options that
      do not require sensitive data.

:::note

Refer to the MCP server's documentation for the required configuration
information, required permissions, and authentication details. A link to the
GitHub repository is provided on each server's details page.

:::

### Network isolation

You can optionally enable network isolation for the MCP server. This allows you
to control the MCP server's network access, restricting it to only the necessary
resources and preventing it from accessing the internet or other external
networks.

See the [Network isolation](./network-isolation.mdx) guide for details on how to
configure network isolation for MCP servers in ToolHive.

### Start the MCP server

Click **Install server** to install and start the MCP server. ToolHive downloads
the Docker image, creates a container, and starts it with the specified
configuration.

Once the server is running, you can see its status on the **MCP Servers** page.
Each server's card includes:

- The server name
- Its status (Running or Stopped) with a toggle button to start or stop it
- A menu (︙) that includes the server's URL for AI clients that need manual
  configuration, and options to:
  - Open the server's GitHub repository
  - View the server's logs
  - Remove the server

See [Manage MCP servers](#manage-mcp-servers) below for more details on server
states.

## Install a custom MCP server

You're not limited to the MCP servers in the registry. You can run remote MCP
servers by providing a URL, or your own local custom MCP servers using Docker
images or source packages.

### Remote MCP server

On the **MCP Servers** page, click **Add an MCP server**, then choose **Add a
remote MCP server** in the drop-down menu.

On the configuration form, enter:

1. A unique **name** for the MCP server. [Required]
2. The **URL** of the remote MCP server. [Required]
3. The **transport protocol** that the MCP server uses. [Required]\
   ToolHive supports server-sent events (SSE) and Streamable HTTP (default) for
   real-time communication. The protocol must match what the MCP server
   supports.
4. **Authorization method**: Choose how ToolHive should authenticate with the
   remote server.\
   The default is **None**, when no client credentials are provided, ToolHive
   can automatically register an OAuth client with the authorization server:
   - Discover OAuth/OIDC endpoints
   - Register a new OAuth client
   - Obtain and manage client credentials
   - Handle token lifecycle automatically

   ToolHive also supports OAuth2 and OIDC authentication with dynamic client
   registration.

   **OAuth2 authentication options:**
   - **Authorize URL**: The URL where users are redirected to authenticate and
     authorize access to the MCP server. [Required]
   - **Token URL**: The URL where your application exchanges the authorization
     code for access tokens. [Required]
   - **Client ID**: Your application's identifier registered with the OAuth
     provider. [Required]
   - **Client secret**: The secret key that proves your application's identity.
     [Optional]
   - **Scopes**: List of permissions your application is requesting. [Optional]

   **OIDC authentication options:**
   - **Issuer URL**: The base URL of the OIDC provider. [Required]
   - **Client ID**: Your application's identifier registered with the OIDC
     provider. [Required]
   - **Client secret**: The secret key that proves your application's identity.
     [Optional]
   - **PKCE**: Enable Proof Key for Code Exchange (RFC 7636) for enhanced
     security without requiring a client secret. [Optional]

5. The **callback port** for the authentication redirect. [Required]

Click **Install server** to connect to the remote MCP server.

#### Configuration and authentication examples

##### Remote MCP server with no client credentials

This example shows how to connect to a remote MCP server using automatic OAuth
client registration, where ToolHive handles all the authentication setup for
you.

1. On the **MCP Servers** page, click **Add an MCP server**.
2. Select **Add a remote MCP server** from the drop-down menu.
3. Fill in the configuration form:
   - **Server name**: `notion-mcp-server`
   - **URL**: `https://mcp.notion.com/mcp`
   - **Transport protocol**: Select **Streamable HTTP**
   - **Authorization method**: Select **None**
   - **Callback port**: `45673` (or any available port on your system)
4. Click **Install server** to start the automatic registration flow.
5. ToolHive automatically discovers the OAuth endpoints, registers a new client,
   and handles the authentication process.
6. Your browser opens for authentication, and after successful authorization,
   the remote MCP server appears in your server list with a "Running" status.

This is the simplest way to connect to a remote MCP server that supports
automatic client registration, as it requires minimal configuration from you.

##### Remote MCP server with OAuth2 authentication

This example shows how to connect to a remote MCP server that requires OAuth2
authentication, such as a GitHub MCP server.

1. On the **MCP Servers** page, click **Add an MCP server**.
2. Select **Add a remote MCP server** from the drop-down menu.
3. Fill in the configuration form:
   - **Server name**: `github-remote-oauth`
   - **URL**: `https://api.githubcopilot.com/mcp/`
   - **Transport protocol**: Select **Streamable HTTP**
   - **Authorization method**: Select **OAuth2**
   - **Authorize URL**: `https://github.com/login/oauth/authorize`
   - **Token URL**: `https://github.com/login/oauth/access_token`
   - **Client ID**: Your GitHub OAuth app client ID (e.g.,
     `Og44jirLIaUgSiTDNGA3`)
   - **Client secret**: Your GitHub OAuth app client secret
   - **Scopes**: `public_repo` (comma-separated list of required permissions)
   - **Callback port**: `45673` (or any available port on your system)
4. Click **Install server** to start the authentication flow.
5. ToolHive opens your browser to authenticate with GitHub and authorize the
   application.
6. After successful authentication, the remote MCP server appears in your server
   list with a "Running" status.

**NOTE**: If you don't have a GitHub OAuth app yet, you need to create one
first:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application details:
   - **Application name**: Choose a descriptive name (e.g., "ToolHive GitHub
     MCP")
   - **Homepage URL**: Your application's homepage or `http://localhost`
   - **Authorization callback URL**: `http://localhost:45673/callback` (match
     the callback port in ToolHive UI)
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client secret** to use in ToolHive UI

##### Remote MCP server with OIDC authentication

This example shows how to connect to a remote MCP server using OpenID Connect
(OIDC) authentication with GitHub as the identity provider.

1. On the **MCP Servers** page, click **Add an MCP server**.
2. Select **Add a remote MCP server** from the drop-down menu.
3. Fill in the configuration form:
   - **Server name**: `github-remote-oidc`
   - **URL**: `https://api.githubcopilot.com/mcp/`
   - **Transport protocol**: Select **Streamable HTTP**
   - **Authorization method**: Select **OIDC**
   - **Issuer URL**: `https://github.com/login/oauth`
   - **Client ID**: Your GitHub OAuth app client ID (e.g.,
     `Og44jirLIaUgSiTDNGA3`)
   - **Client secret**: Your GitHub OAuth app client secret (optional for PKCE)
   - **PKCE**: Enable this option for enhanced security without requiring a
     client secret
   - **Callback port**: `45673` (or any available port on your system)
4. Click **Install server** to start the authentication flow.
5. ToolHive opens your browser to authenticate with GitHub using OIDC.
6. After successful authentication, the remote MCP server appears in your server
   list with a "Running" status.

**NOTE**: For OIDC authentication with GitHub, you can use the same OAuth app
created in the previous example. The OIDC flow provides additional security
features and standardized token handling compared to traditional OAuth2.

### Local custom MCP server

On the **MCP Servers** page, click **Add an MCP server**, then choose **Add
custom local server** in the drop-down menu. Or if this is your first MCP
server, on the introductory screen.

In the **Custom MCP server** dialog, choose [Docker image](#from-a-docker-image)
or [Package manager](#from-a-source-package).

#### From a Docker image

Select the **Docker image** option. This allows you to run any MCP server that
is available as a Docker image in a remote registry or locally on your system.

On the configuration form, enter:

1. A unique **name** for the MCP server. [Required]

2. The **transport protocol** that the MCP server uses. [Required]\
   ToolHive supports standard input/output (`stdio`), server-sent events (SSE),
   and Streamable HTTP. The protocol must match what the MCP server supports.

3. The **target port** to expose from the container (SSE or Streamable HTTP
   transports only). [Optional]\
   If the MCP server uses a specific port, enter it here. If not specified,
   ToolHive will use a random port that is exposed to the container with the
   `MCP_PORT` and `FASTMCP_PORT` environment variables.

4. The Docker **image name** and tag (e.g., `my-mcp-server:latest`). [Required]\
   You can use any valid Docker image, including those hosted on Docker Hub or
   other registries.

5. **Command-line arguments** needed to run the MCP server. [Optional]\
   These are specific to the MCP server and might include transport options or
   application-specific parameters. Refer to the MCP server's documentation for
   details.

6. To give the MCP server **access to the file system**, use the
   [Volume mount](#volumes) feature. [Optional]

7. Any **secrets** or **environment variables** required by the MCP server.
   [Optional]\
   These might include API tokens, configuration options, or other sensitive
   data.
   - Secrets are mapped to an environment variable. Enter the variable name and
     select an existing secret or enter a value to create a new one.
   - For non-sensitive environment variables, enter the name and value directly.

Click **Install server** to create and start the MCP server container.

#### From a source package

Select the **Package manager** option. This allows you to run an MCP server from
a source package.

ToolHive downloads the MCP server's source package and builds a Docker image
on-the-fly. The following package formats are supported:

- Node.js-based MCP servers using npm
- Python-based MCP servers available on PyPI, using the `uv` package manager
- Go-based MCP servers available on GitHub

On the configuration form, enter:

1. A unique **name** for the MCP server. [Required]

2. The **transport protocol** that the MCP server uses. [Required]\
   ToolHive supports standard input/output (`stdio`), server-sent events (SSE),
   and Streamable HTTP. The protocol must match what the MCP server supports.

3. The **target port** to expose from the container (SSE or Streamable HTTP
   transports only). [Optional]\
   If the MCP server uses a specific port, enter it here. If not specified,
   ToolHive will use a random port that is exposed to the container with the
   `MCP_PORT` and `FASTMCP_PORT` environment variables.

4. The package **protocol** (`npx`, `uvx`, or `go`). [Required]

5. The **name** of the package to run. [Required]
   1. For `npx`, use the [npm](https://www.npmjs.com/) package name and version,
      e.g. `my-mcp-package@latest`
   2. For `uvx`, use the [PyPI](https://pypi.org/) package name and version,
      e.g. `my-mcp-package@latest`
   3. For `go`, use the GitHub repository URL with full path to the `main`
      package and version, e.g.
      `go://github.com/orgname/my-mcp-server/cmd/server@latest`

6. **Command-line arguments** needed to run the MCP server. [Optional]\
   These are specific to the MCP server and might include transport options or
   application-specific parameters. Refer to the MCP server's documentation for
   details.

7. To give the MCP server **access to the file system**, use the
   [Volume mount](#volumes) feature. [Optional]

8. Any **secrets** or **environment variables** required by the MCP server.
   [Optional]\
   These might include API tokens, configuration options, or other sensitive
   data.
   - Secrets are mapped to an environment variable. Enter the variable name and
     select an existing secret or enter a value to create a new one.
   - For non-sensitive environment variables, enter the name and value directly.

Click **Install server** to create and start the MCP server container.

## Mount host files and folders (Volumes) {#volumes}

Some MCP servers need access to files on your machine. You can mount host paths
directly in the UI.

1. In the server **Install / Configure** dialog, scroll to **Storage volumes**.
2. Use the **first row** to create your mount:
   - **Host path** — choose a file or folder on your computer.
   - **Container path** — where it should appear inside the server (for example,
     `/data`).
   - By default, mounts are in read-write mode. If you want your volume mount to
     be **Read-only**, select the "Read-only access" option from the drop-down.
3. If you need additional mounts, click **Add a volume** and repeat.
4. Click **Install server** to start the server with your volume(s).

This applies to both registry-installed servers and custom servers (Docker image
or source package).

## Manage MCP servers

On the **MCP Servers** page, you can manage your installed MCP servers:

- **Start/Stop**: Use the toggle button to start or stop the MCP server. When
  you stop a server, it remains in the list but is no longer running. ToolHive
  removes the server from connected AI clients while stopped.
- **Copy URL**: Click the menu (︙) on the server card and select the **Copy**
  icon (⧉) to copy the MCP server's URL to your clipboard. This URL is used by
  AI clients to connect to the MCP server.
- **View logs**: Click the menu (︙) on the server card and select **View logs**
  to see the server's output.
- **Remove server**: Click the menu (︙) on the server card and select **Remove
  server** to stop and remove the MCP server from ToolHive. This deletes the
  container and any associated configuration, so use with caution.

When you quit the application, ToolHive prompts you to stop all running MCP
servers. The running servers are recorded and ToolHive restarts them
automatically the next time you launch the application.

## Next steps

- Connect ToolHive to AI clients like GitHub Copilot or Cursor using the
  [client configuration guide](./client-configuration.mdx).
- Learn more about [secrets management](./secrets-management.md) to securely
  manage API tokens and other sensitive data.
