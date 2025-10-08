#### Remote MCP server with dynamic client registration

Dynamic client registration is the preferred approach for any MCP server that
supports it, as ToolHive handles all authentication setup automatically with
minimal configuration required. Notion's remote MCP server is one example that
supports this feature:

1. Configuration settings:
   - **Server name**: `notion-remote`
   - **Server URL**: `https://mcp.notion.com/mcp`
   - **Transport**: Streamable HTTP
   - **Authorization method**: Dynamic Client Registration
   - **Callback port**: `45673` (or any available port on your system)
1. When you install the server, ToolHive discovers the OAuth endpoints,
   registers a new client, and handles the authentication process.
1. Your browser opens for authentication. After you authorize access, the remote
   MCP server appears in your server list with a "Running" status.

#### Remote MCP server with OAuth2 authentication

GitHub's remote MCP server requires manual OAuth configuration. You'll need to
create a GitHub OAuth app and provide the details in ToolHive.

First, create a GitHub OAuth app:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
1. Click **New OAuth App**
1. Fill in the application details:
   - **Application name**: Choose a descriptive name (e.g., "ToolHive GitHub
     MCP")
   - **Homepage URL**: Your application's homepage or `http://localhost`
   - **Authorization callback URL**: `http://localhost:45673/callback` (the port
     number must match the **Callback port** you will enter in ToolHive)
1. Click **Register application**
1. Copy the **Client ID** and generate a **Client secret** for use in ToolHive

Configure the remote MCP server in ToolHive:

1. Configuration settings:
   - **Server name**: `github-remote`
   - **Server URL**: `https://api.githubcopilot.com/mcp/`
   - **Transport**: Streamable HTTP
   - **Authorization method**: OAuth 2.0
   - **Callback port**: `45673` (or any available port on your system)
   - **Authorize URL**: `https://github.com/login/oauth/authorize`
   - **Token URL**: `https://github.com/login/oauth/access_token`
   - **Client ID**: Your GitHub OAuth app client ID (e.g.,
     `Og44jirLIaUgSiTDNGA3`)
   - **Client secret**: Your GitHub OAuth app client secret (optional if PKCE is
     enabled)
   - **Scopes**: `repo,user:email` (comma-separated list of required
     permissions)
   - **PKCE**: Enable this option for enhanced security without requiring a
     client secret
1. When you install the server, ToolHive opens your browser to authenticate with
   GitHub and authorize the application.
1. After you authenticate successfully, the remote MCP server appears in your
   server list with a "Running" status.

#### Remote MCP server with OIDC authentication

GitHub's remote MCP server also supports OIDC authentication, which provides
additional security features and standardized token handling. Use the same
GitHub OAuth app from the previous example.

1. Fill in the configuration form:
   - **Server name**: `github-remote`
   - **Server URL**: `https://api.githubcopilot.com/mcp/`
   - **Transport**: Streamable HTTP
   - **Authorization method**: OIDC
   - **Callback port**: `45673` (or any available port on your system)
   - **Issuer URL**: `https://github.com/login/oauth`
   - **Client ID**: Your GitHub OAuth app client ID (e.g.,
     `Og44jirLIaUgSiTDNGA3`)
   - **Client secret**: Your GitHub OAuth app client secret (optional if PKCE is
     enabled)
   - **PKCE**: Enable this option for enhanced security without requiring a
     client secret
1. When you install the server, ToolHive opens your browser to authenticate with
   GitHub using OIDC.
1. After you authenticate successfully, the remote MCP server appears in your
   server list with a "Running" status.
